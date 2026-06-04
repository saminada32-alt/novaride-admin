import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

const sizes = { sm: 16, md: 24, lg: 32 };

export function Spinner({ size = 'md', className, text }: SpinnerProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center gap-3 p-8',
            className,
        )}>
            <Loader2
                size={sizes[size]}
                className="animate-spin text-indigo-500"
            />
            {text && (
                <p className="text-sm text-zinc-500">{text}</p>
            )}
        </div>
    );
}

export function PageSpinner() {
    return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" text="Loading..." />
        </div>
    );
}