<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Beneficiary extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'beneficiary_type',
        'status',
        'assistance_type',
        'amount',
        'contact_number',
        'email',
        'address',
        'application_date',
        'approved_date',
        'remarks',
        'attachment',
    ];

    public function disbursements()
    {
        return $this->hasMany(Disbursement::class);
    }
}
