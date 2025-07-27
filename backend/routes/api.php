<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ResidentProfileController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BlotterRequestController;
use App\Http\Controllers\BlotterRecordsController;
use App\Http\Controllers\OrganizationalChartController;
use App\Http\Controllers\EmergencyHotlineController;
use App\Http\Controllers\DisasterEmergencyRecordController;
use App\Http\Controllers\FinancialRecordController;
use App\Http\Controllers\DocumentRequestController;

/*
|--------------------------------------------------------------------------
| Public API Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// 🔐 Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']); // Returns Bearer token

// 🔐 New Verification Code Routes
Route::post('/verify-registration', [AuthController::class, 'verifyRegistration']);
Route::post('/resend-verification-code', [AuthController::class, 'resendVerificationCode']);

// Test route for debugging
Route::post('/test-register', function(Request $request) {
    \Log::info('Test registration attempt:', $request->all());
    return response()->json([
        'message' => 'Test registration received',
        'data' => $request->all()
    ]);
});

// Debug registration validation
Route::post('/debug-register', function(Request $request) {
    \Log::info('Debug registration attempt:', $request->all());
    
    try {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'nullable|string|in:admin,staff,treasurer,residents',
        ]);
        
        return response()->json([
            'message' => 'Validation passed',
            'validated' => $validated
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors(),
            'request_data' => $request->all()
        ], 422);
    }
});

// 📧 Email Verification Routes (Legacy - keeping for compatibility)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerification'])->name('verification.resend');

// 📢 Public Announcements (only "posted" shown to guests)
Route::get('/announcements', [AnnouncementController::class, 'index']);

// 🆔 Fetch individual user (used in modal selection)
Route::get('/user/{id}', function ($id) {
    $user = \App\Models\User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }
    return response()->json(['user' => $user]);
});

// 📋 Organizational Chart (Public)
Route::get('/organizational-chart/officials', [OrganizationalChartController::class, 'getOfficials']);
Route::get('/organizational-chart/staff', [OrganizationalChartController::class, 'getStaff']);

// 📞 Emergency Hotlines (public)
Route::get('/emergency-hotlines', [EmergencyHotlineController::class, 'index']);
Route::get('/emergency-hotlines/{id}', [EmergencyHotlineController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Protected API Routes (Authenticated via Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'throttle:200,1'])->group(function () {

    // 🔒 Authenticated user endpoints
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn(Request $request) => response()->json($request->user()));
    Route::get('/profile', [ResidentProfileController::class, 'show']);

    // ✅ Mark user as having logged in
    Route::patch('/user/update-login-status', function (Request $request) {
        $user = $request->user();
        $user->has_logged_in = true;
        $user->save();

        return response()->json(['message' => 'Login status updated']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin-Only Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {

        // 🧑‍💼 User management
        Route::post('/register', [AuthController::class, 'register']);
        Route::delete('/user/{id}', [AuthController::class, 'deleteUser']);

        // 📊 Dashboard summary
        Route::get('/dashboard', [AdminController::class, 'index']);

        // 👥 Residents list
        Route::get('/residents', [ResidentProfileController::class, 'index']);
        Route::get('/residents/{id}', [ResidentProfileController::class, 'showById']);
        Route::put('/residents/{id}', [ResidentController::class, 'update']); // Admin update

        // 📢 Announcements full CRUD
        Route::get('/announcements', [AnnouncementController::class, 'index']); // Admin can see all announcements
        Route::apiResource('/announcements', AnnouncementController::class)->except(['index']);
        Route::patch('/announcements/{announcement}/toggle', [AnnouncementController::class, 'toggleStatus']);

        // 🔍 Users without existing profiles
        Route::get('/users-without-profiles', [AdminController::class, 'usersWithoutProfiles']);

        // ✅ Check if user already has a profile
        Route::get('/users/{id}/has-profile', function ($id) {
            $user = \App\Models\User::with('profile')->find($id);
            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }
            return response()->json(['exists' => $user->profile !== null]);
        });

        // 📋 Projects CRUD (Admin only)
        Route::apiResource('/projects', App\Http\Controllers\ProjectController::class);

        // 📝 Feedback management (Admin only)
        Route::apiResource('/feedbacks', App\Http\Controllers\FeedbackController::class);

        // 📞 Emergency Hotlines (admin CRUD)
        Route::post('/emergency-hotlines', [EmergencyHotlineController::class, 'store']);
        Route::put('/emergency-hotlines/{id}', [EmergencyHotlineController::class, 'update']);
        Route::delete('/emergency-hotlines/{id}', [EmergencyHotlineController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Shared Authenticated Routes
    |--------------------------------------------------------------------------
    */

    // 👤 Resident: Own profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ResidentProfileController::class, 'show']);
        Route::match(['post', 'put'], '/update', [ResidentProfileController::class, 'update']);
    });

    // 🆕 Resident: Complete first-time profile (Authenticated only)
    Route::post('/residents/complete-profile', [ResidentProfileController::class, 'store']);
Route::get('/residents/my-profile', [ResidentController::class, 'myProfile']);

    // 🧾 Authenticated users (incl. admin): Read residents
    Route::get('/residents', [ResidentProfileController::class, 'index']);
    Route::get('/residents/{id}', [ResidentProfileController::class, 'showById']);

    // 🔔 Notifications
    Route::get('/notifications', function (Request $request) {
        // Return notifications for the authenticated user
        return response()->json([
            'notifications' => $request->user()->notifications
        ]);
    });
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Assets
    Route::get('/assets', [AssetController::class, 'index']);
    Route::post('/assets', [AssetController::class, 'store']); // admin
    Route::patch('/assets/{id}', [AssetController::class, 'update']); // admin
    Route::get('/assets/{id}', [AssetController::class, 'show']);

    // Asset Requests
    Route::post('/assets/request', [AssetRequestController::class, 'store'])
        ->middleware('throttle:100,1'); // 100 requests per minute for dev
    Route::get('/asset-requests', [AssetRequestController::class, 'index']);
    Route::patch('/asset-requests/{id}', [AssetRequestController::class, 'update']); // admin
    Route::post('/asset-requests/{id}/pay', [AssetRequestController::class, 'processPayment']); // Process payment
    Route::delete('/asset-requests/{id}', [AssetRequestController::class, 'destroy']);
    Route::get('/asset-requests/{id}', [AssetRequestController::class, 'show']);

    // Blotter Requests
    Route::post('/blotter-requests', [BlotterRequestController::class, 'store']);

    // 📋 Projects CRUD (Admin only)
    // Route::apiResource('/projects', App\Http\Controllers\ProjectController::class); // Moved inside admin group

    // 📝 Feedback management (Admin only)
    // Route::apiResource('/feedbacks', App\Http\Controllers\FeedbackController::class); // Moved inside admin group

    // 💬 Project Reactions (Authenticated users)
    Route::post('/projects/{projectId}/react', [App\Http\Controllers\ProjectReactionController::class, 'react']);
    Route::get('/projects/{projectId}/reactions', [App\Http\Controllers\ProjectReactionController::class, 'index']);

    // Document Requests
    Route::get('/document-requests', [App\Http\Controllers\DocumentRequestController::class, 'index']); // Admin fetch all
    Route::post('/document-requests', [App\Http\Controllers\DocumentRequestController::class, 'store']); // Resident submit
    Route::match(['put', 'patch'], '/document-requests/{id}', [App\Http\Controllers\DocumentRequestController::class, 'update']); // Admin update
    Route::get('/document-requests/my', [App\Http\Controllers\DocumentRequestController::class, 'myRequests']); // Resident view own requests
    Route::post('/document-requests/{id}/generate-pdf', [App\Http\Controllers\DocumentRequestController::class, 'generatePdf']); // Generate PDF
    Route::get('/document-requests/{id}/download-pdf', [App\Http\Controllers\DocumentRequestController::class, 'downloadPdf']); // Download PDF
    Route::get('/test-pdf', [App\Http\Controllers\DocumentRequestController::class, 'testPdf']); // Test PDF system
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/blotter-requests', [BlotterRequestController::class, 'index']);
    Route::patch('/blotter-requests/{id}', [BlotterRequestController::class, 'update']);
});

Route::middleware(['auth:sanctum'])->get('/blotter-requests', [BlotterRequestController::class, 'myRequests']);
Route::get('/blotter-records', [BlotterRecordsController::class, 'index']);
Route::get('/blotter-records/{id}', [BlotterRecordsController::class, 'show']);
Route::post('/blotter-records', [BlotterRecordsController::class, 'store']);

// 📋 Projects (Read-only for all authenticated users)
Route::get('/projects', [App\Http\Controllers\ProjectController::class, 'index']);

// 📝 Feedback (Residents can submit and view their own)
Route::post('/feedbacks', [App\Http\Controllers\FeedbackController::class, 'store']);
Route::get('/feedbacks/my', [App\Http\Controllers\FeedbackController::class, 'myFeedback']);
Route::get('/feedbacks', [App\Http\Controllers\FeedbackController::class, 'index']); // Allow filtering by project_id

// ✅ **New Backend Structure for Disaster/Emergency Records**
// 1. **Model:**  
// `app/Models/DisasterEmergencyRecord.php`
// - Fields: `type`, `date`, `location`, `description`, `actions_taken`, `casualties`, `reported_by`

// 2. **Migration:**  
// `database/migrations/2024_07_22_000001_create_disaster_emergency_records_table.php`
// - Table: `disaster_emergency_records`
// - Columns:  
//   - `id`
//   - `type` (e.g., Fire, Flood)
//   - `date`
//   - `location`
//   - `description`
//   - `actions_taken` (nullable)
//   - `casualties` (nullable)
//   - `reported_by` (nullable)
//   - `timestamps`

// 3. **Controller:**  
// `app/Http/Controllers/DisasterEmergencyRecordController.php`
// - CRUD methods: `index`, `show`, `store`, `update`, `destroy`
// - Validates and returns JSON

// 4. **Register routes** in `routes/api.php`:
// ```php
// use App\Http\Controllers\DisasterEmergencyRecordController;
// Route::apiResource('/disaster-emergencies', DisasterEmergencyRecordController::class);
// ```

// 5. **Frontend:**  
//    - Make your “Add Disaster and Emergency records” button open a form.
//    - POST to `/disaster-emergencies` with the required fields.

// 6. **Next Steps**
// 1. **Run the migration** to create the table:
//    ```sh
//    php artisan migrate
//    ```
// 2. **Register routes** in `routes/api.php`:
//    ```php
//    use App\Http\Controllers\DisasterEmergencyRecordController;
//    Route::apiResource('/disaster-emergencies', DisasterEmergencyRecordController::class);
//    ```
// 3. **Frontend:**  
//    - Make your “Add Disaster and Emergency records” button open a form.
//    - POST to `/disaster-emergencies` with the required fields.

// 7. **Would you like the full frontend form code, or help with the API routes?**  
//    - Let me know if you want to customize the fields further!


Route::apiResource('disaster-emergencies', DisasterEmergencyRecordController::class);
Route::apiResource('financial-records', FinancialRecordController::class);
Route::apiResource('beneficiaries', App\Http\Controllers\BeneficiaryController::class);
Route::apiResource('disbursements', App\Http\Controllers\DisbursementController::class);
