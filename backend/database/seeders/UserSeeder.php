<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'username' => 'Admin',
            'full_name' => 'User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'has_set_password' => true,
        ]);

        User::factory()->create([
            'username' => 'Librarian',
            'full_name' => 'User',
            'email' => 'librarian@example.com',
            'password' => Hash::make('password'),
            'role' => 'librarian',
            'has_set_password' => true,
        ]);

        User::factory()->create([
            'username' => 'Teacher',
            'full_name' => 'User',
            'email' => 'teacher@example.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
            'has_set_password' => true,
        ]);

        User::factory()->create([
            'username' => 'Student',
            'full_name' => 'User',
            'email' => 'student@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'has_set_password' => true,
        ]);

        // Create a test Google user who needs to set password
        User::factory()->create([
            'username' => 'google_test123',
            'full_name' => 'Google Test User',
            'email' => 'google.test@jdu.uz',
            'password' => Hash::make('password'),
            'role' => 'student',
            'has_set_password' => false, // This user needs to set password
        ]);

        User::factory()->count(5)->librarian()->create();

        User::factory()->count(5)->teacher()->create();

        User::factory()->count(20)->student()->create();

        User::factory()->count(10)->admin()->create();
    }

    /**
     * Check if a column exists in a table
     */
    private function columnExists($table, $column)
    {
        return DB::connection()->getSchemaBuilder()->hasColumn($table, $column);
    }
}
