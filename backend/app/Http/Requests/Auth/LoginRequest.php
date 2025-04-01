<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Allow all users to attempt login
    }

    public function rules(): array
    {
        return [
            'username' => 'sometimes|required_without:email|string|max:255',
            'email' => 'sometimes|required_without:username|string|email|max:255',
            'password' => 'required|string',
        ];
    }
}

