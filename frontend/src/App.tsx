import React, {useEffect, useRef, useState} from 'react';
import {Route, Routes, BrowserRouter as Router, NavLink, Navigate} from "react-router";
import {Menu, Sun, Moon, GamepadIcon, LogIn, LogOut, Dice6} from 'lucide-react';
import {AuthProvider, useAuth} from "@/AuthContext";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import ConsolegameMain from "@/consolegames/ConsolegameMain";
import BoardgameMain from "@/boardgames/BoardgameMain";
import {GameManagerProvider} from "@/boardgames/GameManagerContext";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

// import ConsolegameMain from "/consolegames/ConsolegameMain";

export const LoginButton = () => {
    const { auth, login, logout, version } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [appVersion, setAppVersion] = useState('Unknown');
    const loginRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (loginRef.current && !loginRef.current.contains(event.target)) {
                setShowLogin(false);
                setError('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (auth || !showLogin) {
            setError('');
        }
        if (showLogin) {
            (async () => {
                const data = await version();
                setAppVersion(data.version);
            })();
        }
    }, [auth, showLogin]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(credentials.username, credentials.password);
            setShowLogin(false);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="z-10">
            {!auth ? (
                <div className="relative" ref={loginRef}>
                    <Button onClick={() => setShowLogin(!showLogin)} variant="default" size="sm" className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" /> Login
                    </Button>

                    {showLogin && (
                        <Card className="absolute right-0 mt-2 w-64 shadow-lg">
                            <CardContent className="p-4">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    {error && (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Input
                                        type="text"
                                        placeholder="Username"
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    />

                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    />

                                    <Button type="submit" className="w-full">
                                        Login
                                    </Button>

                                    <p className="text-xs text-muted-foreground">App version: {appVersion}</p>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (
                <Button onClick={logout} variant="default" size="sm" className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                </Button>
            )}
        </div>
    );
};


const UnifiedTopBar = () => {
    return (
        <div className="fixed top-0 left-0 w-full bg-menubar text-white px-4 py-2 z-10 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="text-xl font-bold flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-8 inline-block mr-2" />
                    WUD Games
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-4">
                    <NavLink
                        to="/board-games"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 rounded ${
                                isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                            }`
                        }
                    >
                        <Dice6 className="w-4 h-4 mr-2" /> Board Games
                    </NavLink>
                    <NavLink
                        to="/video-games"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 rounded ${
                                isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                            }`
                        }
                    >
                        <GamepadIcon className="w-4 h-4 mr-2" /> Video Games
                    </NavLink>
                </div>

                {/* Theme and Auth */}
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-transparent">
                                <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("auto")}>System</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <LoginButton />
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem as={NavLink} to="/board-games">
                                <Dice6 className="w-4 h-4 mr-2" /> Board Games
                            </DropdownMenuItem>
                            <DropdownMenuItem as={NavLink} to="/video-games">
                                <GamepadIcon className="w-4 h-4 mr-2" /> Video Games
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

export const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('light', 'dark');

    if (theme === 'auto') {
        localStorage.removeItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        htmlElement.classList.toggle('dark', prefersDark);
        htmlElement.classList.toggle('light', !prefersDark);
    } else {
        localStorage.theme = theme;
        htmlElement.classList.add(theme);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.theme as 'light' | 'dark' | undefined;
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('auto');
    }
});

const App = () => {
    return (
        <Router>
            <AuthProvider>
                    <div className="min-h-screen p-8 antialiased">
                        <UnifiedTopBar />
                        <Routes>
                            <Route path="/" element={<Navigate to="/board-games" replace />} />
                            <Route path="/board-games/*" element={
                                <GameManagerProvider>
                                    <BoardgameMain />
                                </GameManagerProvider>} />
                            <Route path="/video-games/*" element={<ConsolegameMain />} />
                        </Routes>
                    </div>
            </AuthProvider>
        </Router>
    );
};

export default App;
