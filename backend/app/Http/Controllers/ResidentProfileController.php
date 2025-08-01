<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Profile;
use App\Models\Resident;
use App\Notifications\ProfileUpdatedNotification;

class ResidentProfileController extends Controller
{
    // 🔍 Admin: List all residents with profiles
    public function index()
    {
        try {
            $residents = Resident::with('profile', 'user')->get();

            return response()->json([
                'residents' => $residents,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Resident index fetch failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch residents.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // 👤 Authenticated user: View own profile
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                \Log::error('Profile show: No authenticated user found');
                return response()->json([
                    'message' => 'Authentication required',
                    'error' => 'NO_AUTH'
                ], 401);
            }
            
            \Log::info('Profile show request', [
                'user_id' => $user->id,
                'user_email' => $user->email
            ]);
            
            $resident = \App\Models\Resident::where('user_id', $user->id)->with('profile')->first();
            
            if (!$resident) {
                \Log::info('Profile show: No resident found for user', [
                    'user_id' => $user->id
                ]);
                return response()->json([
                    'message' => 'No profile found',
                    'user' => $user,
                    'profile' => null,
                    'error_code' => 'NO_RESIDENT_PROFILE'
                ], 404);
            }
            
            // Return the resident data as the main profile data
            $profileData = $resident->toArray();
            
            // If there's a separate profile record, merge any additional data
            if ($resident->profile) {
                $profileData = array_merge($profileData, $resident->profile->toArray());
            }
            
            // Ensure avatar field is properly mapped for frontend
            if (!isset($profileData['avatar']) && isset($profileData['current_photo'])) {
                $profileData['avatar'] = $profileData['current_photo'];
            }
            
            // DEBUG: Log the response structure
            \Log::info('Profile show response structure', [
                'user_id' => $user->id,
                'user_has_profile_relation' => $user->profile ? true : false,
                'resident_exists' => $resident ? true : false,
                'resident_has_profile' => $resident && $resident->profile ? true : false,
                'profile_data_keys' => array_keys($profileData),
                'avatar_value' => $profileData['avatar'] ?? 'not_set',
                'response_structure' => [
                    'user' => array_keys($user->toArray()),
                    'profile' => array_keys($profileData)
                ]
            ]);
            
            // FIX: Ensure user object includes profile data for frontend compatibility
            $userWithProfile = $user->toArray();
            $userWithProfile['profile'] = $profileData;
            
            return response()->json([
                'user' => $userWithProfile,
                'profile' => $profileData,
            ]);
        } catch (\Exception $e) {
            \Log::error('Profile show failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error fetching profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🧾 Admin: View single resident by ID
    public function showById($id)
    {
        try {
            $resident = Resident::with('profile', 'user')->find($id);

            if (!$resident) {
                return response()->json(['message' => 'Resident not found.'], 404);
            }

            return response()->json(['resident' => $resident], 200);
        } catch (\Exception $e) {
            Log::error('Failed to fetch resident by ID', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error fetching resident.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // 🆕 Create new resident profile
    public function store(Request $request)
    {
        try {
            // ✅ Use authenticated user or admin-supplied user_id
            $userId = $request->input('user_id') ?? Auth::id();

            if (!$userId) {
                return response()->json(['message' => 'User ID is required.'], 400);
            }

            // ❌ Check for existing profiles - redirect to update if profile exists
            $existingResident = Resident::where('user_id', $userId)->first();
            $existingProfile = \App\Models\Profile::where('user_id', $userId)->first();
            
            if ($existingProfile) {
                \Log::info('Profile already exists, updating instead of creating', [
                    'user_id' => $userId,
                    'resident_id' => $existingResident ? $existingResident->id : null,
                    'profile_id' => $existingProfile->id
                ]);
                
                // If profile exists, update it instead
                if ($existingResident) {
                    return $this->updateExistingProfile($request, $existingResident);
                } else {
                    // Create resident and link to existing profile
                    $request->merge(['existing_profile_id' => $existingProfile->id]);
                    // Continue with store method but link to existing profile
                }
            }
            
            // Clean up any duplicate residents for this user before creating new profile
            if ($existingResident) {
                $duplicateResidents = Resident::where('user_id', $userId)
                    ->where('id', '!=', $existingResident->id)
                    ->get();
                
                if ($duplicateResidents->count() > 0) {
                    \Log::info('Cleaning up duplicate residents before creating profile', [
                        'user_id' => $userId,
                        'keeping_resident_id' => $existingResident->id,
                        'deleting_count' => $duplicateResidents->count()
                    ]);
                    
                    foreach ($duplicateResidents as $duplicate) {
                        if ($duplicate->profile) {
                            $duplicate->profile->delete();
                        }
                        $duplicate->delete();
                    }
                }
            }

            // More flexible validation - make most fields nullable for updates
            $validated = $request->validate([
                'first_name' => 'nullable|string',
                'last_name' => 'nullable|string',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string',
                'age' => 'nullable|integer',
                'email' => 'nullable|email',
                'contact_number' => 'nullable|string',
                'sex' => 'nullable|string',
                'civil_status' => 'nullable|string',
                'religion' => 'nullable|string',
                'full_address' => 'nullable|string',
                'years_in_barangay' => 'nullable|integer',
                'voter_status' => 'nullable|string',
                'head_of_family' => 'nullable|boolean',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

                // Optional
                'middle_name' => 'nullable|string',
                'name_suffix' => 'nullable|string',
                'nationality' => 'nullable|string',
                'relation_to_head' => 'nullable|string',
                'voters_id_number' => 'nullable|string',
                'voting_location' => 'nullable|string',
                'housing_type' => 'nullable|string',
                'household_no' => 'nullable|string',
                'classified_sector' => 'nullable|string',
                'educational_attainment' => 'nullable|string',
                'occupation_type' => 'nullable|string',
                'salary_income' => 'nullable|string',
                'business_info' => 'nullable|string',
                'business_type' => 'nullable|string',
                'business_location' => 'nullable|string',
                'business_outside_barangay' => 'nullable|boolean',
                'special_categories' => 'nullable|array',
                'covid_vaccine_status' => 'nullable|string',
                'vaccine_received' => 'nullable|array',
                'other_vaccine' => 'nullable|string',
                'year_vaccinated' => 'nullable|integer',
            ]);

            // Get all fillable data and provide defaults for required fields
            $data = $request->only((new Profile)->getFillable());
            
            // Provide default values for required database fields that might be null/empty
            $requiredDefaults = [
                'full_address' => $data['full_address'] ?: 'Not provided',
                'contact_number' => $data['contact_number'] ?: 'Not provided',
                'first_name' => $data['first_name'] ?: 'Unknown',
                'last_name' => $data['last_name'] ?: 'Unknown',
                'email' => $data['email'] ?: 'noemail@example.com',
                'birth_date' => $data['birth_date'] ?: now()->subYears(18)->format('Y-m-d'),
                'birth_place' => $data['birth_place'] ?: 'Unknown',
                'age' => $data['age'] ?: 18,
                'sex' => $data['sex'] ?: 'Not specified',
                'civil_status' => $data['civil_status'] ?: 'Single',
                'religion' => $data['religion'] ?: 'Not specified',
                'years_in_barangay' => $data['years_in_barangay'] ?: 0,
                'voter_status' => $data['voter_status'] ?: 'Not registered',
            ];
            
            // Merge defaults with actual data
            $data = array_merge($data, array_filter($requiredDefaults, function($value, $key) use ($data) {
                return !isset($data[$key]) || $data[$key] === null || $data[$key] === '';
            }, ARRAY_FILTER_USE_BOTH));
            
            // Handle boolean fields explicitly
            $data['head_of_family'] = $request->boolean('head_of_family');
            $data['business_outside_barangay'] = $request->boolean('business_outside_barangay');
            
            // Handle array fields
            $data['special_categories'] = $request->input('special_categories', []);
            $data['vaccine_received'] = $request->input('vaccine_received', []);

            if ($request->hasFile('avatar')) {
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            // Check if we should use existing profile
            $existingProfileId = $request->input('existing_profile_id');
            if ($existingProfileId) {
                $profile = \App\Models\Profile::find($existingProfileId);
                if ($profile) {
                    // Update existing profile with new data
                    $profile->update($data);
                    \Log::info('Updated existing profile instead of creating new one', [
                        'profile_id' => $profile->id,
                        'user_id' => $userId
                    ]);
                } else {
                    // Fallback to creating new profile if existing one not found
                    $residentsId = 'RES-' . now()->format('YmdHis') . '-' . strtoupper(substr($validated['last_name'], 0, 3));
                    $data['residents_id'] = $residentsId;
                    $profile = new Profile($data);
                    $profile->user_id = $userId;
                    $profile->save();
                }
            } else {
                // Create new profile
                $residentsId = 'RES-' . now()->format('YmdHis') . '-' . strtoupper(substr($validated['last_name'], 0, 3));
                $data['residents_id'] = $residentsId;
                $profile = new Profile($data);
                $profile->user_id = $userId;
                $profile->save();
            }

            // Apply the same defaults for the Resident model
            $residentData = $data;
            // Ensure both full_address and current_address are set for Resident model
            $address = $residentData['full_address'] ?? 'Not provided';
            $residentData['full_address'] = $address;
            $residentData['current_address'] = $address;
            
            $resident = new Resident($residentData);
            $resident->user_id = $userId;
            $resident->profile_id = $profile->id;
            $resident->residents_id = $residentsId;
            $resident->save();

            $user = Auth::user();
            // Temporarily disable notification to prevent email configuration errors
            // $user->notify(new ProfileUpdatedNotification($profile, $resident));

            return response()->json([
                'message' => 'Profile and Resident created successfully.',
                'residents_id' => $residentsId,
                'profile' => $profile,
                'resident' => $resident,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Profile store failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to create profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✏️ Update existing profile
    public function update(Request $request)
    {
        try {
            $user = $request->user();
            
            \Log::info('Profile update attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'has_avatar_file' => $request->hasFile('avatar')
            ]);
            
            // Try to find existing resident - use first() to get the first one if duplicates exist
            $resident = \App\Models\Resident::where('user_id', $user->id)->first();
            
            // If no resident exists, create both resident and profile
            if (!$resident) {
                \Log::info('No resident found, creating new profile via store method');
                return $this->store($request);
            }
            
            // Clean up any duplicate residents for this user (keep the first one)
            $duplicateResidents = \App\Models\Resident::where('user_id', $user->id)
                ->where('id', '!=', $resident->id)
                ->get();
            
            if ($duplicateResidents->count() > 0) {
                \Log::info('Found duplicate residents, cleaning up', [
                    'user_id' => $user->id,
                    'keeping_resident_id' => $resident->id,
                    'deleting_count' => $duplicateResidents->count()
                ]);
                
                foreach ($duplicateResidents as $duplicate) {
                    // Delete associated profiles if they exist
                    if ($duplicate->profile) {
                        $duplicate->profile->delete();
                    }
                    $duplicate->delete();
                }
            }
            
            // Check for existing profile both through resident relationship and directly by user_id
            $profile = $resident->profile;
            if (!$profile) {
                // Also check if there's a profile directly by user_id
                $profile = \App\Models\Profile::where('user_id', $user->id)->first();
            }

            // If resident exists but no profile, create profile and link it
            if (!$profile) {
                \Log::info('Resident exists but no profile, creating profile and linking');
                return $this->store($request);
            } else if (!$resident->profile_id && $profile) {
                // If profile exists but not linked to resident, link them
                \Log::info('Profile exists but not linked to resident, linking them', [
                    'resident_id' => $resident->id,
                    'profile_id' => $profile->id
                ]);
                $resident->profile_id = $profile->id;
                $resident->save();
            }
            
            \Log::info('Updating existing profile', [
                'resident_id' => $resident->id,
                'profile_id' => $profile->id
            ]);

            // Flexible validation for updates - all fields nullable
            $validated = $request->validate([
                'first_name' => 'nullable|string',
                'last_name' => 'nullable|string',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string',
                'age' => 'nullable|integer',
                'email' => 'nullable|email',
                'contact_number' => 'nullable|string',
                'sex' => 'nullable|string',
                'civil_status' => 'nullable|string',
                'religion' => 'nullable|string',
                'full_address' => 'nullable|string',
                'years_in_barangay' => 'nullable|integer',
                'voter_status' => 'nullable|string',
                'head_of_family' => 'nullable|boolean',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

                // Optional
                'middle_name' => 'nullable|string',
                'name_suffix' => 'nullable|string',
                'nationality' => 'nullable|string',
                'relation_to_head' => 'nullable|string',
                'voters_id_number' => 'nullable|string',
                'voting_location' => 'nullable|string',
                'housing_type' => 'nullable|string',
                'household_no' => 'nullable|string',
                'classified_sector' => 'nullable|string',
                'educational_attainment' => 'nullable|string',
                'occupation_type' => 'nullable|string',
                'salary_income' => 'nullable|string',
                'business_info' => 'nullable|string',
                'business_type' => 'nullable|string',
                'business_location' => 'nullable|string',
                'business_outside_barangay' => 'nullable|boolean',
                'special_categories' => 'nullable|array',
                'covid_vaccine_status' => 'nullable|string',
                'vaccine_received' => 'nullable|array',
                'other_vaccine' => 'nullable|string',
                'year_vaccinated' => 'nullable|integer',
            ]);

            // Get all fillable data - for updates, only update provided fields
            $data = array_filter($request->only((new Profile)->getFillable()), function($value) {
                return $value !== null && $value !== '';
            });
            
            // Handle boolean fields explicitly
            if ($request->has('head_of_family')) {
                $data['head_of_family'] = $request->boolean('head_of_family');
            }
            if ($request->has('business_outside_barangay')) {
                $data['business_outside_barangay'] = $request->boolean('business_outside_barangay');
            }
            
            // Handle array fields
            $data['special_categories'] = $request->input('special_categories', []);
            $data['vaccine_received'] = $request->input('vaccine_received', []);

            if ($request->hasFile('avatar')) {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $data['avatar'] = $avatarPath;
                
                // DEBUG: Log avatar upload details
                \Log::info('Avatar upload in profile update', [
                    'user_id' => $user->id,
                    'avatar_path' => $avatarPath,
                    'file_name' => $request->file('avatar')->getClientOriginalName(),
                    'file_size' => $request->file('avatar')->getSize(),
                    'storage_path' => storage_path('app/public/' . $avatarPath),
                    'public_url' => asset('storage/' . $avatarPath)
                ]);
            }

            $profile->update($data);

            // Ensure both address fields are set for Resident model
            $residentData = $data;
            if (isset($residentData['full_address'])) {
                $address = $residentData['full_address'];
                $residentData['full_address'] = $address;
                $residentData['current_address'] = $address;
            }
            
            $resident->fill($residentData);
            $resident->user_id = $user->id;
            $resident->profile_id = $profile->id;
            $resident->residents_id = $profile->residents_id;
            $resident->save();

            // Temporarily disable notification to prevent email configuration errors
            // $user->notify(new \App\Notifications\ProfileUpdatedNotification($profile, $resident));

            return response()->json([
                'message' => 'Profile and Resident updated successfully.',
                'profile' => $profile,
                'resident' => $resident,
                'user' => $user->fresh('profile'),
            ]);
        } catch (\Exception $e) {
            \Log::error('Profile update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to update existing profile (called from store when profile exists)
     */
    private function updateExistingProfile(Request $request, $resident)
    {
        try {
            $user = $request->user();
            $profile = $resident->profile;

            // Flexible validation for updates - all fields nullable
            $validated = $request->validate([
                'first_name' => 'nullable|string',
                'last_name' => 'nullable|string',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string',
                'age' => 'nullable|integer',
                'email' => 'nullable|email',
                'contact_number' => 'nullable|string',
                'sex' => 'nullable|string',
                'civil_status' => 'nullable|string',
                'religion' => 'nullable|string',
                'full_address' => 'nullable|string',
                'years_in_barangay' => 'nullable|integer',
                'voter_status' => 'nullable|string',
                'head_of_family' => 'nullable|boolean',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

                // Optional fields
                'middle_name' => 'nullable|string',
                'name_suffix' => 'nullable|string',
                'nationality' => 'nullable|string',
                'relation_to_head' => 'nullable|string',
                'voters_id_number' => 'nullable|string',
                'voting_location' => 'nullable|string',
                'housing_type' => 'nullable|string',
                'household_no' => 'nullable|string',
                'classified_sector' => 'nullable|string',
                'educational_attainment' => 'nullable|string',
                'occupation_type' => 'nullable|string',
                'salary_income' => 'nullable|string',
                'business_info' => 'nullable|string',
                'business_type' => 'nullable|string',
                'business_location' => 'nullable|string',
                'business_outside_barangay' => 'nullable|boolean',
                'special_categories' => 'nullable|array',
                'covid_vaccine_status' => 'nullable|string',
                'vaccine_received' => 'nullable|array',
                'other_vaccine' => 'nullable|string',
                'year_vaccinated' => 'nullable|integer',
            ]);

            // Get all fillable data - for updates, only update provided fields
            $data = array_filter($request->only((new Profile)->getFillable()), function($value) {
                return $value !== null && $value !== '';
            });
            
            // Handle boolean fields explicitly
            if ($request->has('head_of_family')) {
                $data['head_of_family'] = $request->boolean('head_of_family');
            }
            if ($request->has('business_outside_barangay')) {
                $data['business_outside_barangay'] = $request->boolean('business_outside_barangay');
            }
            
            // Handle array fields
            $data['special_categories'] = $request->input('special_categories', []);
            $data['vaccine_received'] = $request->input('vaccine_received', []);

            if ($request->hasFile('avatar')) {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $data['avatar'] = $avatarPath;
                
                \Log::info('Avatar upload in updateExistingProfile', [
                    'user_id' => $user->id,
                    'avatar_path' => $avatarPath,
                    'file_name' => $request->file('avatar')->getClientOriginalName(),
                ]);
            }

            $profile->update($data);

            // Ensure both address fields are set for Resident model
            $residentData = $data;
            if (isset($residentData['full_address'])) {
                $address = $residentData['full_address'];
                $residentData['full_address'] = $address;
                $residentData['current_address'] = $address;
            }
            
            $resident->fill($residentData);
            $resident->user_id = $user->id;
            $resident->profile_id = $profile->id;
            $resident->residents_id = $profile->residents_id;
            $resident->save();

            // Temporarily disable notification to prevent email configuration errors
            // $user->notify(new \App\Notifications\ProfileUpdatedNotification($profile, $resident));

            return response()->json([
                'message' => 'Profile updated successfully.',
                'profile' => $profile->fresh(),
                'resident' => $resident->fresh(),
                'user' => $user->fresh(),
            ]);
        } catch (\Exception $e) {
            \Log::error('updateExistingProfile failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'An error occurred while updating profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
