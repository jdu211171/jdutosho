<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class BookCategoryResource extends BaseResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
        ];

        if ($this->relationLoaded('books')) {
            $data['books'] = BookResource::collection($this->books);
        }

        return $data;
    }
}
