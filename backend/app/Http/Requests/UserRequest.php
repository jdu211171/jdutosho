<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'username' => 'required|string|max:255',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required|in:student,librarian,admin',
        ];

        if ($this->method() === 'POST') {
            $rules['email'] .= '|unique:users,email';
            $rules['password'] = 'required|string|min:8|confirmed';
        } elseif ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $userId = $this->route('user')->id;
            $rules['email'] .= '|unique:users,email,' . $userId;
            $rules['password'] = 'sometimes|string|min:8|confirmed';
        }

        return $rules;
    }

}
