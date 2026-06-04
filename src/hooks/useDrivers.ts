'use client';

import { useState, useEffect, useCallback } from 'react';
import { driversApi } from '@/lib/api';
import type { Driver } from '@/lib/types';

export function useDrivers(status?: string) {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await driversApi.getAll(status);
            setDrivers(res.data);
        } catch {
            setError('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => { load(); }, [load]);

    return { drivers, loading, error, refetch: load };
}