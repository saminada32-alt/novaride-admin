'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { AnalyticsChart } from '@/components/charts/AnalyticsChart';
import { driversApi, ridesApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsPage() {
    const { t, isAr } = useI18n();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [driversRes, ridesRes] = await Promise.all([
                    driversApi.getAll(),
                    ridesApi.getAll({ limit: 500 }),
                ]);

                const drivers = driversRes.data;
                const rides: any[] = Array.isArray(ridesRes.data) ? ridesRes.data : ridesRes.data?.data ?? [];

                // Rides by day of week
                const byDay = DAYS.map((label, i) => ({
                    label,
                    value: rides.filter(r => new Date(r.createdAt).getDay() === (i + 1) % 7).length,
                    value2: rides.filter(r =>
                        new Date(r.createdAt).getDay() === (i + 1) % 7 &&
                        r.status === 'COMPLETED'
                    ).length,
                }));

                // Rides by status
                const statusGroups = [
                    { label: 'Completed', value: rides.filter(r => r.status === 'COMPLETED').length },
                    { label: 'Cancelled', value: rides.filter(r => r.status === 'CANCELLED').length },
                    { label: 'No Driver', value: rides.filter(r => r.status === 'NO_DRIVER_FOUND').length },
                    { label: 'Active', value: rides.filter(r => ['SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'PASSENGER_ONBOARD', 'TRIP_STARTED'].includes(r.status)).length },
                ];

                // Revenue by month (last 6)
                const now = new Date();
                const byMonth = Array.from({ length: 6 }, (_, i) => {
                    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
                    const m = d.getMonth();
                    const y = d.getFullYear();
                    const monthRides = rides.filter(r => {
                        const rd = new Date(r.createdAt);
                        return rd.getMonth() === m && rd.getFullYear() === y && r.status === 'COMPLETED';
                    });
                    return {
                        label: MONTHS[m],
                        value: Math.round(monthRides.reduce((s: number, r: any) => s + (r.estimatedFare ?? 0), 0)),
                        value2: monthRides.length,
                    };
                });

                // Driver growth by month
                const driverGrowth = Array.from({ length: 6 }, (_, i) => {
                    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
                    const m = d.getMonth();
                    const y = d.getFullYear();
                    return {
                        label: MONTHS[m],
                        value: drivers.filter((dr: any) => {
                            const cd = new Date(dr.createdAt);
                            return cd.getMonth() === m && cd.getFullYear() === y;
                        }).length,
                    };
                });

                setStats({
                    totalRevenue: rides.filter(r => r.status === 'COMPLETED').reduce((s: number, r: any) => s + r.estimatedFare, 0),
                    avgFare: rides.length ? rides.reduce((s: number, r: any) => s + r.estimatedFare, 0) / rides.length : 0,
                    completionRate: rides.length ? Math.round((rides.filter(r => r.status === 'COMPLETED').length / rides.length) * 100) : 0,
                    totalDrivers: drivers.length,
                    approvedDrivers: drivers.filter((d: any) => d.isApproved).length,
                    byDay,
                    statusGroups,
                    byMonth,
                    driverGrowth,
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <>
            <Header title={isAr ? 'التحليلات' : 'Analytics'} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </>
    );

    return (
        <>
            <Header title={isAr ? 'التحليلات' : 'Analytics'} />
            <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                        {isAr ? 'التحليلات' : 'Analytics'}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#52525b' }}>
                        {isAr ? 'نظرة عامة على أداء المنصة' : 'Platform performance overview'}
                    </p>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
                    {[
                        {
                            label: isAr ? 'إجمالي الإيرادات' : 'Total Revenue',
                            value: formatCurrency(stats?.totalRevenue ?? 0),
                            color: '#4ade80',
                            icon: '💰',
                        },
                        {
                            label: isAr ? 'متوسط الأجرة' : 'Avg Fare',
                            value: formatCurrency(stats?.avgFare ?? 0),
                            color: '#818cf8',
                            icon: '📊',
                        },
                        {
                            label: isAr ? 'معدل الإكمال' : 'Completion Rate',
                            value: `${stats?.completionRate ?? 0}%`,
                            color: '#60a5fa',
                            icon: '✅',
                        },
                        {
                            label: isAr ? 'معدل الاعتماد' : 'Driver Approval Rate',
                            value: stats?.totalDrivers
                                ? `${Math.round((stats.approvedDrivers / stats.totalDrivers) * 100)}%`
                                : '0%',
                            color: '#fbbf24',
                            icon: '🚗',
                        },
                    ].map(card => (
                        <div key={card.label} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '16px', padding: '20px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.06em' }}>
                                    {card.label.toUpperCase()}
                                </p>
                                <span style={{ fontSize: '18px' }}>{card.icon}</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: '800', color: card.color, letterSpacing: '-1px' }}>
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <AnalyticsChart
                        title={isAr ? 'الرحلات حسب اليوم' : 'Rides by Day of Week'}
                        data={stats?.byDay ?? []}
                        color="#6366f1"
                        color2="#22c55e"
                        legend1={isAr ? 'الكل' : 'Total'}
                        legend2={isAr ? 'مكتملة' : 'Completed'}
                        height={180}
                    />
                    <AnalyticsChart
                        title={isAr ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
                        data={stats?.byMonth ?? []}
                        color="#22c55e"
                        color2="#6366f1"
                        legend1={isAr ? 'الإيرادات' : 'Revenue ($)'}
                        legend2={isAr ? 'الرحلات' : 'Rides'}
                        height={180}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <AnalyticsChart
                        title={isAr ? 'توزيع حالات الرحلات' : 'Ride Status Distribution'}
                        data={stats?.statusGroups ?? []}
                        color="#818cf8"
                        height={160}
                    />
                    <AnalyticsChart
                        title={isAr ? 'نمو السائقين' : 'Driver Growth'}
                        data={stats?.driverGrowth ?? []}
                        color="#fbbf24"
                        height={160}
                    />
                </div>
            </div>
        </>
    );
}