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
                    '*' => ['id', 'name', 'author', 'language', 'category_id', 'category', 'count']
                ],
                'links',
                'meta'
            ]);
    }

    /**
     * Test retrieving the list of book codes.
     */
    public function test_can_get_book_codes_list()
    {
        BookCode::factory()->count(5)->create(['status' => 'exist']);

        $response = $this->getJson('/api/books/list');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code']
                ]
            ]);
    }

    /**
     * Test retrieving advanced book codes with search and status filter.
     */
    public function test_can_get_advanced_book_codes()
    {
        $book = Book::factory()->create();
        BookCode::factory()->create(['book_id' => $book->id, 'code' => 'CODE123', 'status' => 'exist']);

        $response = $this->getJson('/api/books/codes?search=CODE123&status=exist');

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
}
