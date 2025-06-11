<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;
    
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
