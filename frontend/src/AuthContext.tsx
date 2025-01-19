import React, { useState, useEffect, createContext, useContext } from 'react';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8080/api';

export const AuthContext = createContext(null);

export const AuthProvider: React.FC = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Initialize auth from cookies
        const token = Cookies.get('token');
        // Run refresh method if token exists in cookies
        if (token) {
            const authenticationLevel = '';
            return { token, authenticationLevel };
        }
        return null;
    });

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();

                // Store token in cookies
                Cookies.set('token', data.token, { expires: 1 }); // Expires in 1 day

                setAuth({
                    token: data.token,
                    authenticationLevel: data.authenticationLevel,
                    username: data.username,
                    expiration: new Date(data.expireTime).toISOString(),
                });
            } else if (response.status === 401) {
                throw new Error('Invalid username or password');
            } else {
                throw new Error('An error occurred during login. Please try again later.');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        // Clear token from cookies
        Cookies.remove('token');
        setAuth(null);
    };

    const refresh = async () => {
        const token = Cookies.get('token');
        if (!token) return;
        console.log("Running Refresh");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();

                // Update token in cookies
                Cookies.set('token', data.token, { expires: 10 }); // Expires in 10 day

                setAuth({
                    token: data.token,
                    authenticationLevel: data.authenticationLevel,
                    username: data.username,
                    expiration: new Date(data.expireTime).toISOString(),
                });
            } else {
                console.error('Failed to refresh token:', response.statusText);
                setAuth(null); // Clear auth on refresh failure
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            setAuth(null); // Clear auth on error
        }
    };

    useEffect(() => {
        refresh();
        // Set interval to refresh token before it expires
        const interval = setInterval(refresh, 3600000); // Check every hour

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
