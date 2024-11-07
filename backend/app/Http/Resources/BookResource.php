<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class BookResource extends BaseResource
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
            'author' => $this->author,
            'language' => $this->language,
            'category' => $this->category->name,
        ];

        if ($this->relationLoaded('codes')) {
            $data['codes'] = BookCodeResource::collection($this->codes);
        } else {
            $data['count'] = $this->codes()->count();
        }
        return $data;
    }
}
