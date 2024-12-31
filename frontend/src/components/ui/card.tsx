import React from "react";
import clsx from "clsx";

interface CardProps {
    className?: string;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
    return (
        <div
            className={clsx(
                "border border-gray-200 rounded-lg shadow-sm ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<CardProps> = ({ className, children }) => {
    return (
        <div className={clsx("text-lg font-bold", className)}>{children}</div>
    );
};

export const CardContent: React.FC<CardProps> = ({ className, children }) => {
    return <div className={clsx("text-gray-600 p-4", className)}>{children}</div>;
};
