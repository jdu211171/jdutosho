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
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = $request->input('query'); // Support both 'search' and 'query' parameters
        $perPage = $request->input('per_page', 10);
        $list = $request->input('list'); // Support list format (no pagination)

        // Use either search or query parameter
        $searchTerm = $search ?? $query;

        $bookCategoriesQuery = BookCategory::withCount('books')
            ->when($searchTerm, function ($query) use ($searchTerm) {
                return $query->where('name', 'like', "%{$searchTerm}%");
            });

        // If list parameter is present, return all without pagination
        if ($list !== null) {
            $book_categories = $bookCategoriesQuery->get();
            return BookCategoryListResource::collection($book_categories);
        }

        // Default paginated response
        $book_categories = $bookCategoriesQuery->paginate($perPage);
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
}
