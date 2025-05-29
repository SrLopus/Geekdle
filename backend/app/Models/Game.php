<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category',
        'solution',
        'attempts',
        'date',
        'board_mapping'
    ];

    protected $casts = [
        'date' => 'datetime',
        'attempts' => 'integer',
        'board_mapping' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 