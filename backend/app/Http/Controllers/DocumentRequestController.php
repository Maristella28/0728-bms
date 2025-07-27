<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentRequestController extends Controller
{
    // Admin: Fetch all document requests with resident data
    public function index()
    {
        $requests = DocumentRequest::with(['user', 'resident'])->orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }

    // Resident: Create a new document request
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Check if user has a resident profile
        $resident = Resident::where('user_id', $user->id)->first();
        
        if (!$resident) {
            return response()->json([
                'message' => 'Resident profile not found. Please complete your profile first.'
            ], 404);
        }

        $validated = $request->validate([
            'document_type' => 'required|string',
            'fields' => 'nullable|array',
            'attachment' => 'nullable|string',
        ]);
        
        $docRequest = DocumentRequest::create([
            'user_id' => $user->id,
            'document_type' => $validated['document_type'],
            'fields' => $validated['fields'] ?? [],
            'status' => 'pending',
            'attachment' => $validated['attachment'] ?? null,
        ]);
        
        return response()->json([
            'message' => 'Document request created successfully.',
            'document_request' => $docRequest->load(['user', 'resident'])
        ], 201);
    }

    // Admin: Update status or details of a document request
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'fields' => 'nullable|array',
            'attachment' => 'nullable|string',
        ]);
        
        $docRequest = DocumentRequest::findOrFail($id);
        $docRequest->status = $validated['status'];
        
        if (isset($validated['fields'])) {
            $docRequest->fields = $validated['fields'];
        }
        
        if (isset($validated['attachment'])) {
            $docRequest->attachment = $validated['attachment'];
        }
        
        $docRequest->save();
        
        return response()->json($docRequest->load(['user', 'resident']));
    }

    // Get document requests for authenticated user (resident)
    public function myRequests()
    {
        $user = Auth::user();
        $requests = DocumentRequest::where('user_id', $user->id)
            ->with(['user', 'resident'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($requests);
    }

    // Generate PDF certificate
    public function generatePdf(Request $request, $id)
    {
        try {
            $documentRequest = DocumentRequest::with(['user', 'resident'])->findOrFail($id);
            
            if (!$documentRequest->resident) {
                return response()->json([
                    'message' => 'Resident profile not found for this document request.'
                ], 404);
            }
            
            // Check if document is approved
            if (strtolower($documentRequest->status) !== 'approved') {
                return response()->json([
                    'message' => 'Only approved document requests can generate PDF certificates.'
                ], 400);
            }
            
            $pdfService = new PdfService();
            $pdfPath = $pdfService->generateCertificate($documentRequest, $documentRequest->resident);
            
            // Update document request with PDF path
            $documentRequest->update([
                'pdf_path' => $pdfPath
            ]);
            
            return response()->json([
                'message' => 'PDF certificate generated successfully.',
                'pdf_path' => $pdfPath,
                'download_url' => url("storage/{$pdfPath}")
            ]);
            
        } catch (\Exception $e) {
            \Log::error('PDF Generation Error', [
                'document_request_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to generate PDF certificate.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Download PDF certificate
    public function downloadPdf($id)
    {
        try {
            $documentRequest = DocumentRequest::findOrFail($id);
            
            if (!$documentRequest->pdf_path) {
                return response()->json([
                    'message' => 'PDF certificate not found. Please generate it first.'
                ], 404);
            }
            
            $pdfService = new PdfService();
            return $pdfService->downloadCertificate($documentRequest->pdf_path);
            
        } catch (\Exception $e) {
            \Log::error('PDF Download Error', [
                'document_request_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to download PDF certificate.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Test PDF generation (for debugging)
    public function testPdf()
    {
        try {
            // Check if DomPDF is available
            if (!class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                return response()->json([
                    'error' => 'DomPDF package is not installed or not properly configured.',
                    'status' => 'DomPDF not found'
                ], 500);
            }

            // Check if templates exist
            $templates = ['brgy-clearance', 'brgy-business-permit', 'brgy-indigency', 'brgy-residency'];
            $missingTemplates = [];
            
            foreach ($templates as $template) {
                if (!view()->exists("certificates.{$template}")) {
                    $missingTemplates[] = $template;
                }
            }

            if (!empty($missingTemplates)) {
                return response()->json([
                    'error' => 'Missing certificate templates',
                    'missing_templates' => $missingTemplates,
                    'status' => 'Templates missing'
                ], 500);
            }

            // Check storage
            $storageStatus = [
                'public_disk_exists' => Storage::disk('public')->exists(''),
                'certificates_dir_exists' => Storage::disk('public')->exists('certificates'),
                'storage_link_exists' => file_exists(public_path('storage'))
            ];

            return response()->json([
                'message' => 'PDF system is properly configured',
                'status' => 'OK',
                'storage_status' => $storageStatus,
                'dompdf_available' => true,
                'templates_available' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Test failed',
                'message' => $e->getMessage(),
                'status' => 'Error'
            ], 500);
        }
    }
} 