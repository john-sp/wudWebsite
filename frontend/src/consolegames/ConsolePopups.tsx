import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Plus, Pencil, Trash } from 'lucide-react';
import {ConsoleProvider, useConsoleContext} from "@/consolegames/ConsoleGameManagerContext";


const ConsolePopups = () => {
    const { consoles, createConsole, updateConsole, deleteConsole } = useConsoleContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newConsoleName, setNewConsoleName] = useState('');
    const [currentConsole, setCurrentConsole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isVisible, setIsVisible] = useState(false);

    const handleCreateConsole = async () => {
        if (!newConsoleName.trim()) return;

        setIsLoading(true);
        try {
            await createConsole({ name: newConsoleName });
            setNewConsoleName('');
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to create console:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditConsole = async () => {
        if (!newConsoleName.trim() || !currentConsole) return;

        setIsLoading(true);
        try {
            await updateConsole(currentConsole.id, { ...currentConsole, name: newConsoleName });
            setNewConsoleName('');
            setCurrentConsole(null);
            setIsEditOpen(false);
        } catch (error) {
            console.error('Failed to update console:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConsole = async (id) => {
        setIsLoading(true);
        try {
            await deleteConsole(id);
        } catch (error) {
            console.error('Failed to delete console:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openEditDialog = (console) => {
        setCurrentConsole(console);
        setNewConsoleName(console.name);
        setIsEditOpen(true);
    };

    return (
        <div className="w-full">
            <Button
                onClick={() =>
                    setIsVisible(!isVisible)}
                className="mb-4"
            >
                <Plus className="mr-2 h-4 w-4" /> Manage Consoles
            </Button>

            {/* Create Console Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Console</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                        <Input
                            placeholder="Console name"
                            value={newConsoleName}
                            onChange={(e) => setNewConsoleName(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateConsole}
                            disabled={isLoading || !newConsoleName.trim()}
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Console Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Console</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                        <Input
                            placeholder="Console name"
                            value={newConsoleName}
                            onChange={(e) => setNewConsoleName(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditConsole}
                            disabled={isLoading || !newConsoleName.trim()}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Consoles List */}

            <div className={`grid gap-4 transition-all duration-300 ease-in-out origin-top ${
                isVisible
                    ? 'grid-rows-[1fr] opacity-100 max-h-[500px]'
                    : 'grid-rows-[0fr] opacity-0 max-h-0'
            }`}>
                <Button
                    onClick={() => setIsOpen(true)}
                    className="mb-4"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Console
                </Button>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {consoles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                                    No consoles found. Add your first one!
                                </TableCell>
                            </TableRow>
                        ) : (
                            consoles.map((console) => (
                                <TableRow key={console.id}>
                                    <TableCell>{console.id}</TableCell>
                                    <TableCell>{console.name}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(console)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteConsole(console.id)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ConsolePopups;