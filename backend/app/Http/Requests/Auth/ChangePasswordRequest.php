<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorized for authenticated users
    }

    public function rules(): array
    {
        $user = $this->user();

        // Check if this is a Google user with default password
        $isFirstTimeGoogleUser = str_starts_with($user->username, 'google_') &&
                                 Hash::check('password', $user->password);

        // For first-time Google users, current_password is not required
        if ($isFirstTimeGoogleUser) {
            return [
                'new_password' => 'required|string|min:8|confirmed',
                'new_password_confirmation' => 'required|string|min:8',
            ];
        }

        // For all other users, require current_password
        return [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed|different:current_password',
            'new_password_confirmation' => 'required|string|min:8',
        ];
    }

    public function messages(): array
    {
        return [
            'new_password.different' => 'The new password must be different from your current password.',
        ];
    }
}
