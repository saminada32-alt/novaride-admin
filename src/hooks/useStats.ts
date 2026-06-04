'use client';

import { useState, useEffect, useCallback } from 'react';
import { driversApi, ridesApi, healthApi } from '@/lib/api';
import { useRealtime } from '@/lib/realtime';

interface Stats {
    totalDrivers: number;
    approvedDrivers: number;
    pendingDrivers: number;
    onlineDrivers: number;
    totalRides: number;
    completedRides: number;
    activeRides: number;
    cancelledRides: number;
}

interface Health {
    redis: 'ok' | 'down';
    db: 'ok' | 'down';
    uptime: number;
}

export function useStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [health, setHealth] = useState<Health | null>(null);
    const [loading, setLoading] = useState(true);
    const { onRefresh } = useRealtime();

    const load = useCallback(async () => {
        try {
            const [all, approved, pending, rides, healthRes] = await Promise.all([
                driversApi.getAll(),
                driversApi.getAll('approved'),
                driversApi.getAll('pending'),
                ridesApi.getAll({ limit: 200 }),
                healthApi.check(),
            ]);

            const allDrivers: any[] = all.data;
            const allRides: any[] = Array.isArray(rides.data)
                ? rides.data
                : rides.data?.data ?? [];

            setStats({
                totalDrivers: allDrivers.length,
                approvedDrivers: approved.data.length,
                pendingDrivers: pending.data.length,
                onlineDrivers: allDrivers.filter((d: any) => d.status === 'online').length,
                totalRides: allRides.length,
                completedRides: allRides.filter((r: any) => r.status === 'COMPLETED').length,
                activeRides: allRides.filter((r: any) =>
                    ['SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED',
                        'PASSENGER_ONBOARD', 'TRIP_STARTED'].includes(r.status)
                ).length,
                cancelledRides: allRides.filter((r: any) => r.status === 'CANCELLED').length,
            });

            setHealth(healthRes.data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        return onRefresh(load);
    }, [load, onRefresh]);

    return { stats, health, loading, refetch: load };
}