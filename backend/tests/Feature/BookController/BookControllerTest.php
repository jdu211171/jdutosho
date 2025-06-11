<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCategory;
use App\Models\BookCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Set up the test environment by authenticating as a librarian.
     */
    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->create(['role' => 'librarian']);
        Sanctum::actingAs($user);
    }

    /**
     * Test retrieving all books with pagination.
     */
    public function test_can_get_all_books()
    {
        Book::factory()->count(15)->create();

        $response = $this->getJson('/api/books');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'author', 'language', 'category_id', 'category', 'codes']
                ],
                'links',
                'meta'
            ]);
    }

    /**
     * Test retrieving the list of available book codes.
     */
    public function test_can_get_available_book_codes()
    {
        BookCode::factory()->count(5)->create(['status' => 'exist']);

        $response = $this->getJson('/api/books/available-codes');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code']
                ]
            ]);
    }

    /**
     * Test retrieving book codes with search and status filter using the codes view.
     */
    public function test_can_get_book_codes_view()
    {
        $book = Book::factory()->create();
        BookCode::factory()->create(['book_id' => $book->id, 'code' => 'CODE123', 'status' => 'exist']);

        $response = $this->getJson('/api/books?view=codes&search=CODE123&status=exist');

        $response->assertStatus(200)
            ->assertJsonFragment(['code' => 'CODE123']);
    }

    /**
     * Test creating a new book with codes.
     */
    public function test_can_create_book()
    {
        $category = BookCategory::factory()->create();

        $response = $this->postJson('/api/books', [
            'name' => 'New Book',
            'author' => 'Author Name',
            'language' => 'uz',
            'category' => $category->id,
            'codes' => ['CODE001', 'CODE002']
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'New Book',
                    'author' => 'Author Name',
                    'language' => 'uz',
                    'category_id' => $category->id,
                    'codes' => [
                        ['code' => 'CODE001', 'status' => 'exist'],
                        ['code' => 'CODE002', 'status' => 'exist']
                    ]
                ]
            ]);

        $this->assertDatabaseHas('books', ['name' => 'New Book']);
        $this->assertDatabaseHas('book_codes', ['code' => 'CODE001']);
        $this->assertDatabaseHas('book_codes', ['code' => 'CODE002']);
    }

    /**
     * Test retrieving a single book with its codes.
     */
    public function test_can_get_single_book()
    {
        $book = Book::factory()->create();
        BookCode::factory()->create(['book_id' => $book->id]);

        $response = $this->getJson("/api/books/{$book->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'author',
                    'language',
                    'category_id',
                    'category',
                    'codes' => [
                        '*' => ['id', 'code', 'status']
                    ]
                ]
            ]);
    }

    /**
     * Test updating a book.
     */
    public function test_can_update_book()
    {
        $book = Book::factory()->create();
        $category = BookCategory::factory()->create();

        $response = $this->putJson("/api/books/{$book->id}", [
            'name' => 'Updated Book Name',
            'author' => 'Updated Author',
            'language' => 'en',
            'category' => $category->id
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $book->id,
                    'name' => 'Updated Book Name',
                    'author' => 'Updated Author',
                    'language' => 'en',
                    'category_id' => $category->id
                ]
            ]);

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'name' => 'Updated Book Name'
        ]);
    }

    /**
     * Test updating book codes.
     */
    public function test_can_update_book_codes()
    {
        $book = Book::factory()->create();
        BookCode::factory()->create(['book_id' => $book->id, 'code' => 'CODE001']);

        $response = $this->putJson("/api/books/{$book->id}/code", [
            'codes' => ['CODE001', 'CODE003']
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['code' => 'CODE001'])
            ->assertJsonFragment(['code' => 'CODE003']);

        $this->assertDatabaseHas('book_codes', ['code' => 'CODE003']);
    }

    /**
     * Test deleting a book.
     */
    public function test_can_delete_book()
    {
        $book = Book::factory()->create();

        $response = $this->deleteJson("/api/books/{$book->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Book deleted']);

        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    }

    /**
     * Test validation error when creating a book without required fields.
     */
    public function test_cannot_create_book_without_required_fields()
    {
        $response = $this->postJson('/api/books', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'author', 'language', 'category', 'codes']);
    }

    /**
     * Test error when retrieving a non-existent book.
     */
    public function test_cannot_get_non_existent_book()
    {
        $response = $this->getJson('/api/books/9999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Book not found']);
    }

    /**
     * Test filtering books by language.
     */
    public function test_can_filter_books_by_language()
    {
        $category = BookCategory::factory()->create();
        $englishBook = Book::factory()->create(['language' => 'en', 'category_id' => $category->id]);
        $uzbekBook = Book::factory()->create(['language' => 'uz', 'category_id' => $category->id]);

        $response = $this->getJson('/api/books?language=en');

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $englishBook->id])
            ->assertJsonMissing(['id' => $uzbekBook->id]);
    }

    /**
     * Test filtering books by category.
     */
    public function test_can_filter_books_by_category()
    {
        $category1 = BookCategory::factory()->create();
        $category2 = BookCategory::factory()->create();
        $book1 = Book::factory()->create(['category_id' => $category1->id]);
        $book2 = Book::factory()->create(['category_id' => $category2->id]);

        $response = $this->getJson("/api/books?category={$category1->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $book1->id])
            ->assertJsonMissing(['id' => $book2->id]);
    }

    /**
     * Test filtering books by author.
     */
    public function test_can_filter_books_by_author()
    {
        $category = BookCategory::factory()->create();
        $book1 = Book::factory()->create(['author' => 'John Doe', 'category_id' => $category->id]);
        $book2 = Book::factory()->create(['author' => 'Jane Smith', 'category_id' => $category->id]);

        $response = $this->getJson('/api/books?author=John');

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $book1->id])
            ->assertJsonMissing(['id' => $book2->id]);
    }

    /**
     * Test filtering books by availability.
     */
    public function test_can_filter_books_by_availability()
    {
        $category = BookCategory::factory()->create();
        $availableBook = Book::factory()->create(['category_id' => $category->id]);
        $unavailableBook = Book::factory()->create(['category_id' => $category->id]);
        
        // Create available code for first book
        BookCode::factory()->create(['book_id' => $availableBook->id, 'status' => 'exist']);
        
        // Create only rented codes for second book
        BookCode::factory()->create(['book_id' => $unavailableBook->id, 'status' => 'rent']);

        // Test filtering for available books
        $response = $this->getJson('/api/books?available=true');

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $availableBook->id])
            ->assertJsonMissing(['id' => $unavailableBook->id]);

        // Test filtering for unavailable books
        $response = $this->getJson('/api/books?available=false');

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $unavailableBook->id])
            ->assertJsonMissing(['id' => $availableBook->id]);
    }

    /**
     * Test pagination with custom per_page parameter.
     */
    public function test_can_paginate_books_with_custom_per_page()
    {
        $category = BookCategory::factory()->create();
        Book::factory()->count(15)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/books?per_page=5');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.per_page', 5);
    }

    /**
     * Test combined filtering.
     */
    public function test_can_combine_multiple_filters()
    {
        $category = BookCategory::factory()->create();
        $targetBook = Book::factory()->create([
            'name' => 'Test Programming Book',
            'author' => 'John Developer',
            'language' => 'en',
            'category_id' => $category->id
        ]);
        $otherBook = Book::factory()->create([
            'name' => 'Other Book',
            'author' => 'Jane Author',
            'language' => 'uz',
            'category_id' => $category->id
        ]);
        
        BookCode::factory()->create(['book_id' => $targetBook->id, 'status' => 'exist']);
        BookCode::factory()->create(['book_id' => $otherBook->id, 'status' => 'exist']);

        $response = $this->getJson("/api/books?search=Programming&language=en&author=John&available=true");

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $targetBook->id])
            ->assertJsonMissing(['id' => $otherBook->id]);
    }

    /**
     * Test searching books by book code.
     */
    public function test_can_search_books_by_code()
    {
        $category = BookCategory::factory()->create();
        $book1 = Book::factory()->create(['category_id' => $category->id]);
        $book2 = Book::factory()->create(['category_id' => $category->id]);
        
        BookCode::factory()->create(['book_id' => $book1->id, 'code' => 'ABC123']);
        BookCode::factory()->create(['book_id' => $book2->id, 'code' => 'XYZ789']);

        $response = $this->getJson('/api/books?code=ABC');

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $book1->id])
            ->assertJsonMissing(['id' => $book2->id]);
    }

    /**
     * Test searching books that include code search in general search.
     */
    public function test_can_search_books_including_codes()
    {
        $category = BookCategory::factory()->create();
        $book1 = Book::factory()->create(['name' => 'Random Book', 'category_id' => $category->id]);
        $book2 = Book::factory()->create(['name' => 'Another Book', 'category_id' => $category->id]);
        
        BookCode::factory()->create(['book_id' => $book1->id, 'code' => 'SPECIAL123']);
        BookCode::factory()->create(['book_id' => $book2->id, 'code' => 'NORMAL456']);

        $response = $this->getJson('/api/books?search=SPECIAL');

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $book1->id])
            ->assertJsonMissing(['id' => $book2->id]);
    }

    /**
     * Test filtering books by book code status.
     */
    public function test_can_filter_books_by_code_status()
    {
        $category = BookCategory::factory()->create();
        $book1 = Book::factory()->create(['category_id' => $category->id]);
        $book2 = Book::factory()->create(['category_id' => $category->id]);
        
        BookCode::factory()->create(['book_id' => $book1->id, 'status' => 'exist']);
        BookCode::factory()->create(['book_id' => $book2->id, 'status' => 'rent']);

        $response = $this->getJson('/api/books?status=rent');

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $book2->id])
            ->assertJsonMissing(['id' => $book1->id]);
    }

    /**
     * Test the codes view with filters.
     */
    public function test_can_use_codes_view_with_filters()
    {
        $category = BookCategory::factory()->create();
        $book = Book::factory()->create(['language' => 'en', 'category_id' => $category->id]);
        $code = BookCode::factory()->create(['book_id' => $book->id, 'code' => 'TEST123', 'status' => 'exist']);

        $response = $this->getJson('/api/books?view=codes&language=en&status=exist');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'code' => 'TEST123',
                'status' => 'exist',
                'language' => 'en'
            ]);
    }
}
