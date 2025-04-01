<?php

use App\Models\User;

test('admin can delete user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $token = $admin->createToken('API Token')->plainTextToken;

    $user = User::factory()->create();

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ])->deleteJson('/api/users/' . $user->id);

    $response->assertStatus(204);

    $this->assertDatabaseMissing('users', [
        'id' => $user->id
    ]);
});
