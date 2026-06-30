'use client';

import { useMarket } from '@/lib/market-context';
import { useI18n } from '@/lib/i18n';

export function MarketSelector() {
    const { isAr } = useI18n();
    const { marketCode, setMarketCode, markets, loading } = useMarket();

    if (loading && !markets.length) return null;

    const sortedMarkets = [...markets].sort((a, b) => {
        if (a.code === 'syria') return 1;
        if (b.code === 'syria') return -1;
        const aName = isAr ? a.nameAr : a.nameEn;
        const bName = isAr ? b.nameAr : b.nameEn;
        return aName.localeCompare(bName, isAr ? 'ar' : 'en');
    });

    return (
        <select
            value={marketCode ?? 'all'}
            onChange={(e) => {
                const v = e.target.value;
                setMarketCode(v === 'all' ? null : v);
            }}
            style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: '#d4d4d8',
                fontSize: '12px',
                cursor: 'pointer',
                maxWidth: 160,
            }}
            aria-label={isAr ? 'السوق' : 'Market'}
        >
            <option value="all">{isAr ? 'كل الأسواق' : 'All markets'}</option>
            {sortedMarkets.map((m) => (
                <option key={m.code} value={m.code}>
                    {isAr ? m.nameAr : m.nameEn}
                </option>
            ))}
        </select>
    );
}
