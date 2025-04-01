<?php

use App\Models\User;

test('user can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('API Token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ])->postJson('/api/auth/logout');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Logged out'
        ]);

    $this->assertDatabaseCount('personal_access_tokens', 0);
});

test('user can login with username', function () {
    $user = \App\Models\User::factory()->create([
        'username' => 'myuser',
        'email' => 'myuser@example.com',
        'password' => bcrypt('secret123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'username' => 'myuser',
        'password' => 'secret123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'user' => ['id', 'username'],
            'token',
        ]);
});
