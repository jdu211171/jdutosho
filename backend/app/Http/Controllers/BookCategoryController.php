<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookCategoryRequest;
use App\Http\Requests\UpdateBookCategoryRequest;
use App\Http\Resources\BookCategoryListResource;
use App\Http\Resources\BookCategoryResource;
use App\Models\BookCategory;
use Illuminate\Http\Request;

class BookCategoryController extends Controller
{
    public function index()
    {
        $book_categories = BookCategory::withCount('books')
        ->paginate(10);
        return BookCategoryResource::collection($book_categories);
    }

    public function store(StoreBookCategoryRequest $request)
    {
        $validated = $request->validated();

        $book_category = BookCategory::create([
            'name' => $validated['name'],
        ]);

        return new BookCategoryResource($book_category);
    }

    public function show($id)
    {
        $book_category = BookCategory::with('books')->find($id);

        if (!$book_category) {
            return response()->json([
                'message' => 'Book category not found'
            ], 404);
        }

        return new BookCategoryResource($book_category);
    }

    public function update(UpdateBookCategoryRequest $request, $id)
    {
        $validated = $request->validated();

        $book_category = BookCategory::find($id);

        if (!$book_category) {
            return response()->json([
                'message' => 'Book category not found'
            ], 404);
        }

        $book_category->update([
            'name' => $validated['name'],
        ]);

        return new BookCategoryResource($book_category);
    }

    public function destroy($id)
    {
        $book_category = BookCategory::find($id);

        if (!$book_category) {
            return response()->json([
                'message' => 'Book category not found'
            ], 404);
        }

        $book_category->delete();

        return response()->json([
            'message' => 'Book category deleted'
        ], 200);
    }

    public function list()
    {
        $book_categories = BookCategory::all();
        return BookCategoryListResource::collection($book_categories);
    }

    public function search(Request $request)
    {
        $search = $request->input('query');

        $categories = BookCategory::withCount('books')
            ->when($search, function ($query) use ($search) {
                return $query->where('name', 'like', "%$search%");
            })
            ->paginate(10);

        return BookCategoryListResource::collection($categories);
    }
}
