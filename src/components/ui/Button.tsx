'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    icon?: React.ReactNode;
    iconRight?: React.ReactNode;
}

const variants: Record<Variant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/10',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700',
    danger: 'bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/20',
    ghost: 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
    outline: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600',
};

const sizes: Record<Size, string> = {
    xs: 'h-7  px-2.5 text-xs  gap-1',
    sm: 'h-8  px-3   text-xs  gap-1.5',
    md: 'h-9  px-4   text-sm  gap-2',
    lg: 'h-11 px-5   text-sm  gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading, icon, iconRight,
        children, disabled, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    'inline-flex items-center justify-center font-medium rounded-lg',
                    'transition-all duration-150 select-none',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                    'focus-visible:ring-offset-zinc-950',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className,
                )}
                {...props}
            >
                {loading
                    ? <Loader2 size={14} className="animate-spin flex-shrink-0" />
                    : icon
                        ? <span className="flex-shrink-0">{icon}</span>
                        : null}
                {children}
                {iconRight && !loading && (
                    <span className="flex-shrink-0">{iconRight}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';