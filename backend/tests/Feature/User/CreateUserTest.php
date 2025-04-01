<?php

use App\Models\User;

test('admin can create user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $token = $admin->createToken('API Token')->plainTextToken;

    $userData = [
        'full_name' => 'Jane Smith',
        'email' => 'jane.smith@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'librarian',
    ];

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ])->postJson('/api/users', $userData);

    $response->assertStatus(201)
        ->assertJson([
            'data' => [
                'full_name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'role' => 'librarian'
            ]
        ]);

    $this->assertDatabaseHas('users', [
        'full_name' => 'Jane Smith',
        'email' => 'jane.smith@example.com',
        'role' => 'librarian'
    ]);
});

test('admin cannot create user with duplicate email', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $token = $admin->createToken('API Token')->plainTextToken;

    User::factory()->create([
        'email' => 'existing@example.com'
    ]);

    $userData = [
        'full_name' => 'Duplicate User',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'student',
    ];

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ])->postJson('/api/users', $userData);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('admin can create student', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $token = $admin->createToken('API Token')->plainTextToken;

    $userData = [
        'full_name' => 'Student One',
        'email' => 'student.one@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'student'
    ];

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ])->postJson('/api/users', $userData);

    $response->assertStatus(201);

    $this->assertDatabaseHas('users', [
        'email' => 'student.one@example.com'
    ]);
});
