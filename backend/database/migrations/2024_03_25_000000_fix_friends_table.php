<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('friends');

        Schema::create('friends', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('friend_id');
            $table->enum('status', ['pending', 'accepted'])->default('pending');
            $table->timestamps();

            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('friend_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            // Índices para mejorar el rendimiento
            $table->index(['user_id', 'friend_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friends');
    }
}; 