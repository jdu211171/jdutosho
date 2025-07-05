<?php

namespace Tests\Feature\BookController;

use App\Models\Book;
use App\Models\BookCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookPdfTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->create(['role' => 'librarian']);
        Sanctum::actingAs($user);
        
        // Set up storage for testing
        Storage::fake('public');
    }

    /**
     * Test creating a book with PDF upload.
     */
    public function test_can_create_book_with_pdf()
    {
        $category = BookCategory::factory()->create();
        $pdf = UploadedFile::fake()->create('test_book.pdf', 1024, 'application/pdf');

        $response = $this->postJson('/api/books', [
            'name' => 'Test Book with PDF',
            'author' => 'Test Author',
            'language' => 'en',
            'category' => $category->id,
            'codes' => ['TEST001'],
            'pdf' => $pdf,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id', 'name', 'author', 'language', 'category_id', 'category',
                    'has_pdf', 'pdf_url', 'codes'
                ]
            ])
            ->assertJsonFragment([
                'has_pdf' => true,
                'name' => 'Test Book with PDF'
            ]);

        // Verify file was stored
        $book = Book::where('name', 'Test Book with PDF')->first();
        $this->assertNotNull($book->pdf_path);
        $this->assertTrue(Storage::disk('public')->exists($book->pdf_path));
    }

    /**
     * Test creating a book without PDF.
     */
    public function test_can_create_book_without_pdf()
    {
        $category = BookCategory::factory()->create();

        $response = $this->postJson('/api/books', [
            'name' => 'Test Book without PDF',
            'author' => 'Test Author',
            'language' => 'en',
            'category' => $category->id,
            'codes' => ['TEST002'],
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'has_pdf' => false,
                'pdf_url' => null,
                'name' => 'Test Book without PDF'
            ]);
    }

    /**
     * Test updating a book with PDF upload.
     */
    public function test_can_update_book_with_pdf()
    {
        $category = BookCategory::factory()->create();
        $book = Book::factory()->create(['category_id' => $category->id]);
        $pdf = UploadedFile::fake()->create('updated_book.pdf', 1024, 'application/pdf');

        $response = $this->putJson("/api/books/{$book->id}", [
            'name' => 'Updated Book',
            'author' => 'Updated Author',
            'language' => 'en',
            'category' => $category->id,
            'pdf' => $pdf,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'has_pdf' => true,
                'name' => 'Updated Book'
            ]);

        // Verify file was stored
        $book->refresh();
        $this->assertNotNull($book->pdf_path);
        $this->assertTrue(Storage::disk('public')->exists($book->pdf_path));
    }

    /**
     * Test updating a book and replacing existing PDF.
     */
    public function test_can_replace_existing_pdf()
    {
        $category = BookCategory::factory()->create();
        $book = Book::factory()->create(['category_id' => $category->id]);
        
        // Create initial PDF
        $oldPdf = UploadedFile::fake()->create('old_book.pdf', 1024, 'application/pdf');
        $oldPdfPath = $oldPdf->store('pdfs', 'public');
        $book->update(['pdf_path' => $oldPdfPath]);

        // Upload new PDF
        $newPdf = UploadedFile::fake()->create('new_book.pdf', 1024, 'application/pdf');

        $response = $this->putJson("/api/books/{$book->id}", [
            'name' => $book->name,
            'author' => $book->author,
            'language' => $book->language,
            'category' => $category->id,
            'pdf' => $newPdf,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['has_pdf' => true]);

        // Verify old file was deleted and new file was stored
        $book->refresh();
        $this->assertFalse(Storage::disk('public')->exists($oldPdfPath));
        $this->assertTrue(Storage::disk('public')->exists($book->pdf_path));
        $this->assertNotEquals($oldPdfPath, $book->pdf_path);
    }

    /**
     * Test PDF preview endpoint.
     */
    public function test_can_preview_pdf()
    {
        $book = Book::factory()->create();
        $pdf = UploadedFile::fake()->create('preview_test.pdf', 1024, 'application/pdf');
        $pdfPath = $pdf->store('pdfs', 'public');
        $book->update(['pdf_path' => $pdfPath]);

        $response = $this->get("/api/books/{$book->id}/pdf/preview");

        $response->assertStatus(200);
        $this->assertStringContainsString('inline', $response->headers->get('Content-Disposition'));
    }

    /**
     * Test PDF download endpoint.
     */
    public function test_can_download_pdf()
    {
        $book = Book::factory()->create([
            'name' => 'Download Test Book',
            'author' => 'Test Author'
        ]);
        $pdf = UploadedFile::fake()->create('download_test.pdf', 1024, 'application/pdf');
        $pdfPath = $pdf->store('pdfs', 'public');
        $book->update(['pdf_path' => $pdfPath]);

        $response = $this->get("/api/books/{$book->id}/pdf/download");

        $response->assertStatus(200);
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('Download Test Book_by_Test Author.pdf', $response->headers->get('Content-Disposition'));
    }

    /**
     * Test preview PDF when book doesn't exist.
     */
    public function test_preview_pdf_book_not_found()
    {
        $response = $this->getJson('/api/books/999/pdf/preview');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Book not found']);
    }

    /**
     * Test preview PDF when PDF doesn't exist.
     */
    public function test_preview_pdf_file_not_found()
    {
        $book = Book::factory()->create(['pdf_path' => null]);

        $response = $this->getJson("/api/books/{$book->id}/pdf/preview");

        $response->assertStatus(404)
            ->assertJson(['message' => 'PDF not found']);
    }

    /**
     * Test download PDF when book doesn't exist.
     */
    public function test_download_pdf_book_not_found()
    {
        $response = $this->getJson('/api/books/999/pdf/download');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Book not found']);
    }

    /**
     * Test download PDF when PDF doesn't exist.
     */
    public function test_download_pdf_file_not_found()
    {
        $book = Book::factory()->create(['pdf_path' => null]);

        $response = $this->getJson("/api/books/{$book->id}/pdf/download");

        $response->assertStatus(404)
            ->assertJson(['message' => 'PDF not found']);
    }

    /**
     * Test PDF validation for file upload.
     */
    public function test_pdf_validation()
    {
        $category = BookCategory::factory()->create();
        $invalidFile = UploadedFile::fake()->create('test.txt', 1024, 'text/plain');

        $response = $this->postJson('/api/books', [
            'name' => 'Test Book',
            'author' => 'Test Author',
            'language' => 'en',
            'category' => $category->id,
            'codes' => ['TEST001'],
            'pdf' => $invalidFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    }

    /**
     * Test PDF file size validation.
     */
    public function test_pdf_size_validation()
    {
        $category = BookCategory::factory()->create();
        $largePdf = UploadedFile::fake()->create('large.pdf', 11264, 'application/pdf'); // 11MB > 10MB limit

        $response = $this->postJson('/api/books', [
            'name' => 'Test Book',
            'author' => 'Test Author',
            'language' => 'en',
            'category' => $category->id,
            'codes' => ['TEST001'],
            'pdf' => $largePdf,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    }
}
