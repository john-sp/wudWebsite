import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/AuthContext';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Game {
    id: number;
    name: string;
    genre?: string;
    description?: string;
    minPlayerCount?: number;
    maxPlayerCount?: number;
    minPlaytime?: number;
    maxPlaytime?: number;
    boxImageUrl?: string;
    quantity?: number;
    internalNotes?: string;
}

interface GameManagerProps {
    game: Game; // Replace `any` with the specific type for `game` if possible
}

export const GameManagerContext = createContext(null);

export const GameManagerProvider: React.FC<GameManagerProps> = ({ children }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useAuth();
    let queryParams = new URLSearchParams();
    let [sortData, setSortData] = useState('');

    const fetchGames = async () => {
        setLoading(true);
        try {
            const queryString = queryParams.toString();
            const response = await fetch(`${API_BASE_URL}/games${queryString ? `?${queryString}` : ''}`, {
                headers: auth ? { 'Authorization': `Bearer ${auth.token}` } : {},
            });
            if (response.ok) {
                let data = await response.json();
                if (sortData) {
                    const {field, direction} = sortData;
                    data = data.sort((a, b) => {
                        const valueA = a[field];
                        const valueB = b[field];

                        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
                        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
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
    const updateFiltersAndSort = async (filters, sort) => {
        setLoading(true);
        try {
            queryParams = new URLSearchParams();
            // Add filters to the query string
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (typeof value === "string" && value) {
                            queryParams.append(key, value);
                        }
                    }
                });
            }

            // Perform sorting in TypeScript
            if (sort)
                setSortData(sort);
            fetchGames();
        } catch (error) {
            console.error('Error updating filters and sort:', error);
        }
    };
    const importFile = async (file) => {

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(`${API_BASE_URL}/games/import`, {
                method: 'POST',
                headers: {
                //     // 'Content-Type': 'multipart/form-data;charset=UTF-8',
                    'Authorization': `Bearer ${auth.token}`,
                //     redirect: 'follow',
                },
                body: formData,
            });

            fetchGames();
        } catch (error) {
            console.error('Error updating filters and sort:', error);
        }
    };

    const exportFile = async () => {

        try {
            const response = await fetch(`${API_BASE_URL}/games/download-csv`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'boardgames.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('There was an error downloading the CSV:', error);
        }

    };
    const fetchGameStats = async ({ startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        try {
            const response = await fetch(`${API_BASE_URL}/games/stats?${params.toString()}`, {
                headers: auth ? { 'Authorization': `Bearer ${auth.token}` } : {},
            });
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error('Failed to fetch game stats');
            }
        } catch (error) {
            console.error('Error fetching game stats:', error);
        }
        return null;
    };

    const returnAllGames = async () => {
        const response = await fetch(`${API_BASE_URL}/games/return-all`, {
            method: 'PUT',
            headers: auth ? { 'Authorization': `Bearer ${auth.token}` } : {},
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to return games: ', response.status);
        }

        return null;
    };

    useEffect(() => {
        fetchGames();
    }, [auth]);

    return (
        <GameManagerContext.Provider value={{ games, loading, fetchGames, addGame, deleteGame, updateGame, checkout, returnGame, updateFiltersAndSort, importFile, exportFile, fetchGameStats, returnAllGames }}>
    {children}
    </GameManagerContext.Provider>
);
};

export const useGameManager = () => useContext(GameManagerContext);
