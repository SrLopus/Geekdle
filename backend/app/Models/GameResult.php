<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'word',
        'category',
        'is_win',
        'attempts',
        'time_taken',
        'board_mapping',
        'mode',
        'date'
    ];

    protected $casts = [
        'is_win' => 'boolean',
        'attempts' => 'integer',
        'time_taken' => 'integer',
        'board_mapping' => 'array',
        'date' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 