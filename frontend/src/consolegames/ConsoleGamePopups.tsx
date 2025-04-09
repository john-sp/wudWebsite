import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
// Assuming ConsoleGenre is correctly defined in the context, otherwise define it here
import { ConsoleGame, Console, ConsoleGenre, useConsoleContext } from './ConsoleGameManagerContext';
import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';


interface GamePopupProps {
    isOpen: boolean;
    onClose: () => void;
    gameToEdit?: ConsoleGame | null;
}

export const GamePopup: React.FC<GamePopupProps> = ({ isOpen, onClose, gameToEdit }) => {
    // Ensure ConsoleGenre type is available, might need explicit import or definition if context doesn't export it clearly
    const { consoles, allGenres, createGame, updateGame } = useConsoleContext();
    const [formData, setFormData] = useState({
        name: '',
        boxImageUrl: '',
        description: '',
        releaseDate: '',
    });
    const [selectedConsoles, setSelectedConsoles] = useState<number[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newGenreInput, setNewGenreInput] = useState(''); // State for new genre input
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchSource, setSearchSource] = useState<'steam' | 'vgg'>('vgg');

    useEffect(() => {
        if (gameToEdit) {
            setFormData({
                name: gameToEdit.name || '',
                boxImageUrl: gameToEdit.boxImageUrl || '',
                description: gameToEdit.description || '',
                releaseDate: gameToEdit.releaseDate || ''
            });
            setSelectedConsoles(gameToEdit.consoles?.map(c => c.id) || []);
            setSelectedGenreIds(gameToEdit.genres?.map(g => g.id) || []);
            setNewGenreInput(''); // Reset new genre input when editing
            setSearchResults([]);
            setSearchQuery(gameToEdit.name || '');
        } else {
            // Reset form for new game
            setFormData({ name: '', boxImageUrl: '', description: '', releaseDate: ''}); // Default releaseDate removed for clarity
            setSelectedConsoles([]);
            setSelectedGenreIds([]);
            setNewGenreInput('');
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

    const handleGenreToggle = (genreId: number) => {
        setSelectedGenreIds(prev => prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || selectedConsoles.length === 0) return;
        setIsSubmitting(true);
        try {
            // Prepare payload matching backend ConsoleGameRequest
            const newGenreNames = newGenreInput.split(',')
                                              .map(name => name.trim())
                                              .filter(name => name.length > 0);

            const payload = {
                name: formData.name,
                boxImageUrl: formData.boxImageUrl,
                description: formData.description,
                releaseDate: formData.releaseDate,
                consoleIds: selectedConsoles,
                genreIds: selectedGenreIds, // IDs of existing genres selected via checkbox
                newGenreNames: newGenreNames // Names of new genres from input field
            };

            if (gameToEdit) {
                // Assuming updateGame is adapted to take the payload and ID
                await updateGame(gameToEdit.id, payload);
            } else {
                // Assuming createGame is adapted to take the payload
                await createGame(payload);
            }
            onClose(); // Close popup on success
        } catch (error) {
            console.error('Error saving game:', error);
            // Consider adding user feedback for the error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchResults([]); // Clear previous results
        try {
            let response;
            if (searchSource === 'steam') {
                response = await fetch(`/api/consoles/steam/search?name=${encodeURIComponent(searchQuery)}`);
            } else {
                response = await fetch(`/api/consoles/vgg/search?gameName=${encodeURIComponent(searchQuery)}`);
            }
            if (!response.ok) throw new Error(`Search failed with status: ${response.status}`);
            const data = await response.json();
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error fetching search data:', error);
            setSearchResults([]); // Ensure results are cleared on error
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = async (result: any) => {
        setIsSearching(true); // Indicate loading details
        try {
            let detailsUrl;
            if (searchSource === 'steam') {
                detailsUrl = `/api/consoles/steam/details?appId=${result.appid}`;
            } else {
                detailsUrl = `/api/consoles/vgg/details?id=${result.id}`;
            }
            const response = await fetch(detailsUrl);
            if (!response.ok) throw new Error(`Fetching details failed with status: ${response.status}`);
            const data = await response.json();

            // Update form data based on fetched details
            setFormData((prev) => ({
                ...prev,
                name: data.name || prev.name,
                boxImageUrl: (searchSource === 'steam' ? data.header_image : data.imageurl) || prev.boxImageUrl, // Correct VGG field might be imageurl
                description: (searchSource === 'steam' ? data.short_description : data.description) || prev.description,
                releaseDate: (searchSource === 'steam' ? data.release_date?.date : data.yearpublished?.toString()) || prev.releaseDate, // Ensure VGG year is string
            }));

            // --- Handle Genres from Steam ---
            if (searchSource === 'steam' && data.genres && Array.isArray(data.genres)) {
                const steamGenreNames = data.genres.map((g: any) => g.description.trim());
                // Ensure allGenres is an array before mapping
                const safeAllGenres = Array.isArray(allGenres) ? allGenres : [];
                const existingGenreMap = new Map<string, number>(safeAllGenres.map((g: ConsoleGenre) => [g.name.toLowerCase(), g.id]));
                const matchedGenreIds: number[] = [];
                const unmatchedGenreNames: string[] = [];

                steamGenreNames.forEach((name: string) => {
                    const lowerCaseName = name.toLowerCase();
                    const existingId = existingGenreMap.get(lowerCaseName);
                    if (existingId !== undefined) {
                         // Avoid duplicates if already selected
                        if (!matchedGenreIds.includes(existingId)) {
                           matchedGenreIds.push(existingId);
                        }
                    } else {
                        // Avoid duplicates in new names list (case-insensitive check)
                        if (!unmatchedGenreNames.some(un => un.toLowerCase() === lowerCaseName)) {
                           unmatchedGenreNames.push(name);
                        }
                    }
                });

                setSelectedGenreIds(matchedGenreIds); // Select existing genres found in Steam data
                setNewGenreInput(unmatchedGenreNames.join(', ')); // Put new/unmatched genres into the input
            } else {
                 // Clear genre selections if not Steam or no genres found
                 setSelectedGenreIds([]);
                 setNewGenreInput('');
            }
            // --- End Handle Genres ---
        } catch (error) {
            console.error('Error fetching details:', error);
             // Reset genres if details fetch fails
             setSelectedGenreIds(gameToEdit?.genres?.map(g => g.id) || []);
             setNewGenreInput('');
        } finally {
            setIsSearching(false); // Finish loading indicator
        }
        setShowSearch(false); // Go back to form view
    };

    // Ensure consoles and allGenres are arrays before rendering
    const safeConsoles: Console[] = Array.isArray(consoles) ? consoles : [];
    const safeAllGenres: ConsoleGenre[] = Array.isArray(allGenres) ? allGenres : [];


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"> {/* Added max height and scroll */}
                <DialogHeader>
                    <DialogTitle>{gameToEdit ? 'Edit Game' : 'Add New Game'}</DialogTitle>
                </DialogHeader>
                {showSearch ? (
                    <div className="space-y-4 p-1"> {/* Added padding */}
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder={`Search for a game on ${searchSource === 'steam' ? 'Steam' : 'VGG'}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Allow Enter key search
                                className="flex-1"
                                disabled={isSearching}
                            />
                            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                                {isSearching ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Searching... {/* Added ellipsis */}
                                    </>
                                ) : (
                                    `Search ${searchSource === 'steam' ? 'Steam' : 'VGG'}` // Simplified button text
                                )}
                            </Button>
                        </div>
                        {isSearching ? (
                             <div className="text-center py-4 text-muted-foreground">
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" /> Searching...
                             </div>
                        ) : searchResults.length > 0 ? (
                            <Card className="p-0 overflow-hidden">
                                <div className="max-h-60 overflow-y-auto"> {/* Increased max height */}
                                    <ul className="divide-y">
                                        {searchResults.map((result) => (
                                            <li
                                                key={result.appid || result.id}
                                                className="px-4 py-2 cursor-pointer hover:bg-muted transition-colors"
                                                onClick={() => handleSelectResult(result)}
                                            >
                                                <div className="font-medium">{result.name}</div>
                                                {/* Optionally add year or other info */}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        ) : searchQuery && !isSearching ? ( // Show only if search attempted
                            <div className="text-center py-4 text-muted-foreground">
                                No results found for "{searchQuery}".
                            </div>
                        ) : null}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowSearch(false)}
                            disabled={isSearching} // Disable back button while loading details
                        >
                            Back to Form
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 p-1"> {/* Added padding */}
                        {/* Name Input */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="game-name" className="text-right">Name</Label>
                            <Input id="game-name" name="name" value={formData.name} onChange={handleInputChange}
                                   className="col-span-3" required/>
                        </div>
                        {/* Box Image URL Input */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="game-image" className="text-right">Box Image URL</Label>
                            <Input id="game-image" name="boxImageUrl" value={formData.boxImageUrl}
                                   onChange={handleInputChange} className="col-span-3"
                                   placeholder="https://example.com/image.jpg"/>
                        </div>
                        {/* Description Textarea */}
                        <div className="grid grid-cols-4 gap-4">
                            <Label htmlFor="game-description" className="text-right self-start pt-2">Description</Label>
                            <Textarea id="game-description" name="description" value={formData.description}
                                      onChange={handleInputChange} className="col-span-3" rows={3}/>
                        </div>
                        {/* Release Date Input */}
                        <div className="grid grid-cols-4 items-center gap-4"> {/* Changed gap for alignment */}
                            <Label htmlFor="game-release" className="text-right">Release Info</Label> {/* Changed label */}
                            <Input id="game-release" name="releaseDate" value={formData.releaseDate}
                                      onChange={handleInputChange} className="col-span-3" placeholder="e.g., 2023 Q4, Jan 15, 2024"/> {/* Changed placeholder */}
                        </div>

                        {/* Genre Selection (Existing) */}
                        <div className="grid grid-cols-4 gap-4">
                            <Label className="text-right self-start pt-2">Genres</Label>
                            <div className="col-span-3 flex flex-col gap-2 max-h-32 overflow-y-auto border p-2 rounded-md">
                                {safeAllGenres.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic">No genres available.</div>
                                ) : (
                                    safeAllGenres.map((genre: ConsoleGenre) => (
                                        <div key={genre.id} className="flex items-center space-x-2">
                                            <Checkbox id={`genre-${genre.id}`}
                                                      checked={selectedGenreIds.includes(genre.id)}
                                                      onCheckedChange={() => handleGenreToggle(genre.id)}/>
                                            <Label htmlFor={`genre-${genre.id}`}
                                                   className="text-sm font-normal cursor-pointer">{genre.name}</Label> {/* Added cursor pointer */}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* New Genre Input */}
                        <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="new-genres" className="text-right">Add New Genres</Label>
                             <Input
                                 id="new-genres"
                                 name="newGenres"
                                 value={newGenreInput}
                                 onChange={(e) => setNewGenreInput(e.target.value)}
                                 className="col-span-3"
                                 placeholder="Action, RPG, Strategy (comma-separated)"
                             />
                        </div>

                        {/* Console Selection */}
                        <div className="grid grid-cols-4 gap-4">
                            <Label className="text-right self-start pt-2">Consoles</Label>
                            <div className="col-span-3 flex flex-col gap-2">
                                {safeConsoles.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic">No consoles available. Add one first.</div>
                                ) : (
                                    safeConsoles.map((console: Console) => ( // Added Console type
                                        <div key={console.id} className="flex items-center space-x-2">
                                            <Checkbox id={`console-${console.id}`}
                                                      checked={selectedConsoles.includes(console.id)}
                                                      onCheckedChange={() => handleConsoleToggle(console.id)}/>
                                            <Label htmlFor={`console-${console.id}`}
                                                   className="text-sm font-normal cursor-pointer">{console.name}</Label> {/* Added cursor pointer */}
                                        </div>
                                    ))
                                )}
                                {safeConsoles.length > 0 && selectedConsoles.length === 0 &&
                                    <p className="text-sm text-red-500">Please select at least one console.</p>}
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
                            <Button type="submit"
                                    disabled={isSubmitting || !formData.name.trim() || selectedConsoles.length === 0}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (gameToEdit ? 'Save Changes' : 'Add Game')}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};