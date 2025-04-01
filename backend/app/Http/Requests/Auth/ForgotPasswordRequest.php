<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Allow all users to request password reset
    }

    public function rules(): array
    {
        return [
            'email' => 'required|string|email|max:255|exists:users,email',
        ];
    }
}
