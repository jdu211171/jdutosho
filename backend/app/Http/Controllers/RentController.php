<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentRequest;
use App\Http\Requests\UpdateRentRequest;
use App\Http\Resources\RentResource;
use App\Models\BookCode;
use App\Models\RentBook;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RentController extends Controller
{
    public function index(Request $request)
    {
        $query = RentBook::with(['takenBy', 'givenBy', 'bookCode', 'book'])
            ->selectRaw('*, DATEDIFF(CURDATE(), given_date) as passed_days');

        // Status filtering
        if ($request->has('status')) {
            switch ($request->status) {
                case 'pending':
                    $query->whereHas('bookCode', function ($q) {
                        $q->where('status', 'pending');
                    });
                    break;
                case 'accepted':
                    $query->whereHas('bookCode', function ($q) {
                        $q->where('status', 'rent');
                    })->whereNull('return_date');
                    break;
                case 'returned':
                    $query->whereNotNull('return_date');
                    break;
            }
        } else {
            // Default: show non-returned rents
            $query->whereNull('return_date');
        }

        // Student ID filtering
        if ($request->has('student_id')) {
            $query->where('taken_by', $request->student_id);
        }

        // Book ID filtering  
        if ($request->has('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        // Due date filtering (assuming 14 days loan period)
        if ($request->has('due_date_from')) {
            $query->whereRaw('DATE_ADD(given_date, INTERVAL 14 DAY) >= ?', [$request->due_date_from]);
        }

        if ($request->has('due_date_to')) {
            $query->whereRaw('DATE_ADD(given_date, INTERVAL 14 DAY) <= ?', [$request->due_date_to]);
        }

        // Search functionality (existing)
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('bookCode', function ($subQ) use ($searchTerm) {
                    $subQ->where('code', 'like', "%{$searchTerm}%");
                })->orWhereHas('book', function ($subQ) use ($searchTerm) {
                    $subQ->where('name', 'like', "%{$searchTerm}%");
                })->orWhereHas('takenBy', function ($subQ) use ($searchTerm) {
                    $subQ->where('full_name', 'like', "%{$searchTerm}%")
                         ->orWhere('loginID', 'like', "%{$searchTerm}%");
                });
            });
        }

        $rents = $query->orderBy('passed_days', 'desc')->paginate(10);

        return RentResource::collection($rents);
    }

    public function store(StoreRentRequest $request)
    {
        $validated = $request->validated();

        $student = User::where('loginID', $validated['login_id'])->firstOrFail();
        if ($student->role !== 'student') {
            return response()->json(['message' => 'Only student can rent a book'], 400);
        }

        $studentRents = RentBook::where(['taken_by' => $student->id])
            ->whereNull('return_date')
            ->count();
        if ($studentRents >= 3) {
            return response()->json(['message' => 'Student can only rent 3 books'], 400);
        }

        $bookCode = BookCode::where('code', $validated['book_code'])->firstOrFail();
        if ($bookCode->status !== 'exist') {
            return response()->json(['message' => 'Book is already rented'], 400);
        }
        
        // Set to pending status instead of rent (awaiting librarian approval)
        $bookCode->status = 'pending';
        $bookCode->save();

        $rent = RentBook::create([
            'book_code_id' => $bookCode->id,
            'book_id' => $bookCode->book_id,
            'taken_by' => $student->id,
            'given_by' => Auth::user()->id,
            'given_date' => now(),
            'accepted_by' => null, // Will be set when librarian approves
        ]);

        // Load the relationships for the response
        $rent->load(['takenBy', 'givenBy', 'bookCode', 'book']);

        return new RentResource($rent);
    }

    public function update(UpdateRentRequest $request, $id)
    {
        $validated = $request->validated();
        $rent = RentBook::with(['takenBy', 'givenBy', 'bookCode', 'book'])->find($id);

        if (!$rent) {
            return response()->json(['message' => 'Rent not found'], 404);
        }

        // Handle accept action
        if ($validated['action'] === 'accept') {
            // Check if this is a pending rent (initial approval) or pending return
            if ($rent->bookCode->status !== 'pending') {
                return response()->json(['message' => 'This rent is not pending approval'], 400);
            }

            // If return_date is null, this is initial rent approval
            if (is_null($rent->return_date)) {
                $rent->bookCode->status = 'rent';
                $rent->bookCode->save();
                
                $rent->accepted_by = Auth::user()->id;
                $rent->save();
                
                return new RentResource($rent);
            } else {
                // This is return approval
                $rent->bookCode->status = 'exist';
                $rent->bookCode->save();
                
                $rent->return_date = now();
                $rent->accepted_by = Auth::user()->id;
                $rent->save();
                
                return new RentResource($rent);
            }
        }

        return response()->json(['message' => 'Invalid action'], 400);
    }
}
