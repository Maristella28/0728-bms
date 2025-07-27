<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::orderBy('created_at', 'desc');

        // ✅ Safe check for user role
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            $query->where('status', 'posted');
        }

        $announcements = $query->get()->map(function ($a) {
            $a->image_url = $a->image ? asset('storage/' . $a->image) : null;
            return $a;
        });

        return response()->json(['announcements' => $announcements], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'image'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = [
            'title'        => $validated['title'],
            'content'      => $validated['content'],
            'published_at' => now(),
            'status'       => 'posted',
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('announcements', 'public');
        }

        $announcement = Announcement::create($data);

        return response()->json([
            'message' => 'Announcement created successfully.',
            'announcement' => $announcement
        ], 201);
    }

    public function show(Announcement $announcement)
    {
        $announcement->image_url = $announcement->image ? asset('storage/' . $announcement->image) : null;

        return response()->json(['announcement' => $announcement]);
    }

    public function update(Request $request, Announcement $announcement)
    {

        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $announcement->title = $validated['title'];
        $announcement->content = $validated['content'];

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($announcement->image && Storage::disk('public')->exists($announcement->image)) {
                Storage::disk('public')->delete($announcement->image);
            }

            $announcement->image = $request->file('image')->store('announcements', 'public');
        }

        $announcement->save();

        return response()->json(['message' => 'Announcement updated successfully.']);
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->image && Storage::disk('public')->exists($announcement->image)) {
            Storage::disk('public')->delete($announcement->image);
        }

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully.']);
    }

    public function toggleStatus(Announcement $announcement)
    {
        $announcement->status = $announcement->status === 'posted' ? 'draft' : 'posted';
        $announcement->save();

        return response()->json([
            'message' => 'Status updated',
            'status' => $announcement->status
        ]);
    }
}
