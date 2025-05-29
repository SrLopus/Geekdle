<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('word');
            $table->string('category');
            $table->boolean('is_win');
            $table->integer('attempts');
            $table->integer('time_taken');
            $table->json('board_mapping');
            $table->string('mode'); // 'daily' o 'infinite'
            $table->date('date')->nullable(); // Fecha de creación de la palabra diaria
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_results');
    }
}; 