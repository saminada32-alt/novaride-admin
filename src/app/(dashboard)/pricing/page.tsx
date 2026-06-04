'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { pricingApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

type PricingConfig = {
    crossZoneSurchargePercent: number;
    useGoogleDistance: boolean;
    geoSurgeEnabled: boolean;
    geoSurgeMinDrivers: number;
    baseFare: number;
    pricePerKm: number;
    pricePerMinute: number;
    minimumFare: number;
    roundingStep: number;
    avgSpeedKmh: number;
    demandSurgeEnabled: boolean;
    demandSurgeThreshold: number;
    demandSurgeMultiplier: number;
    demandSurgeHighMultiplier: number;
    vehicleMultipliers: Record<string, number>;
    peakHours: Array<{ start: string; end: string; multiplier: number; label?: string }>;
};

export default function PricingPage() {
    const { isAr } = useI18n();
    const [config, setConfig] = useState<PricingConfig | null>(null);
    const [zones, setZones] = useState<any[]>([]);
    const [surgeMap, setSurgeMap] = useState<any[]>([]);
    const [special, setSpecial] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const [cfg, zn, sp, surge] = await Promise.all([
                pricingApi.getConfig(),
                pricingApi.getZones(),
                pricingApi.getSpecialServices(),
                pricingApi.getSurgeMap(),
            ]);
            setConfig(cfg.data);
            setZones(zn.data);
            setSpecial(sp.data);
            setSurgeMap(surge.data?.zones ?? []);
        } catch {
            toast.error(isAr ? 'فشل تحميل الأسعار' : 'Failed to load pricing');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        if (!config) return;
        setSaving(true);
        try {
            await pricingApi.updateConfig(config);
            toast.success(isAr ? 'تم حفظ الأسعار' : 'Pricing saved');
            load();
        } catch {
            toast.error(isAr ? 'فشل الحفظ' : 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    function Field({ label, value, onChange, hint }: {
        label: string;
        value: number | string;
        onChange: (v: string) => void;
        hint?: string;
    }) {
        return (
            <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#71717a', marginBottom: 6 }}>
                    {label.toUpperCase()}
                </label>
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%', height: 40, padding: '0 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10, color: '#e4e4e7', fontSize: 13,
                        boxSizing: 'border-box',
                    }}
                />
                {hint && <p style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>{hint}</p>}
            </div>
        );
    }

    const exampleFare = config
        ? Math.max(
            config.minimumFare,
            (config.baseFare + 5 * config.pricePerKm + 12 * config.pricePerMinute) * 1,
        )
        : 0;

    return (
        <>
            <Header title={isAr ? 'التسعير' : 'Pricing'} />
            <div style={{ padding: '28px 32px', maxWidth: 720 }}>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                        {isAr ? 'التسعير الديناميكي — ل.س' : 'Dynamic Pricing — SYP'}
                    </h2>
                    <p style={{ fontSize: 13, color: '#52525b' }}>
                        {isAr
                            ? 'أجرة = (فتح + كم + دقائق) × نوع المركبة × ذروة × طلب — بالليرة السورية'
                            : 'Fare = (base + km + minutes) × vehicle × peak × demand — in Syrian Pound'}
                    </p>
                </div>

                {loading || !config ? (
                    <p style={{ color: '#71717a' }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
                ) : (
                    <form onSubmit={save}>
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 16, padding: 24, marginBottom: 16,
                        }}>
                            <p style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 16 }}>
                                {isAr ? 'مثال رحلة 5 كم (~12 د):' : 'Example 5 km ride (~12 min):'}{' '}
                                <strong style={{ color: '#4ade80' }}>{formatCurrency(exampleFare)}</strong>
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <Field label={isAr ? 'فتح العداد (ل.س)' : 'Base fare (SYP)'} value={config.baseFare}
                                    onChange={(v) => setConfig({ ...config, baseFare: Number(v) })} />
                                <Field label={isAr ? 'سعر الكيلومتر' : 'Price per km'} value={config.pricePerKm}
                                    onChange={(v) => setConfig({ ...config, pricePerKm: Number(v) })} />
                                <Field label={isAr ? 'سعر الدقيقة' : 'Price per minute'} value={config.pricePerMinute}
                                    onChange={(v) => setConfig({ ...config, pricePerMinute: Number(v) })} />
                                <Field label={isAr ? 'الحد الأدنى' : 'Minimum fare'} value={config.minimumFare}
                                    onChange={(v) => setConfig({ ...config, minimumFare: Number(v) })} />
                                <Field label={isAr ? 'تقريب لأقرب' : 'Round to nearest'} value={config.roundingStep}
                                    onChange={(v) => setConfig({ ...config, roundingStep: Number(v) })}
                                    hint={isAr ? 'مثلاً 500 = 12,500 → 12,500' : 'e.g. 500'} />
                                <Field label={isAr ? 'سرعة متوسطة (كم/س)' : 'Avg speed (km/h)'} value={config.avgSpeedKmh}
                                    onChange={(v) => setConfig({ ...config, avgSpeedKmh: Number(v) })} />
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 16, padding: 24, marginBottom: 16,
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', marginBottom: 12 }}>
                                {isAr ? 'SURGE — طلب مرتفع' : 'DEMAND SURGE'}
                            </p>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#a1a1aa', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={config.demandSurgeEnabled}
                                    onChange={(e) => setConfig({ ...config, demandSurgeEnabled: e.target.checked })}
                                />
                                {isAr ? 'تفعيل surge حسب عدد الرحلات قيد البحث' : 'Enable demand-based surge'}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <Field label={isAr ? 'عتبة الطلب' : 'Threshold'} value={config.demandSurgeThreshold}
                                    onChange={(v) => setConfig({ ...config, demandSurgeThreshold: Number(v) })} />
                                <Field label={isAr ? 'مضاعف عادي' : 'Multiplier'} value={config.demandSurgeMultiplier}
                                    onChange={(v) => setConfig({ ...config, demandSurgeMultiplier: Number(v) })} />
                                <Field label={isAr ? 'مضاعف عالي' : 'High multiplier'} value={config.demandSurgeHighMultiplier}
                                    onChange={(v) => setConfig({ ...config, demandSurgeHighMultiplier: Number(v) })} />
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 16, padding: 24, marginBottom: 16,
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', marginBottom: 12 }}>
                                {isAr ? 'إعدادات المناطق والمسافة' : 'ZONES & DISTANCE'}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <Field label={isAr ? 'إضافة بين مناطق (%)' : 'Cross-zone surcharge %'}
                                    value={config.crossZoneSurchargePercent ?? 12}
                                    onChange={(v) => setConfig({ ...config, crossZoneSurchargePercent: Number(v) })} />
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a1a1aa', fontSize: 13, marginTop: 24 }}>
                                    <input
                                        type="checkbox"
                                        checked={config.useGoogleDistance ?? true}
                                        onChange={(e) => setConfig({ ...config, useGoogleDistance: e.target.checked })}
                                    />
                                    Google Distance Matrix
                                </label>
                            </div>
                            {zones.map((z) => {
                                const live = surgeMap.find((s: any) => s.code === z.code);
                                return (
                                <div key={z.code} style={{
                                    padding: '10px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    fontSize: 12,
                                    color: '#a1a1aa',
                                }}>
                                    <strong style={{ color: '#e4e4e7' }}>{isAr ? z.labelAr : z.labelEn}</strong>
                                    {' — '}
                                    {formatCurrency(+z.baseFare)} + {formatCurrency(+z.pricePerKm)}/km
                                    {live && (
                                        <span style={{
                                            marginLeft: 8,
                                            padding: '2px 8px',
                                            borderRadius: 20,
                                            background: `${live.color}22`,
                                            color: live.color,
                                            fontWeight: 700,
                                        }}>
                                            Surge ×{live.surgeMultiplier} · {live.demand}/{live.supply}
                                        </span>
                                    )}
                                </div>
                            );})}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a1a1aa', fontSize: 13, marginTop: 12 }}>
                                <input
                                    type="checkbox"
                                    checked={config.geoSurgeEnabled ?? true}
                                    onChange={(e) => setConfig({ ...config, geoSurgeEnabled: e.target.checked })}
                                />
                                {isAr ? 'Surge ديناميكي حسب المنطقة (خريطة)' : 'Geo surge on map (live)'}
                            </label>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 16, padding: 24, marginBottom: 16,
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', marginBottom: 12 }}>
                                {isAr ? 'مضاعفات أنواع المركبات' : 'VEHICLE MULTIPLIERS'}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                {Object.entries(config.vehicleMultipliers).map(([key, val]) => (
                                    <Field key={key} label={key} value={val}
                                        onChange={(v) => setConfig({
                                            ...config,
                                            vehicleMultipliers: { ...config.vehicleMultipliers, [key]: Number(v) },
                                        })} />
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={saving} style={{
                            padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                        }}>
                            {saving ? '...' : (isAr ? 'حفظ الأسعار' : 'Save pricing')}
                        </button>
                    </form>
                )}
            </div>
        </>
    );
}
