'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export function useKeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        function handler(e: KeyboardEvent) {
            // Ctrl/Cmd + K = go to dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                router.push('/dashboard');
            }
            // Ctrl/Cmd + D = drivers
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                router.push('/drivers');
            }
            // Ctrl/Cmd + R = rides
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                router.push('/rides');
            }
            // Ctrl/Cmd + L = logout
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                auth.clear();
                router.push('/login');
            }
        }

        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [router]);
}