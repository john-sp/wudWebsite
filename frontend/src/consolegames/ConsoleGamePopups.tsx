import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ConsoleGame, useConsoleContext } from './ConsoleGameManagerContext';

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
        description: '',
        internalNotes: ''
    });
    const [selectedConsoles, setSelectedConsoles] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (gameToEdit) {
            setFormData({
                name: gameToEdit.name,
                boxImageUrl: gameToEdit.boxImageUrl,
                description: gameToEdit.description,
                internalNotes: gameToEdit.internalNotes
            });
            setSelectedConsoles(gameToEdit.consoles.map(console => console.id));
        } else {
            setFormData({ name: '', boxImageUrl: '', description: '', internalNotes: '' });
            setSelectedConsoles([]);
        }
    }, [gameToEdit]);

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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{gameToEdit ? 'Edit Game' : 'Add New Game'}</DialogTitle>
                </DialogHeader>
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
                        <Label htmlFor="game-notes" className="text-right self-start pt-2">Internal Notes</Label>
                        <Textarea id="game-notes" name="internalNotes" value={formData.internalNotes} onChange={handleInputChange} className="col-span-3" rows={2} />
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
                        <Button type="submit" disabled={isSubmitting || !formData.name.trim() || selectedConsoles.length === 0}>{isSubmitting ? 'Saving...' : gameToEdit ? 'Save Changes' : 'Add Game'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
