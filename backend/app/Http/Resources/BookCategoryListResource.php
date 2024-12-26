<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class BookCategoryListResource extends BaseResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'book_count' => $this->books_count,
        ];
    }
}
