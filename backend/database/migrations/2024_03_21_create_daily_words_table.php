<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('daily_words', function (Blueprint $table) {
            $table->id();
            $table->string('word');
            $table->string('category');
            $table->json('hints')->nullable();
            $table->timestamp('next_word_at');
            $table->json('difficulty')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('daily_words');
    }
}; 