<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class ChangePasswordTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that an authenticated user can change their password.
     */
    public function test_authenticated_user_can_change_password()
    {
        // Arrange
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        $token = $user->createToken('API Token')->plainTextToken;

        // Act
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/change-password', [
                'current_password' => 'oldpassword',
                'new_password' => 'newpassword',
                'new_password_confirmation' => 'newpassword',
            ]);

        // Assert
        $response->assertStatus(200);
        $this->assertTrue(Hash::check('newpassword', $user->fresh()->password));
    }

    /**
     * Test that a Google user can change their password for the first time without providing the current password.
     */
    public function test_google_user_can_change_password_first_time_without_current_password()
    {
        $user = User::factory()->create([
            'username' => 'google_'.\Illuminate\Support\Str::random(6),
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);
        $token = $user->createToken('API Token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/change-password', [
                'new_password' => 'newPasswordForGoogle',
                'new_password_confirmation' => 'newPasswordForGoogle',
            ]);

        $response->assertStatus(200);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('newPasswordForGoogle', $user->fresh()->password));
    }

    /**
     * Test that a Google user's subsequent password change requires the current password.
     */
    public function test_google_user_subsequent_change_requires_current_password()
    {
        $user = User::factory()->create([
            'username' => 'google_'.\Illuminate\Support\Str::random(6),
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);
        $user->password = \Illuminate\Support\Facades\Hash::make('anotherPass');
        $user->save();
        $token = $user->createToken('API Token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/change-password', [
                'current_password' => 'anotherPass',
                'new_password' => 'latestPass',
                'new_password_confirmation' => 'latestPass',
            ]);

        $response->assertStatus(200);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('latestPass', $user->fresh()->password));
    }

    /**
     * Test that changing password fails with mismatched confirmation.
     * Expects a 422 status because new_password and confirmation do not match.
     */
    public function test_change_password_fails_with_mismatched_confirmation()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        $token = $user->createToken('API Token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/change-password', [
                'current_password' => 'oldpassword',
                'new_password' => 'newpassword',
                'new_password_confirmation' => 'differentpassword',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test that changing password fails when the new password is too short.
     * Expects a 422 status due to failing validation rules (min:8).
     */
    public function test_change_password_fails_with_invalid_new_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        $token = $user->createToken('API Token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/change-password', [
                'current_password' => 'oldpassword',
                'new_password' => 'short',
                'new_password_confirmation' => 'short',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test that a Google user cannot skip current password after the first change.
     * The user has already changed the password once without needing the old one.
     * Expects a 400 if the old password is not included for subsequent changes.
     */
    public function test_google_user_cannot_skip_current_password_after_first_change()
    {
        $user = User::factory()->create([
            'username' => 'google_'.\Illuminate\Support\Str::random(6),
            'password' => Hash::make('initialPassword'),
        ]);
        // Simulate first password change
        $user->update(['password' => Hash::make('postFirstChange')]);

        $token = $user->createToken('API Token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/change-password', [
                'new_password' => 'finalPass',
                'new_password_confirmation' => 'finalPass',
            ]);

        $response->assertStatus(400);
    }
}
