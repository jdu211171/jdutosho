<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\RentBook;
use Illuminate\Http\Request;

class LibrarianController extends Controller
{
    public function dashboard()
    {
        // Total number of books (including all copies)
        $totalBooks = Book::withCount('codes')
            ->get()
            ->sum('codes_count');

        // Number of students with active rentals
        $activeStudents = RentBook::whereNull('return_date')
            ->distinct('taken_by')
            ->count('taken_by');

        // Total number of rentals (all time)
        $totalRents = RentBook::count();

        // Average rental duration
        $averageRentDays = RentBook::whereNotNull('return_date')
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
                'totalBooks' => $totalBooks,
                'activeStudents' => $activeStudents,
                'totalRents' => $totalRents,
                'averageRentDays' => (int) $averageRentDays
            ]
        ]);
    }
}
