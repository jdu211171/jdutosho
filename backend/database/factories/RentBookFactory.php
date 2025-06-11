<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RentBook>
 */
class RentBookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'book_code_id' => \App\Models\BookCode::factory(),
            'taken_by' => \App\Models\User::factory(),
            'given_by' => \App\Models\User::factory(),
            'book_id' => \App\Models\Book::factory(),
            'given_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'return_date' => $this->faker->optional(0.3)->dateTimeBetween('now', '+30 days'),
        ];
    }
}
