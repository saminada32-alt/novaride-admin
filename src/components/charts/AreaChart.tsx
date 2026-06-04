'use client';

import {
    AreaChart as ReAreaChart, Area,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';

interface AreaChartProps {
    data: any[];
    dataKey: string;
    xKey?: string;
    color?: string;
    height?: number;
}

export function AreaChart({
    data, dataKey, xKey = 'name',
    color = '#6366f1', height = 200,
}: AreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <ReAreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                    <linearGradient id={`grad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                    dataKey={xKey}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={false} tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={false} tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{
                        background: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: 8,
                        color: '#fafafa',
                        fontSize: 12,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                    cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad_${dataKey})`}
                    dot={false}
                    activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                />
            </ReAreaChart>
        </ResponsiveContainer>
    );
}