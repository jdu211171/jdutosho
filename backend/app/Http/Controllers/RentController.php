<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcceptRentRequest;
use App\Http\Requests\StoreRentRequest;
use App\Http\Resources\RentResource;
use App\Models\BookCode;
use App\Models\RentBook;
use App\Models\User;
use Illuminate\Http\Request;

class RentController extends Controller
{
    public function index()
    {
        $rents = RentBook::whereNull('return_date')
            ->whereHas('bookCode', function ($query) {
                $query->where('status', 'rent');
            })
            ->selectRaw('*, DATEDIFF(CURDATE(), given_date) as passed_days')
            ->orderBy('passed_days', 'desc')
            ->paginate(10);

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
        $bookCode->status = 'rent';
        $bookCode->save();

        $rent = RentBook::create([
            'book_code_id' => $bookCode->id,
            'book_id' => $bookCode->book_id,
            'taken_by' => $student->id,
            'given_by' => auth()->user()->id,
            'given_date' => now(),
        ]);

        return new RentResource($rent);
    }

    public function pending(Request $request)
    {
        $query = RentBook::whereNull('return_date')
            ->whereHas('bookCode', function ($query) {
                $query->where('status', 'pending');
            })
            ->selectRaw('*, DATEDIFF(CURDATE(), given_date) as passed_days');

        // Add search by book code and student ID if provided
        if ($request->has('book_code')) {
            $query->whereHas('bookCode', function ($q) use ($request) {
                $q->where('code', $request->book_code);
            });
        }

        if ($request->has('login_id')) {
            $query->whereHas('takenByUser', function ($q) use ($request) {
                $q->where('loginID', $request->login_id);
            });
        }

        $rents = $query->orderBy('passed_days', 'desc')
            ->paginate(10);

        return RentResource::collection($rents);
    }
    public function accept($id)
    {
        $rent = RentBook::find($id);

        if (!$rent) {
            return response()->json(['message' => 'Rent not found'], 404);
        }

        if ($rent->bookCode->status !== 'pending') {
            return response()->json(['message' => 'This book can\'t be accepted'], 400);
        }
        $rent->bookCode->status = 'exist';
        $rent->bookCode->save();

        $rent->return_date = now();
        $rent->save();

        return new RentResource($rent);
    }
}
