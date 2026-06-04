'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface DataPoint {
    label: string;
    value: number;
    value2?: number;
}

interface AnalyticsChartProps {
    title: string;
    data: DataPoint[];
    color?: string;
    color2?: string;
    legend1?: string;
    legend2?: string;
    height?: number;
    valuePrefix?: string;
}

export function AnalyticsChart({
    title, data, color = '#6366f1', color2 = '#22c55e',
    legend1, legend2, height = 200, valuePrefix = '',
}: AnalyticsChartProps) {
    const { isAr } = useI18n();
    const [hovered, setHovered] = useState<number | null>(null);

    const max = Math.max(...data.map(d => Math.max(d.value, d.value2 ?? 0)), 1);

    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '20px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>{title}</p>
                {(legend1 || legend2) && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {legend1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                                <span style={{ fontSize: '11px', color: '#71717a' }}>{legend1}</span>
                            </div>
                        )}
                        {legend2 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color2 }} />
                                <span style={{ fontSize: '11px', color: '#71717a' }}>{legend2}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${height}px`, position: 'relative' }}>

                {/* Y axis lines */}
                {[0, 25, 50, 75, 100].map(pct => (
                    <div key={pct} style={{
                        position: 'absolute',
                        left: 0, right: 0,
                        bottom: `${pct}%`,
                        borderTop: pct === 0 ? '1px solid rgba(255,255,255,0.1)' : '1px dashed rgba(255,255,255,0.04)',
                    }}>
                        <span style={{
                            position: 'absolute', right: '100%',
                            paddingRight: '8px', fontSize: '9px', color: '#3f3f46',
                            transform: 'translateY(50%)',
                        }}>
                            {Math.round((max * pct) / 100)}
                        </span>
                    </div>
                ))}

                {/* Bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', flex: 1, paddingLeft: '28px' }}>
                    {data.map((d, i) => {
                        const h1 = (d.value / max) * 100;
                        const h2 = d.value2 !== undefined ? (d.value2 / max) * 100 : null;
                        const isHov = hovered === i;

                        return (
                            <div
                                key={i}
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'default' }}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {/* Tooltip */}
                                {isHov && (
                                    <div style={{
                                        position: 'absolute', bottom: '100%', marginBottom: '8px',
                                        background: '#0f0f13',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', padding: '8px 12px',
                                        fontSize: '11px', color: '#e4e4e7',
                                        whiteSpace: 'nowrap', zIndex: 10,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                        pointerEvents: 'none',
                                    }}>
                                        <p style={{ fontWeight: '600', marginBottom: '2px' }}>{d.label}</p>
                                        <p style={{ color }}>{legend1 ?? 'Value 1'}: {valuePrefix}{d.value}</p>
                                        {d.value2 !== undefined && (
                                            <p style={{ color: color2 }}>{legend2 ?? 'Value 2'}: {valuePrefix}{d.value2}</p>
                                        )}
                                    </div>
                                )}

                                {/* Bar group */}
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', width: '100%' }}>
                                    <div style={{
                                        flex: 1, height: `${(h1 / 100) * height}px`,
                                        background: isHov
                                            ? color
                                            : `linear-gradient(180deg, ${color}, ${color}80)`,
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'all 0.2s',
                                        minHeight: '2px',
                                        boxShadow: isHov ? `0 0 12px ${color}50` : 'none',
                                    }} />
                                    {h2 !== null && (
                                        <div style={{
                                            flex: 1, height: `${(h2 / 100) * height}px`,
                                            background: isHov
                                                ? color2
                                                : `linear-gradient(180deg, ${color2}, ${color2}80)`,
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'all 0.2s',
                                            minHeight: '2px',
                                            boxShadow: isHov ? `0 0 12px ${color2}50` : 'none',
                                        }} />
                                    )}
                                </div>

                                {/* Label */}
                                <span style={{ fontSize: '9px', color: '#3f3f46', marginTop: '4px' }}>
                                    {d.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}