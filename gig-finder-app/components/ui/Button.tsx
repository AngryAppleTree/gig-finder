import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

        // Using arbitrary values to map to the project's CSS variables (verified in global styles)
        // --color-primary is the main brand color
        const variants = {
            primary: "bg-[var(--color-primary,oklch(0.6_0.15_200))] text-white hover:opacity-90 shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] border-none",
            secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
            outline: "border-2 border-[var(--color-primary,oklch(0.6_0.15_200))] text-[var(--color-primary,oklch(0.6_0.15_200))] bg-transparent hover:bg-[var(--color-primary,oklch(0.6_0.15_200))] hover:text-white transition-colors",
            ghost: "bg-transparent text-zinc-300 hover:text-white hover:bg-white/10",
            danger: "bg-red-600 text-white hover:bg-red-700 shadow-md"
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-5 text-sm",
            lg: "h-12 px-8 text-lg font-bold"
        };

        const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

        return (
            <button
                ref={ref}
                className={combinedClassName}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
