<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    use HasFactory;

    protected $table = 'residents';

    protected $fillable = [
        'user_id',
        'profile_id',
        'residents_id',
        'first_name',
        'middle_name',
        'last_name',
        'name_suffix',
        'birth_date',
        'birth_place',
        'age',
        'nationality',
        'sex',
        'civil_status',
        'religion',
        'relation_to_head',
        'email',
        'contact_number',
        'landline_number',
        'avatar', // 🔁 replaced 'current_photo'
        'full_address',
        'years_in_barangay',
        'voter_status',
        'voters_id_number',
        'voting_location',
        'household_no',
        'housing_type',
        'head_of_family',
        'classified_sector',
        'educational_attainment',
        'occupation_type',
        'salary_income',
        'business_info',
        'business_type',
        'business_location',
        'business_outside_barangay',
        'special_categories',
        'covid_vaccine_status',
        'vaccine_received',
        'other_vaccine',
        'year_vaccinated',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'age' => 'integer',
        'years_in_barangay' => 'integer',
        'year_vaccinated' => 'integer',
        'head_of_family' => 'boolean',
        'business_outside_barangay' => 'boolean',
        'special_categories' => 'array',
        'vaccine_received' => 'array',
    ];

    /**
     * Relationship: Resident belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    /**
     * Relationship: Resident belongs to a profile.
     */
    public function profile()
    {
        return $this->belongsTo(\App\Models\Profile::class, 'profile_id');
    }
}
