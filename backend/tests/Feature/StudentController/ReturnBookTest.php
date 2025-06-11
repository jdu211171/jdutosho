<?php

namespace Tests\Feature\StudentController;

use App\Models\RentBook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReturnBookTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_return_book()
    {
        $student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($student);
        $rent = RentBook::factory()->create([
            'taken_by' => $student->id,
            'return_date' => null
        ]);

        $response = $this->putJson("/api/student/{$rent->id}/return", [
            'action' => 'return'
        ]);
        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $rent->id);
    }

    public function test_cannot_return_non_existent_rent()
    {
        $student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($student);

        $response = $this->putJson('/api/student/9999/return', [
            'action' => 'return'
        ]);
        $response->assertStatus(404)
                 ->assertJson(['message' => 'Rent not found']);
    }

    public function test_requires_action_parameter()
    {
        $student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($student);
        $rent = RentBook::factory()->create([
            'taken_by' => $student->id,
            'return_date' => null
        ]);

        $response = $this->putJson("/api/student/{$rent->id}/return", []);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['action']);
    }

    public function test_validates_action_value()
    {
        $student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($student);
        $rent = RentBook::factory()->create([
            'taken_by' => $student->id,
            'return_date' => null
        ]);

        $response = $this->putJson("/api/student/{$rent->id}/return", [
            'action' => 'invalid_action'
        ]);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['action']);
    }
}

