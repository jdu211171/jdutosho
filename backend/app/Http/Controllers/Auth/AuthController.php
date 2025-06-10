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
use Illuminate\Http\Request;

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
        // Rate limiting: Allow only 5 requests per hour per IP
        $key = 'forgot_password_' . $request->ip();
        if (cache()->has($key) && cache()->get($key) >= 5) {
            return response()->json([
                'message' => 'Too many password reset attempts. Please try again later.'
            ], 429);
        }

        // Increment rate limit counter first
        $attempts = cache()->get($key, 0) + 1;
        cache()->put($key, $attempts, now()->addHour());

        // Check if user exists with this email
        $user = User::where('email', $request->email)->first();
        
        if ($user) {
            // User exists - send actual reset email
            try {
                $status = Password::sendResetLink(
                    $request->only('email')
                );
                
                // Log successful email send for debugging (optional)
                \Log::info("Password reset email sent to: " . $request->email);
            } catch (\Exception $e) {
                // Log the error for debugging but still return success message
                \Log::error('Password reset email failed: ' . $e->getMessage());
            }
        } else {
            // User doesn't exist - don't send email but log the attempt
            \Log::warning("Password reset attempted for non-existent email: " . $request->email);
        }

        // Always return the same success message regardless of whether user exists
        return response()->json([
            'message' => 'If this email is registered, a reset link has been sent to your email address.'
        ], 200);
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
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Get OAuth URL for API clients (returns JSON instead of redirect)
     */
    public function getOAuthUrl($provider)
    {
        $url = Socialite::driver($provider)->redirect()->getTargetUrl();
        
        return response()->json([
            'oauth_url' => $url,
            'provider' => $provider
        ]);
    }

    /**
     * Get current user profile with setup status
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'has_set_password' => $user->has_set_password,
                'is_google_user' => str_starts_with($user->username, 'google_'),
                'needs_password_setup' => !$user->has_set_password,
            ]
        ]);
    }

    public function handleProviderCallback($provider)
    {
        $providerUser = Socialite::driver($provider)->user();
        $email = $providerUser->getEmail();

        // Check if email domain is jdu.uz
        if (!$this->isValidEmailDomain($email)) {
            return response()->json([
                'message' => 'Registration failed. Only @jdu.uz email domains are allowed for Google authentication.',
                'status' => 'error'
            ], 403);
        }

        $existingUser = User::where('email', $email)->first();

        if (!$existingUser) {
            $existingUser = User::create([
                'username' => 'google_'.Str::random(6),
                'full_name' => $providerUser->getName() ?? 'Google User',
                'email' => $email,
                'role' => 'student',
                'password' => Hash::make('password'),
                'has_set_password' => false, // Google users need to set their password
            ]);
        }

        $token = $existingUser->createToken('API Token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $existingUser,
            'token' => $token
        ], 200);
    }

    /**
     * Check if the email has a valid domain (@jdu.uz)
     *
     * @param string|null $email
     * @return bool
     */
    private function isValidEmailDomain(?string $email): bool
    {
        if (!$email) {
            return false;
        }

        return Str::endsWith(strtolower($email), '@jdu.uz');
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $isFirstTime = !$user->has_set_password;

        // For first-time users, no current_password check needed
        if (!$isFirstTime) {
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
        $user->has_set_password = true; // Mark as password has been set
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
            'is_first_time' => $isFirstTime
        ], 200);
    }
}

