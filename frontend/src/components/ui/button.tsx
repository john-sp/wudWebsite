import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
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
                "px-4 py-2 rounded-md text-white font-medium",
                variant === "primary" && "bg-blue-500 hover:bg-blue-600",
                variant === "secondary" && "bg-gray-500 hover:bg-gray-600",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
