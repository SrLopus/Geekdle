<?php

use Illuminate\Support\Facades\Route;

// Redirigir todas las rutas web a la API, excepto las que ya son de la API
Route::get('/{any}', function () {
    return response()->json(['message' => 'API de Geekdle funcionando']);
})->where('any', '^(?!api).*$'); 
