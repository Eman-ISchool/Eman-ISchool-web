'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
    id: string;
    message: string;
    created_at: string;
    is_internal: boolean;
    sender: {
        id: string;
        name: string;
        role: string;
        image?: string;
    };
}

interface TicketChatProps {
    ticketId: string;
    initialMessages: Message[];
    currentUserId: string;
    status: string;
}

export function TicketChat({ ticketId, initialMessages, currentUserId, status }: TicketChatProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setIsSending(true);

        try {
            const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            });

            if (!res.ok) throw new Error('Failed to send message');

            const message = await res.json();

            // Optimistic update mechanism or refetch?
            // The API returns the message object but sender might not be fully populated like the initial fetch.
            // Let's assume response includes what we need or we construct it.
            // Actually, for simplicity, let's refresh page or manually add assuming we know who sent it.

            const constructedMessage: Message = {
                id: message.id,
                message: message.message,
                created_at: message.created_at,
                is_internal: message.is_internal,
                sender: {
                    id: currentUserId,
                    name: 'Me', // Fallback
                    role: 'parent', // Fallback
                }
            };

            // Ideally we'd re-fetch the ticket or messages to get full sender info if needed.
            // But this is decent for UX.
            setMessages(prev => [...prev, constructedMessage]);
            setNewMessage('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
                {messages.map((msg) => {
                    const isMe = msg.sender.id === currentUserId;
                    const isAdmin = msg.sender.role === 'admin';

                    if (msg.is_internal && !isAdmin) return null; // Hide internal notes from parent (though API shouldn't send them)

                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.sender.image} />
                                <AvatarFallback className={isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100'}>
                                    {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-gray-600">
                                        {isMe ? 'You' : msg.sender.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`p-3 rounded-lg text-sm ${isMe
                                        ? 'bg-brand-primary text-black rounded-tr-none'
                                        : 'bg-white border shadow-sm rounded-tl-none'
                                    }`}>
                                    {msg.message}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {status !== 'resolved' && status !== 'closed' && (
                <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="resize-none"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isSending}
                            className="bg-brand-primary text-black hover:bg-yellow-400 h-auto"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {(status === 'resolved' || status === 'closed') && (
                <div className="p-4 border-t bg-gray-50 text-center text-gray-500 text-sm">
                    This ticket is {status}. You cannot reply.
                </div>
            )}
        </div>
    );
}
