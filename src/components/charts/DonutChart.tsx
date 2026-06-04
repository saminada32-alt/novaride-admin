'use client';

import {
    PieChart, Pie, Cell,
    Tooltip, ResponsiveContainer,
} from 'recharts';

interface DonutData {
    name: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DonutData[];
    height?: number;
}

export function DonutChart({ data, height = 200 }: DonutChartProps) {
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="flex items-center gap-6">
            <ResponsiveContainer width={height} height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={height * 0.3}
                        outerRadius={height * 0.45}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: 8,
                            color: '#fafafa',
                            fontSize: 12,
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-col gap-2.5 flex-1">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: item.color }}
                            />
                            <span className="text-xs text-zinc-400">{item.name}</span>
                        </div>
                        <span className="text-xs font-medium text-zinc-300">
                            {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}