import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Game {
    id: number;
    name: string;
    genre?: string;
    description?: string;
    minPlayerCount?: number;
    maxPlayerCount?: number;
    minPlaytime?: number;
    maxPlaytime?: number;
    boxImageUrl?: string;
    quantity?: number;
    internalNotes?: string;
}

interface GamePopupProps {
    isOpen: boolean;
    onClose: () => void;
    game?: Game; // Optional for AddGamePopup
    onSubmit: (data: Partial<Game>) => Promise<void>;
}

const GamePopup: React.FC<GamePopupProps> = ({ isOpen, onClose, game, onSubmit }) => {
    const [formData, setFormData] = useState<Partial<Game>>(game || {});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showBGGSearch, setShowBGGSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (game) {
            setFormData(game); // Initialize formData when the dialog opens
            setSearchQuery(formData.name);
        } else {
            setFormData({});
        }
    }, [game]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value === '' ? undefined : name.includes('PlayerCount') || name.includes('Playtime') || name === 'quantity' ? parseInt(value) : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onSubmit(formData as Partial<Game>);
            onClose();
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const searchBGG = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`/api/bgg/search?gameName=${searchQuery}`);
            const data = await response.json();
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error fetching BGG data:', error);
            setError('Failed to fetch data from BoardGameGeek.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectBGGResult = async (selectedGame: any) => {

        try {
            const response = await fetch(`/api/bgg/details?id=${selectedGame.id}`);
            const data = await response.json();
            const data2 = data.items[0];
            setFormData((prev) => ({
                ...prev,
                name: data2.name,
                boxImageUrl: data2.thumbnail || prev.boxImageUrl,
                minPlayerCount: data2.minPlayers,
                maxPlayerCount: data2.maxPlayers,
                maxPlaytime: data2.maxPlaytime,
                minPlaytime: data2.minPlaytime,
            }));
        } catch (error) {
            console.error('Error fetching BGG data:', error);
            setError('Failed to fetch data from BoardGameGeek.');
        } finally {
            setIsSearching(false);
        }


        setFormData((prev) => ({
            ...prev,
            name: selectedGame.name,
            description: selectedGame.description || prev.description,
        }));
        setShowBGGSearch(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{game ? `Edit ${game.name || 'Game'}` : 'Add Game'}</DialogTitle>
                </DialogHeader>

                {showBGGSearch ? (
                        <div>
                            <input
                                type="text"
                                placeholder="Search for a game on BGG"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="p-2 w-full border rounded mb-2"
                            />
                            <Button onClick={searchBGG} disabled={isSearching}>
                                Search
                            </Button>
                            <ul className="mt-4 max-h-48 overflow-y-auto">
                                {searchResults.map((result) => (
                                    <li
                                        key={result.id}
                                        className="p-2 border-b cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSelectBGGResult(result)}
                                    >
                                        <strong>{result.name}</strong> ({result.yearpublished})
                                    </li>
                                ))}
                            </ul>
                            <Button variant="secondary" className="mt-4" onClick={() => setShowBGGSearch(false)}>
                                Back to Form
                            </Button>
                        </div>
                        ) : (
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-y-2 w-full">
                        <input
                            type="text"
                            placeholder="Game Name (required)"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                            className="p-2 w-full border rounded"
                        />
                        <textarea
                            placeholder="Description (optional)"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            maxLength={1024}
                            className="p-2 w-full border rounded resize-none overflow-hidden"
                            rows={1}
                            ref={(textarea) => {
                                if (textarea) {
                                    textarea.style.height = 'auto'; // Reset height to recalculate
                                    textarea.style.height = `${textarea.scrollHeight}px`; // Adjust to content
                                }
                            }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto'; // Reset height to recalculate
                                target.style.height = `${target.scrollHeight}px`; // Adjust to content
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Genre (optional)"
                            name="genre"
                            value={formData.genre || ''}
                            onChange={handleChange}
                            maxLength={256}
                            className="p-2 w-full border rounded"
                        />
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <input
                                type="number"
                                placeholder="Minimum Players"
                                name="minPlayerCount"
                                value={formData.minPlayerCount !== undefined ? formData.minPlayerCount.toString() : ''}
                                onChange={handleChange}
                                min="0"
                                className="p-2 border rounded"
                            />
                            <input
                                type="number"
                                placeholder="Maximum Players"
                                name="maxPlayerCount"
                                value={formData.maxPlayerCount !== undefined ? formData.maxPlayerCount.toString() : ''}
                                onChange={handleChange}
                                min="0"
                                className="p-2 border rounded"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <input
                                type="number"
                                placeholder="Minimum Playtime"
                                name="minPlaytime"
                                value={formData.minPlaytime !== undefined ? formData.minPlaytime.toString() : ''}
                                onChange={handleChange}
                                min="0"
                                className="p-2 border rounded"
                            />
                            <input
                                type="number"
                                placeholder="Maximum Playtime"
                                name="maxPlaytime"
                                value={formData.maxPlaytime !== undefined ? formData.maxPlaytime.toString() : ''}
                                onChange={handleChange}
                                min="0"
                                className="p-2 border rounded"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Box Image URL (optional)"
                            name="boxImageUrl"
                            value={formData.boxImageUrl || ''}
                            onChange={handleChange}
                            className="p-2 w-full border rounded"
                        />
                        <input
                            type="number"
                            placeholder="Quantity (optional)"
                            name="quantity"
                            value={formData.quantity !== undefined ? formData.quantity.toString() : ''}
                            onChange={handleChange}
                            min="0"
                            className="p-2 w-full border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Internal Notes (optional)"
                            name="internalNotes"
                            value={formData.internalNotes || ''}
                            onChange={handleChange}
                            className="p-2 w-full border rounded"
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setShowBGGSearch(true)}>
                            Match from BGG
                        </Button>
                        <Button type="submit" disabled={isLoading} loading={isLoading}>
                            {game ? 'Save' : 'Add'}
                        </Button>
                    </DialogFooter>
                </form>
                    )}
            </DialogContent>
        </Dialog>
    );
};

export const AddGamePopup: React.FC<Omit<GamePopupProps, 'game'>> = ({ isOpen, onClose, onSubmit }) => (
    <GamePopup isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} />
);

export const EditGamePopup: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    game: Game;
    onSubmit: (data: Partial<Game>) => Promise<void>;
}> = ({ isOpen, onClose, game, onSubmit }) => (
    <GamePopup isOpen={isOpen} onClose={onClose} game={game} onSubmit={onSubmit} />
);