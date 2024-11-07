<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;

class RentResource extends BaseResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        $givenDate = Carbon::parse($this->given_date)->format('Y-m-d');
        $today = Carbon::now()->format('Y-m-d');

        $data = [
            'id' => $this->id,
            'book_code' => $this->bookCode->code,
            'status'=>$this->bookCode->status,
            'book' => $this->book->name,
            'taken_by' => $this->takenBy->name,
            'given_by' => $this->givenBy->name,
            'given_date' => $givenDate,
        ];

        if ($this->return_date) {
            $returnDate = Carbon::parse($this->return_date)->format('Y-m-d');
            $data['return_date'] = $returnDate;
            $data['passed_days'] = Carbon::parse($givenDate)->diffInDays($returnDate);
        } else {
            $data['passed_days'] = Carbon::parse($givenDate)->diffInDays($today);
        }

        return $data;
    }
}
