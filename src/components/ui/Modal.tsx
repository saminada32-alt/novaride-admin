'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    footer?: React.ReactNode;
}

const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
};

export function Modal({
    open, onClose, title, children, size = 'md', footer,
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) {
            document.addEventListener('keydown', handler);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

            {/* Dialog */}
            <div className={cn(
                'relative w-full bg-zinc-900 border border-zinc-800',
                'rounded-2xl shadow-2xl shadow-black/50',
                'flex flex-col max-h-[90vh] animate-slide-in',
                sizes[size],
            )}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
                    <button
                        onClick={onClose}
                        className={cn(
                            'p-1.5 rounded-lg text-zinc-500',
                            'hover:bg-zinc-800 hover:text-zinc-300',
                            'transition-colors',
                        )}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}