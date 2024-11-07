<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;


class StudentBookListResource extends BaseResource
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
            'author' => $this->author,
            'language' => $this->language,
            'category' => $this->category->name,
            'available' => $this->codes()->where('status', 'exist')->exists()
        ];
    }
}
