<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookCategoryControllerTest extends TestCase
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
     * Test retrieving all book categories with pagination.
     */
    public function test_can_get_all_book_categories()
    {
        BookCategory::factory()->count(15)->create();

        $response = $this->getJson('/api/book-categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'book_count']
                ],
                'links',
                'meta'
            ]);
    }

    /**
     * Test retrieving the full list of book categories without pagination.
     */
    public function test_can_get_book_categories_list()
    {
        BookCategory::factory()->count(5)->create();

        $response = $this->getJson('/api/book-categories?list=true');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'book_count']
                ]
            ]);
    }

    /**
     * Test creating a new book category.
     */
    public function test_can_create_book_category()
    {
        $response = $this->postJson('/api/book-categories', [
            'name' => 'New Category'
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => ['name' => 'New Category']
            ]);

        $this->assertDatabaseHas('book_categories', ['name' => 'New Category']);
    }

    /**
     * Test retrieving a single book category with its books.
     */
    public function test_can_get_single_book_category()
    {
        $category = BookCategory::factory()->create();
        Book::factory()->create(['category_id' => $category->id]);

        $response = $this->getJson("/api/book-categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'books' => [
                        '*' => ['id', 'name', 'author', 'language', 'category_id']
                    ]
                ]
            ]);
    }

    /**
     * Test updating a book category.
     */
    public function test_can_update_book_category()
    {
        $category = BookCategory::factory()->create();

        $response = $this->putJson("/api/book-categories/{$category->id}", [
            'name' => 'Updated Name'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $category->id,
                    'name' => 'Updated Name'
                ]
            ]);

        $this->assertDatabaseHas('book_categories', [
            'id' => $category->id,
            'name' => 'Updated Name'
        ]);
    }

    /**
     * Test deleting a book category.
     */
    public function test_can_delete_book_category()
    {
        $category = BookCategory::factory()->create();

        $response = $this->deleteJson("/api/book-categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Book category deleted']);

        $this->assertDatabaseMissing('book_categories', ['id' => $category->id]);
    }

    /**
     * Test searching book categories using the main route.
     */
    public function test_can_search_book_categories()
    {
        BookCategory::factory()->create(['name' => 'Fiction']);
        BookCategory::factory()->create(['name' => 'Non-Fiction']);
        BookCategory::factory()->create(['name' => 'Science']);

        $response = $this->getJson('/api/book-categories?search=fiction');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['name' => 'Fiction'])
            ->assertJsonFragment(['name' => 'Non-Fiction']);
    }

    /**
     * Test searching book categories using query parameter (backward compatibility).
     */
    public function test_can_search_book_categories_with_query_parameter()
    {
        BookCategory::factory()->create(['name' => 'Fiction']);
        BookCategory::factory()->create(['name' => 'Non-Fiction']);
        BookCategory::factory()->create(['name' => 'Science']);

        $response = $this->getJson('/api/book-categories?query=fiction');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['name' => 'Fiction'])
            ->assertJsonFragment(['name' => 'Non-Fiction']);
    }

    /**
     * Test custom pagination with per_page parameter.
     */
    public function test_can_paginate_book_categories_with_custom_per_page()
    {
        BookCategory::factory()->count(15)->create();

        $response = $this->getJson('/api/book-categories?per_page=5');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.per_page', 5);
    }

    /**
     * Test combining search with pagination.
     */
    public function test_can_combine_search_with_pagination()
    {
        // Create categories where some match the search
        BookCategory::factory()->create(['name' => 'Science Fiction']);
        BookCategory::factory()->create(['name' => 'Non-Fiction']);
        BookCategory::factory()->create(['name' => 'Fiction Novel']);
        BookCategory::factory()->create(['name' => 'History']);
        BookCategory::factory()->create(['name' => 'Biography']);

        $response = $this->getJson('/api/book-categories?search=fiction&per_page=2');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.per_page', 2);
    }

    /**
     * Test validation error when creating a category without a name.
     */
    public function test_cannot_create_book_category_without_name()
    {
        $response = $this->postJson('/api/book-categories', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test error when retrieving a non-existent book category.
     */
    public function test_cannot_get_non_existent_book_category()
    {
        $response = $this->getJson('/api/book-categories/9999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Book category not found']);
    }
}
