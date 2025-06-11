<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BookCategoryController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\RentController;
use App\Http\Controllers\LibrarianController;
use App\Http\Controllers\StudentController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/profile', [AuthController::class, 'profile'])->middleware('auth:sanctum');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/redirect/{provider}', [AuthController::class, 'redirectToProvider']);
    Route::get('/oauth-url/{provider}', [AuthController::class, 'getOAuthUrl']);
    Route::get('/callback/{provider}', [AuthController::class, 'handleProviderCallback']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware('role:admin,librarian')->group(function () {
        Route::apiResource('users', UserController::class);
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
            Route::get('/available-codes', 'availableCodes');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::put('/{id}/code', 'updateCodes');
            Route::delete('/{id}', 'destroy');
        });
        Route::prefix('/users')->controller(UserController::class)->group(function () {
            Route::get('/', 'index'); // Now supports ?role=student&search=query filtering
            Route::post('/', 'store');
            Route::get('/{user}', 'show'); // Generic route for any user
            Route::put('/{user}', 'update');
            Route::delete('/{user}', 'destroy');
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
