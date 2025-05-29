<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Lista de retos']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Reto creado']);
    }

    public function accept(Challenge $challenge)
    {
        return response()->json(['message' => 'Reto aceptado']);
    }
} 