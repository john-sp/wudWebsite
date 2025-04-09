import React, {useState} from 'react';
import {AuthProvider, useAuth} from "@/AuthContext";
import {ConsoleGame, ConsoleProvider, useConsoleContext} from "@/consolegames/ConsoleGameManagerContext";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Monitor, Pencil, Plus, Trash2} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';


import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {Skeleton} from "@/components/ui/skeleton";
import {GamePopup} from "@/consolegames/ConsoleGamePopups";
import ConsolePopups from "@/consolegames/ConsolePopups";


interface ConsoleGameCardProps {
    game: ConsoleGame;
}


const ConsoleGameCard: React.FC<ConsoleGameCardProps> = ({ game }) => {
    const { auth } = useAuth();
    const [editingGame, setEditingGame] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';
    const isHost = isAdmin || auth?.authenticationLevel.toLowerCase() === 'host';
    const { deleteGame, updateGame } = useConsoleContext();

    const handleDelete = async () => {
        deleteGame(game.id);
    };

    const closeEditPopup = () => {
        setEditingGame(false);
    };

    return (
        <>
            <Card
                className={`w-full max-w-sm relative flex flex-col ${isHost ? "pb-12" : ""} cursor-pointer`}
                onClick={() => setShowInfoDialog(true)}
            >
                <div className="relative w-full overflow-hidden">
                    {game.boxImageUrl && (
                        <img
                            src={game.boxImageUrl || "/api/placeholder/200/200"}
                            alt={game.name}
                            className="w-full aspect-[2.7] object-cover rounded-t-lg"
                        />
                    )}

                </div>

                <CardContent className="p-2">
                <div className="text-white text-center">
                        <h4 className="text-md font-bold">{game.name}</h4>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Available on: {game.consoles.map((c) => c.name).join(", ") || "N/A"}
                    </div>
                </CardContent>

                {isAdmin && (
                    <div className="absolute bottom-0 right-0 px-2 py-2 border-t border-l flex gap-2 rounded-tl-md">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingGame(true);
                            }}
                        >
                            <Pencil className="w-4 h-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteDialog(true);
                            }}
                        >
                            <Trash2 className="w-4 h-4"/>
                        </Button>
                    </div>
                )}
            </Card>

            {/* Game Info Dialog */}
            <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{game.name}</DialogTitle>
                        <div className="text-sm text-muted-foreground">
                            Available on: {game.consoles.map((c) => c.name).join(", ") || "N/A"}
                        </div>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <h4 className="font-semibold">Description</h4>
                                <p className="text-sm mt-1">{game.description}</p>
                            </div>
                                <div>
                                <h4 className="font-semibold">Details</h4>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <p className="text-sm font-medium">Release Date</p>
                                        <p className="text-sm">{game.releaseDate || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Genre</p>
                                        <p className="text-sm">{game.genres?.map(g => g.name).join(', ') || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            {game.boxImageUrl && (
                                <img
                                    src={game.boxImageUrl}
                                    alt={game.name}
                                    className="w-full max-h-64 object-contain rounded-lg"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {editingGame && (
                <GamePopup gameToEdit={game} onClose={closeEditPopup} isOpen={editingGame}/>
            )}

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Game</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{game.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

const ConsoleGamesList = () => {
        const {games, loading} = useConsoleContext();

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                                    <ConsoleGameCard game={game}/>
                                ))
                            }
                        </>
                    )}
            </div>
        )
            ;
    }
;


const ConsolegameMain = () => {
    const {auth} = useAuth();
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';
    const isHost = isAdmin || auth?.authenticationLevel.toLowerCase() === 'host';


    const [isAddConsoleOpen, setIsAddConsoleOpen] = useState(false);
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);

    return (
        <>
            <AuthProvider>
                <ConsoleProvider>
                    <div className="min-h-screen p-8 antialiased">
                        <div className="min-h-screen p-8 pt-16"> {/* Added pt-16 for padding */}

                            {isAdmin && (
                                <div className="flex gap-2">
                                    <Button onClick={() => setIsAddGameOpen(true)}
                                            className="flex items-center gap-2">
                                        <Plus className="w-4 h-4"/> Add Game
                                    </Button>

                                    <ConsolePopups/>
                                </div>
                            )}
                            <ConsoleGamesList/>
                        </div>


                        <GamePopup
                            isOpen={isAddGameOpen}
                            onClose={() => setIsAddGameOpen(false)}
                        />
                    </div>
                </ConsoleProvider>
            </AuthProvider>
        </>
    );
};

export default ConsolegameMain;