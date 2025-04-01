<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Set up the test environment by authenticating as an admin.
     */
    protected function setUp(): void
    {
        parent::setUp();
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
    }

    /**
     * Test retrieving all users with pagination.
     */
    public function test_can_get_all_users()
    {
        User::factory()->count(15)->create();

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'username', 'full_name', 'email', 'role']
                ],
                'links',
                'meta'
            ]);
    }

    /**
     * Test retrieving a single user.
     */
    public function test_can_get_single_user()
    {
        $user = User::factory()->create();

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]);
    }

    /**
     * Test creating a new user.
     */
    public function test_can_create_user()
    {
        $response = $this->postJson('/api/users', [
            'username' => 'john.doe',
            'full_name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin'
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'username' => 'john.doe',
                    'full_name' => 'John Doe',
                    'email' => 'john.doe@example.com',
                    'role' => 'admin'
                ]
            ]);

        $this->assertDatabaseHas('users', ['username' => 'john.doe']);
    }

    /**
     * Test updating a user.
     */
    public function test_can_update_user()
    {
        $user = User::factory()->create();

        $response = $this->putJson("/api/users/{$user->id}", [
            'username' => 'john.doe2',
            'full_name' => 'John Doe Updated',
            'email' => 'john.doe2@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'role' => 'student'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $user->id,
                    'username' => 'john.doe2',
                    'full_name' => 'John Doe Updated',
                    'email' => 'john.doe2@example.com',
                    'role' => 'student'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'john.doe2'
        ]);
    }

    /**
     * Test deleting a user.
     */
    public function test_can_delete_user()
    {
        $user = User::factory()->create();

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'User deleted']);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    /**
     * Test validation error when creating a user without required fields.
     */
    public function test_cannot_create_user_without_required_fields()
    {
        $response = $this->postJson('/api/users', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username', 'full_name', 'email', 'password', 'role']);
    }

    /**
     * Test error when retrieving a non-existent user.
     */
    public function test_cannot_get_non_existent_user()
    {
        $response = $this->getJson('/api/users/9999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'User not found']);
    }

    /**
     * Test error when updating a non-existent user.
     */
    public function test_cannot_update_non_existent_user()
    {
        $response = $this->putJson('/api/users/9999', [
            'username' => 'should.fail',
            'full_name' => 'Fail',
            'email' => 'fail@example.com',
            'password' => 'fail123',
            'password_confirmation' => 'fail123',
            'role' => 'student'
        ]);

        $response->assertStatus(404)
            ->assertJson(['message' => 'User not found']);
    }

    /**
     * Test error when deleting a non-existent user.
     */
    public function test_cannot_delete_non_existent_user()
    {
        $response = $this->deleteJson('/api/users/9999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'User not found']);
    }
}
