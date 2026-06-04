'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, iconRight, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-xs font-medium text-zinc-400">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full h-9 rounded-lg text-sm',
                            'bg-zinc-800/50 border text-zinc-100',
                            'placeholder:text-zinc-600',
                            'transition-all duration-150',
                            'focus:outline-none focus:ring-2',
                            'focus:ring-indigo-500/30 focus:border-indigo-500/50',
                            error
                                ? 'border-red-500/50 focus:ring-red-500/20'
                                : 'border-zinc-700/50 hover:border-zinc-600',
                            icon ? 'pl-9' : 'pl-3',
                            iconRight ? 'pr-9' : 'pr-3',
                            className,
                        )}
                        {...props}
                    />
                    {iconRight && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            {iconRight}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// ─── Textarea ─────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-xs font-medium text-zinc-400">{label}</label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full rounded-lg text-sm px-3 py-2.5 resize-none',
                        'bg-zinc-800/50 border text-zinc-100',
                        'placeholder:text-zinc-600',
                        'transition-all duration-150',
                        'focus:outline-none focus:ring-2',
                        'focus:ring-indigo-500/30 focus:border-indigo-500/50',
                        error
                            ? 'border-red-500/50'
                            : 'border-zinc-700/50 hover:border-zinc-600',
                        className,
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';