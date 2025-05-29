<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameResult;
use App\Models\User;
use App\Models\GameStat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    public function getDailyGame()
    {
        return response()->json(['message' => 'Juego diario']);
    }

    public function submitGuess(Request $request, Game $game)
    {
        return response()->json(['message' => 'Intento registrado']);
    }

    public function saveGameResult(Request $request)
    {
        try {
            $validated = $request->validate([
                'word' => 'required|string',
                'category' => 'required|string',
                'is_win' => 'required|boolean',
                'attempts' => 'required|integer|min:1',
                'time_taken' => 'required|integer|min:0',
                'board_mapping' => 'required|array',
                'mode' => 'required|string|in:daily,infinite'
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Crear el resultado del juego
            $gameResult = GameResult::create([
                'user_id' => $user->id,
                'word' => $validated['word'],
                'category' => $validated['category'],
                'is_win' => $validated['is_win'],
                'attempts' => $validated['attempts'],
                'time_taken' => $validated['time_taken'],
                'board_mapping' => $validated['board_mapping'],
                'mode' => $validated['mode']
            ]);

            // Obtener o crear las estadísticas del juego
            try {
                Log::info('Intentando crear/obtener estadísticas:', [
                    'user_id' => $user->id,
                    'mode' => $validated['mode']
                ]);

                $gameStat = GameStat::firstOrCreate(
                    ['user_id' => $user->id, 'mode' => $validated['mode']],
                    ['wins' => 0, 'best_streak' => 0, 'current_streak' => 0]
                );

                Log::info('Estadísticas obtenidas/creadas:', [
                    'game_stat_id' => $gameStat->id,
                    'wins' => $gameStat->wins,
                    'best_streak' => $gameStat->best_streak,
                    'current_streak' => $gameStat->current_streak
                ]);

                // Si el usuario ganó, actualizar sus puntos, nivel y estadísticas
            if ($validated['is_win']) {
                $pointsEarned = $validated['mode'] === 'daily' ? 50 : 10;
                $user->points += $pointsEarned;
                $user->level = floor($user->points / 100) + 1;
                
                try {
                    User::where('id', $user->id)->update([
                        'points' => $user->points,
                        'level' => $user->level
                    ]);

                        // Actualizar estadísticas de victoria
                    $gameStat->wins += 1;
                    $gameStat->current_streak += 1;
                    
                    // Actualizar mejor racha si es necesario
                    if ($gameStat->current_streak > $gameStat->best_streak) {
                        $gameStat->best_streak = $gameStat->current_streak;
                    }

                    $gameStat->save();
                    
                        Log::info('Estadísticas actualizadas después de victoria:', [
                            'game_stat_id' => $gameStat->id,
                            'new_wins' => $gameStat->wins,
                            'new_current_streak' => $gameStat->current_streak,
                            'new_best_streak' => $gameStat->best_streak
                    ]);
                } catch (\Exception $e) {
                        Log::error('Error al actualizar estadísticas después de victoria:', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            } else {
                // Si pierde, reiniciar la racha actual
                    $gameStat->current_streak = 0;
                    $gameStat->save();
                    
                    Log::info('Racha actual reiniciada después de derrota:', [
                        'game_stat_id' => $gameStat->id,
                        'new_current_streak' => $gameStat->current_streak
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error al manejar estadísticas del juego:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

            return response()->json([
                'message' => 'Resultado del juego guardado exitosamente',
                'game_result' => $gameResult,
                'points_earned' => $validated['is_win'] ? ($validated['mode'] === 'daily' ? 50 : 10) : 0,
                'current_points' => $user->points,
                'current_level' => $user->level
            ]);

        } catch (\Exception $e) {
            Log::error('Error al guardar resultado del juego: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al guardar el resultado del juego',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserStats()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener estadísticas de juego
            $dailyStats = GameStat::where('user_id', $user->id)
                ->where('mode', 'daily')
                ->first();

            $infiniteStats = GameStat::where('user_id', $user->id)
                ->where('mode', 'infinite')
                ->first();

            $stats = [
                'daily' => [
                    'wins' => $dailyStats ? $dailyStats->wins : 0,
                    'best_streak' => $dailyStats ? $dailyStats->best_streak : 0,
                    'current_streak' => $dailyStats ? $dailyStats->current_streak : 0
                ],
                'infinite' => [
                    'wins' => $infiniteStats ? $infiniteStats->wins : 0,
                    'best_streak' => $infiniteStats ? $infiniteStats->best_streak : 0,
                    'current_streak' => $infiniteStats ? $infiniteStats->current_streak : 0
                ],
                'total_games' => GameResult::where('user_id', $user->id)->count(),
                'win_rate' => 0,
                'average_attempts' => 0,
                'average_time' => 0,
                'best_time' => GameResult::where('user_id', $user->id)
                    ->where('is_win', true)
                    ->min('time_taken') ?? 0
            ];

            // Calcular win rate
            if ($stats['total_games'] > 0) {
                $stats['win_rate'] = round(
                    (($dailyStats ? $dailyStats->wins : 0) + ($infiniteStats ? $infiniteStats->wins : 0)) / 
                    $stats['total_games'] * 100, 
                    2
                );
            }

            // Calcular promedio de intentos
            $stats['average_attempts'] = round(
                GameResult::where('user_id', $user->id)
                    ->where('is_win', true)
                    ->avg('attempts') ?? 0,
                2
            );

            // Calcular tiempo promedio
            $stats['average_time'] = round(
                GameResult::where('user_id', $user->id)
                    ->where('is_win', true)
                    ->avg('time_taken') ?? 0,
                2
            );

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas del usuario: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener estadísticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getGameHistory()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            $history = GameResult::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($game) {
                    return [
                        'id' => $game->id,
                        'word' => $game->word,
                        'category' => $game->category,
                        'mode' => $game->mode,
                        'status' => $game->is_win ? 'won' : 'lost',
                        'attempts' => $game->attempts,
                        'date' => $game->created_at->toISOString(),
                        'time_taken' => $game->time_taken
                    ];
                });

            return response()->json($history);

        } catch (\Exception $e) {
            Log::error('Error al obtener historial de juegos: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener historial de juegos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene las estadísticas del juego para el usuario autenticado
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        try {
            $stats = GameResult::where('user_id', $user->id)
                ->selectRaw('
                    COUNT(*) as total_games,
                    SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) as total_wins,
                    SUM(CASE WHEN mode = "daily" AND is_win = 1 THEN 1 ELSE 0 END) as daily_wins,
                    SUM(CASE WHEN mode = "infinite" AND is_win = 1 THEN 1 ELSE 0 END) as infinite_wins,
                    AVG(CASE WHEN is_win = 1 THEN attempts ELSE NULL END) as avg_attempts_win,
                    AVG(CASE WHEN is_win = 1 THEN time_taken ELSE NULL END) as avg_time_win
                ')
                ->first();

            // Obtener las estadísticas de GameStat
            $dailyStats = GameStat::where('user_id', $user->id)
                ->where('mode', 'daily')
                ->first();

            $infiniteStats = GameStat::where('user_id', $user->id)
                ->where('mode', 'infinite')
                ->first();

            return response()->json([
                'stats' => array_merge($stats->toArray(), [
                    'best_daily_streak' => $dailyStats ? $dailyStats->best_streak : 0,
                    'best_infinite_streak' => $infiniteStats ? $infiniteStats->best_streak : 0,
                    'daily_current_streak' => $dailyStats ? $dailyStats->current_streak : 0,
                    'infinite_current_streak' => $infiniteStats ? $infiniteStats->current_streak : 0
                ]),
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'level' => $user->level,
                    'points' => $user->points,
                    'wins' => $user->wins,
                    'avatar_color' => $user->avatar_color
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener estadísticas: ' . $e->getMessage()], 500);
        }
    }
} 