<?php

namespace App\Http\Controllers;

use App\Models\Beneficiary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BeneficiaryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Beneficiary::query();
        if ($request->has('beneficiary_type')) {
            $query->where('beneficiary_type', $request->beneficiary_type);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('assistance_type')) {
            $query->where('assistance_type', $request->assistance_type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('contact_number', 'like', "%$search%")
                  ->orWhere('address', 'like', "%$search%")
                  ->orWhere('remarks', 'like', "%$search%")
                  ->orWhere('beneficiary_type', 'like', "%$search%")
                  ->orWhere('assistance_type', 'like', "%$search%")
                  ->orWhere('status', 'like', "%$search%")
                  ;
            });
        }
        return response()->json($query->orderByDesc('id')->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'beneficiary_type' => 'required|string',
            'status' => 'string',
            'assistance_type' => 'required|string',
            'amount' => 'nullable|numeric',
            'contact_number' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'application_date' => 'nullable|date',
            'approved_date' => 'nullable|date',
            'remarks' => 'nullable|string',
            'attachment' => 'nullable|file',
        ]);
        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('attachments');
        }
        $beneficiary = Beneficiary::create($data);
        return response()->json($beneficiary, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $beneficiary = Beneficiary::with('disbursements')->findOrFail($id);
        return response()->json($beneficiary);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Beneficiary $beneficiary)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $beneficiary = Beneficiary::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'beneficiary_type' => 'sometimes|required|string',
            'status' => 'string',
            'assistance_type' => 'sometimes|required|string',
            'amount' => 'nullable|numeric',
            'contact_number' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'application_date' => 'nullable|date',
            'approved_date' => 'nullable|date',
            'remarks' => 'nullable|string',
            'attachment' => 'nullable|file',
        ]);
        if ($request->hasFile('attachment')) {
            if ($beneficiary->attachment) {
                Storage::delete($beneficiary->attachment);
            }
            $data['attachment'] = $request->file('attachment')->store('attachments');
        }
        $beneficiary->update($data);
        return response()->json($beneficiary);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $beneficiary = Beneficiary::findOrFail($id);
        if ($beneficiary->attachment) {
            Storage::delete($beneficiary->attachment);
        }
        $beneficiary->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
