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

        // Check if user needs to set password for the first time
        $isFirstTime = !$user->has_set_password;

        // For first-time users, current_password is not required
        if ($isFirstTime) {
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
