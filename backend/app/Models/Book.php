<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $table = 'books';

    protected $fillable = [
        'name', 'author', 'language', 'category_id'
    ];

    public function category()
    {
        return $this->belongsTo(BookCategory::class, 'category_id');
    }

    public function codes()
    {
        return $this->hasMany(BookCode::class);
    }
}
