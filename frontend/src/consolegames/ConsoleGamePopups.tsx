import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ConsoleGame, useConsoleContext } from './ConsoleGameManagerContext';
import {Card} from "@/components/ui/card";
import { Loader2 } from 'lucide-react';


interface GamePopupProps {
    isOpen: boolean;
    onClose: () => void;
    gameToEdit?: ConsoleGame | null;
}

export const GamePopup: React.FC<GamePopupProps> = ({ isOpen, onClose, gameToEdit }) => {
    const { consoles, createGame, updateGame } = useConsoleContext();
    const [formData, setFormData] = useState({
        name: '',
        boxImageUrl: '',
        description: ''
    });
    const [selectedConsoles, setSelectedConsoles] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchSource, setSearchSource] = useState<'steam' | 'vgg'>('vgg');

    useEffect(() => {
        if (gameToEdit) {
            setFormData({
                name: gameToEdit.name,
                boxImageUrl: gameToEdit.boxImageUrl,
                description: gameToEdit.description
            });
            setSelectedConsoles(gameToEdit.consoles.map(console => console.id));
            setSearchResults([]);
            setSearchQuery(gameToEdit.name);
        } else {
            setFormData({ name: '', boxImageUrl: '', description: ''});
            setSelectedConsoles([]);
            setSearchResults([]);
            setSearchQuery('');
        }
    }, [gameToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConsoleToggle = (consoleId: number) => {
        setSelectedConsoles(prev => prev.includes(consoleId) ? prev.filter(id => id !== consoleId) : [...prev, consoleId]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || selectedConsoles.length === 0) return;
        setIsSubmitting(true);
        try {
            const gameData: ConsoleGame = {
                ...formData,
                id: gameToEdit?.id ?? 0,
                consoles: consoles.filter(console => selectedConsoles.includes(console.id))
            };
            if (gameToEdit) {
                await updateGame(gameToEdit.id, gameData);
            } else {
                await createGame(gameData);
            }
            onClose();
        } catch (error) {
            console.error('Error saving game:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            let response;
            if (searchSource === 'steam') {
                response = await fetch(`/api/consoles/steam/search?name=${searchQuery}`);
            } else {
                response = await fetch(`/api/consoles/vgg/search?gameName=${searchQuery}`);
            }
            const data = await response.json();
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = async (result: any) => {
        try {
            let detailsUrl;
            if (searchSource === 'steam') {
                detailsUrl = `/api/consoles/steam/details?appId=${result.appid}`;
            } else {
                detailsUrl = `/api/consoles/vgg/details?id=${result.id}`;
            }
            const response = await fetch(detailsUrl);
            const data = await response.json();
            setFormData((prev) => ({
                ...prev,
                name: data.name || prev.name,
                boxImageUrl: (searchSource === 'steam' ? data.header_image : data.topimageurl) || prev.boxImageUrl,
                description: data.short_description || prev.description
            }));
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setIsSearching(false);
        }
        setShowSearch(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{gameToEdit ? 'Edit Game' : 'Add New Game'}</DialogTitle>
                </DialogHeader>
                {showSearch ? (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder={`Search for a game on ${searchSource === 'steam' ? 'Steam' : 'VGG'}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={handleSearch} disabled={isSearching}>
                                {isSearching ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Searching
                                    </>
                                ) : (
                                    `Search with ${searchSource === 'steam' ? 'Steam' : 'VGG'}`
                                )}
                            </Button>
                        </div>
                        {searchResults.length > 0 ? (
                            <Card className="p-0 overflow-hidden">
                                <div className="max-h-48 overflow-y-auto">
                                    <ul className="divide-y">
                                        {searchResults.map((result) => (
                                            <li
                                                key={result.appid || result.id}
                                                className="px-4 py-2 cursor-pointer hover:bg-muted transition-colors"
                                                onClick={() => handleSelectResult(result)}
                                            >
                                                <div className="font-medium">{result.name}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        ) : isSearching ? (
                            <div className="text-center py-4 text-muted-foreground">
                                Searching {searchSource === 'steam' ? 'Steam...' : 'VGG...'}
                            </div>
                        ) : searchQuery && !isSearching ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No results found. Try a different search term.
                            </div>
                        ) : null}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowSearch(false)}
                        >
                            Back to Form
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="game-name" className="text-right">Name</Label>
                            <Input id="game-name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="game-image" className="text-right">Box Image URL</Label>
                            <Input id="game-image" name="boxImageUrl" value={formData.boxImageUrl} onChange={handleInputChange} className="col-span-3" placeholder="https://example.com/image.jpg" />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <Label htmlFor="game-description" className="text-right self-start pt-2">Description</Label>
                            <Textarea id="game-description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" rows={3} />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <Label className="text-right self-start pt-2">Consoles</Label>
                            <div className="col-span-3 flex flex-col gap-2">
                                {consoles.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic">No consoles available. Add a console first.</div>
                                ) : (
                                    consoles.map(console => (
                                        <div key={console.id} className="flex items-center space-x-2">
                                            <Checkbox id={`console-${console.id}`} checked={selectedConsoles.includes(console.id)} onCheckedChange={() => handleConsoleToggle(console.id)} />
                                            <Label htmlFor={`console-${console.id}`} className="text-sm font-normal">{console.name}</Label>
                                        </div>
                                    ))
                                )}
                                {consoles.length > 0 && selectedConsoles.length === 0 && <p className="text-sm text-red-500">Please select at least one console</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearchSource("steam");
                                    setShowSearch(true);
                                }}
                            >
                                Search Steam
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearchSource("vgg");
                                    setShowSearch(true);
                                }}
                            >
                                Search VGG
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !formData.name.trim() || selectedConsoles.length === 0}>{isSubmitting ? 'Saving...' : gameToEdit ? 'Save Changes' : 'Add Game'}</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};