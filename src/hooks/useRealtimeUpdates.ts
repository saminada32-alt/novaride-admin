'use client';

import { useEffect } from 'react';
import { useRealtime } from '@/lib/realtime';

/** Subscribe to realtime refresh events (Socket.IO admin room). */
export function useRealtimeUpdates(onRefresh?: () => void) {
    const { onRefresh: subscribe } = useRealtime();

    useEffect(() => {
        if (!onRefresh) return;
        return subscribe(onRefresh);
    }, [onRefresh, subscribe]);
}
