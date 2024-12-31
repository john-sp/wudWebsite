import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';

interface GameManagerProps {
    game: any; // Replace `any` with the specific type for `game` if possible
}

export const GameManagerContext = createContext(null);

export const GameManagerProvider: React.FC<GameManagerProps> = ({ children }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useAuth();

    const fetchGames = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/games`, {
                headers: auth ? { 'Authorization': `Bearer ${auth.token}` } : {},
            });
            if (response.ok) {
                const data = await response.json();
                setGames(data);
            } else {
                console.error('Failed to fetch games');
            }
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            setLoading(false);
        }
    };

    const addGame = async (gameData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/games`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(gameData),
            });
            if (response.ok) {
                fetchGames();
            } else {
                console.error('Failed to add game');
            }
        } catch (error) {
            console.error('Error adding game:', error);
        }
    };

    const deleteGame = async (gameId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                },
            });
            if (response.ok) {
                fetchGames();
            } else {
                console.error('Failed to delete game');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
        }
    };
    const checkout = async (gameId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/games/${gameId}/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                },
            });
            if (response.ok) {
                setGames((prevGames) =>
                    prevGames.map((game) =>
                        game.id === gameId
                            ? { ...game, availableCopies: game.availableCopies - 1, checkoutCount: game.checkoutCount + 1 }
                            : game
                    )
                );
            } else {
                console.error('Failed to checkout game');
            }
        } catch (error) {
            console.error('Error checkingout game:', error);
        }
    };
    const returnGame = async (gameId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/games/${gameId}/return`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                },
            });
            if (response.ok) {
                setGames((prevGames) =>
                    prevGames.map((game) =>
                        game.id === gameId
                            ? { ...game, availableCopies: game.availableCopies + 1 }
                            : game
                    )
                );
            } else {
                console.error('Failed to checkout game');
            }
        } catch (error) {
            console.error('Error checkingout game:', error);
        }
    };
    const updateGame = async (gameId, gameData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(gameData),
            });
            if (response.ok) {
                fetchGames();
            } else {
                console.error('Failed to update game');
            }
        } catch (error) {
            console.error('Error update game:', error);
        }
    };


    useEffect(() => {
        fetchGames();
    }, [auth]);

    return (
        <GameManagerContext.Provider value={{ games, loading, fetchGames, addGame, deleteGame, updateGame, checkout, returnGame }}>
    {children}
    </GameManagerContext.Provider>
);
};

export const useGameManager = () => useContext(GameManagerContext);
