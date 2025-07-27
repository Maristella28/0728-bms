<?php

namespace App\Http\Controllers;

use App\Models\AssetRequest;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\AssetRequestNotification;
use App\Notifications\AssetPaymentNotification;
use App\Models\User;

class AssetRequestController extends Controller
{
    // List requests (admin: all, user: own)
    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'admin') {
            $requests = AssetRequest::with(['items.asset', 'user', 'resident.profile'])->get();
        } else {
            $requests = AssetRequest::with(['items.asset', 'resident.profile'])->where('user_id', $user->id)->get();
        }
        // Map to ensure all fields are present and null-safe
        $requests = $requests->map(function ($req) {
            $firstItem = $req->items->first();
            return [
                'id' => $req->id,
                'resident' => $req->resident ? [
                    'residents_id' => $req->resident->residents_id ?? '',
                    'profile' => $req->resident->profile ? [
                        'first_name' => $req->resident->profile->first_name ?? '',
                        'last_name' => $req->resident->profile->last_name ?? '',
                    ] : null,
                ] : null,
                'user' => $req->user ? [
                    'name' => $req->user->name ?? '',
                ] : null,
                'asset' => $firstItem && $firstItem->asset ? [
                    'name' => $firstItem->asset->name ?? '',
                    'price' => $firstItem->asset->price ?? 0,
                ] : null,
                'request_date' => $firstItem ? $firstItem->request_date ?? '' : '',
                'status' => $req->status ?? '',
                'payment_status' => $req->payment_status ?? 'unpaid',
                'receipt_number' => $req->receipt_number ?? null,
                'amount_paid' => $req->amount_paid ?? null,
                'paid_at' => $req->paid_at ?? null,
                'total_amount' => $req->calculateTotalAmount(),
            ];
        });
        return response()->json($requests);
    }

    // User requests an asset
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.asset_id' => 'required|exists:assets,id',
                'items.*.request_date' => 'required|date',
                'items.*.quantity' => 'required|integer|min:1',
            ]);
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            $resident = \App\Models\Resident::where('user_id', $user->id)->first();
            if (!$resident) {
                return response()->json(['error' => 'Resident profile not found. Please complete your profile.'], 400);
            }
            $residentId = $resident->id;

            // Check stock for each item
            foreach ($validated['items'] as $item) {
                $asset = \App\Models\Asset::findOrFail($item['asset_id']);
                if ($asset->stock < $item['quantity']) {
                    return response()->json(['error' => "Asset '{$asset->name}' does not have enough stock."], 400);
                }
            }

            $assetRequest = AssetRequest::create([
                'user_id' => $user->id,
                'resident_id' => $residentId,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            foreach ($validated['items'] as $item) {
                $assetItem = \App\Models\AssetRequestItem::create([
                    'asset_request_id' => $assetRequest->id,
                    'asset_id' => $item['asset_id'],
                    'request_date' => $item['request_date'],
                    'quantity' => $item['quantity'],
                ]);
                // Notify user for each item
                $asset = \App\Models\Asset::find($item['asset_id']);
                $user->notify(new AssetRequestNotification($asset, $item['request_date'], 'pending'));
            }

            // Notify all admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\AdminAssetRequestNotification($user, $assetRequest));
            }

            return response()->json($assetRequest->load('items'), 201);
        } catch (\Exception $e) {
            \Log::error('Asset request error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    // Admin approves/denies a request
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,denied',
            'admin_message' => 'nullable|string',
        ]);
        $assetRequest = AssetRequest::with('items.asset')->findOrFail($id);
        $assetRequest->status = $validated['status'];
        $assetRequest->admin_message = $validated['admin_message'] ?? null;
        $assetRequest->save();

        // If approved, decrement asset stock
        if ($validated['status'] === 'approved') {
            foreach ($assetRequest->items as $item) {
                $asset = $item->asset;
                if ($asset && $asset->stock > 0) {
                    $asset->decrement('stock', $item->quantity);
                }
            }
        }

        // Notify the user about the status change
        $user = $assetRequest->user;
        if ($user) {
            foreach ($assetRequest->items as $item) {
                $user->notify(new \App\Notifications\AssetRequestNotification(
                    $item->asset,
                    $item->request_date,
                    $assetRequest->status // 'approved' or 'denied'
                ));
            }
        }

        return response()->json($assetRequest->load('items.asset'));
    }

    // Process payment for an asset request
    public function processPayment(Request $request, $id)
    {
        try {
            \Log::info('Processing payment for asset request', ['id' => $id]);
            
            $assetRequest = AssetRequest::with(['items.asset', 'user'])->findOrFail($id);
            
            // Check if request is approved
            if ($assetRequest->status !== 'approved') {
                \Log::warning('Payment attempted on non-approved request', ['id' => $id, 'status' => $assetRequest->status]);
                return response()->json(['error' => 'Only approved requests can be paid'], 400);
            }
            
            // Check if already paid
            if ($assetRequest->payment_status === 'paid') {
                \Log::warning('Payment attempted on already paid request', ['id' => $id]);
                return response()->json(['error' => 'This request has already been paid'], 400);
            }
            
            // Calculate total amount
            $totalAmount = $assetRequest->calculateTotalAmount();
            \Log::info('Calculated total amount', ['id' => $id, 'amount' => $totalAmount]);
            
            // Generate receipt number
            $receiptNumber = $assetRequest->generateReceiptNumber();
            \Log::info('Generated receipt number', ['id' => $id, 'receipt' => $receiptNumber]);
            
            // Update payment status
            $assetRequest->update([
                'payment_status' => 'paid',
                'receipt_number' => $receiptNumber,
                'amount_paid' => $totalAmount,
                'paid_at' => now(),
            ]);
            
            \Log::info('Payment status updated', ['id' => $id, 'payment_status' => 'paid']);
            
            // Send notification to user
            if ($assetRequest->user) {
                try {
                    $assetRequest->user->notify(new AssetPaymentNotification($assetRequest, $receiptNumber, $totalAmount));
                    \Log::info('Payment notification sent', ['id' => $id, 'user_id' => $assetRequest->user->id]);
                } catch (\Exception $e) {
                    \Log::error('Failed to send payment notification', ['id' => $id, 'error' => $e->getMessage()]);
                    // Don't fail the payment if notification fails
                }
            }
            
            return response()->json([
                'message' => 'Payment processed successfully',
                'receipt_number' => $receiptNumber,
                'amount_paid' => $totalAmount,
                'asset_request' => $assetRequest->load('items.asset')
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Payment processing error: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $user = auth()->user();
        $assetRequest = AssetRequest::with(['asset', 'resident.profile', 'user'])->find($id);

        if (!$assetRequest) {
            return response()->json(['error' => 'Asset request not found'], 404);
        }

        // Optionally, restrict access to only admins or the owner
        if ($user->role !== 'admin' && $assetRequest->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($assetRequest);
    }

    public function destroy($id)
    {
        $request = AssetRequest::findOrFail($id);
        $request->delete();
        return response()->json(['message' => 'Request deleted']);
    }
} 