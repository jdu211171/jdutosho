<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookCodeListResource;
use App\Http\Resources\BookCodesAdvancedResource;
use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\BookCode;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function codes(Request $request)
    {
        $search = $request->input('search');
        $searchStatus = $request->input('status');

        $bookCodes = BookCode::query()
            ->when(in_array($searchStatus, ['exist', 'lost', 'pending', 'rent']), function ($query) use ($searchStatus) {
                $query->where('status', $searchStatus);
            })
            ->with('book')
            ->when($search !== null, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhereHas('book', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('author', 'like', "%{$search}%");
                        });
                });
            })
            ->paginate(10);


        return BookCodesAdvancedResource::collection($bookCodes);
    }

    public function index(Request $request)
    {
        $search = $request->input('search');

        $books = Book::with('category')
            ->when($search !== null, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            })->paginate(10);
        return BookResource::collection($books);
    }

    public function store(StoreBookRequest $request)
    {
        $validated = $request->validated();

        $book = Book::create([
            'name' => $validated['name'],
            'author' => $validated['author'],
            'language' => $validated['language'],
            'category_id' => $validated['category'],
        ]);

        foreach ($validated['codes'] as $code) {
            $book->codes()->create([
                'code' => $code,
                'status' => 'exist',
            ]);
        }

        $book->load('codes');

        return new BookResource($book);
    }

    public function show($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $book->load('codes');

        return new BookResource($book);
    }

    public function update(UpdateBookRequest $request, $id)
    {
        $validated = $request->validated();

        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $book->update([
            'name' => $validated['name'],
            'author' => $validated['author'],
            'language' => $validated['language'],
            'category_id' => $validated['category'],
        ]);

        $book->load('codes');

        return new BookResource($book);
    }

    public function destroy($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $book->delete();

        return response()->json(['message' => 'Book deleted'], 200);
    }

    public function updateCodes(Request $request, $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }
        $currentCodes = $book->codes()->pluck('code')->toArray();

        $validated = $request->validate([
            'codes' => ['required', 'array', 'min:1', 'distinct', function ($attribute, $value, $fail) use ($currentCodes) {
                $newCodes = array_diff($value, $currentCodes);
                foreach ($newCodes as $code) {
                    if (BookCode::where('code', $code)->exists()) {
                        $fail("The code '{$code}' is already taken.");
                    }
                }
            }],
        ]);


        $newCodes = array_diff($validated['codes'], $currentCodes);
        $codesToDelete = array_diff($currentCodes, $validated['codes']);

        $book->codes()->whereIn('code', $codesToDelete)->delete();

        foreach ($newCodes as $code) {
            $book->codes()->create([
                'code' => $code,
                'status' => 'exist',
            ]);
        }

        $book->load('codes');

        return new BookResource($book);
    }

    public function list(Request $request)
    {
        $search = $request->query('search');

        $book_codes = BookCode::where(['status' => 'exist'])
            ->when($search !== null, function ($query) use ($search) {
                return $query->where('code', 'like', "%{$search}%");
            })->get();
        return BookCodeListResource::collection($book_codes);
    }
}
