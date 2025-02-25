import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/AuthContext';

const API_BASE_URL = '/api';

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

interface SortData {
    field: keyof Game;
    direction: 'asc' | 'desc';
}

interface Filters {
    name?: string;
    genre?: string;
    playtime?: number;
    playerCount?: number;
}

export const GameManagerContext = createContext(null);

export const GameManagerProvider: React.FC<GameManagerProps> = ({ children }) => {
    const [allGames, setAllGames] = useState<Game[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useAuth();
    const [filters, setFilters] = useState<Filters>({});
    const [sortData, setSortData] = useState<SortData>({ field: "name", direction: "asc" });

    const fetchGames = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/games`, {
                headers: auth ? { Authorization: `Bearer ${auth.token}` } : {},
            });
            if (response.ok) {
                const data: Game[] = await response.json();
                setAllGames(data);
                applyFiltersAndSort(data);
            } else {
                console.error('Failed to fetch games');
            }
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            setLoading(false);
        }
    };

    const getComparableValue = (value: any) => {
        return typeof value === 'string' ? value.toLowerCase() : value;
    };

    const applyFiltersAndSort = (data: Game[]) => {
        let filteredGames = data;

        // Apply filtering based on the Spring query logic
        if (filters) {
            if (filters.name) {
                filteredGames = filteredGames.filter((game) =>
                    game.name && game.name.toLowerCase().includes(filters.name!.toLowerCase())
                );
            }
            if (filters.genre) {
                filteredGames = filteredGames.filter((game) =>
                    game.genre && game.genre.toLowerCase().includes(filters.genre!.toLowerCase())
                );
            }
            if (filters.playtime !== undefined) {
                filteredGames = filteredGames.filter(

                    (game) =>
                        game.minPlaytime !== undefined &&
                        game.maxPlaytime !== undefined &&
                        game.minPlaytime <= filters.playtime! &&
                        game.maxPlaytime >= filters.playtime!
                );
            }
            if (filters.playerCount !== undefined) {
                filteredGames = filteredGames.filter(
                    (game) =>
                        game.minPlayerCount !== undefined &&
                        game.maxPlayerCount !== undefined &&
                        game.minPlayerCount <= filters.playerCount! &&
                        game.maxPlayerCount >= filters.playerCount!
                );
            }
        }

        // Apply client-side sorting
        if (sortData) {
            console.log(sortData);
            const { field, direction } = sortData;
            filteredGames.sort((a, b) => {
                const valueA = a[field];
                const valueB = b[field];

                if (valueA === undefined) return 1;
                if (valueB === undefined) return -1;

                const compA = getComparableValue(valueA);
                const compB = getComparableValue(valueB);

                if (compA < compB) return direction === 'asc' ? -1 : 1;
                if (compA > compB) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setGames(filteredGames);
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

    const updateFiltersAndSort = (newFilters: Filters, newSort: SortData | null) => {
        setFilters(newFilters);
        setSortData(newSort || { field: "name", direction: "desc" }); // Keep default sort if none is provided
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

    useEffect(() => {
        if (allGames.length > 0) {
            applyFiltersAndSort(allGames);
        }
    }, [filters, sortData]);

    return (
        <GameManagerContext.Provider value={{ games, loading, fetchGames, addGame, deleteGame, updateGame, checkout, returnGame, updateFiltersAndSort, importFile, exportFile, fetchGameStats, returnAllGames }}>
    {children}
    </GameManagerContext.Provider>
);
};

export const useGameManager = () => useContext(GameManagerContext);
