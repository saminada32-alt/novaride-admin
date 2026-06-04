import { cn } from '@/lib/utils';

interface EmptyProps {
    icon?: React.ReactNode;
    title?: string;
    message?: string;
    action?: React.ReactNode;
    className?: string;
}

export function Empty({
    icon,
    title = 'Nothing here',
    message = 'No data available',
    action,
    className,
}: EmptyProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center',
            'py-16 px-4 text-center',
            className,
        )}>
            {icon && (
                <div className="p-4 bg-zinc-800/50 rounded-2xl mb-4 text-zinc-600">
                    {icon}
                </div>
            )}
            <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
            <p className="text-xs text-zinc-600 max-w-xs">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}