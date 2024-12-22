<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'loginID' => ['required', 'string', 'max:255', 'unique:users,loginID,' . $this->route('id')],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'in:librarian,student'],
            'password' => ['nullable', 'string', 'min:6'],
        ];
    }
}
