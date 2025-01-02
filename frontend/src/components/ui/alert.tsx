import React from "react";
import clsx from "clsx";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "info" | "warning" | "error" | "success";
    title?: string;
}

export const Alert: React.FC<AlertProps> = ({
                                                children,
                                                variant = "info",
                                                title,
                                                description,
                                                className,
                                                ...props
                                            }) => {
    return (
        <div
            className={clsx(
                "p-4 rounded-md border",
                variant === "info" && "bg-blue-50 border-blue-200 text-blue-700",
                variant === "warning" && "bg-yellow-50 border-yellow-200 text-yellow-700",
                variant === "error" && "bg-red-50 border-red-200 text-red-700",
                variant === "success" && "bg-green-50 border-green-200 text-green-700",
                className
            )}
            role="alert"
            {...props}
        >
            {title && (
                <h3 className={clsx(
                    "font-semibold mb-2",
                    variant === "info" && "text-blue-800",
                    variant === "warning" && "text-yellow-800",
                    variant === "error" && "text-red-800",
                    variant === "success" && "text-green-800"
                )}>
                    {title}
                </h3>
            )}
            {description && (
                <p className="text-sm mb-2">{description}</p>
            )}
            <div className="text-sm">{children}</div>
        </div>
    );
};