<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentBook extends Model
{
    protected $table = 'rent_books';
    protected $fillable = [
        'book_code_id',
        'taken_by',
        'given_by',
        'book_id',
        'book_code_id',
        'given_date',
        'return_date',
        'accepted_by'
    ];

    protected $casts = [
        'given_date' => 'date',
        'return_date' => 'date',
    ];


    public function takenBy()
    {
        return $this->belongsTo(User::class, 'taken_by');
    }

    public function givenBy()
    {
        return $this->belongsTo(User::class, 'given_by');
    }

    public function bookCode()
    {
        return $this->belongsTo(BookCode::class, 'book_code_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }
}
