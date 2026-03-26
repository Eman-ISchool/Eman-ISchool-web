'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Search, Send, User, ChevronLeft, MoreVertical, Check, CheckCheck, Loader2, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeChat, ChatMessage, ThreadWithParticipant, ChatParticipant } from '@/lib/chat';

// Mock data for fallback when Supabase is not configured
const mockThreads: ThreadWithParticipant[] = [
    {
        id: '1',
        participant_ids: ['me', 't1'],
        participant: { id: 't1', name: 'Dr. Ahmed Hassan', role: 'teacher' },
        last_message: 'Don\'t forget to review Chapter 5 before tomorrow\'s class.',
        last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        unread_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        participant_ids: ['me', 't2'],
        participant: { id: 't2', name: 'Ms. Sarah Johnson', role: 'teacher' },
        last_message: 'Great work on your essay!',
        last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unread_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

const mockMessages: Record<string, ChatMessage[]> = {
    '1': [
        { id: 'm1', thread_id: '1', content: 'Hello Dr. Hassan, I have a question about the homework.', sender_id: 'me', read: true, created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { id: 'm2', thread_id: '1', content: 'Of course! What would you like to know?', sender_id: 't1', read: true, created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
        { id: 'm3', thread_id: '1', content: 'I\'m having trouble with problem 3 on page 45.', sender_id: 'me', read: true, created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString() },
        { id: 'm4', thread_id: '1', content: 'That one is tricky! Remember to use the quadratic formula.', sender_id: 't1', read: true, created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
        { id: 'm5', thread_id: '1', content: 'Don\'t forget to review Chapter 5 before tomorrow\'s class.', sender_id: 't1', read: false, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    ],
};

// Mock teachers for initiating new chats
const mockTeachers: ChatParticipant[] = [
    { id: '1', name: 'Dr. Ahmed Hassan', role: 'teacher' },
    { id: '2', name: 'Ms. Sarah Johnson', role: 'teacher' },
];

function ChatContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const teacherIdParam = searchParams.get('teacher');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedThread, setSelectedThread] = useState<ThreadWithParticipant | null>(null);
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userId = session?.user?.id || 'me';

    // Real-time hooks (fallback to mock if Supabase not configured)
    const { messages: realtimeMessages, loading: messagesLoading, send } = useRealtimeChat(
        selectedThread?.id || null,
        userId
    );

    // Handle teacher ID from URL params
    useEffect(() => {
        if (teacherIdParam) {
            // Find or create thread with this teacher
            const teacher = mockTeachers.find(t => t.id === teacherIdParam);
            if (teacher) {
                // Check if thread exists
                const existingThread = mockThreads.find(t =>
                    t.participant.id === teacherIdParam
                );

                if (existingThread) {
                    setSelectedThread(existingThread);
                } else {
                    // Create new thread
                    const newThread: ThreadWithParticipant = {
                        id: `new-${teacherIdParam}`,
                        participant_ids: [userId, teacherIdParam],
                        participant: teacher,
                        unread_count: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };
                    setSelectedThread(newThread);
                }
            }
        }
    }, [teacherIdParam, userId]);

    // Use realtime messages if available, otherwise mock
    const displayMessages = realtimeMessages.length > 0
        ? realtimeMessages
        : (selectedThread ? mockMessages[selectedThread.id] || [] : []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayMessages]);

    const filteredThreads = mockThreads.filter(thread =>
        thread.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedThread || isSending) return;

        setIsSending(true);

        // Create optimistic message
        const optimisticMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            thread_id: selectedThread.id,
            content: newMessage,
            sender_id: userId,
            read: false,
            created_at: new Date().toISOString(),
        };

        // Add optimistically to local state
        setLocalMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');

        try {
            // Try to send via realtime
            const sent = await send(newMessage);
            if (sent) {
                // Replace optimistic with real
                setLocalMessages(prev =>
                    prev.filter(m => m.id !== optimisticMessage.id)
                );
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Keep optimistic message for demo
        } finally {
            setIsSending(false);
        }
    };

    // Chat List View
    if (!selectedThread) {
        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Messages</h1>
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                                <Wifi className="w-3 h-3" />
                                Live
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                <WifiOff className="w-3 h-3" />
                                Offline
                            </span>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-bg-card)] border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    />
                </div>

                {/* Thread List */}
                <div className="space-y-2">
                    {filteredThreads.length === 0 ? (
                        <div className="card-soft p-8 text-center">
                            <MessageCircle className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                            <p className="text-[var(--color-text-secondary)]">No conversations yet</p>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                Start a chat by clicking "Message" on a teacher's card
                            </p>
                        </div>
                    ) : (
                        filteredThreads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => setSelectedThread(thread)}
                                className="card-soft w-full p-4 flex items-center gap-4 text-left hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                                        {thread.participant.image ? (
                                            <img
                                                src={thread.participant.image}
                                                alt={thread.participant.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-[var(--color-primary)]" />
                                        )}
                                    </div>
                                    {thread.participant.role === 'teacher' && (
                                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[9px] text-white font-bold">T</span>
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                                            {thread.participant.name}
                                        </h3>
                                        <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                                            {thread.last_message_at && formatTime(thread.last_message_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                            {thread.last_message}
                                        </p>
                                        {thread.unread_count > 0 && (
                                            <span className="flex-shrink-0 w-5 h-5 bg-[var(--color-primary)] text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
                                                {thread.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // Chat Thread View
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-100px)]">
            {/* Chat Header */}
            <div className="card-soft p-4 flex items-center gap-4 mb-4 shadow-sm">
                <button
                    onClick={() => setSelectedThread(null)}
                    className="p-2 -ml-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                    {selectedThread.participant.image ? (
                        <img
                            src={selectedThread.participant.image}
                            alt={selectedThread.participant.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-5 h-5 text-[var(--color-primary)]" />
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="font-semibold text-[var(--color-text-primary)]">
                        {selectedThread.participant.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            {selectedThread.participant.role === 'teacher' ? 'Teacher' : 'Classmate'}
                        </p>
                        {isConnected && (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                Online
                            </span>
                        )}
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors">
                    <MoreVertical className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4 scroll-smooth">
                {messagesLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : (
                    [...displayMessages, ...localMessages.filter(lm =>
                        !displayMessages.some(dm => dm.id === lm.id)
                    )].map((message) => {
                        const isMe = message.sender_id === userId || message.sender_id === 'me';
                        const isOptimistic = message.id.startsWith('temp-');

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm ${isMe
                                            ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white rounded-br-md'
                                            : 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] rounded-bl-md border border-gray-100'
                                        } ${isOptimistic ? 'opacity-70' : ''}`}
                                >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                    <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <span className={`text-xs ${isMe ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                                            {new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && (
                                            isOptimistic ? (
                                                <Loader2 className="w-3 h-3 text-white/70 animate-spin" />
                                            ) : message.read ? (
                                                <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5 text-white/70" />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="card-soft p-3 flex items-center gap-3 shadow-md">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-full bg-[var(--color-bg-soft)] border-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-3 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                    {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </form>
        </div>
    );
}

export default function StudentChatPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
