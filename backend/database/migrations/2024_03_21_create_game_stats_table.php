<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('game_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('mode'); // 'daily' o 'infinite'
            $table->integer('wins')->default(0);
            $table->integer('best_streak')->default(0);
            $table->integer('current_streak')->default(0);
            $table->timestamps();

            // Índice compuesto para búsquedas rápidas
            $table->unique(['user_id', 'mode']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('game_stats');
    }
}; 