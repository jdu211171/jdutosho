<?php

use App\Models\User;

test('admin can get single user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $token = $admin->createToken('API Token')->plainTextToken;

    $user = User::factory()->create([
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe@example.com',
        'role' => 'student'
    ]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ])->getJson('/api/users/' . $user->id);

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $user->id,
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@example.com',
                'role' => 'student'
            ]
        ]);
});
