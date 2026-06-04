const TOKEN_KEY = 'nr_token';
const USER_KEY = 'nr_admin_user';

export const auth = {

    setToken(token: string) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    setUser(user: any) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    getUser() {
        if (typeof window === 'undefined') return null;
        try {
            return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        } catch { return null; }
    },

    isLoggedIn(): boolean {
        return !!this.getToken();
    },

    logout() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};

// للتوافق مع الكود القديم
export const getAdminToken = () => auth.getToken();
export const setAdminToken = (t: string) => auth.setToken(t);
export const clearAdminToken = () => auth.logout();