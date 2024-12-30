import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './AuthContext.tsx';

const API_BASE_URL = 'http://localhost:8080/api';

export const GameManagerContext = createContext(null);

export const GameManagerProvider = ({ children }) => {
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

    useEffect(() => {
        fetchGames();
    }, [auth]);

    return (
        <GameManagerContext.Provider value={{ games, loading, fetchGames, addGame, deleteGame }}>
    {children}
    </GameManagerContext.Provider>
);
};

export const useGameManager = () => useContext(GameManagerContext);
