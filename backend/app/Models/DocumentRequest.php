<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class DocumentRequest extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'user_id',
        'document_type',
        'certification_type',
        'fields',
        'certification_data',
        'status',
        'processing_notes',
        'priority',
        'estimated_completion',
        'completed_at',
        'attachment',
        'pdf_path',
        'photo_path',
        'photo_type',
        'photo_metadata',
    ];

    protected $casts = [
        'fields' => 'array',
        'certification_data' => 'array',
        'photo_metadata' => 'array',
        'estimated_completion' => 'date',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'user_id', 'user_id');
    }
} 