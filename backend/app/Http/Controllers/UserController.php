<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Actualiza los puntos y nivel del usuario basado en el resultado del juego
     */
    public function updateGameProgress(Request $request)
    {
        try {
            $request->validate([
                'mode' => 'required|string|in:daily,infinite',
                'isCorrect' => 'required|boolean'
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            if (!$request->isCorrect) {
                return response()->json([
                    'pointsEarned' => 0,
                    'currentPoints' => $user->points,
                    'currentLevel' => $user->level
                ]);
            }

            // Calcular puntos según el modo
            $pointsEarned = $request->mode === 'daily' ? 50 : 10;
            
            // Actualizar puntos del usuario
            $user->points = $user->points + $pointsEarned;
            
            // Calcular nuevo nivel (1 nivel por cada 100 puntos, empezando desde 0)
            $newLevel = floor($user->points / 100) + 1;
            
            // Asegurarse de que el nivel nunca sea menor que 1
            $newLevel = max(1, $newLevel);
            
            // Calcular el progreso dentro del nivel actual
            $pointsInCurrentLevel = $user->points % 100;
            $progressToNextLevel = ($pointsInCurrentLevel / 100) * 100;
            
            $user->level = $newLevel;
            
            try {
                $user->save();
                Log::info('Puntos actualizados correctamente', [
                    'user_id' => $user->id,
                    'points_earned' => $pointsEarned,
                    'total_points' => $user->points,
                    'new_level' => $user->level
                ]);
            } catch (\Exception $e) {
                Log::error('Error al guardar usuario: ' . $e->getMessage());
                return response()->json([
                    'error' => 'Error al guardar los puntos',
                    'message' => $e->getMessage()
                ], 500);
            }

            return response()->json([
                'pointsEarned' => $pointsEarned,
                'currentPoints' => $user->points,
                'currentLevel' => $user->level
            ]);
        } catch (\Exception $e) {
            Log::error('Error en updateGameProgress: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al actualizar el progreso del juego',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getTopPlayers()
    {
        try {
            $topPlayers = User::select('id', 'username', 'points', 'level')
                ->orderBy('points', 'desc')
                ->take(100)
                ->get();

            return response()->json($topPlayers);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener el ranking',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Validar los datos de entrada
            $validated = $request->validate([
                'username' => 'sometimes|required|string|max:255|unique:users,username,' . $id,
                'email' => 'sometimes|required|email|max:255|unique:users,email,' . $id,
                'level' => 'sometimes|required|integer|min:1',
                'points' => 'sometimes|required|integer|min:0',
                'is_admin' => 'sometimes|required|boolean'
            ]);

            // Si se está actualizando el nivel desde el panel de admin
            if (isset($validated['level'])) {
                // Calcular los puntos equivalentes al nivel (100 puntos por nivel)
                $validated['points'] = ($validated['level'] - 1) * 100;
            }

            $user->update($validated);
            
            return response()->json([
                'message' => 'Usuario actualizado correctamente',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 