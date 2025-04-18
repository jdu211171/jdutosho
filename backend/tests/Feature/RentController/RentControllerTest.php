<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Book;
use App\Models\BookCode;
use App\Models\RentBook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $librarian;
    protected $student;

    public function setUp(): void
    {
        parent::setUp();

        // Create a librarian for authentication
        $this->librarian = User::factory()->create(['role' => 'librarian']);
        $this->student = User::factory()->create(['role' => 'student', 'loginID' => 'student123']);
    }

    /** @test */
    public function it_retrieves_all_current_rents()
    {
        $book = Book::factory()->create();
        $bookCode = BookCode::factory()->create(['book_id' => $book->id, 'status' => 'rent', 'code' => 'CODE001']);
        RentBook::factory()->create([
            'book_code_id' => $bookCode->id,
            'book_id' => $book->id,
            'taken_by' => $this->student->id,
            'given_by' => $this->librarian->id,
            'return_date' => null,
        ]);

        $response = $this->actingAs($this->librarian)->getJson('/api/rents');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'book_code', 'status', 'book', 'taken_by', 'given_by', 'given_date', 'passed_days'],
                ],
                'links', 'meta',
            ]);
    }

    /** @test */
    public function it_creates_a_rent_successfully()
    {
        $book = Book::factory()->create();
        $bookCode = BookCode::factory()->create(['book_id' => $book->id, 'status' => 'exist', 'code' => 'CODE001']);

        $response = $this->actingAs($this->librarian)->postJson('/api/rents', [
            'book_code' => 'CODE001',
            'login_id' => 'student123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'book_code', 'status', 'book', 'taken_by', 'given_by', 'given_date', 'passed_days']);

        $this->assertDatabaseHas('book_codes', ['code' => 'CODE001', 'status' => 'rent']);
        $this->assertDatabaseHas('rent_books', [
            'book_code_id' => $bookCode->id,
            'taken_by' => $this->student->id,
            'return_date' => null,
        ]);
    }

    /** @test */
    public function it_fails_to_create_rent_with_non_student()
    {
        $nonStudent = User::factory()->create(['role' => 'librarian', 'loginID' => 'librarian123']);
        $bookCode = BookCode::factory()->create(['status' => 'exist', 'code' => 'CODE001']);

        $response = $this->actingAs($this->librarian)->postJson('/api/rents', [
            'book_code' => 'CODE001',
            'login_id' => 'librarian123',
        ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Only student can rent a book']);
    }

    /** @test */
    public function it_fails_to_create_rent_when_student_has_three_rents()
    {
        $bookCodes = BookCode::factory()->count(3)->create(['status' => 'rent']);
        foreach ($bookCodes as $index => $code) {
            RentBook::factory()->create([
                'book_code_id' => $code->id,
                'taken_by' => $this->student->id,
                'given_by' => $this->librarian->id,
                'return_date' => null,
            ]);
        }
        $newBookCode = BookCode::factory()->create(['status' => 'exist', 'code' => 'CODE004']);

        $response = $this->actingAs($this->librarian)->postJson('/api/rents', [
            'book_code' => 'CODE004',
            'login_id' => 'student123',
        ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Student can only rent 3 books']);
    }

    /** @test */
    public function it_fails_to_create_rent_with_already_rented_book()
    {
        $bookCode = BookCode::factory()->create(['status' => 'rent', 'code' => 'CODE001']);

        $response = $this->actingAs($this->librarian)->postJson('/api/rents', [
            'book_code' => 'CODE001',
            'login_id' => 'student123',
        ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Book is already rented']);
    }

    /** @test */
    public function it_retrieves_pending_rents()
    {
        $book = Book::factory()->create();
        $bookCode = BookCode::factory()->create(['book_id' => $book->id, 'status' => 'pending', 'code' => 'CODE001']);
        RentBook::factory()->create([
            'book_code_id' => $bookCode->id,
            'book_id' => $book->id,
            'taken_by' => $this->student->id,
            'given_by' => $this->librarian->id,
            'return_date' => null,
        ]);

        $response = $this->actingAs($this->librarian)->getJson('/api/rents/pending');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'book_code', 'status', 'book', 'taken_by', 'given_by', 'given_date', 'passed_days'],
                ],
                'links', 'meta',
            ]);
    }

    /** @test */
    public function it_accepts_a_pending_rent()
    {
        $book = Book::factory()->create();
        $bookCode = BookCode::factory()->create(['book_id' => $book->id, 'status' => 'pending', 'code' => 'CODE001']);
        $rent = RentBook::factory()->create([
            'book_code_id' => $bookCode->id,
            'book_id' => $book->id,
            'taken_by' => $this->student->id,
            'given_by' => $this->librarian->id,
            'return_date' => null,
        ]);

        $response = $this->actingAs($this->librarian)->putJson("/api/rents/{$rent->id}/accept");

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'book_code', 'status', 'book', 'taken_by', 'given_by', 'given_date', 'return_date', 'passed_days']);

        $this->assertDatabaseHas('book_codes', ['id' => $bookCode->id, 'status' => 'exist']);
        $this->assertDatabaseHas('rent_books', ['id' => $rent->id, 'return_date' => now()->format('Y-m-d')]);
    }

    /** @test */
    public function it_fails_to_accept_non_existing_rent()
    {
        $response = $this->actingAs($this->librarian)->putJson('/api/rents/9999/accept');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Rent not found']);
    }

    /** @test */
    public function it_fails_to_accept_non_pending_rent()
    {
        $book = Book::factory()->create();
        $bookCode = BookCode::factory()->create(['book_id' => $book->id, 'status' => 'rent', 'code' => 'CODE001']);
        $rent = RentBook::factory()->create([
            'book_code_id' => $bookCode->id,
            'book_id' => $book->id,
            'taken_by' => $this->student->id,
            'given_by' => $this->librarian->id,
            'return_date' => null,
        ]);

        $response = $this->actingAs($this->librarian)->putJson("/api/rents/{$rent->id}/accept");

        $response->assertStatus(400)
            ->assertJson(['message' => 'This book can\'t be accepted']);
    }
}
