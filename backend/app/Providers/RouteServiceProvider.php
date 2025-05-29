<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            // Rutas API
            Route::middleware(['api', 'cors'])
                ->prefix('api')
                ->group(function () {
                    require base_path('routes/api.php');
                });

            // Rutas Web
            Route::middleware('web')
                ->group(function () {
                    require base_path('routes/web.php');
                });

            // Rutas de Sanctum
            Route::middleware(['web', 'cors'])
                ->prefix('api/sanctum')
                ->group(function () {
                    require base_path('vendor/laravel/sanctum/routes/sanctum.php');
                });
        });
    }
} 