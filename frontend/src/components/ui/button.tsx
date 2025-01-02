import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "icon" | "destructive" | "constructive";
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = "primary",
                                                  className,
                                                  ...props
                                              }) => {
    return (
        <button
            className={clsx(
                "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring",
                variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
                variant === "secondary" && "bg-gray-500 text-white hover:bg-gray-600",
                variant === "outline" &&
                "border border-gray-500 text-gray-500 hover:bg-gray-100",
                variant === "ghost" &&
                "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                variant === "icon" &&
                "p-2 bg-transparent text-gray-500 hover:bg-gray-100 rounded-full",
                variant === "destructive" &&
                "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
                variant === "constructive" &&
                "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
