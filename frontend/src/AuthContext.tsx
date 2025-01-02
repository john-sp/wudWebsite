import React, { useState, useEffect, createContext, useContext } from 'react';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8080/api';

export const AuthContext = createContext(null);
interface AuthProps {
    game: any; // Replace `any` with the specific type for `game` if possible
}
export const AuthProvider: React.FC<AuthProps> = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Initialize auth from cookies
        const token = Cookies.get('token');
        const expiration = Cookies.get('expiration');
        const authenticationLevel  = Cookies.get('level');
        const username = Cookies.get('username');
        return token && expiration && authenticationLevel  && username
            ? { token, expiration: new Date(expiration).toISOString(), authenticationLevel , username }
            : null;
    });

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            // Store auth in cookies
            Cookies.set('token', data.token, { expires: 1 }); // Expires in 1 day
            Cookies.set('expiration', data.expireTime, { expires: 1 });
            Cookies.set('level', data.authenticationLevel, { expires: 1 });
            Cookies.set('username', data.username, { expires: 1 });

            setAuth({
                ...data,
                expiration: new Date(data.expireTime).toISOString(),
            });
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => {
        // Clear cookies
        Cookies.remove('token');
        Cookies.remove('expiration');
        Cookies.remove('level');
        Cookies.remove('username');

        setAuth(null);
    };

    const refresh = async () => {
        if (!auth?.token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/refresh`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            if (response.ok) {
                const data = await response.json();


                // Update cookies
                Cookies.set('token', data.token, { expires: 1 }); // Expires in 1 day
                Cookies.set('expiration', data.expireTime, { expires: 1 });
                Cookies.set('level', data.authenticationLevel, { expires: 1 });
                Cookies.set('username', data.username, { expires: 1 });

                setAuth({
                    ...auth,
                    token: data.token,
                    expiration: new Date(data.expireTime).toISOString(),
                });
            } else {
                console.error('Failed to refresh token:', response.statusText);
                logout(); // Log out if the token cannot be refreshed
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout(); // Log out on failure
        }
    };

    useEffect(() => {
        if (!auth?.expiration) return;

        const expirationTime = new Date(auth.expiration).getTime();
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;

        // Refresh the token if it's within 6 hours (21600000 ms) of expiring
        if (timeUntilExpiration <= 21600000) {
            refresh();
        }

        // Set a timer to refresh before the token expires
        const interval = setInterval(() => {
            const currentTimeUntilExpiration = expirationTime - Date.now();
            if (currentTimeUntilExpiration <= 21600000) {
                refresh();
            }
        }, 3600000); // Check every hour

        return () => clearInterval(interval); // Cleanup on unmount
    }, [auth?.expiration]);

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);