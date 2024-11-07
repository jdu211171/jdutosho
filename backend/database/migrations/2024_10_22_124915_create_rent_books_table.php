<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rent_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('taken_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('given_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->foreignId('book_code_id')->constrained('book_codes')->onDelete('cascade');
            $table->date('given_date');
            $table->date('return_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rent_books');
    }
};
