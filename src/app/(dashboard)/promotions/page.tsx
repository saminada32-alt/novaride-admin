'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { promotionsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

type Promotion = {
    id: number;
    code: string;
    description: string;
    discountPercent: number;
    isActive: boolean;
    expiresAt?: string | null;
    maxUses?: number | null;
    usedCount: number;
    maxUsesPerPassenger: number;
    minFare?: number | null;
    createdAt?: string;
};

const emptyForm = {
    code: '',
    description: '',
    discountPercent: '10',
    expiresAt: '',
    maxUses: '',
    maxUsesPerPassenger: '1',
    minFare: '',
    isActive: true,
};

export default function PromotionsPage() {
    const { isAr } = useI18n();
    const [list, setList] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await promotionsApi.getAll();
            setList(Array.isArray(res.data) ? res.data : []);
        } catch {
            setList([]);
            toast.error(isAr ? 'فشل تحميل العروض' : 'Failed to load promotions');
        } finally {
            setLoading(false);
        }
    }, [isAr]);

    useEffect(() => { load(); }, [load]);

    const resetForm = () => {
        setForm(emptyForm);
        setEditId(null);
        setShowForm(false);
    };

    const openCreate = () => {
        setForm(emptyForm);
        setEditId(null);
        setShowForm(true);
    };

    const openEdit = (p: Promotion) => {
        setEditId(p.id);
        setForm({
            code: p.code,
            description: p.description,
            discountPercent: String(p.discountPercent),
            expiresAt: p.expiresAt ? p.expiresAt.slice(0, 16) : '',
            maxUses: p.maxUses != null ? String(p.maxUses) : '',
            maxUsesPerPassenger: String(p.maxUsesPerPassenger ?? 1),
            minFare: p.minFare != null ? String(p.minFare) : '',
            isActive: p.isActive,
        });
        setShowForm(true);
    };

    const submit = async () => {
        if (!form.code.trim() || !form.description.trim()) {
            toast.error(isAr ? 'الكود والوصف مطلوبان' : 'Code and description required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                description: form.description.trim(),
                discountPercent: parseFloat(form.discountPercent),
                isActive: form.isActive,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
                maxUses: form.maxUses ? parseInt(form.maxUses, 10) : undefined,
                maxUsesPerPassenger: form.maxUsesPerPassenger
                    ? parseInt(form.maxUsesPerPassenger, 10)
                    : 1,
                minFare: form.minFare ? parseFloat(form.minFare) : undefined,
            };

            if (editId) {
                await promotionsApi.update(editId, {
                    description: payload.description,
                    discountPercent: payload.discountPercent,
                    isActive: payload.isActive,
                    expiresAt: form.expiresAt ? payload.expiresAt : null,
                    maxUses: form.maxUses ? payload.maxUses : null,
                    maxUsesPerPassenger: payload.maxUsesPerPassenger,
                    minFare: form.minFare ? payload.minFare : null,
                });
                toast.success(isAr ? 'تم تحديث العرض' : 'Promotion updated');
            } else {
                await promotionsApi.create(payload);
                toast.success(isAr ? 'تم إنشاء كود الخصم' : 'Promo code created');
            }
            resetForm();
            load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            toast.error(msg ?? (isAr ? 'فشل الحفظ' : 'Save failed'));
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (p: Promotion) => {
        try {
            await promotionsApi.update(p.id, { isActive: !p.isActive });
            load();
        } catch {
            toast.error(isAr ? 'فشل التحديث' : 'Update failed');
        }
    };

    const fmtDate = (d?: string | null) =>
        d ? new Date(d).toLocaleString(isAr ? 'ar-SY' : 'en') : '—';

    return (
        <>
            <Header
                title={isAr ? 'أكواد الخصم' : 'Promo Codes'}
                subtitle={isAr ? 'إنشاء وإدارة عروض الركاب' : 'Create and manage rider promotions'}
            />

            <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button
                        onClick={openCreate}
                        style={{
                            padding: '10px 18px',
                            borderRadius: 10,
                            border: 'none',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {isAr ? '+ كود جديد' : '+ New code'}
                    </button>
                </div>

                {showForm && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14,
                        padding: 20,
                        marginBottom: 20,
                    }}>
                        <h3 style={{ color: '#e4e4e7', marginBottom: 16 }}>
                            {editId
                                ? (isAr ? 'تعديل العرض' : 'Edit promotion')
                                : (isAr ? 'كود خصم جديد' : 'New promo code')}
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: 12,
                        }}>
                            <Field
                                label={isAr ? 'الكود' : 'Code'}
                                value={form.code}
                                onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
                                disabled={!!editId}
                            />
                            <Field
                                label={isAr ? 'نسبة الخصم %' : 'Discount %'}
                                value={form.discountPercent}
                                onChange={(v) => setForm({ ...form, discountPercent: v })}
                                type="number"
                            />
                            <Field
                                label={isAr ? 'الوصف' : 'Description'}
                                value={form.description}
                                onChange={(v) => setForm({ ...form, description: v })}
                                span={2}
                            />
                            <Field
                                label={isAr ? 'انتهاء الصلاحية' : 'Expires at'}
                                value={form.expiresAt}
                                onChange={(v) => setForm({ ...form, expiresAt: v })}
                                type="datetime-local"
                            />
                            <Field
                                label={isAr ? 'حد الاستخدام الكلي' : 'Max uses'}
                                value={form.maxUses}
                                onChange={(v) => setForm({ ...form, maxUses: v })}
                                type="number"
                            />
                            <Field
                                label={isAr ? 'لكل راكب' : 'Per passenger'}
                                value={form.maxUsesPerPassenger}
                                onChange={(v) => setForm({ ...form, maxUsesPerPassenger: v })}
                                type="number"
                            />
                            <Field
                                label={isAr ? 'حد أدنى للأجرة (ل.س)' : 'Min fare (SYP)'}
                                value={form.minFare}
                                onChange={(v) => setForm({ ...form, minFare: v })}
                                type="number"
                            />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: '#a1a1aa' }}>
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            />
                            {isAr ? 'نشط' : 'Active'}
                        </label>
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button onClick={submit} disabled={saving} style={btnPrimary}>
                                {saving ? '...' : (isAr ? 'حفظ' : 'Save')}
                            </button>
                            <button onClick={resetForm} style={btnGhost}>
                                {isAr ? 'إلغاء' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <p style={{ color: '#71717a' }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
                ) : list.length === 0 ? (
                    <p style={{ color: '#71717a' }}>{isAr ? 'لا توجد عروض بعد' : 'No promotions yet'}</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {list.map((p) => (
                            <div
                                key={p.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    padding: '16px 18px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 12,
                                }}
                            >
                                <div style={{
                                    padding: '8px 14px',
                                    background: 'rgba(34,197,94,0.15)',
                                    borderRadius: 8,
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    color: '#4ade80',
                                }}>
                                    {p.code}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ color: '#e4e4e7', fontWeight: 600, margin: 0 }}>
                                        {p.description}
                                    </p>
                                    <p style={{ color: '#71717a', fontSize: 12, margin: '4px 0 0' }}>
                                        {p.discountPercent}% · {isAr ? 'مستخدم' : 'used'} {p.usedCount}
                                        {p.maxUses != null ? ` / ${p.maxUses}` : ''}
                                        {' · '}{fmtDate(p.expiresAt)}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    background: p.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: p.isActive ? '#4ade80' : '#f87171',
                                }}>
                                    {p.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطّل' : 'Off')}
                                </span>
                                <button onClick={() => openEdit(p)} style={btnGhost}>{isAr ? 'تعديل' : 'Edit'}</button>
                                <button onClick={() => toggleActive(p)} style={btnGhost}>
                                    {p.isActive ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل' : 'Enable')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function Field({
    label, value, onChange, type = 'text', disabled, span,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    disabled?: boolean;
    span?: number;
}) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: span ? `span ${span}` : undefined }}>
            <span style={{ fontSize: 11, color: '#71717a' }}>{label}</span>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                }}
            />
        </label>
    );
}

const btnPrimary: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#a1a1aa',
    cursor: 'pointer',
};
