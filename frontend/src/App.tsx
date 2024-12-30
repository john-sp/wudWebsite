import React, { useState, useContext, createContext } from 'react';
import { Card, CardContent, CardHeader } from './components/ui/card.tsx';
import { Button } from './components/ui/button.tsx';
import { Pencil, Trash2, LogIn, LogOut, Plus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const AuthContext = createContext(null);

const TopBar = () => (
    <div className="fixed top-0 left-0 w-full bg-gray-900 text-white px-4 py-2 flex items-center justify-between z-10 shadow-lg">
        <div className="text-xl font-bold">
            <img src="/path/to/logo.png" alt="Logo" className="h-8 inline-block mr-2" />
            Wud Games
        </div>
    </div>
);


const AuthProvider = ({ children }) => {
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

const LoginButton = () => {
    const { auth, login, logout } = useContext(AuthContext);
    const [showLogin, setShowLogin] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleLogin = (e) => {
        e.preventDefault();
        login(credentials.username, credentials.password);
        setShowLogin(false);
    };

    return (
        <div className="fixed top-1 right-4 z-10">
            {!auth ? (
                <>
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
                                    onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="p-2 border rounded"
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                />
                                <Button type="submit">Login</Button>
                            </form>
                        </div>
                    )}
                </>
            ) : (
                <Button onClick={logout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                </Button>
            )}
        </div>
    );
};

const GameCard = ({ game }) => {
    const { auth } = useContext(AuthContext);
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';

    const handleDelete = async () => {
        try {
            await fetch(`${API_BASE_URL}/games/${game.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            // Handle successful deletion (e.g., refresh game list)
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="relative">
                <img
                    src={game.boxImageUrl || "/api/placeholder/200/200"}
                    alt={game.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                />
                {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2">
                        <Button variant="outline" size="icon">
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
                    {game.minPlayerCount}-{game.maxPlayerCount} players |
                    {game.minPlaytime}-{game.maxPlaytime} hours
                </p>
                <p className="mt-2">{game.description}</p>
                <p className="mt-2 text-sm">Genre: {game.genre}</p>
                <p className="text-sm">Available: {game.quantity - game.checkoutCount}</p>
                {(auth?.authenticationLevel.toLowerCase() === 'host' || auth?.authenticationLevel.toLowerCase() === 'admin') && (
                    <p className="mt-2 text-sm italic">{game.internalNotes}</p>
                )}
            </CardContent>
        </Card>
    );
};

const AddGamePopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [gameName, setGameName] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [minPlayerCount, setMinPlayerCount] = useState('');
    const [maxPlayerCount, setMaxPlayerCount] = useState('');
    const [playtime, setPlaytime] = useState('');
    const [maxPlaytime, setMaxPlaytime] = useState('');
    const [boxArtUrl, setBoxArtUrl] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameName) {
            // TODO: Send to backend
            console.log('Adding game:', { gameName, genre, minPlayerCount, playtime });
            onClose(); // Close the popup after submitting
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


const GamesList = ({onAddGameClick}: { onAddGameClick: () => void }) => {
    const [games, setGames] = useState([]);
    const {auth} = useContext(AuthContext);
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/games`)
            .then(res => res.json())
            .then(setGames);
    }, []);

    return (
        <div>
            {isAdmin && (
                <Button onClick={() => onAddGameClick()} className="mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Game
                </Button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map(game => (
                    <GameCard key={game.id} game={game} />
                ))}
            </div>
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
            <div className="min-h-screen bg-gray-100 p-8">
                <TopBar />
                <LoginButton />
                <div className="min-h-screen bg-gray-100 p-8 pt-16"> {/* Added pt-16 for padding */}
                    <GamesList onAddGameClick={handleAddGameClick}/>
                </div>
            </div>
            <AddGamePopup isOpen={isAddGameOpen} onClose={() => setIsAddGameOpen(false)} />
        </AuthProvider>
    );
};

export default App;
