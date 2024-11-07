<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login');

//Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
//    ->middleware('guest')
//    ->name('password.email');
//
//Route::post('/reset-password', [NewPasswordController::class, 'store'])
//    ->middleware('guest')
//    ->name('password.store');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->name('logout');

Route::post('/change-password', [AuthenticatedSessionController::class, 'changePassword'])
    ->middleware('auth:sanctum')
    ->name('change-password');
