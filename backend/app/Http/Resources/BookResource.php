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
            'category_id' => $this->category_id,
            'category' => $this->category->name,
            'has_pdf' => !is_null($this->pdf_path),
            'pdf_url' => $this->pdf_path ? asset('storage/' . $this->pdf_path) : null,
        ];

        if ($this->relationLoaded('codes')) {
            $data['codes'] = BookCodeResource::collection($this->codes);
        } else {
            $data['count'] = $this->codes()->count();
        }
        return $data;
    }
}
