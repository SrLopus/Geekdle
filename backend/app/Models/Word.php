<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Word extends Model
{
    protected $fillable = [
        'word',
        'category',
        'hints',
        'next_word_at'
    ];

    protected $casts = [
        'hints' => 'array',
        'next_word_at' => 'datetime'
    ];
} 