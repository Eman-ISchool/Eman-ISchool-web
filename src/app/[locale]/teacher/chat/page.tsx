'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Send, User, ChevronLeft, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Message { id: string; content: string; senderId: string; createdAt: string; read?: boolean; }
interface ChatThread { id: string; participant: { id: string; name: string; image?: string; role: 'teacher' | 'student' }; lastMessage?: string; lastMessageAt?: string; unreadCount: number; }

const mockThreads: ChatThread[] = [
    { id: '1', participant: { id: 's1', name: 'Ali Mohammed', role: 'student' }, lastMessage: 'Thank you for the explanation!', lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), unreadCount: 2 },
    { id: '2', participant: { id: 's2', name: 'Sara Ahmed', role: 'student' }, lastMessage: 'When is the quiz?', lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), unreadCount: 1 },
    { id: '3', participant: { id: 't1', name: 'Dr. Mohammed Ali', role: 'teacher' }, lastMessage: 'Meeting at 3pm tomorrow', lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), unreadCount: 0 },
];

const mockMessages: Record<string, Message[]> = {
    '1': [
        { id: 'm1', content: 'Hello teacher, I have a question about today\'s lesson.', senderId: 's1', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { id: 'm2', content: 'Sure! What would you like to know?', senderId: 'me', createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(), read: true },
        { id: 'm3', content: 'Thank you for the explanation!', senderId: 's1', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    ],
};

export default function TeacherChatPage() {
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (selectedThread) setMessages(mockMessages[selectedThread.id] || []); }, [selectedThread]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const filteredThreads = mockThreads.filter(t => t.participant.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedThread) return;
        setMessages(prev => [...prev, { id: `m${Date.now()}`, content: newMessage, senderId: 'me', createdAt: new Date().toISOString(), read: false }]);
        setNewMessage('');
    };

    if (!selectedThread) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{language === 'ar' ? 'الرسائل' : 'Messages'}</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input type="text" placeholder={language === 'ar' ? 'ابحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-bg-card)] border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
                <div className="space-y-2">
                    {filteredThreads.map((t) => (
                        <button key={t.id} onClick={() => setSelectedThread(t)} className="card-soft w-full p-4 flex items-center gap-4 text-left hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center"><User className="w-6 h-6 text-[var(--color-primary)]" /></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2"><h3 className="font-medium truncate">{t.participant.name}</h3><span className="text-xs text-[var(--color-text-muted)]">{t.lastMessageAt && formatTime(t.lastMessageAt)}</span></div>
                                <div className="flex items-center justify-between gap-2 mt-1"><p className="text-sm text-[var(--color-text-secondary)] truncate">{t.lastMessage}</p>{t.unreadCount > 0 && <span className="w-5 h-5 bg-[var(--color-primary)] text-white text-xs rounded-full flex items-center justify-center">{t.unreadCount}</span>}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="card-soft p-4 flex items-center gap-4 mb-4">
                <button onClick={() => setSelectedThread(null)} className="p-2 -ml-2 rounded-full hover:bg-[var(--color-primary-light)]"><ChevronLeft className="w-5 h-5" /></button>
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center"><User className="w-5 h-5 text-[var(--color-primary)]" /></div>
                <div className="flex-1"><h2 className="font-medium">{selectedThread.participant.name}</h2><p className="text-xs text-[var(--color-text-secondary)]">{selectedThread.participant.role === 'student' ? (language === 'ar' ? 'طالب' : 'Student') : (language === 'ar' ? 'معلم' : 'Teacher')}</p></div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${m.senderId === 'me' ? 'bg-[var(--color-primary)] text-white rounded-br-md' : 'bg-[var(--color-bg-card)] rounded-bl-md shadow-sm'}`}>
                            <p className="text-sm">{m.content}</p>
                            <div className="flex items-center gap-1 mt-1 justify-end"><span className={`text-xs ${m.senderId === 'me' ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>{formatTime(m.createdAt)}</span>{m.senderId === 'me' && (m.read ? <CheckCheck className="w-3.5 h-3.5 text-white/70" /> : <Check className="w-3.5 h-3.5 text-white/70" />)}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="card-soft p-3 flex items-center gap-3">
                <input type="text" placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 px-4 py-2 rounded-full bg-[var(--color-bg-soft)] border-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
                <button type="submit" disabled={!newMessage.trim()} className="p-3 rounded-full bg-[var(--color-primary)] text-white disabled:opacity-50"><Send className="w-5 h-5" /></button>
            </form>
        </div>
    );
}
