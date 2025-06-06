<?php

namespace App\Http\Requests;

class StoreUserRequest extends BaseRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'loginID' => ['required', 'string', 'max:255', 'unique:users,loginID'],
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', 'in:librarian,student'],
        ];
    }
}
