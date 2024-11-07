<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'language' => ['required', 'string', 'in:uz,ru,en,ja'],
            'category' => ['required', 'exists:book_categories,id'],
            'codes' => ['required', 'array', 'min:1', 'distinct', 'unique:book_codes,code'],
        ];
    }
}
