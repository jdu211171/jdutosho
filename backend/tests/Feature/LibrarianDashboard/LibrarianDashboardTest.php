<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Book;
use App\Models\BookCategory;
use App\Models\BookCode;
use App\Models\RentBook;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon;

class LibrarianDashboardTest extends TestCase
{
    use RefreshDatabase;

    private $librarian;
    private $student1;
    private $student2;
    private $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users with different roles
        $this->librarian = User::factory()->create(['role' => 'librarian']);
        $this->student1 = User::factory()->create(['role' => 'student']);
        $this->student2 = User::factory()->create(['role' => 'student']);
        $this->admin = User::factory()->create(['role' => 'admin']); // Non-librarian role
    }

    /**
     * Test unauthorized access to the dashboard.
     */
    public function test_unauthorized_user_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/librarian/dashboard');

        $response->assertStatus(401); // Expecting Unauthorized
    }

    /**
     * Test forbidden access for non-librarian roles.
     */
    public function test_non_librarian_cannot_access_dashboard(): void
    {
        Sanctum::actingAs($this->student1); // Authenticate as student
        $response = $this->getJson('/api/librarian/dashboard');
        $response->assertStatus(403); // Expecting Forbidden (assuming role middleware)

        Sanctum::actingAs($this->admin); // Authenticate as admin
        $response = $this->getJson('/api/librarian/dashboard');
        $response->assertStatus(403); // Expecting Forbidden
    }

    /**
     * Test successful access for librarian with no data.
     */
    public function test_librarian_can_access_dashboard_with_no_data(): void
    {
        Sanctum::actingAs($this->librarian);
        $response = $this->getJson('/api/librarian/dashboard');

        $response->assertStatus(200)
            ->assertExactJson([
                'data' => [
                    'totalBooks' => 0,
                    'activeStudents' => 0,
                    'totalRents' => 0,
                    'averageRentDays' => 0,
                ]
            ]);
    }

    /**
     * Test successful access for librarian with correct stats calculation.
     */
    public function test_librarian_can_access_dashboard_and_receives_correct_stats(): void
    {
        // --- Setup Data ---
        $category = BookCategory::factory()->create();

        // Book 1: 3 copies
        $book1 = Book::factory()->create(['category_id' => $category->id]);
        $book1Codes = BookCode::factory()->count(3)->create(['book_id' => $book1->id, 'status' => 'exist']);

        // Book 2: 2 copies
        $book2 = Book::factory()->create(['category_id' => $category->id]);
        $book2Codes = BookCode::factory()->count(2)->create(['book_id' => $book2->id, 'status' => 'exist']);

        // Rent 1 (Active - Student 1)
        RentBook::factory()->create([
            'taken_by' => $this->student1->id,
            'given_by' => $this->librarian->id,
            'book_id' => $book1->id,
            'book_code_id' => $book1Codes[0]->id,
            'given_date' => Carbon::now()->subDays(10),
            'return_date' => null, // Active
        ]);
        $book1Codes[0]->update(['status' => 'rent']);

        // Rent 2 (Active - Student 2)
        RentBook::factory()->create([
            'taken_by' => $this->student2->id,
            'given_by' => $this->librarian->id,
            'book_id' => $book1->id,
            'book_code_id' => $book1Codes[1]->id,
            'given_date' => Carbon::now()->subDays(5),
            'return_date' => null, // Active
        ]);
        $book1Codes[1]->update(['status' => 'rent']);

        // Rent 3 (Completed - Student 1, 7 days)
        RentBook::factory()->create([
            'taken_by' => $this->student1->id,
            'given_by' => $this->librarian->id,
            'book_id' => $book2->id,
            'book_code_id' => $book2Codes[0]->id,
            'given_date' => Carbon::now()->subDays(15),
            'return_date' => Carbon::now()->subDays(8), // Completed (7 days duration)
        ]);
        // Assume book status returned to 'exist' upon return

        // Rent 4 (Completed - Student 2, 13 days)
        RentBook::factory()->create([
            'taken_by' => $this->student2->id,
            'given_by' => $this->librarian->id,
            'book_id' => $book2->id,
            'book_code_id' => $book2Codes[1]->id,
            'given_date' => Carbon::now()->subDays(20),
            'return_date' => Carbon::now()->subDays(7), // Completed (13 days duration)
        ]);

        // Rent 5 (Active - Student 1, another book)
        RentBook::factory()->create([
            'taken_by' => $this->student1->id,
            'given_by' => $this->librarian->id,
            'book_id' => $book1->id,
            'book_code_id' => $book1Codes[2]->id, // Use the 3rd code of book1
            'given_date' => Carbon::now()->subDays(2),
            'return_date' => null, // Active
        ]);
        $book1Codes[2]->update(['status' => 'rent']);

        // --- Expected Calculations ---
        $expectedTotalBooks = 3 + 2; // Total book codes
        $expectedActiveStudents = 2; // student1 and student2 have active rentals
        $expectedTotalRents = 5; // Total rent records created
        $expectedAverageRentDays = round((7 + 13) / 2); // Average of completed rentals


        // --- Execute Test ---
        Sanctum::actingAs($this->librarian); // Authenticate as librarian
        $response = $this->getJson('/api/librarian/dashboard');

        // --- Assertions ---
        $response->assertStatus(200)
            ->assertJsonStructure([ // Verify the structure first
                'data' => [
                    'totalBooks',
                    'activeStudents',
                    'totalRents',
                    'averageRentDays',
                ]
            ])
            ->assertJson([ // Verify the calculated values
                'data' => [
                    'totalBooks' => $expectedTotalBooks,
                    'activeStudents' => $expectedActiveStudents,
                    'totalRents' => $expectedTotalRents,
                    'averageRentDays' => $expectedAverageRentDays,
                ]
            ]);
    }
}
