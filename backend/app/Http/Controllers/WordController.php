<?php

namespace App\Http\Controllers;

use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use App\Models\Game;
use App\Models\User;
use App\Models\UserGameResult;
use App\Models\GameResult;
use App\Models\DailyWord;

class WordController extends Controller
{
    private $defaultWords = [
        'PYTHON', 'JAVA', 'RUBY', 'SWIFT', 'KOTLIN', 'RUST', 'GO', 'PHP', 'PERL', 'SCALA',
        'TYPESCRIPT', 'JAVASCRIPT', 'HTML', 'CSS', 'SQL', 'NOSQL', 'MONGODB', 'REDIS', 'NODE', 'REACT',
        'ANGULAR', 'VUE', 'SVELTE', 'NEXT', 'NEST', 'EXPRESS', 'DJANGO', 'FLASK', 'LARAVEL', 'SPRING',
        'DOCKER', 'KUBERNETES', 'AWS', 'AZURE', 'GCP', 'LINUX', 'GIT', 'SVN', 'JIRA', 'AGILE'
    ];

    private $categories = [
        'tecnologia',
        'programacion',
        'videojuegos',
        'anime',
        'manga',
        'comics',
        'peliculas',
        'series',
        'hardware',
        'internet'
    ];

    private $basePrompt = "Genera una palabra relacionada con {CATEGORIA} y 5 pistas para adivinarla. La palabra debe tener entre 4 y 8 letras y estar en español.";
    private $responseFormat = "\nIMPORTANTE: Responde EXACTAMENTE en este formato:\nPALABRA: [PALABRA]\nPISTA1: [pista 1]\nPISTA2: [pista 2]\nPISTA3: [pista 3]\nPISTA4: [pista 4]\nPISTA5: [pista 5]";

    private const DIFFICULTIES = [
        'básica' => [
            'minLength' => 4,
            'maxLength' => 5,
            'complexity' => 'básica',
            'description' => 'Usa términos comunes y ampliamente conocidos en el campo'
        ],
        'intermedia' => [
            'minLength' => 5,
            'maxLength' => 6,
            'complexity' => 'intermedia',
            'description' => 'Usa términos que requieran conocimiento básico del tema'
        ],
        'avanzada' => [
            'minLength' => 6,
            'maxLength' => 7,
            'complexity' => 'avanzada',
            'description' => 'Usa términos técnicos y especializados del campo'
        ],
        'experto' => [
            'minLength' => 7,
            'maxLength' => 8,
            'complexity' => 'experto',
            'description' => 'Usa términos altamente especializados y técnicos'
        ]
    ];

    private function getRandomDifficulty(): array
    {
        return self::DIFFICULTIES[array_rand(self::DIFFICULTIES)];
    }

    public function getWord(Request $request)
    {
        $mode = $request->query('mode', 'daily');
        $category = $request->query('category');
        $prompt = $request->query('prompt');
        
        // Verificar si el usuario ya ha jugado hoy en modo diario
        if ($mode === 'daily' && Auth::check()) {
            $user = Auth::user();
            $previousGame = GameResult::where('user_id', $user->id)
                ->where('mode', 'daily')
                ->where('category', $category)
                ->whereDate('created_at', Carbon::today())
                ->first();

            if ($previousGame) {
                return response()->json([
                    'has_played' => true,
                    'previous_game' => [
                        'word' => $previousGame->word,
                        'attempts' => $previousGame->attempts,
                        'is_win' => $previousGame->is_win,
                        'board_mapping' => $previousGame->board_mapping,
                        'time_taken' => $previousGame->time_taken
                    ],
                    'next_word_at' => Carbon::tomorrow()
                ]);
            }
        }
        
        if ($mode === 'infinite') {
            $excludeWords = $prompt ? json_decode($prompt, true)['excludeWords'] ?? [] : [];
            return $this->getInfiniteWord($category, $excludeWords);
        }
        
        return $this->getDailyWord($request);
    }

    public function getDailyWord(Request $request)
    {
        try {
            $category = $request->input('category', 'tecnologia');
            Log::info('Obteniendo palabra diaria para categoría:', ['category' => $category]);

            // Validar que la categoría sea válida
            if (!in_array($category, $this->categories)) {
                Log::warning('Categoría no válida:', ['category' => $category]);
                return response()->json([
                    'error' => 'Categoría no válida',
                    'message' => 'La categoría debe ser una de: ' . implode(', ', $this->categories)
                ], 400);
            }

            // Obtener la palabra del día actual
            $today = now()->startOfDay();
            Log::info('Buscando palabra para fecha:', [
                'date' => $today->toDateTimeString(),
                'date_formatted' => $today->format('Y-m-d'),
                'timestamp' => $today->timestamp,
                'timezone' => $today->timezone->getName()
            ]);
            
            $dailyWord = Word::where('category', $category)
                ->whereDate('created_at', $today)
                ->first();

            if ($dailyWord) {
                Log::info('Palabra diaria encontrada:', [
                    'word' => $dailyWord->word,
                    'category' => $dailyWord->category,
                    'next_word_at' => $dailyWord->next_word_at
                ]);
                return response()->json([
                    'word' => $dailyWord->word,
                    'hints' => $dailyWord->hints,
                    'next_word_at' => $dailyWord->next_word_at,
                    'difficulty' => $dailyWord->difficulty
                ]);
            }

            Log::info('No se encontró palabra diaria, generando nueva...');

            // Si no hay palabra para hoy, generar una nueva
            try {
                // Obtener todas las palabras ya utilizadas en modo diario
                $usedWords = Word::where('category', $category)
                    ->where('created_at', '>=', now()->subDays(30))
                    ->pluck('word')
                    ->toArray();
                
                Log::info('Palabras usadas recientemente:', ['used_words' => $usedWords]);

                // Preparar el prompt para Gemini
                $prompt = $this->buildPrompt($category);
                if (!empty($usedWords)) {
                    $prompt .= "\nIMPORTANTE: No uses estas palabras: " . implode(', ', $usedWords);
                }

                Log::info('Enviando petición a Gemini API...');
                // Hacer la petición a la API de Gemini
                $data = $this->prepareApiRequest($prompt);
                $result = $this->makeApiRequest($data);
                
                if ($result['httpCode'] !== 200) {
                    Log::error('Error en la API de Gemini:', [
                        'httpCode' => $result['httpCode'],
                        'response' => $result['response']
                    ]);
                    throw new \Exception('Error en la API de Gemini: ' . $result['response']);
                }
                
                $responseText = $this->parseApiResponse($result['response']);
                $wordAndHints = $this->extractWordAndHints($responseText);
                
                Log::info('Respuesta de Gemini procesada:', [
                    'word' => $wordAndHints['word'],
                    'hints_count' => count($wordAndHints['hints'])
                ]);

                if (!$wordAndHints) {
                    Log::error('No se pudo extraer la palabra y las pistas');
                    throw new \Exception('No se pudo extraer la palabra y las pistas');
                }

                // Verificar si la palabra ya fue usada
                if (in_array($wordAndHints['word'], $usedWords)) {
                    Log::warning('Palabra ya usada, intentando generar otra...', [
                        'word' => $wordAndHints['word']
                    ]);
                    // Si la palabra ya fue usada, intentar obtener otra
                    return $this->getDailyWord($request);
                }

                // Calcular la dificultad
                $difficulty = $this->calculateWordDifficulty($wordAndHints['word']);
                Log::info('Dificultad calculada:', ['difficulty' => $difficulty]);

                // Guardar la palabra en la base de datos
                $nextWordAt = now()->addDay()->startOfDay();
                $dailyWord = Word::create([
                    'word' => $wordAndHints['word'],
                    'category' => $category,
                    'hints' => $wordAndHints['hints'],
                    'next_word_at' => $nextWordAt,
                    'difficulty' => $difficulty
                ]);

                Log::info('Nueva palabra diaria guardada:', [
                    'word' => $dailyWord->word,
                    'category' => $dailyWord->category,
                    'next_word_at' => $dailyWord->next_word_at->format('Y-m-d H:i:s'),
                    'next_word_timestamp' => $dailyWord->next_word_at->timestamp
                ]);

                return response()->json([
                    'word' => $wordAndHints['word'],
                    'hints' => $wordAndHints['hints'],
                    'next_word_at' => $nextWordAt,
                    'difficulty' => $difficulty
                ]);

            } catch (\Exception $e) {
                Log::error('Error al generar palabra diaria:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw new \Exception('Error al generar la palabra del día: ' . $e->getMessage());
            }

        } catch (\Exception $e) {
            Log::error('Error en getDailyWord:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Error al obtener la palabra',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function buildPrompt($category, $difficulty = null)
    {
        $prompt = str_replace('{CATEGORIA}', $category, $this->basePrompt);
        
        // Añadir instrucciones de dificultad si se proporcionan
        if ($difficulty) {
            $prompt .= "\nIMPORTANTE - INSTRUCCIONES DE DIFICULTAD:";
            $prompt .= "\n1. La palabra DEBE tener entre {$difficulty['minLength']} y {$difficulty['maxLength']} letras.";
            $prompt .= "\n2. Nivel de dificultad: {$difficulty['complexity']}";
            $prompt .= "\n3. {$difficulty['description']}";
        }
        
        $prompt .= $this->responseFormat;
        return $prompt;
    }

    private function prepareApiRequest($prompt)
    {
        return [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 200,
                'topP' => 0.8,
                'topK' => 40
            ]
        ];
    }

    private function makeApiRequest($data)
    {
        $ch = curl_init();
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . config('services.gemini.api_key');
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            throw new \Exception('Error cURL: ' . curl_error($ch));
        }
        
        curl_close($ch);
        
        return [
            'response' => $response,
            'httpCode' => $httpCode
        ];
    }

    private function parseApiResponse($response)
    {
        $content = json_decode($response, true);
        
        if (!isset($content['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception('Formato de respuesta inválido de Gemini');
        }

        return $content['candidates'][0]['content']['parts'][0]['text'];
    }

    private function extractWordAndHints($text)
    {
        $word = '';
        $hints = [];
        
        $lines = explode("\n", $text);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            if (strpos($line, 'PALABRA:') === 0) {
                $word = trim(str_replace('PALABRA:', '', $line));
            } elseif (preg_match('/^PISTA\d+:/', $line)) {
                $hint = trim(substr($line, strpos($line, ':') + 1));
                if (!empty($hint)) {
                    $hints[] = $hint;
                }
            }
        }

        if (empty($word) || count($hints) < 3) {
            throw new \Exception('No se pudo extraer la palabra o las pistas de la respuesta');
        }

        // Asegurarse de que las pistas estén en el orden correcto
        sort($hints);

        // Asegurarse de que la palabra esté en mayúsculas
        $word = strtoupper($word);

        return [
            'word' => $word,
            'hints' => $hints
        ];
    }

    private function generateWordWithApi(string $category, array $difficulty, array $excludeWords = []): array
    {
        $prompt = $this->buildPrompt($category, $difficulty);

            if (!empty($excludeWords)) {
                $prompt .= "\nIMPORTANTE: No uses estas palabras: " . implode(', ', $excludeWords);
            }

            $data = $this->prepareApiRequest($prompt);
            $result = $this->makeApiRequest($data);
            
            if ($result['httpCode'] !== 200) {
                throw new \Exception('Error en la API de Gemini: ' . $result['response']);
            }
            
            $responseText = $this->parseApiResponse($result['response']);
        return $this->extractWordAndHints($responseText);
    }

    private function getDefaultWord(array $excludeWords = []): string
    {
        $availableWords = array_diff($this->defaultWords, array_map('strtoupper', $excludeWords));
        return empty($availableWords) 
            ? $this->defaultWords[array_rand($this->defaultWords)]
            : $availableWords[array_rand($availableWords)];
            }

    private function formatWordResponse(string $word, array $hints, string $category, array $difficulty, array $actualDifficulty, int $userLevel): array
    {
        return [
            'word' => $word,
                'next_word_at' => now(),
            'category' => $category,
            'hints' => $hints,
                'difficulty' => [
                    'level' => $userLevel,
                    'complexity' => $difficulty['complexity'],
                    'description' => $difficulty['description'],
                    'length' => [
                        'min' => $difficulty['minLength'],
                        'max' => $difficulty['maxLength']
                ],
                'actual' => $actualDifficulty
            ]
        ];
    }

    private function getInfiniteWord($category = null, $excludeWords = [])
    {
        try {
            $selectedCategory = $category ?? 'tecnologia';
            $user = Auth::user();
            $userLevel = $user ? $user->level : 1;
            $difficulty = $this->getRandomDifficulty();

            try {
                $wordAndHints = $this->generateWordWithApi($selectedCategory, $difficulty, $excludeWords);
                
                if (in_array(strtoupper($wordAndHints['word']), array_map('strtoupper', $excludeWords))) {
                    return $this->getInfiniteWord($category, $excludeWords);
                }

                $actualDifficulty = $this->calculateWordDifficulty($wordAndHints['word']);
                
                return response()->json(
                    $this->formatWordResponse(
                        $wordAndHints['word'],
                        $wordAndHints['hints'],
                        $selectedCategory,
                        $difficulty,
                        $actualDifficulty,
                        $userLevel
                    )
                );

            } catch (\Exception $e) {
                Log::error('Error al generar palabra con API: ' . $e->getMessage());
                
                $word = $this->getDefaultWord($excludeWords);
                $actualDifficulty = $this->calculateWordDifficulty($word);
                
                return response()->json(
                    $this->formatWordResponse(
                        $word,
                        [],
                        $selectedCategory,
                        $difficulty,
                        $actualDifficulty,
                        $userLevel
                    )
                );
            }

        } catch (\Exception $e) {
            Log::error('Error en getInfiniteWord: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener la palabra',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function checkWord(Request $request)
    {
        try {
            $request->validate([
                'word' => 'required|string'
            ]);

            $mode = $request->query('mode', 'daily');
            $category = $request->query('category', 'tecnologia');
            
            if ($mode === 'infinite') {
                // En modo infinito, la palabra se verifica contra la caché
                $cacheKey = "infinite_word_{$category}";
                $currentWord = Cache::get($cacheKey);
                if (!$currentWord) {
                    $response = $this->getInfiniteWord($category);
                    $currentWord = $response->getData()->word;
                    Cache::put($cacheKey, $currentWord, now()->addMinutes(5));
                }
            } else {
                // En modo diario, la palabra se verifica contra la base de datos
                $currentWord = Word::where('date', Carbon::today())
                    ->where('category', $category)
                    ->first();
                
                if (!$currentWord) {
                    return response()->json([
                        'error' => 'No hay palabra disponible'
                    ], 404);
                }
                $currentWord = $currentWord->word;
            }

            $isCorrect = strtoupper($request->word) === $currentWord;

            // Calcular puntos según el modo
            $pointsEarned = $isCorrect ? ($mode === 'daily' ? 50 : 10) : 0;

            // Actualizar progreso del usuario usando el UserController
            $userController = new UserController();
            $progressResponse = $userController->updateGameProgress(new Request([
                'mode' => $mode,
                'isCorrect' => $isCorrect
            ]));

            if ($progressResponse->getStatusCode() !== 200) {
                Log::error('Error al actualizar progreso: ' . json_encode($progressResponse->getData()));
                // Intentar obtener los datos del usuario actual
                $user = Auth::user();
                return response()->json([
                    'isCorrect' => $isCorrect,
                    'next_word_at' => $mode === 'infinite' ? now() : Carbon::tomorrow(),
                    'pointsEarned' => $pointsEarned,
                    'currentPoints' => $user ? $user->points : 0,
                    'currentLevel' => $user ? $user->level : 1
                ]);
            }

            $progressData = $progressResponse->getData();

            return response()->json([
                'isCorrect' => $isCorrect,
                'next_word_at' => $mode === 'infinite' ? now() : Carbon::tomorrow(),
                'pointsEarned' => $pointsEarned,
                'currentPoints' => $progressData->currentPoints,
                'currentLevel' => $progressData->currentLevel
            ]);
        } catch (\Exception $e) {
            Log::error('Error en checkWord: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al verificar la palabra',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProgress(Request $request)
    {
        try {
            Log::info('Recibiendo solicitud de actualización de progreso:', $request->all());

            $validated = $request->validate([
                'mode' => 'required|string|in:daily,infinite',
                'category' => 'required|string',
                'word' => 'required|string',
                'attempts' => 'required|integer',
                'time_taken' => 'required|integer',
                'isCorrect' => 'required|boolean',
                'board_mapping' => 'required|array'
            ]);

            Log::info('Datos validados:', $validated);

            if (!Auth::check()) {
                Log::warning('Intento de actualizar progreso sin autenticación');
                return response()->json(['message' => 'Usuario no autenticado'], 401);
            }

            $user = Auth::user();
            Log::info('Usuario autenticado:', ['user_id' => $user->id]);

            // Procesar el board_mapping para asegurar el formato correcto
            $processedBoardMapping = collect($validated['board_mapping'])->map(function ($attempt) {
                $letterStates = is_array($attempt['letterStates']) 
                    ? $attempt['letterStates'] 
                    : array_values((array)$attempt['letterStates']);
                
                return [
                    'guess' => $attempt['guess'],
                    'letterStates' => $letterStates
                ];
            })->toArray();

            // Guardar el resultado del juego
            $gameResult = GameResult::create([
                'user_id' => $user->id,
                'word' => $validated['word'],
                'category' => $validated['category'],
                'is_win' => $validated['isCorrect'] ? true : false,
                'attempts' => $validated['attempts'],
                'time_taken' => $validated['time_taken'],
                'board_mapping' => $processedBoardMapping,
                'mode' => $validated['mode']
            ]);

            Log::info('Resultado del juego guardado:', [
                'game_result_id' => $gameResult->id,
                'is_win' => $gameResult->is_win,
                'isCorrect' => $validated['isCorrect'],
                'attempts' => $validated['attempts']
            ]);

            // Actualizar puntos y nivel si el usuario ganó
            if ($validated['isCorrect']) {
                $pointsEarned = $validated['mode'] === 'daily' ? 50 : 10;
                $user->points += $pointsEarned;
                $user->level = floor($user->points / 100) + 1;
                
                try {
                    User::where('id', $user->id)->update([
                        'points' => $user->points,
                        'level' => $user->level
                    ]);
                    
                    Log::info('Usuario actualizado:', [
                        'user_id' => $user->id,
                        'new_points' => $user->points,
                        'new_level' => $user->level
                    ]);
                } catch (\Exception $e) {
                    Log::error('Error al actualizar usuario:', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            }

            return response()->json([
                'points_earned' => $validated['isCorrect'] ? ($validated['mode'] === 'daily' ? 50 : 10) : 0,
                'current_points' => $user->points,
                'current_level' => $user->level,
                'game_result' => $gameResult
            ]);
        } catch (\Exception $e) {
            Log::error('Error en updateProgress:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Error al actualizar el progreso'], 500);
        }
    }

    public function checkProgress(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            $mode = $request->query('mode', 'daily');
            $category = $request->query('category', 'tecnologia');
            $user = Auth::user();

            $previousGame = GameResult::where('user_id', $user->id)
                ->where('mode', $mode)
                ->where('category', $category)
                ->whereDate('created_at', Carbon::today())
                ->first();

            if ($previousGame) {
                return response()->json([
                    'has_played' => true,
                    'previous_game' => [
                        'word' => $previousGame->word,
                        'attempts' => $previousGame->attempts,
                        'is_win' => $previousGame->is_win,
                        'board_mapping' => $previousGame->board_mapping,
                        'time_taken' => $previousGame->time_taken
                    ]
                ]);
            }

            return response()->json([
                'has_played' => false
            ]);
        } catch (\Exception $e) {
            Log::error('Error en checkProgress: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al verificar el progreso',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function calculateWordDifficulty($word)
    {
        $length = strlen($word);
        $complexity = 'basic';
        $level = 1;

        // Determinar complejidad basada en la longitud
        if ($length <= 4) {
            $complexity = 'basic';
            $level = 1;
        } elseif ($length <= 6) {
            $complexity = 'intermediate';
            $level = 2;
        } elseif ($length <= 8) {
            $complexity = 'advanced';
            $level = 3;
        } else {
            $complexity = 'expert';
            $level = 4;
        }

        return [
            'complexity' => $complexity,
            'length' => [
                'min' => $length,
                'max' => $length
            ],
            'level' => $level
        ];
    }

    public function generateAllDailyWords()
    {
        try {
            $categories = $this->categories;
            $generatedWords = [];

            foreach ($categories as $category) {
                try {
                    // Obtener todas las palabras ya utilizadas en modo diario
                    $usedWords = Word::where('category', $category)
                        ->where('created_at', '>=', now()->subDays(30))
                        ->pluck('word')
                        ->toArray();

                    // Preparar el prompt para Gemini
                    $prompt = $this->buildPrompt($category);
                    if (!empty($usedWords)) {
                        $prompt .= "\nIMPORTANTE: No uses estas palabras: " . implode(', ', $usedWords);
                    }

                    // Hacer la petición a la API de Gemini
                    $data = $this->prepareApiRequest($prompt);
                    $result = $this->makeApiRequest($data);

                    if ($result['httpCode'] !== 200) {
                        throw new \Exception('Error en la API de Gemini: ' . $result['response']);
                    }

                    $responseText = $this->parseApiResponse($result['response']);
                    $wordAndHints = $this->extractWordAndHints($responseText);

                    if (!$wordAndHints) {
                        throw new \Exception('No se pudo extraer la palabra y las pistas');
                    }

                    // Verificar si la palabra ya fue usada
                    if (in_array($wordAndHints['word'], $usedWords)) {
                        continue;
                    }

                    // Calcular la dificultad
                    $difficulty = $this->calculateWordDifficulty($wordAndHints['word']);

                    // Guardar la palabra en la base de datos
                    $nextWordAt = now()->addDay()->startOfDay();
                    $dailyWord = Word::create([
                        'word' => $wordAndHints['word'],
                        'category' => $category,
                        'hints' => $wordAndHints['hints'],
                        'next_word_at' => $nextWordAt,
                        'difficulty' => $difficulty
                    ]);

                    $generatedWords[] = [
                        'category' => $category,
                        'word' => $wordAndHints['word'],
                        'next_word_at' => $nextWordAt
                    ];

                } catch (\Exception $e) {
                    Log::error("Error generando palabra para categoría {$category}: " . $e->getMessage());
                    continue;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Palabras diarias generadas correctamente',
                'generated_words' => $generatedWords
            ]);

        } catch (\Exception $e) {
            Log::error('Error generando palabras diarias: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al generar las palabras diarias',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 