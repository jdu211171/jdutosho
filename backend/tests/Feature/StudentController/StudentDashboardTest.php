<?php

namespace Tests\Feature\StudentController;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_view_dashboard()
    {
        $student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($student);

        $response = $this->getJson('/api/student/dashboard');
        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [
                'totalBorrowed', 'availableBooks', 'rentHistory', 'averageRentDays'
            ]]);
    }

    public function test_non_student_cannot_view_dashboard()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/student/dashboard');
        $response->assertStatus(403)
            ->assertJson(['message' => 'User does not have the right roles.']);
    }
}
