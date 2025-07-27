<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $table = 'profiles'; // Explicitly define table name (optional but clear)

    protected $fillable = [
        'user_id',
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
        'full_address',
        'years_in_barangay',
        'voter_status',
        'voters_id_number',
        'voting_location',
        'avatar',
        'housing_type',
        'head_of_family',
        'household_no',
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
     * Relationship: Profile belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Profile has one corresponding Resident record.
     * Mapping by residents_id for proper syncing.
     */
    public function resident()
    {
        return $this->hasOne(Resident::class, 'residents_id', 'residents_id');
    }
}
