'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemePanelV2 } from '@/components/ui/ThemePanel';
import { useTheme } from '@/lib/theme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { RealtimeProvider } from '@/lib/realtime';
import { MarketProvider } from '@/lib/market-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { theme } = useTheme();
    useKeyboardShortcuts();

    useEffect(() => {
        if (!auth.isLoggedIn()) router.replace('/login');
    }, [router]);

    return (
        <RealtimeProvider>
        <MarketProvider>
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            color: 'var(--text-1)',
            transition: 'background 0.3s, color 0.3s',
        }}>
            <Sidebar />
            <div style={{
                marginLeft: theme.sidebarSize === 'compact' ? '68px' : '260px',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left 0.3s ease',
            }}>
                {children}
            </div>
            <ThemePanelV2 />
        </div>
        </MarketProvider>
        </RealtimeProvider>
    );
}