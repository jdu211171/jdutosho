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
        $rents = RentBook::where('taken_by', $student->id)
            ->whereNull('return_date')
            ->selectRaw('*, DATEDIFF(CURDATE(), given_date) as passed_days')
            ->orderBy('passed_days', 'desc')->get();

        return RentResource::collection($rents);
    }

    public function returnBook($id)
    {
        $rent = RentBook::find($id)
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
