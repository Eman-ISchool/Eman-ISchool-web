'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Send, User, ChevronLeft, MoreVertical, Check, CheckCheck } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    read?: boolean;
}

interface ChatThread {
    id: string;
    participant: {
        id: string;
        name: string;
        image?: string;
        role: 'teacher' | 'student';
    };
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
}

// Mock data
const mockThreads: ChatThread[] = [
    {
        id: '1',
        participant: { id: 't1', name: 'Dr. Ahmed Hassan', role: 'teacher' },
        lastMessage: 'Don\'t forget to review Chapter 5 before tomorrow\'s class.',
        lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        unreadCount: 2,
    },
    {
        id: '2',
        participant: { id: 't2', name: 'Ms. Sarah Johnson', role: 'teacher' },
        lastMessage: 'Great work on your essay!',
        lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
    },
    {
        id: '3',
        participant: { id: 's1', name: 'Ali Mohammed', role: 'student' },
        lastMessage: 'Did you finish the homework?',
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
    },
    {
        id: '4',
        participant: { id: 's2', name: 'Fatima Ahmed', role: 'student' },
        lastMessage: 'Thanks for sharing the notes!',
        lastMessageAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
    },
];

const mockMessages: Record<string, Message[]> = {
    '1': [
        { id: 'm1', content: 'Hello Dr. Hassan, I have a question about the homework.', senderId: 'me', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), read: true },
        { id: 'm2', content: 'Of course! What would you like to know?', senderId: 't1', createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
        { id: 'm3', content: 'I\'m having trouble with problem 3 on page 45.', senderId: 'me', createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(), read: true },
        { id: 'm4', content: 'That one is tricky! Remember to use the quadratic formula. Would you like me to go over it in class tomorrow?', senderId: 't1', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
        { id: 'm5', content: 'Yes please, that would be very helpful!', senderId: 'me', createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), read: true },
        { id: 'm6', content: 'Don\'t forget to review Chapter 5 before tomorrow\'s class.', senderId: 't1', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    ],
};

export default function StudentChatPage() {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedThread) {
            setMessages(mockMessages[selectedThread.id] || []);
        }
    }, [selectedThread]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedThread) return;

        const message: Message = {
            id: `m${Date.now()}`,
            content: newMessage,
            senderId: 'me',
            createdAt: new Date().toISOString(),
            read: false,
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');
    };

    // Chat List View
    if (!selectedThread) {
        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Messages</h1>
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
                            <p className="text-[var(--color-text-secondary)]">No conversations found</p>
                        </div>
                    ) : (
                        filteredThreads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => setSelectedThread(thread)}
                                className="card-soft w-full p-4 flex items-center gap-4 text-left hover:shadow-lg transition-shadow"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden">
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
                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                                            <span className="text-[8px] text-white font-bold">T</span>
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-medium text-[var(--color-text-primary)] truncate">
                                            {thread.participant.name}
                                        </h3>
                                        <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                                            {thread.lastMessageAt && formatTime(thread.lastMessageAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                            {thread.lastMessage}
                                        </p>
                                        {thread.unreadCount > 0 && (
                                            <span className="flex-shrink-0 w-5 h-5 bg-[var(--color-primary)] text-white text-xs font-medium rounded-full flex items-center justify-center">
                                                {thread.unreadCount}
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
            <div className="card-soft p-4 flex items-center gap-4 mb-4">
                <button
                    onClick={() => setSelectedThread(null)}
                    className="p-2 -ml-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden">
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
                    <h2 className="font-medium text-[var(--color-text-primary)]">
                        {selectedThread.participant.name}
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                        {selectedThread.participant.role === 'teacher' ? 'Teacher' : 'Classmate'}
                    </p>
                </div>
                <button className="p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors">
                    <MoreVertical className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {messages.map((message) => {
                    const isMe = message.senderId === 'me';
                    return (
                        <div
                            key={message.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${isMe
                                        ? 'bg-[var(--color-primary)] text-white rounded-br-md'
                                        : 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] rounded-bl-md shadow-sm'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`text-xs ${isMe ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        message.read
                                            ? <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                                            : <Check className="w-3.5 h-3.5 text-white/70" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="card-soft p-3 flex items-center gap-3">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-full bg-[var(--color-bg-soft)] border-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 rounded-full bg-[var(--color-primary)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
