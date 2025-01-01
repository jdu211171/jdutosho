<?php

namespace Database\Seeders;

use App\Models\User;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'loginID' => 'admin',
            'name' => 'Admin',
            'password' => 'admin',
            'role' => 'librarian',
        ]);
        /*
        User::create([
            'loginID' => 'student',
            'name' => 'Student',
            'password' => 'student',
            'role' => 'student',
        ]);
        */
    }
}
