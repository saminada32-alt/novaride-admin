#!/usr/bin/env bash
# Hotfix broken admin API client on the VPS (proxy/auth routes missing).
set -euo pipefail

cd "$(dirname "$0")/.."

if grep -q '/api/proxy\|/api/auth/login' src/lib/api.ts; then
  python3 <<'PY'
from pathlib import Path
path = Path('src/lib/api.ts')
text = path.read_text()
end = text.index('export const driversApi')
fixed = '''import axios, { AxiosInstance } from 'axios';
import { auth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const createClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_URL,
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' },
    });

    client.interceptors.request.use((config) => {
        const token = auth.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    client.interceptors.response.use(
        (res) => res,
        async (err) => {
            const url = String(err.config?.url ?? '');
            const isLogin = url.includes('/admin/login');
            if (err.response?.status === 401 && typeof window !== 'undefined' && !isLogin) {
                auth.clear();
                window.location.href = '/login';
            }
            return Promise.reject(err);
        },
    );

    return client;
};

export const api = createClient();

// ─── API calls ────────────────────────────────────────────────

export const adminApi = {
    login: (email: string, password: string, totpCode?: string) =>
        api.post('/admin/login', { email, password, totpCode }),
    getMe: () => api.get('/admin/me'),
};

'''
path.write_text(fixed + text[end:])
print('Patched src/lib/api.ts')
PY
else
  echo 'api.ts already correct'
fi
