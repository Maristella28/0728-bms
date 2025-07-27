<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ResidentController extends Controller
{
    // 🧾 Store a new profile and resident
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            // Profile fields
            'residents_id'       => 'required|string|unique:profiles,residents_id',
            'first_name'         => 'required|string',
            'middle_name'        => 'nullable|string',
            'last_name'          => 'required|string',
            'name_suffix'        => 'nullable|string',
            'birth_date'         => 'required|date',
            'birth_place'        => 'required|string',
            'age'                => 'required|integer',
            'nationality'        => 'nullable|string',
            'email'              => 'required|email',
            'contact_number'     => 'required|string',
            'sex'                => 'required|string',
            'civil_status'       => 'required|string',
            'religion'           => 'required|string',
            'full_address'       => 'required|string',
            'years_in_barangay'  => 'required|integer',
            'voter_status'       => 'required|string',
            'avatar'             => 'nullable|image|mimes:jpg,jpeg,png|max:2048',

            // Resident fields
            'household_no'       => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (Profile::where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Profile already exists.'], 409);
        }

        // ✅ Correct avatar upload logic
        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $profile = Profile::create([
            ...$data,
            'user_id' => $user->id,
            'avatar'  => $data['avatar'] ?? null,
        ]);

        $resident = Resident::create([
            ...$data,
            'user_id'    => $user->id,
            'profile_id' => $profile->id,
            'residents_id' => $profile->residents_id,
            'avatar'     => $data['avatar'] ?? null,
        ]);

        return response()->json([
            'message'  => '✅ Profile and Resident successfully saved.',
            'profile'  => $profile,
            'resident' => $resident,
        ], 201);
    }

    // 📄 Get all residents with profiles
    public function index()
    {
        $residents = Resident::with('profile')->get();

        return response()->json([
            'residents' => $residents
        ]);
    }

    // 👤 Get current user's resident profile
    public function myProfile(Request $request)
    {
        $user = $request->user();
        
        $resident = Resident::where('user_id', $user->id)->first();
        
        if (!$resident) {
            return response()->json([
                'message' => 'Resident profile not found. Please complete your profile first.'
            ], 404);
        }
        
        return response()->json($resident);
    }

    // ✏️ Update existing resident and profile
    public function update(Request $request, $id)
    {
        $resident = Resident::findOrFail($id);
        $profile = $resident->profile;

        $validator = Validator::make($request->all(), [
            'first_name'         => 'required|string',
            'middle_name'        => 'nullable|string',
            'last_name'          => 'required|string',
            'name_suffix'        => 'nullable|string',
            'birth_date'         => 'required|date',
            'birth_place'        => 'required|string',
            'age'                => 'required|integer',
            'nationality'        => 'nullable|string',
            'email'              => 'required|email',
            'contact_number'     => 'required|string',
            'sex'                => 'required|string',
            'civil_status'       => 'required|string',
            'religion'           => 'required|string',
            'full_address'       => 'required|string',
            'years_in_barangay'  => 'required|integer',
            'voter_status'       => 'required|string',
            'household_no'       => 'required|string',
            'avatar'             => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // ✅ Correct avatar upload logic
        if ($request->hasFile('avatar')) {
            // Optionally delete the old avatar file
            if ($profile->avatar) {
                Storage::disk('public')->delete($profile->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            $profile->avatar = $data['avatar'];
            $resident->avatar = $data['avatar'];
        }

        // Fill and save other data
        $profile->fill($data)->save();
        $resident->fill($data)->save();

        return response()->json([
            'message'  => '✅ Resident and profile updated successfully.',
            'resident' => $resident,
            'profile'  => $profile,
        ]);
    }
}