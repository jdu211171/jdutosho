<?php

use App\Models\User;

test('user can register with valid data', function () {
    $userData = [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = $this->postJson('/api/auth/register', $userData);

    $response->assertStatus(201)
        ->assertJsonStructure(['token']);

    $this->assertDatabaseHas('users', [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
    ]);
});

test('user cannot register with existing email', function () {
    User::factory()->create([
        'email' => 'existing@example.com'
    ]);

    $userData = [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = $this->postJson('/api/auth/register', $userData);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('email');
});
