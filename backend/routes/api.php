<?php

use App\Http\Controllers\BookCategoryController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\RentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\LibrarianController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:librarian')->group(function () {
        Route::prefix('/book-categories')->controller(BookCategoryController::class)->group(function () {
            Route::get('/', 'index');
            Route::get('/list', 'list');
            Route::post('/', 'store');
            Route::get('/search', 'search');

            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });
        Route::prefix('/books')->controller(BookController::class)->group(function () {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/list', 'list');
            Route::get('/codes', 'codes');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::put('/{id}/code', 'updateCodes');
            Route::delete('/{id}', 'destroy');
        });
        Route::prefix('/users')->controller(UserController::class)->group(function () {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/list', 'studentList');
            Route::get('/{id}/student', 'studentShow');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });
        Route::prefix('/rents')->controller(RentController::class)->group(function () {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/pending', 'pending');
            Route::put('/{id}/accept', 'accept');
        });
        Route::prefix('/librarian')->controller(LibrarianController::class)->group(function() {
            Route::get('/dashboard', 'dashboard');
        });
    });

    Route::middleware('role:student')->group(function () {
        Route::prefix('/student')->controller(StudentController::class)->group(function () {
            Route::get('/rents', 'index');
            Route::get('/books', 'bookList');
            Route::get('/dashboard', 'dashboard');
            Route::put('/{id}/return', 'returnBook');
        });
    });
});


require __DIR__ . '/auth.php';
