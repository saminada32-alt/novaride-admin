'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { marketsApi, type AdminMarket } from '@/lib/api';

type MarketContextValue = {
    marketCode: string | null;
    setMarketCode: (code: string | null) => void;
    markets: AdminMarket[];
    loading: boolean;
};

const MarketContext = createContext<MarketContextValue>({
    marketCode: null,
    setMarketCode: () => {},
    markets: [],
    loading: true,
});

const STORAGE_KEY = 'novaride_admin_market';

export function MarketProvider({ children }: { children: ReactNode }) {
    const [marketCode, setMarketCodeState] = useState<string | null>(null);
    const [markets, setMarkets] = useState<AdminMarket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved !== 'all') setMarketCodeState(saved);

        marketsApi.adminList()
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : [];
                setMarkets(list.filter((m) => m.active));
            })
            .catch(() => setMarkets([]))
            .finally(() => setLoading(false));
    }, []);

    const setMarketCode = useCallback((code: string | null) => {
        setMarketCodeState(code);
        localStorage.setItem(STORAGE_KEY, code ?? 'all');
    }, []);

    return (
        <MarketContext.Provider value={{ marketCode, setMarketCode, markets, loading }}>
            {children}
        </MarketContext.Provider>
    );
}

export function useMarket() {
    return useContext(MarketContext);
}
