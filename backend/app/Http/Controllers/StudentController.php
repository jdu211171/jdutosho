<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookResource;
use App\Http\Resources\RentResource;
use App\Http\Resources\StudentBookListResource;
use App\Models\Book;
use App\Models\RentBook;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        $student = auth()->user();
        $rents = RentBook::with(['takenBy', 'givenBy', 'bookCode', 'book'])
            ->where('taken_by', $student->id)
            ->whereNull('return_date')
            ->selectRaw('*, DATEDIFF(CURDATE(), given_date) as passed_days')
            ->orderBy('passed_days', 'desc')->get();

        return RentResource::collection($rents);
    }

    public function dashboard()
    {
        $student = auth()->user();

        // Currently borrowed books
        $totalBorrowed = RentBook::where('taken_by', $student->id)
            ->whereNull('return_date')
            ->count();

        // Available books - fixed query
        $availableBooks = Book::count();

        // Total books borrowed history
        $rentHistory = RentBook::where('taken_by', $student->id)->count();

        // Average rent days - improved calculation
        $averageRentDays = RentBook::where('taken_by', $student->id)
            ->whereNotNull('return_date')
            ->selectRaw('
                ROUND(
                    AVG(
                        DATEDIFF(
                            return_date,
                            given_date
                        )
                    )
                ) as avg_days
            ')
            ->value('avg_days') ?? 0;

        return response()->json([
            'data' => [
                'totalBorrowed' => $totalBorrowed,
                'availableBooks' => $availableBooks,
                'rentHistory' => $rentHistory,
                'averageRentDays' => (int) $averageRentDays
            ]
        ]);
    }

    public function returnBook($id)
    {
        $rent = RentBook::with(['takenBy', 'givenBy', 'bookCode', 'book'])
            ->where('id', $id)
            ->where('taken_by', auth()->user()->id)
            ->whereNull('return_date')
            ->first();

        if (!$rent) {
            return response()->json(['message' => 'Rent not found'], 404);
        }

        $rent->bookCode->status = 'pending';
        $rent->bookCode->save();

        return new RentResource($rent);
    }
    public function bookList(Request $request)
    {
        $search = $request->input('search');

        $books = Book::with('category')
            ->when($search !== null, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            })->paginate(10);
        return StudentBookListResource::collection($books);
    }
}
