'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { passengersApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';

export default function PassengerDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [p, setP] = useState<any>(null);
    const { isAr } = useI18n();

    useEffect(() => {
        if (!id) return;
        passengersApi.getOne(id).then((res) => setP(res.data)).catch(() => setP(null));
    }, [id]);

    if (!p) {
        return (
            <>
                <Header title={isAr ? 'تفاصيل الراكب' : 'Passenger Details'} />
                <div style={{ padding: 32, color: '#71717a' }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
            </>
        );
    }

    const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.phone;

    return (
        <>
            <Header title={isAr ? 'تفاصيل الراكب' : 'Passenger Details'} />
            <div style={{ padding: '28px 32px', maxWidth: 900 }}>
                <Link href="/passengers" style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none' }}>
                    ← {isAr ? 'الركاب' : 'Passengers'}
                </Link>

                <div style={{
                    marginTop: 16, padding: 20,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16,
                    display: 'flex', alignItems: 'center', gap: 16,
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 800,
                    }}>
                        {name[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>{name}</h1>
                        <p style={{ fontFamily: 'monospace', color: '#a1a1aa', margin: '4px 0' }}>{p.phone}</p>
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                            background: p.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: p.isActive ? '#4ade80' : '#f87171',
                        }}>
                            {p.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'محظور' : 'Blocked')}
                        </span>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                        {[
                            [isAr ? 'الرحلات' : 'Rides', p.rides?.length ?? 0],
                            [isAr ? 'المحفظة' : 'Wallet', `$${Number(p.walletBalance ?? 0).toFixed(2)}`],
                        ].map(([label, val]) => (
                            <div key={label as string} style={{
                                textAlign: 'center', padding: '10px 16px',
                                background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                            }}>
                                <p style={{ fontSize: 10, color: '#71717a', margin: 0 }}>{label}</p>
                                <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    marginTop: 16, padding: 20,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16,
                }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7', marginBottom: 12 }}>
                        {isAr ? 'معلومات شخصية' : 'Personal Info'}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                            [isAr ? 'البريد' : 'Email', p.email ?? '—'],
                            [isAr ? 'الجنس' : 'Gender', p.gender ?? '—'],
                            [isAr ? 'تاريخ الميلاد' : 'Birth Date', p.birthDate ?? '—'],
                            [isAr ? 'العنوان' : 'Home', p.homeAddress ?? '—'],
                        ].map(([label, val]) => (
                            <div key={label as string}>
                                <p style={{ fontSize: 10, color: '#71717a', margin: 0 }}>{label}</p>
                                <p style={{ fontSize: 13, color: '#e4e4e7', margin: '4px 0 0' }}>{val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    marginTop: 16, padding: 20,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16,
                }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7', marginBottom: 12 }}>
                        {isAr ? 'سجل الرحلات' : 'Ride History'} ({p.rides?.length ?? 0})
                    </h2>
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {(p.rides ?? []).map((r: any) => (
                            <div key={r.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', marginBottom: 6, borderRadius: 10,
                                background: 'rgba(255,255,255,0.03)',
                            }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#71717a' }}>#{r.id}</span>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                                    background: r.status === 'COMPLETED' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                    color: r.status === 'COMPLETED' ? '#4ade80' : '#fbbf24',
                                }}>{r.status}</span>
                                <span style={{ color: '#4ade80', fontWeight: 700 }}>
                                    {formatCurrency(Number(r.estimatedFare ?? 0))}
                                </span>
                                <span style={{ fontSize: 11, color: '#71717a' }}>
                                    {new Date(r.createdAt).toLocaleDateString(isAr ? 'ar-SY' : 'en-US')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
