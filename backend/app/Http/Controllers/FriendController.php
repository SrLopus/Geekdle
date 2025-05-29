<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FriendController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            
            // Obtener amigos aceptados
            $friends = Friend::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('friend_id', $user->id);
            })
            ->where('status', 'accepted')
            ->with(['user', 'friend'])
            ->get()
            ->map(function($friend) use ($user) {
                $friendUser = $friend->user_id === $user->id ? $friend->friend : $friend->user;
                return [
                    'id' => $friendUser->id,
                    'username' => $friendUser->username,
                    'level' => $friendUser->level,
                    'avatarColor' => $friendUser->avatarColor,
                    'status' => $friend->status
                ];
            });

            // Obtener solicitudes pendientes recibidas
            $pendingRequests = Friend::where('friend_id', $user->id)
                ->where('status', 'pending')
                ->with('user')
                ->get()
                ->map(function($request) {
                    return [
                        'id' => $request->user->id,
                        'username' => $request->user->username,
                        'level' => $request->user->level,
                        'avatarColor' => $request->user->avatarColor,
                        'status' => $request->status
                    ];
                });

            // Obtener solicitudes pendientes enviadas
            $sentRequests = Friend::where('user_id', $user->id)
                ->where('status', 'pending')
                ->with('friend')
                ->get()
                ->map(function($request) {
                    return [
                        'id' => $request->friend->id,
                        'username' => $request->friend->username,
                        'level' => $request->friend->level,
                        'avatarColor' => $request->friend->avatarColor,
                        'status' => $request->status
                    ];
                });

            return response()->json([
                'friends' => $friends,
                'pending_requests' => $pendingRequests,
                'sent_requests' => $sentRequests
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener lista de amigos: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener la lista de amigos'], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            // Verificar autenticación
            if (!Auth::check()) {
                Log::error('Usuario no autenticado intentando buscar amigos');
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $query = $request->input('query');
            $user = Auth::user();

            if (empty($query)) {
                return response()->json(['users' => []]);
            }

            Log::info('Buscando usuarios', [
                'query' => $query,
                'user_id' => $user->id
            ]);

            // Buscar usuarios que coincidan con la consulta
            $users = User::where('username', 'like', "%{$query}%")
                ->where('id', '!=', $user->id)
                ->whereNotIn('id', function($q) use ($user) {
                    $q->select('friend_id')
                        ->from('friends')
                        ->where('user_id', $user->id)
                        ->where(function($subQuery) {
                            $subQuery->where('status', 'accepted')
                                    ->orWhere('status', 'pending');
                        });
                })
                ->whereNotIn('id', function($q) use ($user) {
                    $q->select('user_id')
                        ->from('friends')
                        ->where('friend_id', $user->id)
                        ->where(function($subQuery) {
                            $subQuery->where('status', 'accepted')
                                    ->orWhere('status', 'pending');
                        });
                })
                ->select('id', 'username', 'level', 'avatarColor')
                ->limit(10)
                ->get();

            Log::info('Resultados de búsqueda', [
                'count' => $users->count(),
                'user_id' => $user->id,
                'query' => $query,
                'users' => $users->toArray()
            ]);

            return response()->json(['users' => $users]);
        } catch (\Exception $e) {
            Log::error('Error al buscar usuarios: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json(['error' => 'Error al buscar usuarios'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Iniciando solicitud de amistad', [
                'user_id' => Auth::id(),
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            // Verificar autenticación
            if (!Auth::check()) {
                Log::error('Usuario no autenticado');
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $request->validate([
                'friend_id' => 'required|exists:users,id'
            ]);

            $user = Auth::user();
            $friendId = $request->friend_id;

            Log::info('Datos de la solicitud', [
                'user_id' => $user->id,
                'friend_id' => $friendId,
                'auth_check' => Auth::check()
            ]);

            // Verificar que no se está intentando agregar a sí mismo
            if ($user->id === $friendId) {
                Log::info('Intento de agregarse a sí mismo como amigo', [
                    'user_id' => $user->id
                ]);
                return response()->json([
                    'error' => 'No puedes agregarte a ti mismo como amigo'
                ], 400);
            }

            // Verificar que no exista ya una solicitud o amistad
            $existingFriend = Friend::where(function($query) use ($user, $friendId) {
                $query->where('user_id', $user->id)
                      ->where('friend_id', $friendId)
                      ->orWhere('user_id', $friendId)
                      ->where('friend_id', $user->id);
            })->first();

            if ($existingFriend) {
                Log::info('Ya existe una solicitud o amistad', [
                    'existing_friend' => $existingFriend
                ]);
                return response()->json([
                    'error' => 'Ya existe una solicitud de amistad o ya son amigos'
                ], 400);
            }

            try {
                // Crear la solicitud de amistad
                $friend = Friend::create([
                    'user_id' => $user->id,
                    'friend_id' => $friendId,
                    'status' => 'pending'
                ]);

                Log::info('Solicitud de amistad creada exitosamente', [
                    'friend' => $friend
                ]);

                return response()->json([
                    'message' => 'Solicitud de amistad enviada',
                    'friend' => $friend
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                Log::error('Error de base de datos al crear solicitud de amistad: ' . $e->getMessage(), [
                    'sql' => $e->getSql(),
                    'bindings' => $e->getBindings(),
                    'code' => $e->getCode()
                ]);
                return response()->json(['error' => 'Error al crear la solicitud de amistad en la base de datos'], 500);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación al enviar solicitud de amistad: ' . $e->getMessage());
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error al enviar solicitud de amistad: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);
            return response()->json(['error' => 'Error al enviar la solicitud de amistad: ' . $e->getMessage()], 500);
        }
    }

    public function accept(Request $request)
    {
        try {
            $request->validate([
                'friend_id' => 'required|exists:users,id'
            ]);

            $user = Auth::user();
            $friendId = $request->friend_id;

            // Buscar la solicitud pendiente
            $friendRequest = Friend::where('user_id', $friendId)
                ->where('friend_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if (!$friendRequest) {
                return response()->json([
                    'error' => 'No se encontró la solicitud de amistad'
                ], 404);
            }

            // Actualizar el estado de la solicitud
            $friendRequest->update(['status' => 'accepted']);

            // Obtener los datos actualizados
            $friendRequest->load(['user', 'friend']);

            return response()->json([
                'message' => 'Solicitud de amistad aceptada',
                'friend' => [
                    'id' => $friendRequest->user->id,
                    'username' => $friendRequest->user->username,
                    'level' => $friendRequest->user->level,
                    'avatarColor' => $friendRequest->user->avatarColor,
                    'status' => 'accepted'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al aceptar solicitud de amistad: ' . $e->getMessage());
            return response()->json(['error' => 'Error al aceptar la solicitud de amistad'], 500);
        }
    }

    public function destroy($friendId)
    {
        try {
            $user = Auth::user();

            // Buscar la amistad
            $friend = Friend::where(function($query) use ($user, $friendId) {
                $query->where('user_id', $user->id)
                      ->where('friend_id', $friendId)
                      ->orWhere('user_id', $friendId)
                      ->where('friend_id', $user->id);
            })->first();

            if (!$friend) {
                return response()->json([
                    'error' => 'No se encontró la amistad'
                ], 404);
            }

            $friend->delete();

            return response()->json([
                'message' => 'Amistad eliminada correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar amistad: ' . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar la amistad'], 500);
        }
    }

    public function getFriendsRanking()
    {
        try {
            $user = Auth::user();
            
            // Obtener IDs de amigos
            $friendIds = Friend::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('friend_id', $user->id);
            })
            ->where('status', 'accepted')
            ->get()
            ->map(function($friend) use ($user) {
                return $friend->user_id === $user->id ? $friend->friend_id : $friend->user_id;
            });

            // Agregar el ID del usuario actual
            $friendIds->push($user->id);

            // Obtener el ranking de amigos
            $ranking = User::whereIn('id', $friendIds)
                ->select('id', 'username', 'level', 'points', 'avatarColor')
                ->orderBy('points', 'desc')
                ->get()
                ->map(function($user, $index) {
                    return [
                        'id' => $user->id,
                        'username' => $user->username,
                        'level' => $user->level,
                        'points' => $user->points,
                        'avatarColor' => $user->avatarColor,
                        'rank' => $index + 1
                    ];
                });

            return response()->json($ranking);
        } catch (\Exception $e) {
            Log::error('Error al obtener ranking de amigos: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener el ranking de amigos'], 500);
        }
    }
} 