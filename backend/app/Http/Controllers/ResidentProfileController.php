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
        $user = $request->user();
        $user->load('profile');
        $resident = \App\Models\Resident::where('user_id', $user->id)->first();
        return response()->json([
            'user' => $user,
            'profile' => $resident,
        ]);
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

            // ❌ Prevent duplicate profiles
            if (Resident::where('user_id', $userId)->exists()) {
                return response()->json(['message' => 'Profile already exists for this user.'], 409);
            }

            $validated = $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'birth_date' => 'required|date',
                'birth_place' => 'required|string',
                'age' => 'required|integer',
                'email' => 'required|email',
                'contact_number' => 'required|string',
                'sex' => 'required|string',
                'civil_status' => 'required|string',
                'religion' => 'required|string',
                'full_address' => 'required|string',
                'years_in_barangay' => 'required|integer',
                'voter_status' => 'required|string',
                'head_of_family' => 'required|boolean',
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

            $data = $request->only((new Profile)->getFillable());
            $data['head_of_family'] = $request->boolean('head_of_family');
            $data['business_outside_barangay'] = $request->boolean('business_outside_barangay');
            $data['special_categories'] = $request->input('special_categories', []);
            $data['vaccine_received'] = $request->input('vaccine_received', []);

            if ($request->hasFile('avatar')) {
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            $residentsId = 'RES-' . now()->format('YmdHis') . '-' . strtoupper(substr($validated['last_name'], 0, 3));
            $data['residents_id'] = $residentsId;

            $profile = new Profile($data);
            $profile->user_id = $userId;
            $profile->save();

            $resident = new Resident($data);
            $resident->user_id = $userId;
            $resident->profile_id = $profile->id;
            $resident->residents_id = $residentsId;
            $resident->save();

            $user = Auth::user();
            $user->notify(new ProfileUpdatedNotification($profile, $resident));

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
            $resident = \App\Models\Resident::where('user_id', $user->id)->firstOrFail();
            $profile = $resident->profile;

            if (!$profile) {
                return response()->json(['message' => 'Profile not found.'], 404);
            }

            $validated = $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'birth_date' => 'required|date',
                'birth_place' => 'required|string',
                'age' => 'required|integer',
                'email' => 'required|email',
                'contact_number' => 'required|string',
                'sex' => 'required|string',
                'civil_status' => 'required|string',
                'religion' => 'required|string',
                'full_address' => 'required|string',
                'years_in_barangay' => 'required|integer',
                'voter_status' => 'required|string',
                'head_of_family' => 'required|boolean',
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

            $data = $request->only((new Profile)->getFillable());
            $data['head_of_family'] = $request->boolean('head_of_family');
            $data['business_outside_barangay'] = $request->boolean('business_outside_barangay');
            $data['special_categories'] = $request->input('special_categories', []);
            $data['vaccine_received'] = $request->input('vaccine_received', []);

            if ($request->hasFile('avatar')) {
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            $profile->update($data);

            $resident->fill($data);
            $resident->user_id = $user->id;
            $resident->profile_id = $profile->id;
            $resident->residents_id = $profile->residents_id;
            $resident->save();

            $user->notify(new \App\Notifications\ProfileUpdatedNotification($profile, $resident));

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
}