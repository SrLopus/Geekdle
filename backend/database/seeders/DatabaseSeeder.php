<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Word;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuario administrador
        User::create([
            'username' => 'admin',
            'email' => 'admin@geekdle.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'level' => 1,
            'avatarColor' => '#10B981'
        ]);

        // Crear algunos usuarios de prueba
        User::create([
            'username' => 'usuario1',
            'email' => 'usuario1@geekdle.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'level' => 1,
            'avatarColor' => '#3B82F6'
        ]);

        User::create([
            'username' => 'usuario2',
            'email' => 'usuario2@geekdle.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'level' => 1,
            'avatarColor' => '#8B5CF6'
        ]);

        // Crear palabras de tecnología
        $words = [
            // Lenguajes de programación
            ['word' => 'javascript', 'category' => 'tecnologia', 'hints' => 'Lenguaje de programación web'],
            ['word' => 'python', 'category' => 'tecnologia', 'hints' => 'Lenguaje de programación interpretado'],
            ['word' => 'java', 'category' => 'tecnologia', 'hints' => 'Lenguaje orientado a objetos'],
            ['word' => 'php', 'category' => 'tecnologia', 'hints' => 'Lenguaje para desarrollo web'],
            ['word' => 'ruby', 'category' => 'tecnologia', 'hints' => 'Lenguaje dinámico y orientado a objetos'],
            
            // Frameworks
            ['word' => 'react', 'category' => 'tecnologia', 'hints' => 'Biblioteca JavaScript para interfaces'],
            ['word' => 'angular', 'category' => 'tecnologia', 'hints' => 'Framework de Google'],
            ['word' => 'vue', 'category' => 'tecnologia', 'hints' => 'Framework progresivo de JavaScript'],
            ['word' => 'laravel', 'category' => 'tecnologia', 'hints' => 'Framework PHP elegante'],
            ['word' => 'django', 'category' => 'tecnologia', 'hints' => 'Framework web de Python'],
            
            // Bases de datos
            ['word' => 'mysql', 'category' => 'tecnologia', 'hints' => 'Sistema de gestión de base de datos relacional'],
            ['word' => 'mongodb', 'category' => 'tecnologia', 'hints' => 'Base de datos NoSQL'],
            ['word' => 'postgresql', 'category' => 'tecnologia', 'hints' => 'Base de datos relacional avanzada'],
            ['word' => 'redis', 'category' => 'tecnologia', 'hints' => 'Base de datos en memoria'],
            ['word' => 'sqlite', 'category' => 'tecnologia', 'hints' => 'Base de datos ligera'],
            
            // Herramientas de desarrollo
            ['word' => 'docker', 'category' => 'tecnologia', 'hints' => 'Plataforma de contenedores'],
            ['word' => 'kubernetes', 'category' => 'tecnologia', 'hints' => 'Orquestador de contenedores'],
            ['word' => 'git', 'category' => 'tecnologia', 'hints' => 'Sistema de control de versiones'],
            ['word' => 'jenkins', 'category' => 'tecnologia', 'hints' => 'Herramienta de integración continua'],
            ['word' => 'vscode', 'category' => 'tecnologia', 'hints' => 'Editor de código de Microsoft']
        ];

        foreach ($words as $word) {
            Word::create([
                'word' => $word['word'],
                'category' => $word['category'],
                'hints' => $word['hints'],
                'next_word_at' => now()
            ]);
        }
    }
}
