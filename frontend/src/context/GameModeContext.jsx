import { createContext, useContext, useState } from 'react';

const GameModeContext = createContext();

export function GameModeProvider({ children }) {
    const [gameMode, setGameMode] = useState('daily');

    return (
        <GameModeContext.Provider value={{ gameMode, setGameMode }}>
            {children}
        </GameModeContext.Provider>
    );
}

export function useGameMode() {
    const context = useContext(GameModeContext);
    if (!context) {
        throw new Error('useGameMode debe ser usado dentro de un GameModeProvider');
    }
    return context;
} 