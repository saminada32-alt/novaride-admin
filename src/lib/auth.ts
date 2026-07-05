import Cookies from 'js-cookie';
import type { Admin } from './types';

const TOKEN_KEY = 'nr_admin_token';
const USER_KEY = 'nr_admin_user';

export const auth = {
    setToken(token: string) {
        Cookies.set(TOKEN_KEY, token, {
            expires: 0.5,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
    },

    getToken(): string | null {
        return Cookies.get(TOKEN_KEY) ?? null;
    },

    setUser(user: Admin) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    },

    getUser(): Admin | null {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },

    clear() {
        Cookies.remove(TOKEN_KEY);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_KEY);
        }
    },

    isLoggedIn(): boolean {
        return !!this.getToken();
    },
};
