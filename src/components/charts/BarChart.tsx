'use client';

import {
    BarChart as ReBarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface BarChartProps {
    data: any[];
    dataKey: string;
    xKey?: string;
    color?: string;
    height?: number;
}

export function BarChart({
    data, dataKey, xKey = 'name',
    color = '#6366f1', height = 200,
}: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <ReBarChart data={data} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
                    }}
                    cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                    {data.map((_, i) => (
                        <Cell
                            key={i}
                            fill={color}
                            fillOpacity={0.7 + (i === data.length - 1 ? 0.3 : 0)}
                        />
                    ))}
                </Bar>
            </ReBarChart>
        </ResponsiveContainer>
    );
}