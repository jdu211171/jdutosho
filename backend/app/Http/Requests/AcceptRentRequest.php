<?php

namespace App\Http\Requests;

class AcceptRentRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'book_code' => 'required|string|exists:book_codes,code',
            'login_id' => 'required|string|exists:users,loginID',
        ];
    }
}
