'use client';

import { useState, useEffect, useCallback } from 'react';
import { ridesApi } from '@/lib/api';
import type { Ride } from '@/lib/types';
import { useRealtime } from '@/lib/realtime';

export function useRides(status?: string) {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const { onRefresh } = useRealtime();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ridesApi.getAll({ status, limit: 100 });
            const data = Array.isArray(res.data)
                ? res.data
                : res.data?.data ?? [];
            setRides(data);
        } catch {
            setRides([]);
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        load();
        return onRefresh(load);
    }, [load, onRefresh]);

    return { rides, loading, refetch: load };
}