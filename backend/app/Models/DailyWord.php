<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyWord extends Model
{
    protected $fillable = [
        'word',
        'category',
        'hints',
        'next_word_at',
        'difficulty'
    ];

    protected $casts = [
        'hints' => 'array',
        'next_word_at' => 'datetime',
        'difficulty' => 'array'
    ];
} 