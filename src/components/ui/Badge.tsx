import { cn } from '@/lib/utils';

type Color = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'zinc' | 'indigo';

interface BadgeProps {
    color?: Color;
    children: React.ReactNode;
    dot?: boolean;
    className?: string;
}

const styles: Record<Color, { bg: string; text: string; dot: string }> = {
    green: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
    zinc: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-400' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-400' },
};

export function Badge({ color = 'zinc', children, dot, className }: BadgeProps) {
    const s = styles[color];
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5',
            'text-xs font-medium',
            s.bg, s.text, className,
        )}>
            {dot && (
                <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', s.dot)} />
            )}
            {children}
        </span>
    );
}

// ─── Status Badges ────────────────────────────────────────────

export function DriverStatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: Color; label: string }> = {
        online: { color: 'green', label: 'Online' },
        offline: { color: 'zinc', label: 'Offline' },
        on_trip: { color: 'blue', label: 'On Trip' },
    };
    const cfg = map[status] ?? { color: 'zinc', label: status };
    return <Badge color={cfg.color} dot>{cfg.label}</Badge>;
}

export function ReviewStatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: Color; label: string }> = {
        PENDING: { color: 'yellow', label: 'Pending' },
        APPROVED: { color: 'green', label: 'Approved' },
        REJECTED: { color: 'red', label: 'Rejected' },
    };
    const cfg = map[status] ?? { color: 'zinc', label: status };
    return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export function RideStatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: Color; label: string }> = {
        SEARCHING: { color: 'yellow', label: 'Searching' },
        DRIVER_ASSIGNED: { color: 'blue', label: 'Assigned' },
        DRIVER_ARRIVED: { color: 'blue', label: 'Arrived' },
        PASSENGER_ONBOARD: { color: 'indigo', label: 'Onboard' },
        TRIP_STARTED: { color: 'purple', label: 'In Progress' },
        COMPLETED: { color: 'green', label: 'Completed' },
        CANCELLED: { color: 'red', label: 'Cancelled' },
        NO_DRIVER_FOUND: { color: 'red', label: 'No Driver' },
    };
    const cfg = map[status] ?? { color: 'zinc', label: status };
    return <Badge color={cfg.color}>{cfg.label}</Badge>;
}