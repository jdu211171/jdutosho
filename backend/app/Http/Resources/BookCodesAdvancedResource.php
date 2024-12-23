<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookCodesAdvancedResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->book->id,
            'code' => $this->code,
            'status' => $this->status,
            'name' => $this->book->name,
            'author' => $this->book->author,
            'category' => $this->book->category->name,
            'language' => $this->book->language,
        ];
    }
}
