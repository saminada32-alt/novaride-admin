import axios, { AxiosInstance } from 'axios';
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
        (err) => {
            if (err.response?.status === 401) {
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
    login: (email: string, password: string) =>
        api.post('/admin/login', { email, password }),
    getMe: () => api.get('/admin/me'),
};

export const driversApi = {
    getAll: (status?: string) =>
        api.get('/drivers', { params: status ? { status } : {} }),
    getOne: (id: number) => api.get(`/drivers/${id}`),
    approve: (id: number) => api.patch(`/drivers/${id}/approve`),
    reject: (id: number, reason?: string) =>
        api.patch(`/drivers/${id}/reject`, { reason }),
};

export const documentsApi = {
    getAll: (status?: string) =>
        api.get('/documents/all', { params: status && status !== 'all' ? { status } : {} }),
    getPending: () => api.get('/documents/pending'),
    getByDriver: (driverId: number) =>
        api.get(`/documents/driver/${driverId}`),
    approve: (driverId: number) =>
        api.patch(`/documents/driver/${driverId}/approve`),
    reject: (driverId: number, reason: string) =>
        api.patch(`/documents/driver/${driverId}/reject`, { reason }),
};

export const ridesApi = {
    getAll: (params?: { status?: string; limit?: number }) =>
        api.get('/rides', { params }),
    confirmPayment: (rideId: number) =>
        api.patch(`/rides/${rideId}/payment/confirm`),
};

export const earningsApi = {
    getDashboard: (driverId: number) =>
        api.get(`/earnings/driver/${driverId}/dashboard`),
};

export const healthApi = {
    check: () => api.get('/health'),
};

// ─── Live Ops / Control room ──────────────────────────────────

export interface OpsDashboard {
    timestamp: string;
    rides: { active: number; searching: number; scheduled?: number; completedToday: number };
    drivers: { online: number; pendingApproval: number };
    payments: {
        ridesAwaitingConfirm: number;
        driverPayoutsPending: number;
        subscriptionPaymentsPending: number;
    };
    support: { complaints: { open: number; inReview: number; resolved: number; rejected: number; total: number } };
    infrastructure: {
        dispatchQueueLength: number;
        socketConnections: number;
        socketRooms: number;
    };
}

export interface OpsAlert {
    level: 'warning' | 'critical';
    code: string;
    message: string;
}

export interface OpsLiveDriver {
    id: number;
    lat: number;
    lng: number;
    name: string;
    phone?: string;
    status?: string;
    isAvailable?: boolean;
}

export interface OpsActiveRide {
    id: number;
    status: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    pickupAddress?: string;
    dropoffAddress?: string;
    estimatedFare: number;
    passenger: { id: number; name: string; phone?: string } | null;
    driver: { id: number; name: string; phone?: string } | null;
    createdAt: string;
}

export interface OpsScheduledRide {
    id: number;
    status: string;
    scheduledAt: string | null;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    pickupAddress?: string;
    dropoffAddress?: string;
    estimatedFare: number;
    passenger: { id: number; name: string; phone?: string } | null;
    createdAt: string;
}

export const opsApi = {
    dashboard: () => api.get<OpsDashboard>('/ops/dashboard'),
    liveMap: () =>
        api.get<{ updatedAt: string; drivers: OpsLiveDriver[] }>('/ops/live-map'),
    activeRides: () => api.get<OpsActiveRide[]>('/ops/rides/active'),
    scheduledRides: () => api.get<OpsScheduledRide[]>('/ops/rides/scheduled'),
    queues: () =>
        api.get<{
            dispatchQueueLength: number;
            socket: { connected: number; rooms: number };
            onlineDrivers: number;
            alerts: OpsAlert[];
        }>('/ops/queues'),
    health: () => api.get('/ops/health'),
    cancelRide: (rideId: number, reason?: string) =>
        api.post(`/ops/rides/${rideId}/cancel`, { reason }),
    confirmPayment: (rideId: number) =>
        api.patch(`/ops/rides/${rideId}/payment/confirm`),
};

export const passengersApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get('/passengers', { params }),
    getOne: (id: number) => api.get(`/passengers/${id}`),
    toggleBlock: (id: number) => api.patch(`/passengers/${id}/block`),
};

export const complaintsApi = {
    getAll: (status?: string) =>
        api.get('/complaints', { params: status && status !== 'all' ? { status } : {} }),
    getStats: () => api.get('/complaints/stats'),
    resolve: (id: number, data: { status: string; adminNote: string }) =>
        api.patch(`/complaints/${id}/resolve`, data),
};

export const subscriptionsApi = {
    getAll: (status?: string) =>
        api.get('/subscriptions', { params: status && status !== 'all' ? { status } : {} }),
    getPendingPayments: () => api.get('/subscriptions/payments/pending'),
    confirmPayment: (id: number, data: {
        amount: number;
        method: string;
        reference?: string;
        note?: string;
    }) => api.patch(`/subscriptions/${id}/confirm-payment`, data),
    approvePayment: (paymentId: number) =>
        api.patch(`/subscriptions/payments/${paymentId}/approve`),
    rejectPayment: (paymentId: number, note?: string) =>
        api.patch(`/subscriptions/payments/${paymentId}/reject`, { note }),
    suspend: (id: number, reason?: string) =>
        api.patch(`/subscriptions/${id}/suspend`, { reason }),
};

export const adminSettingsApi = {
    changePassword: (currentPassword: string, newPassword: string) =>
        api.patch('/admin/me/password', { currentPassword, newPassword }),
};

export const pricingApi = {
    getConfig: () => api.get('/pricing/admin/config'),
    updateConfig: (data: Record<string, unknown>) =>
        api.patch('/pricing/admin/config', data),
    getZones: () => api.get('/pricing/admin/zones'),
    getSpecialServices: () => api.get('/pricing/special'),
    getSurgeMap: () => api.get('/pricing/surge-map'),
};

export const promotionsApi = {
    getAll: () => api.get('/promotions/admin'),
    create: (data: {
        code: string;
        description: string;
        discountPercent: number;
        isActive?: boolean;
        expiresAt?: string;
        maxUses?: number;
        maxUsesPerPassenger?: number;
        minFare?: number;
    }) => api.post('/promotions/admin', data),
    update: (id: number, data: Record<string, unknown>) =>
        api.patch(`/promotions/admin/${id}`, data),
    getStats: (id: number) => api.get(`/promotions/admin/${id}/stats`),
};

export type SupportChatMessage = {
    id: number;
    passengerId: number | null;
    senderId: number;
    senderRole: string;
    body: string;
    createdAt: string;
};

export type SupportChatThread = {
    passengerId: number;
    passenger: {
        id: number;
        phone: string;
        firstName?: string;
        lastName?: string;
    } | null;
    lastMessage: SupportChatMessage;
};

export const chatApi = {
    getThreads: () => api.get<SupportChatThread[]>('/support/chat/threads'),
    getMessages: (passengerId: number) =>
        api.get<SupportChatMessage[]>(`/support/chat/passenger/${passengerId}`),
    sendMessage: (passengerId: number, body: string) =>
        api.post<SupportChatMessage>(`/support/chat/passenger/${passengerId}`, { body }),
};