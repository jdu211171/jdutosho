<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookCodeListResource;
use App\Http\Resources\BookCodesAdvancedResource;
use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\BookCode;
use App\Models\BookCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $language = $request->input('language');
        $category = $request->input('category');
        $author = $request->input('author');
        $available = $request->input('available'); // filter by availability
        $status = $request->input('status'); // filter by book code status
        $code = $request->input('code'); // search by specific book code
        $view = $request->input('view'); // 'codes' for code-centric view
        $perPage = $request->input('per_page', 10);

        // If requesting code-centric view, return book codes with book info
        if ($view === 'codes') {
            $bookCodes = BookCode::query()
                ->when(in_array($status, ['exist', 'lost', 'pending', 'rent']), function ($query) use ($status) {
                    $query->where('status', $status);
                })
                ->with(['book.category'])
                ->when($search !== null, function ($query) use ($search) {
                    $query->where(function ($subQuery) use ($search) {
                        $subQuery->where('code', 'like', "%{$search}%")
                            ->orWhereHas('book', function ($bookQuery) use ($search) {
                                $bookQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('author', 'like', "%{$search}%");
                            });
                    });
                })
                ->when($code !== null, function ($query) use ($code) {
                    $query->where('code', 'like', "%{$code}%");
                })
                ->when($language !== null, function ($query) use ($language) {
                    $query->whereHas('book', function ($bookQuery) use ($language) {
                        $bookQuery->where('language', $language);
                    });
                })
                ->when($category !== null, function ($query) use ($category) {
                    $query->whereHas('book', function ($bookQuery) use ($category) {
                        $bookQuery->where('category_id', $category);
                    });
                })
                ->when($author !== null, function ($query) use ($author) {
                    $query->whereHas('book', function ($bookQuery) use ($author) {
                        $bookQuery->where('author', 'like', "%{$author}%");
                    });
                })
                ->paginate($perPage);

            return BookCodesAdvancedResource::collection($bookCodes);
        }

        // Default book-centric view
        $books = Book::with(['category', 'codes'])
            ->when($search !== null, function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhereHas('codes', function ($codeQuery) use ($search) {
                            $codeQuery->where('code', 'like', "%{$search}%");
                        });
                });
            })
            ->when($code !== null, function ($query) use ($code) {
                $query->whereHas('codes', function ($codeQuery) use ($code) {
                    $codeQuery->where('code', 'like', "%{$code}%");
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
            ->when($status !== null, function ($query) use ($status) {
                if (in_array($status, ['exist', 'lost', 'pending', 'rent'])) {
                    $query->whereHas('codes', function ($subQuery) use ($status) {
                        $subQuery->where('status', $status);
                    });
                }
            })
            ->paginate($perPage);

        return BookResource::collection($books);
    }

    public function store(StoreBookRequest $request)
    {
        $validated = $request->validated();

        // Handle PDF upload
        $pdfPath = null;
        if ($request->hasFile('pdf')) {
            $pdfPath = $request->file('pdf')->store('pdfs', 'public');
        }

        $book = Book::create([
            'name' => $validated['name'],
            'author' => $validated['author'],
            'language' => $validated['language'],
            'category_id' => $validated['category'],
            'pdf_path' => $pdfPath,
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

        // Handle PDF upload
        $updateData = [
            'name' => $validated['name'],
            'author' => $validated['author'],
            'language' => $validated['language'],
            'category_id' => $validated['category'],
        ];

        if ($request->hasFile('pdf')) {
            // Delete old PDF if exists
            if ($book->pdf_path && Storage::disk('public')->exists($book->pdf_path)) {
                Storage::disk('public')->delete($book->pdf_path);
            }
            
            // Store new PDF
            $updateData['pdf_path'] = $request->file('pdf')->store('pdfs', 'public');
        }

        $book->update($updateData);

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

    /**
     * Preview PDF file in browser
     */
    public function previewPdf($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        if (!$book->pdf_path || !Storage::disk('public')->exists($book->pdf_path)) {
            return response()->json(['message' => 'PDF not found'], 404);
        }

        $pdfPath = Storage::disk('public')->path($book->pdf_path);
        
        return response()->file($pdfPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $book->name . '.pdf"'
        ]);
    }

    /**
     * Download PDF file
     */
    public function downloadPdf($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        if (!$book->pdf_path || !Storage::disk('public')->exists($book->pdf_path)) {
            return response()->json(['message' => 'PDF not found'], 404);
        }

        $pdfPath = Storage::disk('public')->path($book->pdf_path);
        $fileName = $book->name . '_by_' . $book->author . '.pdf';
        
        return response()->download($pdfPath, $fileName);
    }

    /**
     * Bulk import books from CSV
     */
    public function bulkImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // Max 10MB
        ]);

        $file = $request->file('file');
        $csvData = array_map('str_getcsv', file($file->getRealPath()));
        
        // Skip header row if present
        $header = array_shift($csvData);
        
        // Validate header format
        $expectedHeaders = ['title', 'code'];
        $optionalHeaders = ['author', 'language', 'category'];
        
        // Clean and lowercase headers for comparison
        $cleanedHeaders = array_map(function($h) {
            return strtolower(trim($h));
        }, $header);
        
        // Check if required headers are present
        foreach ($expectedHeaders as $required) {
            if (!in_array($required, $cleanedHeaders)) {
                return response()->json([
                    'success' => false,
                    'message' => "Missing required column: {$required}. Required columns are: title, code",
                ], 422);
            }
        }
        
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => [],
        ];
        
        // Get header indexes
        $headerIndexes = array_flip($cleanedHeaders);
        
        DB::beginTransaction();
        
        try {
            foreach ($csvData as $rowIndex => $row) {
                $rowNumber = $rowIndex + 2; // Account for 0-index and header row
                
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }
                
                // Extract data based on headers
                $bookData = [
                    'name' => trim($row[$headerIndexes['title']] ?? ''),
                    'codes' => array_map('trim', explode(',', $row[$headerIndexes['code']] ?? '')),
                    'author' => isset($headerIndexes['author']) ? trim($row[$headerIndexes['author']] ?? 'Unknown') : 'Unknown',
                    'language' => isset($headerIndexes['language']) ? trim($row[$headerIndexes['language']] ?? 'en') : 'en',
                    'category_name' => isset($headerIndexes['category']) ? trim($row[$headerIndexes['category']] ?? '') : null,
                ];
                
                // Validate row data
                $validator = Validator::make($bookData, [
                    'name' => 'required|string|max:255',
                    'codes' => 'required|array|min:1',
                    'codes.*' => 'required|string|unique:book_codes,code',
                    'author' => 'required|string|max:255',
                    'language' => 'required|in:uz,ru,en,ja',
                ]);
                
                if ($validator->fails()) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNumber,
                        'title' => $bookData['name'],
                        'errors' => $validator->errors()->all(),
                    ];
                    continue;
                }
                
                // Find or create category if provided
                $categoryId = null;
                if (!empty($bookData['category_name'])) {
                    $category = BookCategory::firstOrCreate(
                        ['name' => $bookData['category_name']],
                        ['name' => $bookData['category_name']]
                    );
                    $categoryId = $category->id;
                } else {
                    // Use default category or first available
                    $defaultCategory = BookCategory::first();
                    if ($defaultCategory) {
                        $categoryId = $defaultCategory->id;
                    }
                }
                
                // Create book
                $book = Book::create([
                    'name' => $bookData['name'],
                    'author' => $bookData['author'],
                    'language' => $bookData['language'],
                    'category_id' => $categoryId,
                ]);
                
                // Create book codes
                foreach ($bookData['codes'] as $code) {
                    if (!empty($code)) {
                        $book->codes()->create([
                            'code' => $code,
                            'status' => 'exist',
                        ]);
                    }
                }
                
                $results['success']++;
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Import completed. {$results['success']} books imported successfully.",
                'details' => $results,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'details' => $results,
            ], 500);
        }
    }
}
