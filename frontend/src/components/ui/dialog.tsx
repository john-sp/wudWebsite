import React from "react";
import clsx from "clsx";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface DialogProps {
    className?: string;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps extends DialogProps {
    onClose?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {children}
        </DialogPrimitive.Root>
    );
};

export const DialogContent: React.FC<DialogContentProps> = ({
                                                                className,
                                                                children,
                                                                onClose,
                                                            }) => {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
            <DialogPrimitive.Content
                className={clsx(
                    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    "w-full max-w-lg rounded-lg text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark p-6 shadow-lg",
                    "focus:outline-none",
                    className
                )}
            >
                {children}
                {onClose && (
                    <DialogPrimitive.Close
                        className="absolute right-4 top-4 text-text-light dark:text-text-dark hover:text-gray-700"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        ×
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
};

export const DialogHeader: React.FC<DialogProps> = ({ className, children }) => {
    return (
        <div className={clsx("mb-4", className)}>
            {children}
        </div>
    );
};

export const DialogTitle: React.FC<DialogProps> = ({ className, children }) => {
    return (
        <DialogPrimitive.Title
            className={clsx("text-lg font-bold text-text-light dark:text-text-dark", className)}
        >
            {children}
        </DialogPrimitive.Title>
    );
};

export const DialogFooter: React.FC<DialogProps> = ({ className, children }) => {
    return (
        <div
            className={clsx(
                "mt-6 flex justify-end space-x-2",
                className
            )}
        >
            {children}
        </div>
    );
};