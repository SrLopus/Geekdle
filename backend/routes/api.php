<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\WordController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Ruta de prueba
Route::get('/', function () {
    return response()->json(['message' => 'API de Geekdle funcionando']);
});

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/word', [WordController::class, 'getWord']);
Route::get('/current-word', [WordController::class, 'getWord']);
Route::post('/word/check', [WordController::class, 'checkWord']);
Route::get('/users/top', [UserController::class, 'getTopPlayers']);
Route::post('/word/generate-daily', [WordController::class, 'generateAllDailyWords']);

// Rutas protegidas con Sanctum
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/avatar-color', [AuthController::class, 'updateAvatarColor']);
    Route::post('/word/update-progress', [WordController::class, 'updateProgress']);
    Route::get('/word/check-progress', [WordController::class, 'checkProgress']);

    // Juego
    Route::get('/games/daily', [GameController::class, 'getDailyGame']);
    Route::post('/games/{game}/guess', [GameController::class, 'submitGuess']);
    Route::post('/games/save-result', [GameController::class, 'saveGameResult']);
    Route::get('/games/stats', [GameController::class, 'getUserStats']);
    Route::get('/games/history', [GameController::class, 'getGameHistory']);

    // Amigos
    Route::get('/friends', [FriendController::class, 'index']);
    Route::get('/friends/search', [FriendController::class, 'search']);
    Route::post('/friends', [FriendController::class, 'store']);
    Route::post('/friends/accept', [FriendController::class, 'accept']);
    Route::delete('/friends/{friend}', [FriendController::class, 'destroy']);
    Route::get('/friends/ranking', [FriendController::class, 'getFriendsRanking']);

    // Rutas de juego
    Route::get('/game/stats', [GameController::class, 'getStats']);
    Route::post('/game/progress', [GameController::class, 'updateProgress']);
    Route::get('/game/progress', [GameController::class, 'checkProgress']);
});

// Rutas de administración
Route::middleware(['auth:sanctum', \App\Http\Middleware\CheckRole::class.':admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'index']);
    Route::get('/users/{user}', [AdminController::class, 'show']);
    Route::put('/users/{user}', [AdminController::class, 'update']);
    Route::delete('/users/{user}', [AdminController::class, 'destroy']);
    Route::put('/users/{user}/password', [AdminController::class, 'updatePassword']);
}); 