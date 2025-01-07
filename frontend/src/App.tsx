import React, {useState, useEffect, useRef} from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {Pencil, Trash2, LogIn, LogOut, Plus, Minus, BarChart, RefreshCw, Filter, Upload, Download, Menu, Sun, Moon} from 'lucide-react';
import { GameManagerProvider, useGameManager } from "./GameManagerContext";
import { AuthProvider,useAuth } from './AuthContext';
import {Alert} from "@/components/ui/alert";

// const API_BASE_URL = 'http://localhost:8080/api';

const TopBar = () => {
    const { auth } = useAuth();
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';
    const isHost = isAdmin || auth?.authenticationLevel.toLowerCase() === 'host';
    const [showStats, setShowStats] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);

    const handleAddGameClick = () => setIsAddGameOpen(true);
    const handleExport = () => {/* API call */};
    const handleReturnAll = () => {/* API call */};

    const MenuItems = () => (
        <>
            {isAdmin && (
                <>
                    <DropdownMenuItem onClick={() => setShowImport(true)}>
                        <Upload className="w-4 h-4 mr-2" /> Import
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" /> Export
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAddGameClick}>
                        <Plus className="w-4 h-4 mr-2" /> Add Game
                    </DropdownMenuItem>
                </>
            )}
            {isHost && (
                <DropdownMenuItem onClick={handleReturnAll}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Return All
                </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setShowFilters(true)}>
                <Filter className="w-4 h-4 mr-2" /> Filter & Sort
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowStats(true)}>
                <BarChart className="w-4 h-4 mr-2" /> Stats
            </DropdownMenuItem>
        </>
    );

    return (
        <div className="fixed top-0 left-0 w-full bg-menubar-light dark:bg-menubar-dark text-white px-4 py-2 flex items-center justify-between z-10 shadow-lg">
            <div className="text-xl font-bold flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 inline-block mr-2" />
                WUD Games
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-gray-400">
                        <MenuItems />
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button  variant="outline" size="icon">
                            <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("auto")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <LoginButton />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2">
                {isAdmin && (
                    <>
                        <Button variant="outline" onClick={() => setShowImport(true)} className="flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Import
                        </Button>
                        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export
                        </Button>
                        <Button variant="outline" onClick={handleAddGameClick} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Game
                        </Button>
                    </>
                )}
                {isHost && (
                    <Button variant="outline" onClick={handleReturnAll} className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Return All
                    </Button>
                )}
                <Button variant="outline" onClick={() => setShowFilters(true)} className="flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter & Sort
                </Button>
                <Button variant="outline" onClick={() => setShowStats(true)} className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" /> Stats
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button  variant="outline" size="icon">
                            <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("auto")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <LoginButton />
            </div>

            <StatsPopup isOpen={showStats} onClose={() => setShowStats(false)} />
            <FilterPopup isOpen={showFilters} onClose={() => setShowFilters(false)} />
            <ImportPopup isOpen={showImport} onClose={() => setShowImport(false)} />
            <AddGamePopup isOpen={isAddGameOpen} onClose={() => setIsAddGameOpen(false)} />
        </div>
    );
};

const StatsPopup = ({ isOpen, onClose }) => {
    const [stats, setStats] = useState(null);
    // console.log({ Dialog, DialogContent, DialogHeader, DialogTitle });
    useEffect(() => {
        if (isOpen) {
            // API call to get stats
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Game Library Statistics</DialogTitle>
                </DialogHeader>
                {stats ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-100 rounded">
                            <h3 className="font-bold">Total Games</h3>
                            <p>{stats?.totalGames || 0}</p>
                        </div>
                        <div className="p-4 bg-gray-100 rounded">
                            <h3 className="font-bold">Games Checked Out</h3>
                            <p>{stats?.checkedOut || 0}</p>
                        </div>
                        {/* Add more stats as needed */}
                    </div>
                ) : (
                    <p>Loading statistics...</p>
                )}
            </DialogContent>
        </Dialog>
    );
};

const FilterPopup = ({ isOpen, onClose }) => {
    const [filters, setFilters] = useState({
        name: '',
        genre: '',
        minPlaytime: '',
        minPlayerCount: ''
    });
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const { updateFiltersAndSort } = useGameManager();

    const handleApply = () => {
        updateFiltersAndSort(filters, { field: sortField, direction: sortDirection });
        onClose();
    };

    return (

        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filter & Sort Games</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={filters.name}
                            onChange={(e) => setFilters({...filters, name: e.target.value})}
                        />
                    </div>
                    {/* Add more filter fields */}
                    <div>
                        <label className="block text-sm font-medium">Sort By</label>
                        <select
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                        >
                            <option value="name">Name</option>
                            <option value="minPlayerCount">Player Count</option>
                            <option value="minPlaytime">Play Time</option>
                            <option value="checkoutCount">Popularity</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Order</label>
                        <select
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={sortDirection}
                            onChange={(e) => setSortDirection(e.target.value)}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleApply}>Apply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ImportPopup = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const {importFile, loading} = useGameManager();

    const handleImport = () => {
        if (!file) return;
        importFile(file);
        isOpen = false;
    };

    return (

    <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Games</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <a href="importTemplate.csv" download="WUDGames-ImportTemplate">
                        <Button  variant="outline">
                            Download Template
                        </Button>
                    </a>
                    <div>
                        <label className="block text-sm font-medium">Upload CSV</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files[0])}
                            disabled={loading}
                            className="mt-1 w-full"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleImport} disabled={!file}>{loading ? "Importing..." : "Import"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const LoginButton = () => {
    const { auth, login, logout } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState({ username: '', password: '' });
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
        <div className="z-10 text-black">

            {!auth ? (
                <div className="relative" ref={loginRef}>
                    <Button onClick={() => setShowLogin(!showLogin)} className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" /> Login
                    </Button>
                    {showLogin && (
                        <div className="absolute right-0 mt-2 p-4 bg-white rounded-lg shadow-lg">
                            <form onSubmit={handleLogin} className="flex flex-col gap-2">
                                {error && (
                                    <Alert variant="error" className="mb-2" description={error}>
                                    </Alert>
                                )}
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="p-2 border rounded"
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="p-2 border rounded"
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                                <Button type="submit">Login</Button>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <Button onClick={logout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                </Button>
            )}
        </div>
    );
};

const GameCard = ({ key, game }) => {
    const {auth} = useAuth();
    const { deleteGame, checkout, returnGame } = useGameManager();
    const [isEditing, setIsEditing] = useState(false);
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';
    const isHost = isAdmin || auth?.authenticationLevel.toLowerCase() === 'host';
    const handleDelete = async () => {
        deleteGame(game.id);
    };
    const handleCheckout = async () => {
        checkout(game.id);
    };
    const handleReturn = async () => {
        returnGame(game.id);
    };
    return (
        <>
            <Card className="w-full max-w-sm">
                <CardHeader className="relative">
                    <img
                        src={game.boxImageUrl || "/api/placeholder/200/200"}
                        alt={game.name}
                        className="w-full h-48 object-cover rounded-t-lg text-center"
                    />
                    {isHost && (
                    <div className="absolute top-2 right-2 grid grid-cols-1 gap-y-1">
                        <div className="top-2 right-2 grid-cols-2 gap-1 grid rounded-lg">
                            <Button  title="Checkout Game" variant="constructive" size="icon" onClick={handleCheckout} >
                                <Plus className="w-4 h-4" />
                            </Button>
                            <Button  title="Return Game" variant="destructive" size="icon" onClick={handleReturn}>
                                <Minus className="w-4 h-4" />
                            </Button>
                        </div>

                    {isAdmin && (
                        <div className="top-6 right-2 flex gap-1 rounded-lg">
                            <Button  variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button  variant="outline" size="icon" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    </div>)}
                </CardHeader>
                <CardContent className="text-left">
                    <h3 className="text-lg font-bold">{game.name}</h3>
                    <p className="text-sm">
                        {game.minPlayerCount}
                        {game.minPlayerCount !== game.maxPlayerCount && `-${game.maxPlayerCount}`} players
                        | {game.minPlaytime}
                        {game.minPlaytime !== game.maxPlaytime && `-${game.maxPlaytime}`} minutes
                    </p>
                    <p className="mt-2">{game.description}</p>
                    <p className="mt-2 text-sm">Genre: {game.genre}</p>
                    <p className="text-sm">Available: {game.availableCopies}</p>
                    <p className="text-sm">Times Checked Out: {game.checkoutCount}</p>
                    {(isHost) && (
                        <p className="mt-2 text-sm italic">{game.internalNotes}</p>
                    )}
                </CardContent>
            </Card>
            <EditGamePopup isOpen={isEditing} game={game} onClose={() => setIsEditing(false)} />
        </>
    );
};

const AddGamePopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    // const {auth} = useAuth();
    const { addGame } = useGameManager();
    const [gameName, setGameName] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [minPlayerCount, setMinPlayerCount] = useState('');
    const [maxPlayerCount, setMaxPlayerCount] = useState('');
    const [playtime, setPlaytime] = useState('');
    const [maxPlaytime, setMaxPlaytime] = useState('');
    const [boxArtUrl, setBoxArtUrl] = useState('');
    const [quantity, setQuantity] = useState('');
    const [internalNotes, setInternalNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (gameName) {
            const gameData = {
                name: gameName,
                genre,
                description,
                minPlayerCount: minPlayerCount ? parseInt(minPlayerCount) : undefined,
                maxPlayerCount: maxPlayerCount ? parseInt(maxPlayerCount) : undefined,
                minPlaytime: playtime ? parseInt(playtime) : undefined,
                maxPlaytime: maxPlaytime ? parseInt(maxPlaytime) : undefined,
                boxImageUrl: boxArtUrl,
                quantity: quantity ? parseInt(quantity) : undefined,
                internalNotes
            };

            try {
                addGame(gameData);
                onClose(); // Close the popup after submitting
            } catch (error) {
                console.error('Error adding game:', error);
                alert('There was an error adding the game.');
            }
        } else {
            alert('Game name is required!');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filter & Sort Games</DialogTitle>
                </DialogHeader>
                <div className="grid gap-y-2 w-full">
                    <input
                        type="text"
                        placeholder="Game Name (required)"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        className="p-2 w-full border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Genre (optional)"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <input
                            type="number"
                            placeholder="Minimum Players"
                            value={minPlayerCount}
                            min="0"
                            onChange={(e) => setMinPlayerCount(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <input
                            type="number"
                            placeholder="Maximum Players"
                            value={maxPlayerCount}
                            min="0"
                            onChange={(e) => setMaxPlayerCount(e.target.value)}
                            className="p-2 border rounded"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full">
                        <input
                            type="number"
                            placeholder="Minimum Playtime"
                            value={playtime}
                            min="0"
                            onChange={(e) => setPlaytime(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <input
                            type="number"
                            placeholder="Max Playtime"
                            value={maxPlaytime}
                            min="0"
                            onChange={(e) => setMaxPlaytime(e.target.value)}
                            className="p-2 border rounded"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Box Art URL (optional)"
                        value={boxArtUrl}
                        onChange={(e) => setBoxArtUrl(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Quantity (optional)"
                        value={quantity}
                        min="0"
                        onChange={(e) => setQuantity(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Internal Notes (optional)"
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        className="p-2 border rounded"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Add Game</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
    ;
};

const EditGamePopup = ({isOpen, game, onClose}: { isOpen: boolean, game: any, onClose: () => void }) => {
    const {updateGame} = useGameManager();
    const [gameName, setGameName] = useState(game?.name || '');
    const [genre, setGenre] = useState(game?.genre || '');
    const [description, setDescription] = useState(game?.description || '');
    const [minPlayerCount, setMinPlayerCount] = useState(game?.minPlayerCount || '');
    const [maxPlayerCount, setMaxPlayerCount] = useState(game?.maxPlayerCount || '');
    const [playtime, setPlaytime] = useState(game?.minPlaytime || '');
    const [maxPlaytime, setMaxPlaytime] = useState(game?.maxPlaytime || '');
    const [boxArtUrl, setBoxArtUrl] = useState(game?.boxImageUrl || '');
    const [quantity, setQuantity] = useState(game?.quantity || '');
    const [internalNotes, setInternalNotes] = useState(game?.internalNotes || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData = {
            name: gameName,
            genre,
            description,
            minPlayerCount: minPlayerCount ? parseInt(minPlayerCount) : undefined,
            maxPlayerCount: maxPlayerCount ? parseInt(maxPlayerCount) : undefined,
            minPlaytime: playtime ? parseInt(playtime) : undefined,
            maxPlaytime: maxPlaytime ? parseInt(maxPlaytime) : undefined,
            boxImageUrl: boxArtUrl,
            quantity: quantity ? parseInt(quantity) : undefined,
            internalNotes,
        };

        try {
            await updateGame(game.id, updatedData);
            onClose(); // Close the popup after submission
        } catch (error) {
            console.error('Error updating game:', error);
            alert('Failed to update the game.');
        }
    };

    return (
        isOpen && (
            <div className="fixed z-10 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-100">
                    <h2 className="text-2xl mb-4">Edit Game</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Game Name (required)"
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Genre (optional)"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min Players"
                                value={minPlayerCount}
                                onChange={(e) => setMinPlayerCount(e.target.value)}
                                className="p-2 border rounded"
                            />
                            <input
                                type="number"
                                placeholder="Max Players"
                                value={maxPlayerCount}
                                onChange={(e) => setMaxPlayerCount(e.target.value)}
                                className="p-2 border rounded"
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min Playtime"
                                value={playtime}
                                onChange={(e) => setPlaytime(e.target.value)}
                                className="p-2 border rounded"
                            />
                            <input
                                type="number"
                                placeholder="Max Playtime"
                                value={maxPlaytime}
                                onChange={(e) => setMaxPlaytime(e.target.value)}
                                className="p-2 border rounded"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Box Art URL"
                            value={boxArtUrl}
                            onChange={(e) => setBoxArtUrl(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Internal Notes"
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" onClick={onClose}>Cancel</Button>
                            <Button type="submit" color="blue">Update Game</Button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );
};


const GamesList = () => {
    const { games, loading } = useGameManager();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-2 gap-y-6">
            {loading ? (
                    <Card className="w-full max-w-sm">
                        <CardHeader className="relative">
                            <Skeleton className="w-full h-48 object-cover bg-slate-500 rounded-t-lg" />
                        </CardHeader>
                        <CardContent className="text-left space-y-2">
                            <Skeleton className="h-4 w-[250px] bg-slate-500" />
                            <Skeleton className="h-4 w-[250px] bg-slate-500" />
                        </CardContent>
                    </Card>
                ) :
                (
                    <>
                        {
                            games.map(game => (
                                <GameCard key={game.id} game={game}/>
                            ))
                        }
                    </>
                )}
        </div>
    )
        ;
    }
;

const setTheme = (theme: 'light' | 'dark' | 'auto') => {
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
        <>
            <AuthProvider>
                <GameManagerProvider>
                    <div className="min-h-screen p-8 antialiased text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark accent-blue-500">
                        <TopBar/>
                        <div className="min-h-screen p-8 pt-16"> {/* Added pt-16 for padding */}
                            {/*<p>Hello</p>*/}
                            <GamesList/>
                        </div>
                    </div>
                </GameManagerProvider>
            </AuthProvider>
        </>
    );
};

export default App;
