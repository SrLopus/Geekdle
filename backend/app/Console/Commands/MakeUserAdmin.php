<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email}';
    protected $description = 'Hace que un usuario sea administrador';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error('Usuario no encontrado');
            return 1;
        }

        $user->role = 'admin';
        $user->save();

        $this->info("El usuario {$user->name} ahora es administrador");
        return 0;
    }
} 