import React, {useState, useEffect, useRef} from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {Pencil, Trash2, Plus, Minus, BarChart, RefreshCw, Filter, Upload, Download, X} from 'lucide-react';
import {Game, GameManagerProvider, useGameManager} from "./GameManagerContext";
import { AuthProvider,useAuth } from '@/AuthContext';

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

interface Filters {
    name: string;
    genre: string;
    minPlaytime?: number;
    playerCount?: number;
}
interface GameCardProps {
    game: Game;
}

export const BoardGameNav = ({ isAdmin, isHost, onAddGame, onExport, setShowImport, setShowStats, setShowFilters, setShowReturnAll }) => (
    <div className="flex gap-2">
        {isAdmin && (
            <>
                <Button variant="outline" onClick={() => setShowImport(true)} className="flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Import Board Games
                </Button>
                <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Board Games
                </Button>
                <Button variant="outline" onClick={onAddGame} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Board Game
                </Button>
            </>
        )}
        {isHost && (
            <>
                <Button variant="outline" onClick={() => setShowReturnAll(true)} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Return All
                </Button>
                <Button variant="outline" onClick={() => setShowStats(true)} className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" /> Board Game Stats
                </Button>
            </>
        )}
        <Button variant="outline" onClick={() => setShowFilters(true)} className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter Board Games
        </Button>
    </div>
);

export const StatsPopup = ({ isOpen, onClose }) => {
    const [stats, setStats] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { fetchGameStats } = useGameManager();

    useEffect(() => {
        if (isOpen) {
            setStats(null);
            (async () => {
                const data = await fetchGameStats({ startDate, endDate });
                setStats(data);
            })();
        }
    }, [isOpen, startDate, endDate, fetchGameStats]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
            setStartDate(value);
        } else if (name === 'endDate') {
            setEndDate(value);
        }
    };

    if (!isOpen) return null;

    return  (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-background-light dark:bg-background-dark">
                <DialogHeader>
                    <DialogTitle className="text-text-light dark:text-text-dark">Game Library Statistics</DialogTitle>
                    <DialogDescription>
                        View statistics that we track about games over a period of time
                    </DialogDescription>
                </DialogHeader>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-light dark:text-text-dark">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={startDate}
                            onChange={handleDateChange}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-light dark:text-text-dark">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={handleDateChange}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm"
                        />
                    </div>
                </div>
                {stats ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <h3 className="font-bold text-text-light dark:text-text-dark">Total Checkouts</h3>
                            <p className="text-text-light dark:text-text-dark">{stats.totalCheckouts}</p>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <h3 className="font-bold text-text-light dark:text-text-dark">Most Popular Game</h3>
                            <p className="text-text-light dark:text-text-dark">{stats.mostPopularGameName}</p>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <h3 className="font-bold text-text-light dark:text-text-dark">Average Games Checkout</h3>
                            <p className="text-text-light dark:text-text-dark">{stats.averageGamesCheckout.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <h3 className="font-bold text-text-light dark:text-text-dark">Most Popular Game Night</h3>
                            <p className="text-text-light dark:text-text-dark">{stats.mostPopularGameNight}</p>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <h3 className="font-bold text-text-light dark:text-text-dark">Average Players Per Game</h3>
                            <p className="text-text-light dark:text-text-dark">{stats.averagePlayersPerGame.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <h3 className="font-bold text-text-light dark:text-text-dark">Average Playtime Per Game</h3>
                            <p className="text-text-light dark:text-text-dark">{stats.averagePlaytimePerGame.toFixed(2)} mins</p>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <h3 className="font-bold text-text-light dark:text-text-dark">Total Available Copies</h3>
                            <p className="text-text-light dark:text-text-dark">{stats.totalAvailableCopies}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <Skeleton className="h-6 w-32"/>
                            <Skeleton className="h-4 w-24 mt-2"/>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <Skeleton className="h-6 w-32"/>
                            <Skeleton className="h-4 w-24 mt-2"/>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <Skeleton className="h-6 w-32"/>
                            <Skeleton className="h-4 w-24 mt-2"/>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <Skeleton className="h-6 w-32"/>
                            <Skeleton className="h-4 w-24 mt-2"/>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <Skeleton className="h-6 w-32"/>
                            <Skeleton className="h-4 w-24 mt-2"/>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <Skeleton className="h-6 w-32"/>
                            <Skeleton className="h-4 w-24 mt-2"/>
                        </div>
                        <div className="p-4 bg-popover-light dark:bg-popover-dark rounded">
                            <Skeleton className="h-6 w-32"/>
                            <Skeleton className="h-4 w-24 mt-2"/>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export const FilterPopup = ({ isOpen, onClose }) => {
    const [filters, setFilters] = useState<Filters>({
        name: "",
        genre: "",
        minPlaytime: undefined,
        playerCount: undefined,
    });

    const [sortField, setSortField] = useState<"name" | "minPlayerCount" | "minPlaytime" | "checkoutCount">("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const { updateFiltersAndSort } = useGameManager();

    const handleApply = () => {
        updateFiltersAndSort(filters, { field: sortField, direction: sortDirection });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]" >
                <DialogHeader>
                    <DialogTitle>Filter & Sort Games</DialogTitle>
                    <DialogDescription>
                        Adjust filters and sorting to refine the game list.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={filters.name}
                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Genre</label>
                        <input
                            type="text"
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={filters.genre}
                            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Playtime</label>
                        <input
                            type="number"
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={filters.minPlaytime ?? ""}
                            onChange={(e) =>
                                setFilters({ ...filters, minPlaytime: e.target.value ? parseInt(e.target.value, 10) : undefined })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Player Count</label>
                        <input
                            type="number"
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={filters.playerCount ?? ""}
                            onChange={(e) =>
                                setFilters({ ...filters, playerCount: e.target.value ? parseInt(e.target.value, 10) : undefined })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Sort By</label>
                        <select
                            className="mt-1 w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value as "name" | "minPlayerCount" | "minPlaytime" | "checkoutCount")}
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
                            onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
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

const InlineFilters = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [filters, setFilters] = useState({
        name: "",
        genre: "",
        playtime: undefined,
        playerCount: undefined,
    });
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");

    const { updateFiltersAndSort } = useGameManager();

    // Update filters whenever they change
    useEffect(() => {
        updateFiltersAndSort(filters, { field: sortField, direction: sortDirection });
    }, [filters, sortField, sortDirection]);

    const handleClick = () => {
        if (isVisible) {
            // If filters are visible, clicking means we want to clear and close
            setFilters({
                name: "",
                genre: "",
                playtime: undefined,
                playerCount: undefined,
            });
            setSortField("name");
            setSortDirection("asc");
        }
        // Toggle visibility
        setIsVisible(!isVisible);
    };

    return (
        <div className="space-y-2">
            <Button
                variant="outline"
                onClick={() => handleClick()}
                className="flex items-center gap-2"
            >
                {isVisible ? (
                    <>
                        <X className="w-4 h-4" /> Clear Filters
                    </>
                ) : (
                    <>
                        <Filter className="w-4 h-4" /> Filter
                    </>
                )}
            </Button>

            <div className={`grid gap-4 transition-all duration-300 ease-in-out origin-top ${
                isVisible
                    ? 'grid-rows-[1fr] opacity-100 max-h-[500px]'
                    : 'grid-rows-[0fr] opacity-0 max-h-0'
            }`}>
                <div className="overflow-hidden">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-card rounded-lg shadow-sm">
                        {/* Filter Fields */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                                value={filters.name}
                                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                placeholder="Search by name..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Genre</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                                value={filters.genre}
                                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                                placeholder="Filter by genre..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Playtime</label>
                            <input
                                type="number"
                                className="w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                                value={filters.playtime ?? ""}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    playtime: e.target.value ? parseInt(e.target.value, 10) : undefined
                                })}
                                placeholder="Playtime..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Player Count</label>
                            <input
                                type="number"
                                className="w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                                value={filters.playerCount ?? ""}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    playerCount: e.target.value ? parseInt(e.target.value, 10) : undefined
                                })}
                                placeholder="Number of players..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sort By</label>
                            <select
                                className="w-full p-2 bg-background-light dark:bg-background-dark border rounded"
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
                            <label className="block text-sm font-medium mb-1">Order</label>
                            <select
                                className="w-full p-2 bg-background-light dark:bg-background-dark border rounded"
                                value={sortDirection}
                                onChange={(e) => setSortDirection(e.target.value)}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ReturnAllPopup = ({isOpen, onClose}) => {
    const {returnAllGames} = useGameManager();
    const [stats, setStats] = useState(null);
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setStats(null);
            try{
                (async () => {
                    const data = await returnAllGames();
                    setStats(data);
                })();}
            catch (error) {
                setErrors(error);
            }
        }
    }, [isOpen, returnAllGames]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Games Marked as Returned</DialogTitle>
                    <DialogDescription>
                        These games were not marked as returned already, do you have extra wiscards?
                    </DialogDescription>
                </DialogHeader>
                {!stats ? (
                    <div>
                        <Skeleton className="h-6 mb-2 bg-slate-500" />
                        <Skeleton className="h-6 mb-2 bg-slate-500 " />
                        <Skeleton className="h-6 mb-2 bg-slate-500" />
                        <Skeleton className="h-6 mb-2 bg-slate-500" />
                        <Skeleton className="h-6 mb-2 bg-slate-500" />
                    </div>
                ) : errors ? (
                    <p className="error">Error: {errors}</p>
                ) : stats.length === 0 ? (
                    // If no games are returned, show a custom message
                    <p>No games were updated.</p>
                ) : (
                    <div className="games-list overflow-y-auto max-h-96">
                        <ul>
                            {stats.map(game => (
                                <li key={game.id}>
                                    <strong>{game.name}</strong> - Quantity: {game.quantity}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export const ImportPopup = ({isOpen, onClose}) => {
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
                    <DialogDescription>
                        Easy way to add lots of games to the database. Duplicates (by name) are skipped.
                    </DialogDescription>
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

const GameCard: React.FC<GameCardProps> = ({ game }) => {
    const { auth } = useAuth();
    const { deleteGame, checkout, returnGame, updateGame } = useGameManager();
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

    const handleCheckout = async () => {
        checkout(game.id);
    };

    const handleReturn = async () => {
        returnGame(game.id);
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

                {isHost && (
                    <div
                        className="absolute bottom-0 rounded-tl-md right-0 px-2 py-2 border-t border-l flex justify-between gap-2">
                        {isAdmin && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => openEditPopup(game)}>
                                    <Pencil className="w-4 h-4"/>
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                title="Checkout Game"
                                variant="constructive"
                                size="icon"
                                onClick={handleCheckout}
                                disabled={isCheckoutDisabled}
                            >
                                <Plus className="w-4 h-4"/>
                            </Button>
                            <Button
                                title="Return Game"
                                variant="destructive"
                                size="icon"
                                onClick={handleReturn}
                                disabled={isReturnDisabled}
                            >
                                <Minus className="w-4 h-4"/>
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
                        <AlertDialogAction onClick={handleDelete} className="text-white bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
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

const BoardgameMain = () => {
    const { auth } = useAuth();
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';
    const isHost = isAdmin || auth?.authenticationLevel.toLowerCase() === 'host';
    const [showStats, setShowStats] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);
    const [showReturnAll, setShowReturnAll] = useState(false);
    const {exportFile, addGame} = useGameManager();

    const handleExport = () => exportFile();
    const handleAddGame = async (game: Partial<Game>) => {
        await addGame(game);
        setIsAddGameOpen(false);
    };

    return (

            <div className="min-h-screen p-8 pt-16">
                {/* Section Controls */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {isAdmin && (
                        <>
                            <Button variant="outline" onClick={() => setShowImport(true)}
                                    className="flex items-center gap-2">
                                <Upload className="w-4 h-4"/> Import
                            </Button>
                            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                                <Download className="w-4 h-4"/> Export
                            </Button>
                            <Button variant="outline" onClick={() => setIsAddGameOpen(true)}
                                    className="flex items-center gap-2">
                                <Plus className="w-4 h-4"/> Add Game
                            </Button>
                        </>
                    )}
                    {isHost && (
                        <>
                            <Button variant="outline" onClick={() => setShowReturnAll(true)}
                                    className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4"/> Return All
                            </Button>
                            <Button variant="outline" onClick={() => setShowStats(true)}
                                    className="flex items-center gap-2">
                                <BarChart className="w-4 h-4"/> Stats
                            </Button>
                        </>
                    )}
                     <InlineFilters/>
                </div>


                {/* Games List */}
                <GamesList/>

                {/* Popups */}
                <StatsPopup isOpen={showStats} onClose={() => setShowStats(false)}/>
                <ReturnAllPopup isOpen={showReturnAll} onClose={() => setShowReturnAll(false)}/>
                {/*<FilterPopup isOpen={showFilters} onClose={() => setShowFilters(false)}/>*/}
                <ImportPopup isOpen={showImport} onClose={() => setShowImport(false)}/>
                {isAddGameOpen && (
                    <AddGamePopup
                        onSubmit={handleAddGame}
                        isOpen={isAddGameOpen}
                        onClose={() => setIsAddGameOpen(false)}
                    />
                )}
            </div>
    );
};

export default BoardgameMain;