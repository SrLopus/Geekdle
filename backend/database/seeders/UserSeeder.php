<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'username' => 'test',
            'email' => 'test@test.com',
            'password' => Hash::make('password123'),
            'level' => 1,
            'points' => 0
        ]);
    }
} 