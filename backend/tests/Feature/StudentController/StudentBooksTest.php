<?php

namespace Tests\Feature\StudentController;

use App\Models\Book;
use App\Models\BookCategory;
use App\Models\BookCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentBooksTest extends TestCase
{
    use RefreshDatabase;

    protected $student;
    protected $admin;
    protected $baseUrl = '/api/student/books';

    /**
     * Set up the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => 'student']);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    /**
     * Test that students can access the books endpoint.
     */
    public function test_student_can_access_books()
    {
        Sanctum::actingAs($this->student);
        
        $response = $this->getJson($this->baseUrl);
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'links',
                'meta'
            ]);
    }

    /**
     * Test unauthorized access is prevented.
     */
    public function test_unauthenticated_access_is_rejected()
    {
        $response = $this->getJson($this->baseUrl);
        
        $response->assertStatus(401);
    }

    /**
     * Test that non-student users cannot access the endpoint.
     */
    public function test_non_student_users_cannot_access_books()
    {
        Sanctum::actingAs($this->admin);
        
        $response = $this->getJson($this->baseUrl);
        
        $response->assertStatus(403);
    }

    /**
     * Test that the endpoint returns available and unavailable books correctly.
     */
    public function test_returns_books_with_availability_status()
    {
        Sanctum::actingAs($this->student);
        
        // Create category for testing
        $category = BookCategory::factory()->create();
        
        // Create a book with an available copy
        $availableBook = Book::factory()->create([
            'name' => 'Available Book',
            'category_id' => $category->id
        ]);
        BookCode::factory()->create([
            'book_id' => $availableBook->id,
            'status' => 'exist'
        ]);
        
        // Create a book with only unavailable copies
        $unavailableBook = Book::factory()->create([
            'name' => 'Unavailable Book',
            'category_id' => $category->id
        ]);
        BookCode::factory()->create([
            'book_id' => $unavailableBook->id,
            'status' => 'rent'
        ]);
        
        $response = $this->getJson($this->baseUrl);
        
        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $availableBook->id,
                'name' => 'Available Book',
                'available' => true
            ])
            ->assertJsonFragment([
                'id' => $unavailableBook->id,
                'name' => 'Unavailable Book',
                'available' => false
            ]);
    }

    /**
     * Test search functionality by book name.
     */
    public function test_can_search_books_by_name()
    {
        Sanctum::actingAs($this->student);
        
        $category = BookCategory::factory()->create();
        
        // Create books with different names
        $pythonBook = Book::factory()->create([
            'name' => 'Python Programming',
            'author' => 'John Doe',
            'category_id' => $category->id
        ]);
        BookCode::factory()->create([
            'book_id' => $pythonBook->id,
            'status' => 'exist'
        ]);
        
        $javaBook = Book::factory()->create([
            'name' => 'Java Development',
            'author' => 'Jane Smith',
            'category_id' => $category->id
        ]);
        BookCode::factory()->create([
            'book_id' => $javaBook->id,
            'status' => 'exist'
        ]);
        
        $response = $this->getJson("{$this->baseUrl}?search=Python");
        
        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $pythonBook->id,
                'name' => 'Python Programming'
            ]);
            
        // Check that the Java book is not included
        $responseData = $response->json('data');
        $bookIds = array_column($responseData, 'id');
        $this->assertNotContains($javaBook->id, $bookIds);
    }

    /**
     * Test search functionality by author.
     */
    public function test_can_search_books_by_author()
    {
        Sanctum::actingAs($this->student);
        
        $category = BookCategory::factory()->create();
        
        // Create books with different authors
        $bookByJohn = Book::factory()->create([
            'name' => 'First Book',
            'author' => 'John Author',
            'category_id' => $category->id
        ]);
        BookCode::factory()->create([
            'book_id' => $bookByJohn->id,
            'status' => 'exist'
        ]);
        
        $bookByJane = Book::factory()->create([
            'name' => 'Second Book',
            'author' => 'Jane Writer',
            'category_id' => $category->id
        ]);
        BookCode::factory()->create([
            'book_id' => $bookByJane->id,
            'status' => 'exist'
        ]);
        
        $response = $this->getJson("{$this->baseUrl}?search=John");
        
        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $bookByJohn->id,
                'author' => 'John Author'
            ]);
            
        // Check that Jane's book is not included
        $responseData = $response->json('data');
        $bookIds = array_column($responseData, 'id');
        $this->assertNotContains($bookByJane->id, $bookIds);
    }

    /**
     * Test pagination works correctly.
     */
    public function test_pagination_works_correctly()
    {
        Sanctum::actingAs($this->student);
        
        $category = BookCategory::factory()->create();
        
        // Create 15 books
        $books = Book::factory()->count(15)->create(['category_id' => $category->id]);
        
        // Add book codes for each book
        foreach ($books as $book) {
            BookCode::factory()->create(['book_id' => $book->id, 'status' => 'exist']);
        }
        
        // Test first page with 5 items per page
        $response = $this->getJson("{$this->baseUrl}?page=1&per_page=5");
        
        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 3)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 15);
            
        // Test second page
        $response2 = $this->getJson("{$this->baseUrl}?page=2&per_page=5");
        
        $response2->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.current_page', 2);
            
        // Ensure we got different books on different pages
        $firstPageIds = collect($response->json('data'))->pluck('id')->all();
        $secondPageIds = collect($response2->json('data'))->pluck('id')->all();
        
        $this->assertEmpty(array_intersect($firstPageIds, $secondPageIds));
    }

    /**
     * Test response structure is correct.
     */
    public function test_response_structure_is_correct()
    {
        Sanctum::actingAs($this->student);
        
        $category = BookCategory::factory()->create(['name' => 'Fiction']);
        
        $book = Book::factory()->create([
            'name' => 'Test Book',
            'author' => 'Test Author',
            'language' => 'en',
            'category_id' => $category->id
        ]);
        
        BookCode::factory()->create([
            'book_id' => $book->id,
            'status' => 'exist'
        ]);
        
        $response = $this->getJson($this->baseUrl);
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'author',
                        'language',
                        'category',
                        'available'
                    ]
                ]
            ])
            ->assertJsonFragment([
                'id' => $book->id,
                'name' => 'Test Book',
                'author' => 'Test Author',
                'language' => 'en',
                'category' => 'Fiction',
                'available' => true
            ]);
    }
}
