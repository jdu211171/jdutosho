<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCategory;
use App\Models\BookCode;
use App\Models\RentBook;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $student;

    /**
     * Set up the test environment by authenticating as a student.
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($this->student);
    }

    /**
     * Test retrieving student's current rents.
     */
    public function test_can_get_student_rents()
    {
        // Create category, book, and book code
        $category = BookCategory::factory()->create();
        $book = Book::factory()->create(['category_id' => $category->id]);
        $bookCode = BookCode::factory()->create([
            'book_id' => $book->id, 
            'status' => 'rent'
        ]);

        // Create a rent for the student
        $librarian = User::factory()->create(['role' => 'librarian']);
        $rent = RentBook::factory()->create([
            'book_code_id' => $bookCode->id,
            'book_id' => $book->id,
            'taken_by' => $this->student->id,
            'given_by' => $librarian->id,
            'given_date' => Carbon::now()->subDays(5),
            'return_date' => null
        ]);

        // Create another rent that has been returned (should not appear in results)
        $returnedRent = RentBook::factory()->create([
            'book_code_id' => $bookCode->id,
            'book_id' => $book->id,
            'taken_by' => $this->student->id,
            'given_by' => $librarian->id,
            'given_date' => Carbon::now()->subDays(10),
            'return_date' => Carbon::now()->subDays(2)
        ]);

        $response = $this->getJson('/api/student/rents');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'book_code',
                        'status',
                        'book',
                        'taken_by',
                        'given_by',
                        'given_date',
                        'passed_days'
                    ]
                ]
            ])
            ->assertJsonFragment([
                'id' => $rent->id,
                'book_code' => $bookCode->code,
                'status' => 'rent',
            ]);

        // Verify the returned rent is not included
        $responseData = $response->json('data');
        $rentIds = array_column($responseData, 'id');
        $this->assertNotContains($returnedRent->id, $rentIds);
    }

    /**
     * Test student can request return of a borrowed book.
     */
    public function test_can_request_book_return()
    {
        // Create necessary models
        $category = BookCategory::factory()->create();
        $book = Book::factory()->create(['category_id' => $category->id]);
        $bookCode = BookCode::factory()->create([
            'book_id' => $book->id, 
            'status' => 'rent'
        ]);
        
        // Create an active rent for the student
        $librarian = User::factory()->create(['role' => 'librarian']);
        $rent = RentBook::factory()->create([
            'book_code_id' => $bookCode->id,
            'book_id' => $book->id,
            'taken_by' => $this->student->id,
            'given_by' => $librarian->id,
            'given_date' => Carbon::now()->subDays(5),
            'return_date' => null
        ]);

        $response = $this->putJson("/api/student/{$rent->id}/return", [
            'action' => 'return'
        ]);

        $response->assertStatus(200);

        // Check that the book code status is changed to pending
        $this->assertDatabaseHas('book_codes', [
            'id' => $bookCode->id,
            'status' => 'pending'
        ]);
    }

    /**
     * Test handling return request for non-existent rent.
     */
    public function test_cannot_return_non_existent_rent()
    {
        $response = $this->putJson('/api/student/9999/return', [
            'action' => 'return'
        ]);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Rent not found']);
    }

    /**
     * Test student cannot return a book that belongs to another student.
     */
    public function test_cannot_return_another_students_book()
    {
        // Create another student
        $otherStudent = User::factory()->create(['role' => 'student']);
        
        // Create necessary models
        $category = BookCategory::factory()->create();
        $book = Book::factory()->create(['category_id' => $category->id]);
        $bookCode = BookCode::factory()->create([
            'book_id' => $book->id, 
            'status' => 'rent'
        ]);
        
        // Create a rent assigned to the other student
        $librarian = User::factory()->create(['role' => 'librarian']);
        $rent = RentBook::factory()->create([
            'book_code_id' => $bookCode->id,
            'book_id' => $book->id,
            'taken_by' => $otherStudent->id,
            'given_by' => $librarian->id,
            'given_date' => Carbon::now()->subDays(5),
            'return_date' => null
        ]);

        $response = $this->putJson("/api/student/{$rent->id}/return", [
            'action' => 'return'
        ]);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Rent not found']);
    }

    /**
     * Test retrieving available books with search.
     */
    public function test_can_get_available_books()
    {
        $category = BookCategory::factory()->create();
        $book = Book::factory()->create([
            'name' => 'Test Book Title',
            'category_id' => $category->id
        ]);
        $bookCode = BookCode::factory()->create([
            'book_id' => $book->id, 
            'status' => 'exist'
        ]);

        $response = $this->getJson('/api/student/books');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'author', 'language', 'category', 'available']
                ],
                'links',
                'meta'
            ])
            ->assertJsonFragment([
                'id' => $book->id,
                'name' => 'Test Book Title',
                'available' => true
            ]);
    }

    /**
     * Test searching for books.
     */
    public function test_can_search_books()
    {
        $category = BookCategory::factory()->create();
        
        // Book that should match search
        $matchingBook = Book::factory()->create([
            'name' => 'Python Programming',
            'category_id' => $category->id
        ]);
        BookCode::factory()->create([
            'book_id' => $matchingBook->id, 
            'status' => 'exist'
        ]);
        
        // Book that should not match search
        $nonMatchingBook = Book::factory()->create([
            'name' => 'Java Development',
            'category_id' => $category->id
        ]);
        BookCode::factory()->create([
            'book_id' => $nonMatchingBook->id, 
            'status' => 'exist'
        ]);

        $response = $this->getJson('/api/student/books?search=Python');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $matchingBook->id,
                'name' => 'Python Programming'
            ]);

        // Ensure the non-matching book is not included
        $responseData = $response->json('data');
        $bookIds = array_column($responseData, 'id');
        $this->assertNotContains($nonMatchingBook->id, $bookIds);
    }

    /**
     * Test retrieving student dashboard statistics.
     */
    public function test_can_get_student_dashboard()
    {
        // Create some books
        $category = BookCategory::factory()->create();
        $books = Book::factory()->count(3)->create(['category_id' => $category->id]);
        
        // Create some book codes (some rented, some available)
        foreach ($books as $book) {
            BookCode::factory()->create(['book_id' => $book->id, 'status' => 'exist']);
        }
        
        $librarian = User::factory()->create(['role' => 'librarian']);
        
        // Create active rents for the student
        $book1Code = BookCode::factory()->create(['book_id' => $books[0]->id, 'status' => 'rent']);
        $rent1 = RentBook::factory()->create([
            'book_code_id' => $book1Code->id,
            'book_id' => $books[0]->id,
            'taken_by' => $this->student->id,
            'given_by' => $librarian->id,
            'given_date' => Carbon::now()->subDays(5),
            'return_date' => null
        ]);
        
        // Create completed rents for the student
        $book2Code = BookCode::factory()->create(['book_id' => $books[1]->id, 'status' => 'exist']);
        $rent2 = RentBook::factory()->create([
            'book_code_id' => $book2Code->id,
            'book_id' => $books[1]->id,
            'taken_by' => $this->student->id,
            'given_by' => $librarian->id,
            'given_date' => Carbon::now()->subDays(15),
            'return_date' => Carbon::now()->subDays(5)
        ]);

        $response = $this->getJson('/api/student/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'totalBorrowed',
                    'availableBooks',
                    'rentHistory',
                    'averageRentDays'
                ]
            ])
            ->assertJson([
                'data' => [
                    'totalBorrowed' => 1,
                    'availableBooks' => 3,
                    'rentHistory' => 2
                ]
            ]);
            
        // Average rent days should be 10 (from the completed rent)
        $this->assertEquals(10, $response->json('data.averageRentDays'));
    }
}
