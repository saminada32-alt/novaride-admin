'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import {
    chatApi,
    passengersApi,
    type SupportChatMessage,
    type SupportChatThread,
} from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';

type PassengerOption = {
    id: number;
    phone: string;
    firstName?: string;
    lastName?: string;
};

function passengerLabel(
    p: { firstName?: string; lastName?: string; phone: string } | null,
    fallbackId: number,
) {
    if (!p) return `#${fallbackId}`;
    const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
    return name || p.phone;
}

function isStaff(role: string) {
    return role === 'ADMIN' || role === 'SUPERADMIN' || role === 'SUPPORT';
}

export default function SupportChatPage() {
    const { isAr } = useI18n();
    const [threads, setThreads] = useState<SupportChatThread[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messages, setMessages] = useState<SupportChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [search, setSearch] = useState('');
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const [passengerSearch, setPassengerSearch] = useState('');
    const [passengerOptions, setPassengerOptions] = useState<PassengerOption[]>([]);
    const [loadingPassengers, setLoadingPassengers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadThreads = useCallback(async () => {
        setLoadingThreads(true);
        try {
            const res = await chatApi.getThreads();
            setThreads(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error(isAr ? 'فشل تحميل المحادثات' : 'Failed to load conversations');
        } finally {
            setLoadingThreads(false);
        }
    }, [isAr]);

    const loadMessages = useCallback(async (passengerId: number) => {
        setLoadingMessages(true);
        try {
            const res = await chatApi.getMessages(passengerId);
            setMessages(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error(isAr ? 'فشل تحميل الرسائل' : 'Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    }, [isAr]);

    useEffect(() => {
        loadThreads();
        const id = setInterval(loadThreads, 15000);
        return () => clearInterval(id);
    }, [loadThreads]);

    useEffect(() => {
        if (!selectedId) return;
        loadMessages(selectedId);
        const id = setInterval(() => loadMessages(selectedId), 4000);
        return () => clearInterval(id);
    }, [selectedId, loadMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const searchPassengers = async () => {
        setLoadingPassengers(true);
        try {
            const res = await passengersApi.getAll({
                search: passengerSearch || undefined,
                limit: 15,
                page: 1,
            });
            const list = res.data?.data ?? res.data ?? [];
            setPassengerOptions(Array.isArray(list) ? list : []);
        } catch {
            toast.error(isAr ? 'فشل البحث' : 'Search failed');
        } finally {
            setLoadingPassengers(false);
        }
    };

    const sendReply = async () => {
        if (!selectedId || !draft.trim() || sending) return;
        setSending(true);
        try {
            const res = await chatApi.sendMessage(selectedId, draft.trim());
            setDraft('');
            setMessages((prev) => {
                if (prev.some((m) => m.id === res.data.id)) return prev;
                return [...prev, res.data];
            });
            loadThreads();
        } catch {
            toast.error(isAr ? 'فشل الإرسال' : 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const selectedThread = threads.find((t) => t.passengerId === selectedId);

    const filteredThreads = threads.filter((t) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const label = passengerLabel(t.passenger, t.passengerId).toLowerCase();
        const phone = t.passenger?.phone?.toLowerCase() ?? '';
        return label.includes(q) || phone.includes(q);
    });

    const panelStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        overflow: 'hidden',
    };

    return (
        <>
            <Header title={isAr ? 'دردشة الدعم' : 'Support Chat'} />
            <div style={{ padding: '20px 28px 28px', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
                            {isAr ? 'دردشة الدعم' : 'Support Chat'}
                        </h2>
                        <p style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>
                            {isAr
                                ? 'ردّ على رسائل الركاب من التطبيق'
                                : 'Reply to passenger messages from the app'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setShowNewChat((v) => !v);
                            if (!showNewChat) searchPassengers();
                        }}
                        style={{
                            padding: '10px 16px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#6366f1',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        {isAr ? '+ محادثة جديدة' : '+ New chat'}
                    </button>
                </div>

                {showNewChat && (
                    <div style={{ ...panelStyle, padding: 16, marginBottom: 16 }}>
                        <p style={{ fontSize: 12, color: '#a1a1aa', margin: '0 0 10px' }}>
                            {isAr ? 'ابحث عن راكب لبدء محادثة' : 'Find a passenger to start a conversation'}
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            <input
                                value={passengerSearch}
                                onChange={(e) => setPassengerSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchPassengers()}
                                placeholder={isAr ? 'اسم أو هاتف...' : 'Name or phone...'}
                                style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.04)',
                                    color: '#fff',
                                    fontSize: 13,
                                }}
                            />
                            <button
                                type="button"
                                onClick={searchPassengers}
                                disabled={loadingPassengers}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#e4e4e7',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                }}
                            >
                                {isAr ? 'بحث' : 'Search'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                            {passengerOptions.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedId(p.id);
                                        setShowNewChat(false);
                                        if (!threads.some((t) => t.passengerId === p.id)) {
                                            setThreads((prev) => [
                                                {
                                                    passengerId: p.id,
                                                    passenger: p,
                                                    lastMessage: {
                                                        id: 0,
                                                        passengerId: p.id,
                                                        senderId: 0,
                                                        senderRole: 'SUPPORT',
                                                        body: isAr ? '(محادثة جديدة)' : '(New conversation)',
                                                        createdAt: new Date().toISOString(),
                                                    },
                                                },
                                                ...prev,
                                            ]);
                                        }
                                    }}
                                    style={{
                                        textAlign: 'left',
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: '#e4e4e7',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                    }}
                                >
                                    {passengerLabel(p, p.id)}
                                    <span style={{ color: '#71717a', marginLeft: 8 }}>{p.phone}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div
                    style={{
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: 'minmax(280px, 320px) 1fr',
                        gap: 16,
                        minHeight: 0,
                    }}
                >
                    {/* Threads */}
                    <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isAr ? 'تصفية المحادثات...' : 'Filter conversations...'}
                                style={{
                                    width: '100%',
                                    padding: '9px 12px',
                                    borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.04)',
                                    color: '#fff',
                                    fontSize: 12,
                                }}
                            />
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {loadingThreads ? (
                                <p style={{ padding: 24, textAlign: 'center', color: '#71717a', fontSize: 13 }}>
                                    {isAr ? 'جاري التحميل...' : 'Loading...'}
                                </p>
                            ) : filteredThreads.length === 0 ? (
                                <p style={{ padding: 24, textAlign: 'center', color: '#52525b', fontSize: 13 }}>
                                    {isAr ? 'لا محادثات بعد' : 'No conversations yet'}
                                </p>
                            ) : (
                                filteredThreads.map((t) => {
                                    const active = t.passengerId === selectedId;
                                    const fromPassenger = t.lastMessage.senderRole === 'PASSENGER';
                                    return (
                                        <button
                                            key={t.passengerId}
                                            type="button"
                                            onClick={() => setSelectedId(t.passengerId)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '14px 16px',
                                                border: 'none',
                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                background: active
                                                    ? 'rgba(99,102,241,0.12)'
                                                    : 'transparent',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                                <span
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        color: active ? '#c7d2fe' : '#e4e4e7',
                                                    }}
                                                >
                                                    {passengerLabel(t.passenger, t.passengerId)}
                                                </span>
                                                <span style={{ fontSize: 10, color: '#52525b', flexShrink: 0 }}>
                                                    {formatRelativeTime(t.lastMessage.createdAt)}
                                                </span>
                                            </div>
                                            <p
                                                style={{
                                                    fontSize: 12,
                                                    color: fromPassenger ? '#fbbf24' : '#71717a',
                                                    margin: '6px 0 0',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {fromPassenger && !active ? '● ' : ''}
                                                {t.lastMessage.body}
                                            </p>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Conversation */}
                    <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        {!selectedId ? (
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#52525b',
                                    fontSize: 14,
                                }}
                            >
                                {isAr ? 'اختر محادثة من القائمة' : 'Select a conversation'}
                            </div>
                        ) : (
                            <>
                                <div
                                    style={{
                                        padding: '14px 20px',
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff' }}>
                                            {passengerLabel(
                                                selectedThread?.passenger ?? null,
                                                selectedId,
                                            )}
                                        </p>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#71717a' }}>
                                            {selectedThread?.passenger?.phone ?? `ID ${selectedId}`}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        padding: 20,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10,
                                    }}
                                >
                                    {loadingMessages && messages.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#71717a', fontSize: 13 }}>
                                            {isAr ? 'جاري التحميل...' : 'Loading...'}
                                        </p>
                                    ) : messages.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#52525b', fontSize: 13 }}>
                                            {isAr
                                                ? 'لا رسائل. أرسل أول رد للراكب.'
                                                : 'No messages. Send the first reply.'}
                                        </p>
                                    ) : (
                                        messages.map((m) => {
                                            const mine = isStaff(m.senderRole);
                                            return (
                                                <div
                                                    key={m.id}
                                                    style={{
                                                        alignSelf: mine ? 'flex-end' : 'flex-start',
                                                        maxWidth: '75%',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            padding: '10px 14px',
                                                            borderRadius: mine
                                                                ? '16px 16px 4px 16px'
                                                                : '16px 16px 16px 4px',
                                                            background: mine
                                                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                                : 'rgba(255,255,255,0.08)',
                                                            color: mine ? '#fff' : '#e4e4e7',
                                                            fontSize: 14,
                                                            lineHeight: 1.45,
                                                        }}
                                                    >
                                                        {m.body}
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontSize: 10,
                                                            color: '#52525b',
                                                            margin: '4px 6px 0',
                                                            textAlign: mine ? 'right' : 'left',
                                                        }}
                                                    >
                                                        {formatDateTime(m.createdAt)}
                                                        {!mine && ` · ${m.senderRole}`}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div
                                    style={{
                                        padding: 16,
                                        borderTop: '1px solid rgba(255,255,255,0.06)',
                                        display: 'flex',
                                        gap: 10,
                                    }}
                                >
                                    <textarea
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendReply();
                                            }
                                        }}
                                        rows={2}
                                        placeholder={
                                            isAr ? 'اكتب ردك... (Enter للإرسال)' : 'Type a reply... (Enter to send)'
                                        }
                                        style={{
                                            flex: 1,
                                            resize: 'none',
                                            padding: '12px 14px',
                                            borderRadius: 12,
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: 'rgba(255,255,255,0.04)',
                                            color: '#fff',
                                            fontSize: 14,
                                            fontFamily: 'inherit',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={sendReply}
                                        disabled={sending || !draft.trim()}
                                        style={{
                                            alignSelf: 'flex-end',
                                            padding: '12px 20px',
                                            borderRadius: 12,
                                            border: 'none',
                                            background: sending || !draft.trim()
                                                ? 'rgba(99,102,241,0.4)'
                                                : '#6366f1',
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: 13,
                                            cursor: sending || !draft.trim() ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {sending
                                            ? '...'
                                            : isAr
                                              ? 'إرسال'
                                              : 'Send'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
