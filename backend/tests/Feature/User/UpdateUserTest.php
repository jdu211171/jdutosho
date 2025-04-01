<?php

use App\Models\User;

test('admin can update user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $token = $admin->createToken('API Token')->plainTextToken;

    $user = User::factory()->create([
        'full_name' => 'Old Name',
        'email' => 'old.name@example.com',
        'role' => 'student'
    ]);

    $updateData = [
        'full_name' => 'New Name',
        'email' => 'new.name@example.com',
        'role' => 'student'
    ];

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ])->putJson('/api/users/' . $user->id, $updateData);

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $user->id,
                'full_name' => 'New Name',
                'email' => 'new.name@example.com'
            ]
        ]);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'full_name' => 'New Name',
        'email' => 'new.name@example.com'
    ]);
});

