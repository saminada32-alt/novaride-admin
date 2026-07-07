'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { notificationStore } from './notifications';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type RefreshCallback = () => void;

interface RealtimeContextType {
    connected: boolean;
    onRefresh: (cb: RefreshCallback) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
    connected: false,
    onRefresh: () => () => {},
});

function handleAdminEvent(
    data: { event?: string; payload?: Record<string, unknown> },
    triggerRefresh: () => void,
) {
    const { event, payload } = data;
    if (!event) return;

    switch (event) {
        case 'new_driver_registered':
            notificationStore.add({
                type: 'new_driver',
                title: 'New Driver Registered',
                message: `${payload?.phone ?? 'Unknown'} just signed up`,
                link: `/drivers/${payload?.id}`,
            });
            triggerRefresh();
            break;

        case 'new_ride_created':
            notificationStore.add({
                type: 'new_ride',
                title: 'New Ride Request',
                message: `Ride #${payload?.id} — $${payload?.fare ?? 0}`,
                link: '/rides',
            });
            triggerRefresh();
            break;

        case 'ride_completed':
            notificationStore.add({
                type: 'ride_completed',
                title: 'Ride Completed',
                message: `Ride #${payload?.id} completed`,
            });
            triggerRefresh();
            break;

        case 'documents_uploaded':
            notificationStore.add({
                type: 'doc_uploaded',
                title: 'Documents Uploaded',
                message: `Driver ${payload?.phone ?? payload?.driverId} uploaded documents`,
                link: '/documents',
            });
            triggerRefresh();
            break;
    }
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const refreshCallbacks = useRef(new Set<RefreshCallback>());

    const triggerRefresh = useCallback(() => {
        refreshCallbacks.current.forEach((cb) => cb());
    }, []);

    const onRefresh = useCallback((cb: RefreshCallback) => {
        refreshCallbacks.current.add(cb);
        return () => {
            refreshCallbacks.current.delete(cb);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function connect() {
            try {
                const res = await fetch('/api/auth/ws-token', { cache: 'no-store' });
                if (!res.ok) return;
                const { token } = await res.json();
                if (!token || cancelled) return;

                const socket = io(`${API_URL}/tracking`, {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionDelayMax: 30000,
                });

                socketRef.current = socket;

                socket.on('connect', () => setConnected(true));
                socket.on('disconnect', () => setConnected(false));
                socket.on('connect_error', () => setConnected(false));

                socket.on('admin:event', (data) => {
                    handleAdminEvent(data, triggerRefresh);
                });
            } catch {
                setConnected(false);
            }
        }

        void connect();

        return () => {
            cancelled = true;
            socketRef.current?.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [triggerRefresh]);

    return (
        <RealtimeContext.Provider value={{ connected, onRefresh }}>
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtime() {
    return useContext(RealtimeContext);
}
