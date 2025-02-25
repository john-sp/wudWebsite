import React, {useState} from 'react';
import {AuthProvider, useAuth} from "@/AuthContext";
import {ConsoleGame, ConsoleProvider, useConsoleContext} from "@/consolegames/ConsoleGameManagerContext";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Download, Pencil, Plus, Trash2, Upload} from "lucide-react";

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


const ConsoleGameCard: React.FC<ConsoleGameCardProps> = ({game}) => {
    const {auth} = useAuth();
    const [editingGame, setEditingGame] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const isAdmin = auth?.authenticationLevel.toLowerCase() === 'admin';
    const isHost = isAdmin || auth?.authenticationLevel.toLowerCase() === 'host';
    const {deleteGame, updateGame} = useConsoleContext();

    const handleDelete = async () => {
        deleteGame(game.id);
    };

    const closeEditPopup = () => {
        setEditingGame(false);
    };

    return (
        <>
            <Card className={`w-full max-w-sm relative flex flex-row  ${isHost ? "pb-12" : ""}`}>
                <div className="w-2/3 p-2 text-left">
                    <h3 className="text-lg font-bold">{game.name}</h3>
                    <div className="max-h-32 overflow-y-auto">
                        <p className="mt-2 text-xs">{game.description}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Available on: {game.consoles.map((c) => c.name).join(", ") || "N/A"}
                    </div>
                </div>
                <div className="relative w-1/3">
                    {game.boxImageUrl && (
                        <img
                            src={game.boxImageUrl || "/api/placeholder/200/200"}
                            alt={game.name}
                            className="w-full max-h-[85%] object-cover rounded-tr-lg text-center"
                        />)}
                </div>

                {isAdmin && (
                    <div
                        className="absolute bottom-0 rounded-tl-md right-0 px-2 py-2 border-t border-l flex justify-between gap-2">

                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => setEditingGame(true)}>
                                <Pencil className="w-4 h-4"/>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </div>

                    </div>
                )}
            </Card>
            {editingGame && (
                <GamePopup gameToEdit={game} onClose={closeEditPopup} isOpen={editingGame}/>
            )}
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
                        <AlertDialogAction onClick={handleDelete}
                                           className="text-white bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-2 gap-y-6">
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

// TODO: Replace game manager
const ConsolegameMain = () => {
    const { auth } = useAuth();
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