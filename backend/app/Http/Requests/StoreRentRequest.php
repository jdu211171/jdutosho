<?php

namespace App\Http\Requests;

class StoreRentRequest extends BaseRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'book_code_id' => ['required', 'exists:book_codes,id'],
            'taken_by' => ['required', 'exists:users,id'],
        ];
    }
}
