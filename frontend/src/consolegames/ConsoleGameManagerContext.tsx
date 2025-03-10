import React, {createContext, useContext, useEffect, useState} from "react";
import {useAuth} from '@/AuthContext';

const API_BASE_URL = "/api/consoles";

interface Console {
    id: number;
    name: string;
}

export interface ConsoleGame {
    id: number;
    name: string;
    boxImageUrl: string;
    consoles: Console[];
    description: string;
}

interface ConsoleContextType {
    consoles: Console[];
    games: ConsoleGame[];
    loading: boolean;
    fetchConsoles: () => void;
    fetchGames: () => void;
    createConsole: (console: Console) => void;
    updateConsole: (id: number, console: Console) => void;
    deleteConsole: (id: number) => void;
    createGame: (game: ConsoleGame) => void;
    updateGame: (id: number, game: ConsoleGame) => void;
    deleteGame: (id: number) => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export const useConsoleContext = () => {
    const context = useContext(ConsoleContext);
    if (!context) {
        throw new Error("useConsoleContext must be used within a ConsoleProvider");
    }
    return context;
};

interface ConsoleProviderProps {
    key?: number
}

export const ConsoleProvider: React.FC<{ children: React.ReactNode }> = ({children, key}) => {
    const {auth} = useAuth();
    const [consoles, setConsoles] = useState<Console[]>([]);
    const [games, setGames] = useState<ConsoleGame[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchConsoles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                headers: auth ? {Authorization: `Bearer ${auth.token}`} : {},
            });
            if (response.ok) {
                setConsoles(await response.json());
            } else {
                console.error("Failed to fetch consoles");
            }
        } catch (error) {
            console.error("Error fetching consoles:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGames = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/games`, {
                headers: auth ? {Authorization: `Bearer ${auth.token}`} : {},
            });
            if (response.ok) {
                setGames(await response.json());
            } else {
                console.error("Failed to fetch games");
            }
        } catch (error) {
            console.error("Error fetching games:", error);
        } finally {
            setLoading(false);
        }
    };

    const createConsole = async (console: Console) => {
        await fetch(`${API_BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth?.token}`,
            },
            body: JSON.stringify(console),
        });
        fetchConsoles();
    };

    const updateConsole = async (id: number, console: Console) => {
        await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth?.token}`,
            },
            body: JSON.stringify(console),
        });
        fetchConsoles();
    };

    const deleteConsole = async (id: number) => {
        await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${auth?.token}`},
        });
        fetchConsoles();
    };

    const createGame = async (game: ConsoleGame) => {
        await fetch(`${API_BASE_URL}/games`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth?.token}`,
            },
            body: JSON.stringify(game),
        });
        fetchGames();
    };

    const updateGame = async (id: number, game: ConsoleGame) => {
        await fetch(`${API_BASE_URL}/games/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth?.token}`,
            },
            body: JSON.stringify(game),
        });
        fetchGames();
    };

    const deleteGame = async (id: number) => {
        await fetch(`${API_BASE_URL}/games/${id}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${auth?.token}`},
        });
        fetchGames();
    };

    useEffect(() => {
        fetchConsoles();
        fetchGames();
    }, [auth]);

    return (
        <ConsoleContext.Provider value={{
            consoles,
            games,
            loading,
            fetchConsoles,
            fetchGames,
            createConsole,
            updateConsole,
            deleteConsole,
            createGame,
            updateGame,
            deleteGame
        }}>
            {children}
        </ConsoleContext.Provider>
    );
};
