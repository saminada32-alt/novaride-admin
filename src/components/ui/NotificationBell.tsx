'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { notificationStore, AppNotification } from '@/lib/notifications';
import { useI18n } from '@/lib/i18n';
import { formatRelativeTime } from '@/lib/utils';

export function NotificationBell() {
    const router = useRouter();
    const { isAr } = useI18n();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return notificationStore.subscribe(setNotifications);
    }, []);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Request browser notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const unread = notifications.filter(n => !n.read).length;

    const TYPE_ICONS: Record<string, string> = {
        new_driver: '👤',
        new_ride: '🚗',
        ride_completed: '✅',
        doc_uploaded: '📄',
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative', width: '36px', height: '36px',
                    borderRadius: '9px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                    color: '#71717a',
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.color = '#e4e4e7';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLElement).style.color = '#71717a';
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {unread > 0 && (
                    <div style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        minWidth: '16px', height: '16px',
                        background: '#ef4444', borderRadius: '99px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: '700', color: '#fff',
                        padding: '0 4px', border: '2px solid #0a0a0f',
                    }}>
                        {unread > 9 ? '9+' : unread}
                    </div>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)',
                    right: 0, width: '340px', zIndex: 100,
                    background: '#0f0f13',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>
                            {isAr ? 'الإشعارات' : 'Notifications'}
                            {unread > 0 && (
                                <span style={{
                                    marginLeft: '8px', fontSize: '10px', fontWeight: '700',
                                    padding: '1px 6px', borderRadius: '99px',
                                    background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                                }}>
                                    {unread}
                                </span>
                            )}
                        </p>
                        {unread > 0 && (
                            <button
                                onClick={() => notificationStore.markAllRead()}
                                style={{
                                    fontSize: '11px', color: '#818cf8',
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', padding: 0,
                                }}
                            >
                                {isAr ? 'قراءة الكل' : 'Mark all read'}
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
                                {isAr ? 'لا توجد إشعارات' : 'No notifications yet'}
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        notificationStore.markRead(n.id);
                                        if (n.link) { router.push(n.link); setOpen(false); }
                                    }}
                                    style={{
                                        display: 'flex', gap: '12px', padding: '12px 16px',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        cursor: n.link ? 'pointer' : 'default',
                                        background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(99,102,241,0.04)'}
                                >
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '16px',
                                    }}>
                                        {TYPE_ICONS[n.type] ?? '🔔'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#e4e4e7', marginBottom: '2px' }}>
                                                {n.title}
                                            </p>
                                            {!n.read && (
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: '3px' }} />
                                            )}
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#71717a', lineHeight: 1.5 }}>{n.message}</p>
                                        <p style={{ fontSize: '10px', color: '#3f3f46', marginTop: '4px' }}>
                                            {formatRelativeTime(n.time.toISOString())}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}