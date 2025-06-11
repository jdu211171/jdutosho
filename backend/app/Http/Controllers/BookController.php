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
        $language = $request->input('language');
        $category = $request->input('category');
        $author = $request->input('author');
        $available = $request->input('available'); // filter by availability
        $perPage = $request->input('per_page', 10);

        $books = Book::with(['category', 'codes'])
            ->when($search !== null, function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%");
                });
            })
            ->when($language !== null, function ($query) use ($language) {
                $query->where('language', $language);
            })
            ->when($category !== null, function ($query) use ($category) {
                $query->where('category_id', $category);
            })
            ->when($author !== null, function ($query) use ($author) {
                $query->where('author', 'like', "%{$author}%");
            })
            ->when($available !== null, function ($query) use ($available) {
                if ($available === 'true' || $available === '1') {
                    // Only books that have at least one available copy
                    $query->whereHas('codes', function ($subQuery) {
                        $subQuery->where('status', 'exist');
                    });
                } elseif ($available === 'false' || $available === '0') {
                    // Only books that have no available copies
                    $query->whereDoesntHave('codes', function ($subQuery) {
                        $subQuery->where('status', 'exist');
                    });
                }
            })
            ->paginate($perPage);

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

    public function availableCodes(Request $request)
    {
        $search = $request->query('search');

        $book_codes = BookCode::where(['status' => 'exist'])
            ->when($search !== null, function ($query) use ($search) {
                return $query->where('code', 'like', "%{$search}%");
            })->get();
        return BookCodeListResource::collection($book_codes);
    }
}
