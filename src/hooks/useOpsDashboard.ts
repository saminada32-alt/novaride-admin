'use client';

import { useCallback, useEffect, useState } from 'react';
import { opsApi, type OpsDashboard } from '@/lib/api';
import { useMarket } from '@/lib/market-context';
import { useRealtime } from '@/lib/realtime';
import type { BadgeKey } from '@/lib/nav';

const TTL_MS = 8000;
const cache = new Map<string, { at: number; promise: Promise<OpsDashboard | null> }>();

function fetchDashboard(marketCode: string | null) {
    const key = marketCode ?? 'all';
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;

    const promise = opsApi
        .dashboard(marketCode)
        .then((res) => res.data)
        .catch(() => null);
    cache.set(key, { at: Date.now(), promise });
    return promise;
}

/** Items waiting on an admin, keyed the same way as the sidebar badges. */
export function pendingCounts(d: OpsDashboard | null): Record<BadgeKey, number> {
    return {
        pendingDrivers: d?.drivers.pendingApproval ?? 0,
        walletTopups: d?.payments.walletTopupsPending ?? 0,
        payouts: d?.payments.driverPayoutsPending ?? 0,
        shamCash: d?.payments.ridesAwaitingConfirm ?? 0,
        complaints: d?.support.complaints.open ?? 0,
    };
}

/** Shared by the sidebar badges and the dashboard's "needs attention" cards. */
export function useOpsDashboard() {
    const { marketCode } = useMarket();
    const { onRefresh } = useRealtime();
    const [data, setData] = useState<OpsDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        const d = await fetchDashboard(marketCode);
        if (d) setData(d);
        setLoading(false);
    }, [marketCode]);

    useEffect(() => {
        load();
        const timer = setInterval(load, 60000);
        const off = onRefresh(load);
        return () => {
            clearInterval(timer);
            off();
        };
    }, [load, onRefresh]);

    return { data, loading, reload: load };
}
