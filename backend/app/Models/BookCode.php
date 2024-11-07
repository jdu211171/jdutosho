<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookCode extends Model
{
    protected $table = 'book_codes';
    protected $fillable = ['code', 'book_id', 'status'];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function rent()
    {
        return $this->hasOne(RentBook::class, 'book_code_id');
    }
}
