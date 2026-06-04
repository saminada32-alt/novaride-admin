import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

const sizes = {
    xs: 'w-6  h-6  text-xs',
    sm: 'w-8  h-8  text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
};

const colors = [
    'bg-indigo-500/20 text-indigo-300',
    'bg-purple-500/20 text-purple-300',
    'bg-blue-500/20   text-blue-300',
    'bg-green-500/20  text-green-300',
    'bg-yellow-500/20 text-yellow-300',
    'bg-red-500/20    text-red-300',
];

function getColor(name: string): string {
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

export function Avatar({ name = '?', size = 'md', className }: AvatarProps) {
    const initials = getInitials(name);
    const color = getColor(name);

    return (
        <div className={cn(
            'rounded-full flex items-center justify-center flex-shrink-0',
            'font-semibold select-none',
            sizes[size],
            color,
            className,
        )}>
            {initials}
        </div>
    );
}