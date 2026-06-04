import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: boolean;
    hover?: boolean;
}

export function Card({
    children, className, padding = true, hover = false,
}: CardProps) {
    return (
        <div className={cn(
            'rounded-xl border border-zinc-800 bg-zinc-900/50',
            'transition-all duration-200',
            padding && 'p-5',
            hover && 'hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer',
            className,
        )}>
            {children}
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────

type StatColor = 'indigo' | 'green' | 'yellow' | 'red' | 'blue';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: StatColor;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const statColors: Record<StatColor, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    green: 'bg-green-500/10  text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10    text-red-400',
    blue: 'bg-blue-500/10   text-blue-400',
};

const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-zinc-500',
};

export function StatCard({
    title, value, icon, color = 'indigo', change, trend = 'neutral',
}: StatCardProps) {
    return (
        <Card className="relative overflow-hidden">
            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-transparent opacity-50 pointer-events-none" />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        {title}
                    </p>
                    <p className="text-2xl font-semibold text-zinc-100 tracking-tight">
                        {value}
                    </p>
                    {change && (
                        <p className={cn('text-xs mt-1.5', trendColors[trend])}>
                            {change}
                        </p>
                    )}
                </div>
                <div className={cn('p-2.5 rounded-lg', statColors[color])}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}