export interface AppNotification {
    id: string;
    type: 'new_driver' | 'new_ride' | 'ride_completed' | 'doc_uploaded';
    title: string;
    message: string;
    time: Date;
    read: boolean;
    link?: string;
}

// Simple in-memory store
class NotificationStore {
    private notifications: AppNotification[] = [];
    private listeners: ((n: AppNotification[]) => void)[] = [];

    add(n: Omit<AppNotification, 'id' | 'time' | 'read'>) {
        const notification: AppNotification = {
            ...n,
            id: Math.random().toString(36).slice(2),
            time: new Date(),
            read: false,
        };
        this.notifications = [notification, ...this.notifications].slice(0, 50);
        this.listeners.forEach(l => l([...this.notifications]));

        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification(n.title, { body: n.message, icon: '/favicon.ico' });
        }
    }

    markRead(id: string) {
        this.notifications = this.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        this.listeners.forEach(l => l([...this.notifications]));
    }

    markAllRead() {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.listeners.forEach(l => l([...this.notifications]));
    }

    subscribe(listener: (n: AppNotification[]) => void) {
        this.listeners.push(listener);
        listener([...this.notifications]);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }
}

export const notificationStore = new NotificationStore();