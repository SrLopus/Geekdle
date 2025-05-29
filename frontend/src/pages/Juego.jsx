import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGameMode } from '../context/GameModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import AnimatedBackground from '../components/AnimatedBackground';
import { getDailyWord, updateProgress, checkPlayerProgress, generateDailyWords } from '../services/wordService';
import { rankingService } from '../services/rankingService';
import LevelUpAnimation from '../components/LevelUpAnimation';
import Ranking from '../components/Ranking';
import CategorySidebar from '../components/CategorySidebar';
import { useCategory } from '../context/CategoryContext';
import AuthPopup from '../components/AuthPopup';
import axios from 'axios';

const MAX_ATTEMPTS = 6;

const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

// Función para quitar acentos
const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const letterStates = {
    correct: 'bg-green-600',
    present: 'bg-yellow-500',
    absent: 'bg-gray-900',
    unused: 'bg-gray-600'
};

const keyColors = {
    correct: 'bg-green-600 hover:bg-green-700',
    present: 'bg-yellow-500 hover:bg-yellow-600',
    absent: 'bg-gray-900 hover:bg-gray-950',
    unused: 'bg-gray-600 hover:bg-gray-700'
};

export default function Juego() {
    const [word, setWord] = useState('');
    const [wordLength, setWordLength] = useState(5);
    const [nextWordAt, setNextWordAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    const [keyStates, setKeyStates] = useState({});
    const [feedback, setFeedback] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [activeKey, setActiveKey] = useState(null);
    const [shakeRow, setShakeRow] = useState(null);
    const [revealRow, setRevealRow] = useState(null);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isWordReady, setIsWordReady] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [gameStartTime, setGameStartTime] = useState(Date.now());
    const [isModeChangeBlocked, setIsModeChangeBlocked] = useState(true);
    const [hints, setHints] = useState([]);
    const [showHints, setShowHints] = useState(false);
    const [playedWords, setPlayedWords] = useState(new Set());
    const initialLoadDone = useRef(false);
    const { gameMode } = useGameMode();
    const navigate = useNavigate();
    const { isAuthenticated, user, updateUser } = useAuth();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpPoints, setLevelUpPoints] = useState(0);
    const { selectedCategory, setSelectedCategory, getCategoryStyle } = useCategory();
    const categoryStyle = getCategoryStyle(selectedCategory);
    const categoryNames = {
        tecnologia: 'TECNOLOGÍA',
        programacion: 'PROGRAMACIÓN',
        videojuegos: 'VIDEOJUEGOS',
        anime: 'ANIME',
        manga: 'MANGA',
        comics: 'CÓMICS',
        peliculas: 'PELÍCULAS',
        series: 'SERIES',
        hardware: 'HARDWARE',
        internet: 'INTERNET'
    };
    const [isCalculatingTime, setIsCalculatingTime] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [topUsers, setTopUsers] = useState([]);

    // Efecto para resetear el juego cuando cambia la categoría o el modo
    useEffect(() => {
        if (isModeChangeBlocked) {
            return;
        }

        const resetGame = () => {
            setGuesses([]);
            setCurrentGuess('');
            setGameOver(false);
            setGameResult(null);
            setKeyStates({});
            setScore(0);
            setIsWordReady(false);
            setIsInitialLoad(true);
            initialLoadDone.current = false;
            setShowLevelUp(false);
            setLevelUpPoints(0);
            setGameStartTime(Date.now());
            setNextWordAt(null);
            setTimeLeft('');
            setShowToast(false);
            setFeedback('');
        };

        resetGame();
        // Forzar una nueva carga de palabra
        initialLoadDone.current = false;
        fetchWord();
    }, [selectedCategory, gameMode, isModeChangeBlocked]);

    // Efecto para desbloquear el cambio de modo después de 1.5 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsModeChangeBlocked(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Obtener la palabra del día o una nueva palabra para modo infinito
    useEffect(() => {
        let isMounted = true;
        let timeoutId = null;
        
        const loadWord = async () => {
            if (isMounted && !isLoading && !initialLoadDone.current) {
                try {
                    initialLoadDone.current = true;
                    setIsLoading(true);
                    setIsWordReady(false);
                    setIsTransitioning(true);
                    setTimeLeft('');

                    const data = await getDailyWord(gameMode, selectedCategory);
                    
                    if (!isMounted) {
                        return;
                    }

                    if (!data || !data.word) {
                        throw new Error('No se recibió palabra del servidor');
                    }

                    const wordWithoutAccents = removeAccents(data.word);
                    
                    setWord(wordWithoutAccents);
                    setWordLength(wordWithoutAccents.length);
                    setHints(data.hints || []);
                        
                    // Asegurarse de que nextWordAt sea una fecha válida
                    const nextWordDate = new Date(data.next_word_at);
                    if (isNaN(nextWordDate.getTime())) {
                        // Si es modo diario, establecer para mañana a medianoche
                        if (gameMode === 'daily') {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(0, 0, 0, 0);
                            setNextWordAt(tomorrow);
                        } else {
                            // Si es modo infinito, establecer para 5 minutos después
                            const fiveMinutesLater = new Date();
                            fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
                            setNextWordAt(fiveMinutesLater);
                        }
                    } else {
                        // Usar el next_word_at del backend
                        setNextWordAt(nextWordDate);
                    }
                        
                    // Solo resetear el juego si no hay un juego en curso
                    if (!gameOver) {
                        setGuesses([]);
                        setCurrentGuess('');
                        setGameOver(false);
                        setGameResult(null);
                        setKeyStates({});
                    }
                    
                    setIsWordReady(true);
                    setIsInitialLoad(false);
                    setIsTransitioning(false);
                
                } catch (error) {
                    if (isMounted) {
                        initialLoadDone.current = false;
                        setFeedback('Error al cargar la palabra. Inténtalo de nuevo.');
                        setShowToast(true);
                    }
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            }
        };

        // Limpiar cualquier timeout pendiente
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Pequeño delay para evitar múltiples llamadas simultáneas
        timeoutId = setTimeout(() => {
            loadWord();
        }, 100);

        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    const fetchWord = useCallback(async () => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            setIsWordReady(false);
            setIsTransitioning(true);
            setTimeLeft('');

            // Solo verificar progreso en modo diario
            if (isAuthenticated && gameMode === 'daily') {
                try {
                    const progressResponse = await checkPlayerProgress(gameMode, selectedCategory);
                    if (progressResponse.has_played && progressResponse.previous_game) {
                        // Si ya jugó, restauramos el estado anterior
                        const previousGame = progressResponse.previous_game;
                        const wordWithoutAccents = removeAccents(previousGame.word);
                        
                        setWord(wordWithoutAccents);
                        setWordLength(wordWithoutAccents.length);
                        setHints(previousGame.hints || []);
                        
                        // Procesar el mapeo del tablero
                        const boardMapping = previousGame.board_mapping;
                        
                        // Convertir el mapeo en intentos para el tablero
                        const processedAttempts = boardMapping.map(attempt => attempt.guess);
                        
                        // Establecer los intentos en el estado
                        setGuesses(processedAttempts);
                        
                        // Procesar los estados de las teclas
                        const newKeyStates = {};
                        boardMapping.forEach(attempt => {
                            const guess = attempt.guess;
                            const letterStates = attempt.letterStates;
                            
                            // Asegurarnos de que letterStates sea un array
                            const states = Array.isArray(letterStates) ? letterStates : Object.values(letterStates);
                            
                            states.forEach((state, index) => {
                                const letter = guess[index];
                                if (state === 'correct' || 
                                    (state === 'present' && newKeyStates[letter] !== 'correct') ||
                                    (state === 'absent' && !newKeyStates[letter])) {
                                    newKeyStates[letter] = state;
                                }
                            });
                        });
                        
                        setKeyStates(newKeyStates);
                        setGameOver(true);
                        setGameResult(previousGame.is_win ? 'success' : 'error');
                        
                        // Configurar el tiempo para la siguiente palabra
                        const nextWordDate = new Date();
                        nextWordDate.setDate(nextWordDate.getDate() + 1);
                        nextWordDate.setHours(0, 0, 0, 0);
                        setNextWordAt(nextWordDate);
                        
                        // Asegurarnos de que el juego esté en estado final
                        setIsWordReady(true);
                        setIsInitialLoad(false);
                        setIsTransitioning(false);
                        
                        // Mostrar el resultado
                        const resultMessage = previousGame.is_win 
                            ? `¡Has ganado!\nPalabra: ${wordWithoutAccents.toUpperCase()}`
                            : `¡Has perdido!\nLa palabra era: ${wordWithoutAccents.toUpperCase()}`;
                        setFeedback(resultMessage);
                        setGameResult(previousGame.is_win ? 'success' : 'error');
                        setShowToast(true);
                        
                        return;
                    }
                } catch (error) {
                    console.error('Error al verificar progreso:', error);
                }
            }

            // Obtener nueva palabra
            let response;
            let wordWithoutAccents;
            let attempts = 0;
            const maxAttempts = 5; // Máximo número de intentos para obtener una palabra no repetida

            do {
                // En modo infinito, pasar las palabras jugadas como parte del prompt
                const prompt = gameMode === 'infinite' ? {
                    excludeWords: Array.from(playedWords),
                    category: selectedCategory
                } : null;

                response = await getDailyWord(gameMode, selectedCategory, prompt);
                if (response.word) {
                    wordWithoutAccents = removeAccents(response.word);
                    attempts++;
                }
            } while (gameMode === 'infinite' && 
                     playedWords.has(wordWithoutAccents) && 
                     attempts < maxAttempts);

            if (response.word) {
                setWord(wordWithoutAccents);
                setWordLength(wordWithoutAccents.length);
                setHints(response.hints || []);
                
                // Configurar el tiempo para la siguiente palabra
                if (response.next_word_at) {
                    const nextWordDate = new Date(response.next_word_at);
                    if (!isNaN(nextWordDate.getTime())) {
                        setNextWordAt(nextWordDate);
                    } else {
                        // Fallback: 5 minutos si la fecha es inválida
                        const fiveMinutesLater = new Date();
                        fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
                        setNextWordAt(fiveMinutesLater);
                    }
                } else {
                    // Fallback: 5 minutos si no hay next_word_at
                    const fiveMinutesLater = new Date();
                    fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
                    setNextWordAt(fiveMinutesLater);
                }
                
                // Resetear el juego
                setGuesses([]);
                setCurrentGuess('');
                setGameOver(false);
                setGameResult(null);
                setKeyStates({});
                setIsWordReady(true);
                setIsInitialLoad(false);
                setIsTransitioning(false);
            }
        } catch (error) {
            console.error('Error al obtener la palabra:', error);
            setFeedback('Error al cargar la palabra');
            setShowToast(true);
            setIsTransitioning(false);
        } finally {
            setIsLoading(false);
        }
    }, [gameMode, selectedCategory, isLoading, isAuthenticated, playedWords]);

    // Actualizar el contador
    useEffect(() => {
        // Siempre establecer para mañana a las 00:00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        setNextWordAt(tomorrow);

        let isUpdating = false;
        let lastUpdate = Date.now();

        const updateTimer = async () => {
            if (isUpdating) return;
            const now = Date.now();
            if (now - lastUpdate < 100) return;
            
            isUpdating = true;
            setIsCalculatingTime(true);
            
            try {
                const currentTime = new Date();
                const targetTime = new Date(tomorrow);
                
                if (isNaN(currentTime.getTime()) || isNaN(targetTime.getTime())) {
                    setTimeLeft('Error en el cálculo');
                    return;
                }

                const diff = targetTime - currentTime;

                if (isNaN(diff)) {
                    setTimeLeft('Error en el cálculo');
                    return;
                }

                if (diff <= 0) {
                    setTimeLeft('¡Nueva palabra disponible!');
                    if (gameMode === 'daily') {
                        try {
                            // Generar todas las palabras diarias
                            await generateDailyWords();
                            // Obtener la nueva palabra para la categoría actual
                            await fetchWord();
                        } catch (error) {
                            console.error('Error al generar palabras diarias:', error);
                            setTimeLeft('Error al generar palabras');
                        }
                    }
                    return;
                }

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                if (hours < 0 || minutes < 0 || seconds < 0) {
                    setTimeLeft('Error en el cálculo');
                    return;
                }

                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                setTimeLeft(timeString);
                lastUpdate = now;
            } catch (error) {
                setTimeLeft('Error en el cálculo');
            } finally {
                isUpdating = false;
                setIsCalculatingTime(false);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 100);

        return () => {
            clearInterval(timer);
            isUpdating = false;
            setIsCalculatingTime(false);
            setTimeLeft('');
        };
    }, [gameMode, fetchWord]);

    // Detectar teclas físicas
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            setActiveKey(key);
            
            if (gameOver || isTransitioning || isAnimating) return;

            if (key === 'ENTER') {
                if (currentGuess.length === wordLength) {
                    setIsAnimating(true);
                    setRevealRow(guesses.length);
                    submitGuess();
                    // Esperar a que termine la animación de revelación
                    setTimeout(() => {
                        setIsAnimating(false);
                    }, 1000);
                } else {
                    setIsAnimating(true);
                    setShakeRow(guesses.length);
                    setGameResult('warning');
                    setFeedback(`Necesitas ${wordLength - currentGuess.length} letra${wordLength - currentGuess.length !== 1 ? 's' : ''} más`);
                    setShowToast(true);
                    setTimeout(() => {
                        setShowToast(false);
                        setFeedback('');
                        setGameResult(null);
                        setShakeRow(null);
                        setIsAnimating(false);
                    }, 1000);
                }
            } else if (key === 'BACKSPACE') {
                setCurrentGuess(prev => prev.slice(0, -1));
            } else if (/^[A-ZÑ]$/.test(key) && currentGuess.length < wordLength) {
                setCurrentGuess(prev => prev + key);
            }
        };

        const handleKeyUp = () => {
            setActiveKey(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [currentGuess, gameOver, wordLength, isTransitioning, isAnimating]);

    const getLetterState = (letter, index, rowIndex) => {
        if (!guesses[rowIndex]) return letterStates.unused;
        const states = calculateLetterStates(guesses[rowIndex], word);
        return letterStates[states[index]] || letterStates.unused;
    };

    const getKeyState = (key) => {
        if (!guesses.length) return 'unused';
        
        let bestState = 'unused';
        
        guesses.forEach(guess => {
            const states = calculateLetterStates(guess, word);
            for (let i = 0; i < guess.length; i++) {
                if (guess[i] === key) {
                    const state = states[i];
                    if (state === 'correct' || 
                        (state === 'present' && bestState !== 'correct') ||
                        (state === 'absent' && bestState === 'unused')) {
                        bestState = state;
                    }
                }
            }
        });
        
        return bestState;
    };

    const handleKeyPress = (key) => {
        if (gameOver || isTransitioning || isAnimating) return;
        
        // Verificar si ya se ha jugado en modo diario
        if (gameMode === 'daily' && gameOver) {
            setFeedback('Ya has jugado la palabra de hoy');
            setGameResult('warning');
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setFeedback('');
                setGameResult(null);
            }, 2000);
            return;
        }

        // Efecto visual de pulsación
        setActiveKey(key);
        setTimeout(() => setActiveKey(null), 100);

        if (key === 'ENTER') {
            if (currentGuess.length === wordLength) {
                setIsAnimating(true);
                setRevealRow(guesses.length);
                submitGuess();
                // Esperar a que termine la animación de revelación
                setTimeout(() => {
                    setIsAnimating(false);
                }, 1000);
            } else {
                setIsAnimating(true);
                setShakeRow(guesses.length);
                setGameResult('warning');
                setFeedback(`Necesitas ${wordLength - currentGuess.length} letra${wordLength - currentGuess.length !== 1 ? 's' : ''} más`);
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    setFeedback('');
                    setGameResult(null);
                    setShakeRow(null);
                    setIsAnimating(false);
                }, 1000);
            }
        } else if (key === '⌫') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < wordLength) {
            setCurrentGuess(prev => prev + key);
        }
    };

            // Función auxiliar para calcular estados de letras
            const calculateLetterStates = (guess, targetWord) => {
                const letterStates = {};
                const letterCounts = {};
                
                // Contar ocurrencias de letras en la palabra objetivo
                for (let i = 0; i < targetWord.length; i++) {
                    const letter = targetWord[i];
                    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
                }

                // Primera pasada: marcar letras correctas
                for (let i = 0; i < guess.length; i++) {
                    const letter = guess[i];
                    if (letter === targetWord[i]) {
                        letterStates[i] = 'correct';
                        letterCounts[letter]--;
                    }
                }

                // Segunda pasada: marcar letras presentes
                for (let i = 0; i < guess.length; i++) {
                    const letter = guess[i];
                    if (letter !== targetWord[i] && letterCounts[letter] > 0) {
                        letterStates[i] = 'present';
                        letterCounts[letter]--;
                    } else if (letter !== targetWord[i] && !letterStates[i]) {
                        letterStates[i] = 'absent';
                    }
                }

                return letterStates;
            };

    const fetchTopUsers = async () => {
        try {
            const response = await axios.get('/api/users/top');
            setTopUsers(response.data);
        } catch (error) {
            console.error('Error al obtener el ranking:', error);
        }
    };

    const updateRanking = async () => {
        try {
            const topPlayers = await rankingService.getTopPlayers();
            setTopUsers(topPlayers);
        } catch (error) {
            console.error('Error al actualizar el ranking:', error);
        }
            };

    const handleGameOver = async (isCorrect, newGuesses) => {
        if (!isAuthenticated) {
            setGameOver(true);
            setIsWin(isCorrect);
            setShowAuthPopup(true);
            return;
        }

        try {
            // En modo infinito, actualizamos puntos, nivel y guardamos el resultado
            if (gameMode === 'infinite') {
                const pointsEarned = isCorrect ? 10 : 0;
                const newPoints = user.points + pointsEarned;
                const newLevel = Math.floor(newPoints / 100) + 1; // Cada 100 puntos sube un nivel

                const updatedUser = {
                    ...user,
                    points: newPoints,
                    level: newLevel,
                    avatarColor: user.avatarColor
                };
                
                updateUser(updatedUser);
                
                if (newLevel > user.level) {
                    setLevelUpPoints(pointsEarned);
                    setShowLevelUp(true);
                    setScore(prev => prev + 1);
                    setFeedback(`¡Has subido al nivel ${newLevel}!\n+${pointsEarned} puntos`);
                    setGameResult('success');
                    setShowToast(true);
                } else {
                    setFeedback(`¡Has ganado!\n+${pointsEarned} puntos`);
                    setGameResult('success');
                    setShowToast(true);
                }

                // Guardar el resultado del juego
                const boardMapping = newGuesses.map(guess => ({
                    guess,
                    letterStates: calculateLetterStates(guess, word)
                }));

                await updateProgress(
                    gameMode, 
                    selectedCategory,
                    word,
                    newGuesses.length,
                    Math.floor((Date.now() - gameStartTime) / 1000),
                    boardMapping,
                    isCorrect
                );

                // Actualizar el ranking después de una victoria
                if (isCorrect) {
                    await updateRanking();
                }
            } else {
                // Modo diario: guardar todo el progreso
                const boardMapping = newGuesses.map(guess => ({
                    guess,
                    letterStates: calculateLetterStates(guess, word)
                }));

                const response = await updateProgress(
                    gameMode, 
                    selectedCategory,
                    word,
                    newGuesses.length,
                    Math.floor((Date.now() - gameStartTime) / 1000),
                    boardMapping,
                    isCorrect
                );

                if (response?.current_points !== undefined && response?.current_level !== undefined) {
                    const updatedUser = {
                        ...user,
                        points: response.current_points,
                        level: response.current_level,
                        avatarColor: user.avatarColor
                    };
                    
                    updateUser(updatedUser);
                    
                    if (response.current_level > user.level) {
                        setLevelUpPoints(response.points_earned);
                        setShowLevelUp(true);
                        setScore(prev => prev + 1);
                        setFeedback(`¡Has subido al nivel ${response.current_level}!\n+${response.points_earned} puntos`);
                        setGameResult('success');
                        setShowToast(true);
                    } else {
                        setFeedback(`¡Has ganado!\n+${response.points_earned} puntos`);
                        setGameResult('success');
                        setShowToast(true);
                    }

                    // Actualizar el ranking después de una victoria
                    if (isCorrect) {
                        await updateRanking();
                    }
                }
            }

            setGameOver(true);
            
            if (isCorrect) {
                setGameResult('success');
                setScore(prev => prev + 1);
                setStreak(prev => prev + 1);
                
                // Establecer el tiempo para mañana a las 12 de la noche
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                setNextWordAt(tomorrow);
                
                if (gameMode === 'infinite') {
                    // Esperar a que se muestre el toast y luego obtener nueva palabra
                    setTimeout(async () => {
                        await handleInfiniteModeReset();
                        // Actualizar el ranking después de resetear el juego
                        await updateRanking();
                    }, 2000);
                }
            } else {
                setGameResult('error');
                setStreak(0);
                setFeedback(`¡Has perdido!\nLa palabra era: ${word.toUpperCase()}`);
                setShowToast(true);
                
                // Establecer el tiempo para mañana a las 12 de la noche
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                setNextWordAt(tomorrow);
                
                if (gameMode === 'infinite') {
                    // Esperar a que se muestre el toast y luego obtener nueva palabra
                    setTimeout(async () => {
                        await handleInfiniteModeReset();
                        // Actualizar el ranking después de resetear el juego
                        await updateRanking();
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Error al actualizar progreso:', error);
            setFeedback('Error al guardar el progreso');
            setShowToast(true);
        }
    };

    const handleInfiniteModeReset = async () => {
        setShowToast(false);
        setFeedback('');
        setGameResult(null);
        setGameOver(false);
        setGuesses([]);
        setCurrentGuess('');
        setKeyStates({});
        setHints([]); // Limpiar las pistas antes de obtener una nueva palabra
        await fetchWord();
    };

    const submitGuess = async () => {
        if (currentGuess.length !== wordLength) return;

        try {
            if (gameMode === 'daily' && gameOver) {
                setFeedback('Ya has jugado la palabra de hoy');
                setGameResult('warning');
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    setFeedback('');
                    setGameResult(null);
                }, 2000);
                return;
            }

            const newGuesses = [...guesses, currentGuess];
            setGuesses(newGuesses);
            setCurrentGuess('');

            const isCorrect = currentGuess === word;

            if (isCorrect || newGuesses.length >= MAX_ATTEMPTS) {
                await handleGameOver(isCorrect, newGuesses);
            }
        } catch (error) {
            console.error('Error al procesar la palabra:', error);
            setFeedback('Error al procesar la palabra');
            setShowToast(true);
        }
    };

    // Resetear las palabras jugadas cuando se cambia de categoría
    useEffect(() => {
        if (isModeChangeBlocked) {
            return;
        }
        setPlayedWords(new Set());
    }, [selectedCategory, isModeChangeBlocked]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-8">
            <CategorySidebar />
            <div className="container mx-auto px-4 py-4">
                <div className="flex-1 max-w-4xl mx-auto">
                    <AnimatedBackground />
                    
                    {/* Título y Contador */}
                    <div className="relative z-10 w-full max-w-sm mx-auto mb-8">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <h1 
                                    className="text-4xl font-black tracking-wider"
                                    style={{ color: categoryStyle.primaryColor }}
                                >
                                    {categoryNames[selectedCategory]}
                                </h1>
                                {!gameOver && (
                                    <button
                                        onClick={() => setShowHints(true)}
                                        className="p-2 rounded-lg bg-black/40 backdrop-blur-xl border border-white/5 hover:bg-white/5 transition-all duration-200"
                                        title="Mostrar pistas"
                                        style={{ color: categoryStyle.primaryColor }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {gameMode === 'daily' ? (
                                <>
                                    <p className="text-white/60 text-sm tracking-wide mb-2">Adivina la palabra en {MAX_ATTEMPTS} intentos</p>
                                    <div className="text-white/80 text-sm font-medium">
                                        Siguiente palabra en: <span style={{ color: categoryStyle.primaryColor }}>
                                            {!nextWordAt || isTransitioning || !timeLeft ? (
                                                <motion.span
                                                    initial={{ opacity: 0.5 }}
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    Cargando...
                                                </motion.span>
                                            ) : isCalculatingTime ? (
                                                <motion.span
                                                    initial={{ opacity: 0.5 }}
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    Calculando...
                                                </motion.span>
                                            ) : (
                                                timeLeft
                                            )}
                                        </span>
                                    </div>
                                    {gameOver && gameResult && (
                                        <div className="mt-2">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                gameResult === 'success' 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {gameResult === 'success' ? '¡Has ganado!' : '¡Has perdido!'}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="text-white/60 text-sm tracking-wide mb-2">Modo Infinito - Adivina palabras sin límite</p>
                                    <div className="flex justify-center items-center gap-4 text-white/80 text-sm font-medium">
                                        <div>
                                            Puntuación: <span className="text-green-400">{score}</span>
                                        </div>
                                        <div>
                                            Racha: <span className="text-yellow-400">{streak}</span>
                                        </div>
                                    </div>
                                    {gameOver && gameResult && (
                                        <div className="mt-2">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                gameResult === 'success' 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {gameResult === 'success' ? '¡Has ganado!' : '¡Has perdido!'}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </div>

                    {/* Tablero */}
                    <motion.div 
                        className="relative z-10 w-full mx-auto"
                        style={{
                            maxWidth: `min(95vw, ${wordLength * 4.5}rem)`,
                            padding: '0 0.75rem'
                        }}
                        initial={{ opacity: 0.5 }}
                        animate={{
                            opacity: isInitialLoad || isTransitioning ? [0.5, 0.8, 0.5] : 1,
                            scale: isInitialLoad || isTransitioning ? [1, 1.02, 1] : 1
                        }}
                        transition={{
                            duration: isInitialLoad || isTransitioning ? 1.5 : 0.3,
                            repeat: isInitialLoad || isTransitioning ? Infinity : 0,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="grid grid-rows-6 gap-1.5 sm:gap-2">
                            {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
                                <motion.div
                                    key={rowIndex}
                                    className="grid"
                                    style={{ 
                                        gridTemplateColumns: `repeat(${wordLength}, 1fr)`,
                                        gap: `min(0.35rem, ${100 / (wordLength * 3)}vw)`
                                    }}
                                    animate={shakeRow === rowIndex ? {
                                        x: [0, -10, 10, -10, 10, 0],
                                        transition: {
                                            duration: 0.3,
                                            ease: "easeInOut"
                                        }
                                    } : {}}
                                >
                                    {Array.from({ length: wordLength }).map((_, colIndex) => {
                                        const letter = guesses[rowIndex]?.[colIndex] || 
                                                     (rowIndex === guesses.length ? currentGuess[colIndex] : '');
                                        const state = getLetterState(letter, colIndex, rowIndex);
                                        
                                        return (
                                            <motion.div
                                                key={colIndex}
                                                initial={false}
                                                animate={{
                                                    ...(revealRow === rowIndex && {
                                                        scale: [1, 1.2, 1],
                                                        transition: {
                                                            duration: 0.3,
                                                            delay: colIndex * 0.1
                                                        }
                                                    })
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className={`aspect-square flex items-center justify-center font-black uppercase
                                                    ${letter ? state : shakeRow === rowIndex ? 'border-2 border-red-400' : 'border-2 border-white/20'} 
                                                    ${letter ? 'text-white' : 'text-transparent'}
                                                    font-mono tracking-wider relative
                                                    ${isInitialLoad || isTransitioning ? 'bg-gray-800/50' : ''}`}
                                                style={{
                                                    boxShadow: letter ? '0 0 10px rgba(255,255,255,0.1)' : 'none',
                                                    backgroundColor: isInitialLoad || isTransitioning ? 'rgba(31, 41, 55, 0.5)' : 
                                                                   letter ? '' : 'transparent',
                                                    fontSize: `min(${wordLength > 5 ? '1.5rem' : '1.75rem'}, ${100 / (wordLength * 1.5)}vw)`
                                                }}
                                            >
                                                {letter}
                                                {(isInitialLoad || isTransitioning) && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                        transition={{
                                                            duration: 1.5,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                    />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Teclado Virtual */}
                    <motion.div
                        className="fixed bottom-8 w-full max-w-[500px] mx-auto left-0 right-0 py-4 px-4 z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="w-full mx-auto space-y-2">
                            {keyboardLayout.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex justify-center gap-1">
                                    {row.map((key) => {
                                        const keyState = getKeyState(key);
                                        const isSpecialKey = key === 'ENTER' || key === '⌫';
                                        const isActive = activeKey === key;
                                        
                                        return (
                                            <motion.button
                                                key={key}
                                                whileHover={isWordReady && !isTransitioning ? { scale: 1.05 } : {}}
                                                whileTap={isWordReady && !isTransitioning ? { scale: 0.95 } : {}}
                                                animate={{
                                                    scale: isActive && isWordReady && !isTransitioning ? 0.95 : 1
                                                }}
                                                onClick={() => handleKeyPress(key)}
                                                disabled={!isWordReady || isTransitioning || (!isSpecialKey && currentGuess.length >= wordLength)}
                                                className={`px-3 py-3 rounded-lg text-sm font-bold uppercase
                                                    ${isSpecialKey ? 'w-20' : 'w-10'}
                                                    ${isSpecialKey ? 'bg-gray-700/50 hover:bg-gray-600/50' : keyColors[keyState]}
                                                    ${(!isSpecialKey && currentGuess.length >= wordLength) || !isWordReady || isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}
                                                    text-white transition-all duration-200 shadow-lg
                                                    ${isActive ? 'ring-2 ring-white/50' : ''}
                                                    font-mono tracking-wider relative`}
                                                style={{
                                                    backgroundColor: !isWordReady || isTransitioning ? 'rgba(31, 41, 55, 0.5)' :
                                                                   isActive ? 'rgba(255,255,255,0.2)' : 
                                                                   isSpecialKey ? 'rgba(71, 85, 105, 0.5)' : 
                                                                   keyState === 'correct' ? '#16a34a' :
                                                                   keyState === 'present' ? '#eab308' :
                                                                   keyState === 'absent' ? '#111827' :
                                                                   'rgba(71, 85, 105, 0.5)',
                                                    boxShadow: '0 0 10px rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                {key}
                                                {(!isWordReady || isTransitioning) && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Toast de feedback */}
                    <AnimatePresence>
                        {showToast && (
                            <Toast
                                message={feedback}
                                type={gameResult === 'success' ? 'success' : gameResult === 'error' ? 'error' : gameResult === 'warning' ? 'warning' : 'info'}
                                isVisible={showToast}
                                onClose={() => {
                                    setShowToast(false);
                                    setFeedback('');
                                    setGameResult(null);
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
                <Ranking topUsers={topUsers} />
            </div>

            {/* Modal de Pistas */}
            <AnimatePresence>
                {showHints && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowHints(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl p-6 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💡</span>
                                    <h2 
                                        className="text-xl font-black tracking-wider"
                                        style={{ color: categoryStyle.primaryColor }}
                                    >
                                        Pistas
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowHints(false)}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {hints.map((hint, index) => {
                                    const shouldShowHint = guesses.length >= index + 1;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`bg-white/5 rounded-lg p-4 border border-white/5 transition-all duration-300 ${
                                                shouldShowHint ? 'opacity-100' : 'opacity-40'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span 
                                                    className="text-sm font-medium mt-1"
                                                    style={{ color: categoryStyle.primaryColor }}
                                                >
                                                    {index + 1}.
                                                </span>
                                                <div className="flex-1">
                                                    {shouldShowHint ? (
                                                        <p className="text-white/80">{hint}</p>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-white/40">
                                                                {`Pista disponible después del intento ${index + 1}`}
                                                            </p>
                                                            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40">
                                                                {guesses.length}/{index + 1}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auth Popup */}
            <AuthPopup 
                isVisible={showAuthPopup}
                onClose={() => setShowAuthPopup(false)}
                isWin={isWin}
            />
        </div>
    );
} 