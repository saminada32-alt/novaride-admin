'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import type { Admin } from '@/lib/types';

export function useAuth() {
    const router = useRouter();
    const [user, setUser] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = auth.getUser();
        if (!auth.isLoggedIn()) {
            router.replace('/login');
            return;
        }
        setUser(u);
        setLoading(false);
    }, [router]);

    function logout() {
        auth.clear();
        router.replace('/login');
    }

    return { user, loading, logout };
}