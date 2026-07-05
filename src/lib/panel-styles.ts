/** Shared theme-aware inline styles for dashboard pages. */

export const panel = {
    page: {
        padding: '28px 32px',
        maxWidth: '1400px',
        margin: '0 auto',
        color: 'var(--text-1)',
    } as const,
    title: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text-1)',
        marginBottom: '4px',
    } as const,
    subtitle: {
        fontSize: '13px',
        color: 'var(--text-3)',
    } as const,
    card: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        color: 'var(--text-1)',
    } as const,
    cardSubtle: {
        background: 'var(--bg-hover)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        color: 'var(--text-1)',
    } as const,
    text: { color: 'var(--text-1)' } as const,
    textSecondary: { color: 'var(--text-2)' } as const,
    textMuted: { color: 'var(--text-3)' } as const,
    textFaint: { color: 'var(--text-4)' } as const,
    input: {
        background: 'var(--bg-hover)',
        border: '1px solid var(--border)',
        color: 'var(--text-1)',
        outline: 'none',
    } as const,
    tab: (active: boolean) => ({
        padding: '8px 12px',
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 700,
        border: '1px solid var(--border)',
        cursor: 'pointer',
        background: active ? 'var(--accent)' : 'var(--bg-hover)',
        color: active ? '#fff' : 'var(--text-2)',
    }),
    rowDivider: {
        borderBottom: '1px solid var(--border)',
    } as const,
};
