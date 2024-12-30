import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './components/ui/card.tsx';
import { Button } from './components/ui/button.tsx';
import { Pencil, Trash2, LogIn, LogOut, Plus } from 'lucide-react';
import { GameManagerProvider, useGameManager } from "./GameManagerContext.tsx";
import { AuthProvider,useAuth } from './AuthContext.tsx';

// const API_BASE_URL = 'http://localhost:8080/api';

const TopBar = () => (
    <div className="fixed top-0 left-0 w-full bg-gray-900 text-white px-4 py-2 flex items-center justify-between z-10 shadow-lg">
        <div className="text-xl font-bold">
            <img src="/path/to/logo.png" alt="Logo" className="h-8 inline-block mr-2" />
            Wud Games
        </div>
    </div>
);


const LoginButton = ({ onAddGameClick }: { onAddGameClick: () => void }) => {
    const { auth, login, logout } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';

    const handleLogin = (e) => {
        e.preventDefault();
        login(credentials.username, credentials.password);
        setShowLogin(false);
    };

    return (
        <div className="fixed top-1 right-4 z-10 flex items-center gap-4">
            {isAdmin && (
                <>
                    <Button onClick={onAddGameClick} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Game
                    </Button>
                </>

            )}
            {!auth ? (
                <div className="relative">
                    <Button onClick={() => setShowLogin(!showLogin)} className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" /> Login
                    </Button>
                    {showLogin && (
                        <div className="absolute right-0 mt-2 p-4 bg-white rounded-lg shadow-lg">
                            <form onSubmit={handleLogin} className="flex flex-col gap-2">
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

const GameCard = ({ game }) => {
    const {auth} = useAuth();
    const { deleteGame } = useGameManager();
    const [isEditing, setIsEditing] = useState(false);
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';

    const handleDelete = async () => {
        deleteGame(game.id);
    };

    return (
        <>
            <Card className="w-full max-w-sm">
                <CardHeader className="relative">
                    <img
                        src={game.boxImageUrl || "/api/placeholder/200/200"}
                        alt={game.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-2 drop-shadow-sm drop-shadow">
                            <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="text-left">
                    <h3 className="text-lg font-bold">{game.name}</h3>
                    <p className="text-sm text-gray-600">
                        {game.minPlayerCount}-{game.maxPlayerCount} players
                        | {game.minPlaytime}-{game.maxPlaytime} hours
                    </p>
                    <p className="mt-2">{game.description}</p>
                    <p className="mt-2 text-sm">Genre: {game.genre}</p>
                    <p className="text-sm">Available: {game.availableCopies}</p>
                    <p className="text-sm">Times Checked Out: {game.checkoutCount}</p>
                    {(auth?.authenticationLevel.toLowerCase() === 'host' || auth?.authenticationLevel.toLowerCase() === 'admin') && (
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
        isOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-100">
                    <h2 className="text-2xl mb-4">Add a Game</h2>
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
                                placeholder="Minimum Player Count"
                                value={minPlayerCount}
                                onChange={(e) => setMinPlayerCount(e.target.value)}
                                className="p-2 border rounded"
                            />
                            <input
                                type="number"
                                placeholder="Maximum Player Count"
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
                            placeholder="Box Art URL (optional)"
                            value={boxArtUrl}
                            onChange={(e) => setBoxArtUrl(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <input
                            type="number"
                            placeholder="Quantity (optional)"
                            value={quantity}
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
                        <div className="flex justify-end gap-2">
                            <Button type="button" onClick={onClose}>Cancel</Button>
                            <Button type="submit" color="green">Add Game</Button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );
};

const EditGamePopup = ({ isOpen, game, onClose }: { isOpen: boolean, game: any, onClose: () => void }) => {
    const { updateGame } = useGameManager();
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
        <div>
            {loading ? (
                <p>Loading games...</p>
            ) :
                (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map(game => (
                    <GameCard key={game.id} game={game} />
                ))}
            </div>)}
        </div>
    );
};

const App = () => {
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);
    const handleAddGameClick = () => {
        setIsAddGameOpen(true);
    };

    return (
        <AuthProvider>
            <GameManagerProvider>
                <div className="min-h-screen bg-gray-100 p-8">
                    <TopBar />
                    <LoginButton  onAddGameClick={handleAddGameClick}/>
                    <div className="min-h-screen bg-gray-100 p-8 pt-16"> {/* Added pt-16 for padding */}
                        <GamesList/>
                    </div>
                </div>
                <AddGamePopup isOpen={isAddGameOpen} onClose={() => setIsAddGameOpen(false)} />
            </GameManagerProvider>
        </AuthProvider>
    );
};

export default App;
