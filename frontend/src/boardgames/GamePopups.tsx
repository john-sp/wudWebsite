import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
            setSearchQuery(game.name);
        } else {
            setFormData({});
            setSearchQuery('');
        }
    }, [game, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value === ''
                ? undefined
                : name.includes('PlayerCount') || name.includes('Playtime') || name === 'quantity'
                    ? parseInt(value)
                    : value,
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
            setFormData((prev) => ({
                ...prev,
                name: data.name,
                boxImageUrl: data.imageurl || prev.boxImageUrl,
                description: data.short_description || prev.description,
                minPlayerCount: data.minplayers,
                maxPlayerCount: data.maxplayers,
                maxPlaytime: data.maxplaytime,
                minPlaytime: data.minplaytime,
            }));
        } catch (error) {
            console.error('Error fetching BGG data:', error);
            setError('Failed to fetch data from BoardGameGeek.');
        } finally {
            setIsSearching(false);
        }

        setShowBGGSearch(false);
    };

    const handleDialogChange = (open: boolean) => {
        if (!open) onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{game ? `Edit ${game.name || 'Game'}` : 'Add Game'}</DialogTitle>
                    <DialogDescription>
                        {showBGGSearch
                            ? "Search for a game using BoardGameGeek. Populates name, playtime and player count."
                            : "Adjust fields as needed."}
                    </DialogDescription>
                </DialogHeader>

                {showBGGSearch ? (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search for a game on BGG"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={searchBGG} disabled={isSearching}>
                                {isSearching ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Searching
                                    </>
                                ) : (
                                    "Search"
                                )}
                            </Button>
                        </div>

                        {searchResults.length > 0 ? (
                            <Card className="p-0 overflow-hidden">
                                <div className="max-h-48 overflow-y-auto">
                                    <ul className="divide-y">
                                        {searchResults.map((result) => (
                                            <li
                                                key={result.id}
                                                className="px-4 py-2 cursor-pointer hover:bg-muted transition-colors"
                                                onClick={() => handleSelectBGGResult(result)}
                                            >
                                                <div className="font-medium">{result.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {result.yearpublished}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        ) : isSearching ? (
                            <div className="text-center py-4 text-muted-foreground">
                                Searching BoardGameGeek...
                            </div>
                        ) : searchQuery && !isSearching ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No results found. Try a different search term.
                            </div>
                        ) : null}

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowBGGSearch(false)}
                        >
                            Back to Form
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Game Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Game Name (required)"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Description (optional)"
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    maxLength={1024}
                                    className="resize-none min-h-20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="genre">Genre</Label>
                                <Input
                                    id="genre"
                                    type="text"
                                    placeholder="Genre (optional)"
                                    name="genre"
                                    value={formData.genre || ''}
                                    onChange={handleChange}
                                    maxLength={256}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minPlayerCount">Min Players</Label>
                                    <Input
                                        id="minPlayerCount"
                                        type="number"
                                        placeholder="Minimum Players"
                                        name="minPlayerCount"
                                        value={formData.minPlayerCount != undefined ? formData.minPlayerCount.toString() : ''}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxPlayerCount">Max Players</Label>
                                    <Input
                                        id="maxPlayerCount"
                                        type="number"
                                        placeholder="Maximum Players"
                                        name="maxPlayerCount"
                                        value={formData.maxPlayerCount != undefined ? formData.maxPlayerCount.toString() : ''}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minPlaytime">Min Time (min)</Label>
                                    <Input
                                        id="minPlaytime"
                                        type="number"
                                        placeholder="Minimum Playtime"
                                        name="minPlaytime"
                                        value={formData.minPlaytime != undefined ? formData.minPlaytime.toString() : ''}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxPlaytime">Max Time (min)</Label>
                                    <Input
                                        id="maxPlaytime"
                                        type="number"
                                        placeholder="Maximum Playtime"
                                        name="maxPlaytime"
                                        value={formData.maxPlaytime != undefined ? formData.maxPlaytime.toString() : ''}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="boxImageUrl">Box Image URL</Label>
                                <Input
                                    id="boxImageUrl"
                                    type="text"
                                    placeholder="Box Image URL (optional)"
                                    name="boxImageUrl"
                                    value={formData.boxImageUrl || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    placeholder="Quantity (optional)"
                                    name="quantity"
                                    value={formData.quantity != undefined ? formData.quantity.toString() : ''}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="internalNotes">Internal Notes</Label>
                                <Input
                                    id="internalNotes"
                                    type="text"
                                    placeholder="Internal Notes (optional)"
                                    name="internalNotes"
                                    value={formData.internalNotes || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                            <div className="w-full flex justify-between gap-2">
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowBGGSearch(true)}
                                    className="flex-1"
                                >
                                    Match from BGG
                                </Button>
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {game ? 'Saving...' : 'Adding...'}
                                    </>
                                ) : (
                                    game ? 'Save' : 'Add'
                                )}
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