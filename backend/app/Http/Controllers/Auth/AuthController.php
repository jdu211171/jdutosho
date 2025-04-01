<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'username' => $request->username,
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'student',
        ]);

        $token = $user->createToken('API Token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $loginValue = $request->input('email') ?? $request->input('username');
        $user = filter_var($loginValue, FILTER_VALIDATE_EMAIL)
            ? User::where('email', $loginValue)->first()
            : User::where('username', $loginValue)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('API Token')->plainTextToken;
        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function logout(LogoutRequest $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out'], 200);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Reset link sent to your email'], 200)
            : response()->json(['message' => 'Unable to send reset link'], 400);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                $user->tokens()->delete(); // Revoke existing tokens
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Password reset successfully'], 200)
            : response()->json(['message' => 'Invalid token or email'], 400);
    }

    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        $providerUser = Socialite::driver($provider)->stateless()->user();
        $existingUser = User::where('email', $providerUser->getEmail())->first();

        if (!$existingUser) {
            $existingUser = User::create([
                'username' => 'google_'.Str::random(6),
                'full_name' => $providerUser->getName() ?? 'Google User',
                'email' => $providerUser->getEmail(),
                'role' => 'student',
                'password' => Hash::make('password'),
            ]);
        }

        $token = $existingUser->createToken('API Token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $existingUser,
            'token' => $token
        ], 200);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $isGoogleUser = str_starts_with($user->username, 'google_');
        $isFirstTimeGoogleUser = $isGoogleUser && Hash::check('password', $user->password);

        // For first-time Google users, no current_password check needed
        if (!$isFirstTimeGoogleUser) {
            // All other users must provide correct current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect',
                    'errors' => ['current_password' => ['The provided password does not match our records']]
                ], 422);
            }
        }

        // Check if new password matches the old one
        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'message' => 'New password cannot be the same as your current password',
                'errors' => ['new_password' => ['New password must be different from your current password']]
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
            'is_first_time' => $isFirstTimeGoogleUser
        ], 200);
    }
}

