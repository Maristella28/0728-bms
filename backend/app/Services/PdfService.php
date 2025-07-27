<?php

namespace App\Services;

use App\Models\DocumentRequest;
use App\Models\Resident;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PdfService
{
    public function generateCertificate(DocumentRequest $documentRequest, Resident $resident)
    {
        try {
            // Check if DomPDF is available
            if (!class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                throw new \Exception('DomPDF package is not installed or not properly configured.');
            }

            $template = $this->getTemplateName($documentRequest->document_type);
            
            // Check if template exists
            if (!view()->exists("certificates.{$template}")) {
                throw new \Exception("Certificate template 'certificates.{$template}' not found.");
            }
            
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView("certificates.{$template}", [
                'documentRequest' => $documentRequest,
                'resident' => $resident
            ]);
            
            $pdf->setPaper('A4', 'portrait');
            
            // Generate filename
            $filename = $this->generateFilename($documentRequest, $resident);
            
            // Ensure certificates directory exists
            $certificatesPath = 'certificates';
            if (!Storage::disk('public')->exists($certificatesPath)) {
                Storage::disk('public')->makeDirectory($certificatesPath);
            }
            
            // Save to storage
            $path = "{$certificatesPath}/{$filename}";
            Storage::disk('public')->put($path, $pdf->output());
            
            Log::info("PDF certificate generated successfully", [
                'document_request_id' => $documentRequest->id,
                'resident_id' => $resident->id,
                'pdf_path' => $path
            ]);
            
            return $path;
            
        } catch (\Exception $e) {
            Log::error("Failed to generate PDF certificate", [
                'document_request_id' => $documentRequest->id,
                'resident_id' => $resident->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }
    
    private function getTemplateName($documentType)
    {
        $templates = [
            'Brgy Clearance' => 'brgy-clearance',
            'Brgy Business Permit' => 'brgy-business-permit',
            'Brgy Indigency' => 'brgy-indigency',
            'Brgy Residency' => 'brgy-residency',
        ];
        
        return $templates[$documentType] ?? 'brgy-clearance';
    }
    
    private function generateFilename(DocumentRequest $documentRequest, Resident $resident)
    {
        $documentType = str_replace(' ', '-', strtolower($documentRequest->document_type));
        $residentName = str_replace(' ', '-', strtolower($resident->first_name . '-' . $resident->last_name));
        $date = now()->format('Y-m-d');
        $id = $documentRequest->id;
        
        return "{$documentType}-{$residentName}-{$date}-{$id}.pdf";
    }
    
    public function downloadCertificate($path)
    {
        if (!Storage::disk('public')->exists($path)) {
            throw new \Exception('Certificate file not found: ' . $path);
        }
        
        return Storage::disk('public')->download($path);
    }
} 