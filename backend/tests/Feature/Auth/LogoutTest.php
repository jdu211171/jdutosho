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
