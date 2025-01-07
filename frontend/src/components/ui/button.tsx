import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "icon" | "destructive" | "constructive";
    size?: "default" | "sm" | "lg" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = "primary",
                                                  size = "default",
                                                  className,
                                                  ...props
                                              }) => {
    return (
        <button
            className={clsx(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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
                size === "default" && "h-9 px-4 py-2",
                size === "sm" && "h-8 rounded-md px-3 text-xs",
                size === "lg" && "h-10 rounded-md px-8",
                size === "icon" && "h-9 w-9",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
