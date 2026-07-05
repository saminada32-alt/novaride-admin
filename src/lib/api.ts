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

export const driversApi = {
    getAll: (status?: string) =>
        api.get('/drivers', { params: status ? { status } : {} }),
    getOne: (id: number) => api.get(`/drivers/${id}`),
    approve: (id: number) => api.patch(`/drivers/${id}/approve`),
    reject: (id: number, reason?: string) =>
        api.patch(`/drivers/${id}/reject`, { reason }),
    suspend: (id: number, reason?: string) =>
        api.patch(`/drivers/${id}/suspend`, { reason }),
    unsuspend: (id: number) => api.patch(`/drivers/${id}/unsuspend`),
    approveFull: (id: number) => api.patch(`/drivers/${id}/approve-full`),
};

export const documentsApi = {
    getAll: (status?: string) =>
        api.get('/documents/all', { params: status && status !== 'all' ? { status } : {} }),
    getPending: () => api.get('/documents/pending'),
    getByDriver: (driverId: number) =>
        api.get(`/documents/driver/${driverId}`),
    approve: (driverId: number) =>
        api.patch(`/documents/driver/${driverId}/approve`),
    reject: (driverId: number, reason?: string) =>
        api.patch(`/documents/driver/${driverId}/reject`, { reason }),
    rejectFields: (
        driverId: number,
        data: { fields: string[]; reason?: string; fieldReasons?: Record<string, string> },
    ) => api.patch(`/documents/driver/${driverId}/reject-fields`, data),
};
export const ridesApi = {
    getAll: (params?: { status?: string; limit?: number }) =>
        api.get('/rides', { params }),
    getAdminDetail: (id: number) => api.get(`/rides/${id}/admin`),
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

export interface OpsPendingPayment {
    id: number;
    status: string;
    marketCode?: string;
    finalFare?: number;
    estimatedFare?: number;
    paymentReference?: string;
    paymentMethod?: string;
    completedAt?: string;
    passenger: { id: number; firstName?: string; lastName?: string; phone?: string } | null;
    driver: { id: number; firstName?: string; lastName?: string; phone?: string } | null;
}

export interface OpsSosIncident {
    id: number;
    rideId: number;
    createdAt: string;
    meta: {
        userId?: number;
        role?: string;
        lat?: number;
        lng?: number;
        at?: string;
    };
    ride: {
        id: number;
        status: string;
        marketCode?: string | null;
        passenger: { id: number; name: string; phone?: string } | null;
        driver: { id: number; name: string; phone?: string } | null;
    } | null;
}

export interface AdminMarket {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    currency: string;
    currencySymbol: string;
    active: boolean;
}

const opsMarketParams = (marketCode?: string | null) =>
    marketCode ? { marketCode } : {};

export const opsApi = {
    dashboard: (marketCode?: string | null) =>
        api.get<OpsDashboard>('/ops/dashboard', { params: opsMarketParams(marketCode) }),
    liveMap: (marketCode?: string | null) =>
        api.get<{ updatedAt: string; drivers: OpsLiveDriver[] }>('/ops/live-map', {
            params: opsMarketParams(marketCode),
        }),
    activeRides: (marketCode?: string | null) =>
        api.get<OpsActiveRide[]>('/ops/rides/active', { params: opsMarketParams(marketCode) }),
    scheduledRides: (marketCode?: string | null) =>
        api.get<OpsScheduledRide[]>('/ops/rides/scheduled', { params: opsMarketParams(marketCode) }),
    queues: (marketCode?: string | null) =>
        api.get<{
            marketCode?: string | null;
            dispatchQueueLength: number;
            socket: { connected: number; rooms: number };
            onlineDrivers: number;
            searchingRides: number;
            alerts: OpsAlert[];
        }>('/ops/queues', { params: opsMarketParams(marketCode) }),
    health: () => api.get('/ops/health'),
    cancelRide: (rideId: number, reason?: string) =>
        api.post(`/ops/rides/${rideId}/cancel`, { reason }),
    confirmPayment: (rideId: number) =>
        api.patch(`/ops/rides/${rideId}/payment/confirm`),
    pendingPayments: (marketCode?: string | null) =>
        api.get<OpsPendingPayment[]>('/ops/rides/pending-payments', {
            params: opsMarketParams(marketCode),
        }),
    sosIncidents: (marketCode?: string | null) =>
        api.get<OpsSosIncident[]>('/ops/safety/sos', { params: opsMarketParams(marketCode) }),
    pendingDrivers: () => api.get('/ops/drivers/pending'),
    assignCandidates: (rideId: number) =>
        api.get(`/ops/rides/${rideId}/assign-candidates`),
    assignDriver: (rideId: number, driverId: number) =>
        api.post(`/ops/rides/${rideId}/assign`, { driverId }),
    reassignDriver: (rideId: number, driverId: number) =>
        api.post(`/ops/rides/${rideId}/reassign`, { driverId }),
};

export const marketsApi = {
    adminList: () => api.get<AdminMarket[]>('/markets/admin'),
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

// ─── Privacy / DSR ────────────────────────────────────────────

export type PrivacyDsrType =
    | 'access'
    | 'erasure'
    | 'rectification'
    | 'portability'
    | 'restriction'
    | 'objection';

export type PrivacyDsrStatus =
    | 'submitted'
    | 'identity_verified'
    | 'in_progress'
    | 'completed'
    | 'rejected'
    | 'cancelled';

export type PrivacyDsrRequest = {
    id: number;
    userId: number;
    userRole: 'PASSENGER' | 'DRIVER';
    type: PrivacyDsrType;
    status: PrivacyDsrStatus;
    details?: string | null;
    rectificationPayload?: Record<string, unknown> | null;
    exportPayload?: Record<string, unknown> | null;
    adminNote?: string | null;
    assignedAdminId?: number | null;
    dueAt: string;
    completedAt?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
    updatedAt?: string;
    exportAvailable?: boolean;
};

export type PrivacyDsrStats = {
    byStatus: Record<PrivacyDsrStatus, number>;
    overdue: number;
    slaDays: number;
};

export const privacyDsrApi = {
    getStats: () => api.get<PrivacyDsrStats>('/privacy/dsr/admin/stats'),
    list: (params?: {
        status?: PrivacyDsrStatus;
        type?: PrivacyDsrType;
        page?: number;
        limit?: number;
    }) => api.get<{ data: PrivacyDsrRequest[]; total: number; page: number; pageSize: number }>(
        '/privacy/dsr/admin',
        { params },
    ),
    update: (id: number, data: {
        status?: PrivacyDsrStatus;
        adminNote?: string;
        rejectionReason?: string;
    }) => api.patch<PrivacyDsrRequest>(`/privacy/dsr/admin/${id}`, data),
    fulfillErasure: (id: number) =>
        api.post<PrivacyDsrRequest>(`/privacy/dsr/admin/${id}/fulfill-erasure`),
    fulfillAccess: (id: number) =>
        api.post<PrivacyDsrRequest>(`/privacy/dsr/admin/${id}/fulfill-access`),
    fulfillRectification: (id: number) =>
        api.post<PrivacyDsrRequest>(`/privacy/dsr/admin/${id}/fulfill-rectification`),
};

// ─── Finance / Ledger / Payouts / KYC / Fraud / Audit / MFA ──

export const financeApi = {
    getSummary: (from?: string, to?: string) =>
        api.get('/finance/reconciliation/summary', { params: { from, to } }),
    getItems: (from?: string, to?: string) =>
        api.get('/finance/reconciliation/items', { params: { from, to } }),
    matchRide: (rideId: number) =>
        api.post(`/finance/reconciliation/rides/${rideId}/match`),
};

export const ledgerApi = {
    getSummary: () => api.get('/ledger/summary'),
    getEntries: (params?: { account?: string; rideId?: number; limit?: number }) =>
        api.get('/ledger/entries', { params }),
};

export const payoutsApi = {
    getPending: () => api.get('/ops/payouts/pending'),
    getAll: () => api.get('/ops/payouts'),
    getBalances: () => api.get('/ops/payouts/balances'),
    approve: (id: number) => api.patch(`/ops/payouts/${id}/approve`),
    reject: (id: number, reason?: string) =>
        api.patch(`/ops/payouts/${id}/reject`, { note: reason }),
};

export const kycApi = {
    getQueue: (status?: string) =>
        api.get('/kyc/admin/queue', { params: status ? { status } : {} }),
    approve: (driverId: number) => api.patch(`/kyc/admin/${driverId}/approve`),
    reject: (driverId: number, reason?: string) =>
        api.patch(`/kyc/admin/${driverId}/reject`, { reason }),
};

export const fraudApi = {
    getAlerts: (params?: { status?: string; type?: string; limit?: number }) =>
        api.get('/fraud/admin', { params }),
    getStats: () => api.get('/fraud/admin/stats'),
    getRules: () => api.get('/fraud/admin/rules'),
    updateRule: (id: number, data: Record<string, unknown>) =>
        api.patch(`/fraud/admin/rules/${id}`, data),
    review: (id: number, data: { status: string; adminNote?: string; applyEnforcement?: boolean }) =>
        api.patch(`/fraud/admin/${id}/review`, data),
    scan: () => api.post('/fraud/admin/scan'),
};

export const auditApi = {
    getPlatform: (params?: { limit?: number; category?: string; from?: string; to?: string }) =>
        api.get('/platform-audit', { params }),
    getAdmin: (params?: { limit?: number; action?: string; from?: string; to?: string }) =>
        api.get('/admin/audit', { params }),
};

export const adminMfaApi = {
    setup: () => api.post('/admin/mfa/setup'),
    confirm: (code: string) => api.post('/admin/mfa/confirm', { code }),
    disable: (code: string) => api.post('/admin/mfa/disable', { code }),
};
