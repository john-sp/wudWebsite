import React, { useState, createContext, useContext } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export const AuthContext = createContext(null);
interface AuthProps {
    game: any; // Replace `any` with the specific type for `game` if possible
}
export const AuthProvider: React.FC<AuthProps> = ({ children }) => {
    const [auth, setAuth] = useState(null);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            setAuth(data);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => setAuth(null);

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);