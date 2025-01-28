import React, {useEffect, useRef, useState} from 'react';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Skeleton} from '@/components/ui/skeleton';
import {
    BarChart,
    Download,
    Filter,
    LogIn,
    LogOut,
    Menu,
    Minus,
    Moon,
    Pencil,
    Plus,
    RefreshCw,
    Sun,
    Trash2,
    Upload
} from 'lucide-react';
// TODO: Replace GameManagerContext with Boardgame version
import {Game, GameManagerProvider, useGameManager} from "./GameManagerContext";
import {AuthProvider, useAuth} from '@/AuthContext';
import {setTheme} from '@/App'
import {Alert} from "@/components/ui/alert";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {AddGamePopup, EditGamePopup} from "@/boardgames/GamePopups";

const TopBar = () => {
    const {auth} = useAuth();
    const {exportFile} = useGameManager();
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';
    const isHost = isAdmin || auth?.authenticationLevel.toLowerCase() === 'host';
    const [showFilters, setShowFilters] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);
    const {addGame} = useGameManager();

    const handleAddGame = async (game: Partial<Game>) => {
        await addGame(game);
        setIsAddGameOpen(false);
    };

    const handleAddGameClick = () => setIsAddGameOpen(true);
    const handleExport = () => exportFile();

    const MenuItems = () => (
        <>
            {isAdmin && (
                <>
                    <DropdownMenuItem onClick={() => setShowImport(true)}>
                        <Upload className="w-4 h-4 mr-2"/> Import
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2"/> Export
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAddGameClick}>
                        <Plus className="w-4 h-4 mr-2"/> Add Game
                    </DropdownMenuItem>
                </>
            )}
            <DropdownMenuItem onClick={() => setShowFilters(true)}>
                <Filter className="w-4 h-4 mr-2"/> Filter & Sort
            </DropdownMenuItem>
        </>
    );

    return (
        <div
            className="fixed top-0 left-0 w-full bg-menubar-light dark:bg-menubar-dark text-white px-4 py-2 flex items-center justify-between z-10 shadow-lg">
            <div className="text-xl font-bold flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 inline-block mr-2"/>
                WUD Games
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-gray-400">
                        <MenuItems/>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Sun
                                className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                            <Moon
                                className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
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
                <LoginButton/>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2">
                {isAdmin && (
                    <>
                        <Button variant="outline" onClick={() => setShowImport(true)}
                                className="flex items-center gap-2">
                            <Upload className="w-4 h-4"/> Import
                        </Button>
                        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                            <Download className="w-4 h-4"/> Export
                        </Button>
                        <Button variant="outline" onClick={handleAddGameClick} className="flex items-center gap-2">
                            <Plus className="w-4 h-4"/> Add Game
                        </Button>
                    </>
                )}
                <Button variant="outline" onClick={() => setShowFilters(true)} className="flex items-center gap-2">
                    <Filter className="w-4 h-4"/> Filter & Sort
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Sun
                                className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                            <Moon
                                className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
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
                <LoginButton/>
            </div>

            <FilterPopup isOpen={showFilters} onClose={() => setShowFilters(false)}/>
            <ImportPopup isOpen={showImport} onClose={() => setShowImport(false)}/>
            {isAddGameOpen &&
                <AddGamePopup onSubmit={handleAddGame} isOpen={isAddGameOpen} onClose={() => setIsAddGameOpen(false)}/>}
        </div>
    );
};

const FilterPopup = ({isOpen, onClose}) => {
    const [filters, setFilters] = useState({
        name: '',
        genre: '',
        minPlaytime: '',
        playerCount: ''
    });
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const {updateFiltersAndSort} = useGameManager();

    const handleApply = () => {
        updateFiltersAndSort(filters, {field: sortField, direction: sortDirection});
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
                    <div>
                        <label className="block text-sm font-medium">Genre</label>
                        <input
                            type="text"
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={filters.genre}
                            onChange={(e) => setFilters({...filters, genre: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Playtime</label>
                        <input
                            type="number"
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={filters.minPlaytime}
                            onChange={(e) => setFilters({...filters, minPlaytime: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Player Count</label>
                        <input
                            type="number"
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={filters.playerCount}
                            onChange={(e) => setFilters({...filters, playerCount: e.target.value})}
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

const ImportPopup = ({isOpen, onClose}) => {
    const [file, setFile] = useState(null);
    const {importFile, loading} = useGameManager();

    const handleImport = () => {
        if (!file) return;
        importFile(file);
        onClose();
    };

    return (

        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Games</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <a href="importTemplate.csv" download="WUDGames-ImportTemplate">
                        <Button variant="outline">
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
    const {auth, login, logout, version} = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState({username: '', password: ''});
    const loginRef = useRef(null);
    const [appVersion, setAppVersion] = useState('Unknown');


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
        <div className="z-10 text-black">

            {!auth ? (
                <div className="relative" ref={loginRef}>
                    <Button onClick={() => setShowLogin(!showLogin)} className="flex items-center gap-2">
                        <LogIn className="w-4 h-4"/> Login
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
                                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="p-2 border rounded"
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                />
                                <Button type="submit">Login</Button>
                                <p className="text-xs">App version: {appVersion}</p>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <Button onClick={logout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4"/> Logout
                </Button>
            )}
        </div>
    );
};

// TODO: Redesign as needed, keep general card the same. Maybe use <CardHeader> for the image
const GameCard = ({key, game}) => {
    const {auth} = useAuth();
    const {deleteGame, checkout, returnGame, updateGame} = useGameManager();
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';
    const isHost = isAdmin || auth?.authenticationLevel.toLowerCase() === 'host';

    const handleEditGame = async (updatedGame: Partial<Game>) => {
        if (!editingGame) return;
        await updateGame(game.id, updatedGame);
        setEditingGame(null);
    };

    const handleDelete = async () => {
        deleteGame(game.id);
    };


    const openEditPopup = (game: Game) => {
        setEditingGame(game);
    };

    const closeEditPopup = () => {
        setEditingGame(null);
    };

    // Disable logic
    const isReturnDisabled = game.availableCopies === game.quantity;
    const isCheckoutDisabled = game.availableCopies === null || game.availableCopies <= 0;

    return (
        <>
            <Card className={`w-full max-w-sm relative flex flex-row  ${isHost ? "pb-12" : ""}`}>

                <div className="w-2/3 p-2 text-left">
                    <h3 className="text-lg font-bold">{game.name}</h3>
                    <p className="text-sm">
                        {game.minPlayerCount}
                        {game.minPlayerCount !== game.maxPlayerCount && `-${game.maxPlayerCount}`} players
                        | {game.minPlaytime}
                        {game.minPlaytime !== game.maxPlaytime && `-${game.maxPlaytime}`} minutes
                    </p>
                    <div className="max-h-16 overflow-y-auto">
                        <p className="mt-2 text-xs">{game.description}</p>
                    </div>
                    <p className="mt-2 text-sm">Genre: {game.genre}</p>
                    <p className="text-sm">Available: {game.availableCopies} / {game.quantity}</p>
                    {isHost && (
                        <>
                            <p className="text-sm">Times Checked Out: {game.checkoutCount}</p>
                            <p className="mt-2 text-sm italic">{game.internalNotes}</p>
                        </>
                    )}
                </div>
                <div className="relative w-1/3">
                    {game.boxImageUrl && (
                        <img
                            src={game.boxImageUrl || "/api/placeholder/200/200"}
                            alt={game.name}
                            className="w-full max-h-[85%] object-cover rounded-tr-lg text-center"
                        />)}
                </div>

                {isAdmin && (
                    <div
                        className="absolute bottom-0 rounded-tl-md right-0 px-2 py-2 border-t border-l flex justify-between gap-2">
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => openEditPopup(game)}>
                                    <Pencil className="w-4 h-4"/>
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                    </div>
                )}
            </Card>
            <EditGamePopup game={editingGame} onSubmit={handleEditGame} onClose={closeEditPopup} isOpen={editingGame}/>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent
                    className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Game</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{game.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}
                                           className="text-white bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};


// TODO: Replace game Manager
const GamesList = () => {
        const {games, loading} = useGameManager();

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-2 gap-y-6">
                {loading ? (
                        <Card className="w-full max-w-sm">
                            <CardHeader className="relative">
                                <Skeleton className="w-full h-48 object-cover bg-slate-500 rounded-t-lg"/>
                            </CardHeader>
                            <CardContent className="text-left space-y-2">
                                <Skeleton className="h-4 w-[250px] bg-slate-500"/>
                                <Skeleton className="h-4 w-[250px] bg-slate-500"/>
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

// TODO: Replace game manager
const ConsolegameMain = () => {

    return (
        <>
            <AuthProvider>
                <GameManagerProvider>
                    <div
                        className="min-h-screen p-8 antialiased text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark accent-blue-500">
                        <TopBar/>
                        <div className="min-h-screen p-8 pt-16"> {/* Added pt-16 for padding */}
                            <GamesList/>
                        </div>
                    </div>
                </GameManagerProvider>
            </AuthProvider>
        </>
    );
};

export default ConsolegameMain;