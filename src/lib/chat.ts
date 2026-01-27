'use client';

import { supabase } from './supabase';
import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Chat Message Interface
 */
export interface ChatMessage {
    id: string;
    thread_id: string;
    sender_id: string;
    content: string;
    read: boolean;
    created_at: string;
}

/**
 * Chat Thread Interface
 */
export interface ChatThread {
    id: string;
    participant_ids: string[];
    last_message?: string;
    last_message_at?: string;
    unread_count: number;
    created_at: string;
    updated_at: string;
}

/**
 * Participant information for display
 */
export interface ChatParticipant {
    id: string;
    name: string;
    image?: string;
    role: 'teacher' | 'student';
}

/**
 * Thread with participant info for display
 */
export interface ThreadWithParticipant extends ChatThread {
    participant: ChatParticipant;
}

/**
 * Find or create a chat thread between two users
 */
export async function findOrCreateThread(userId: string, otherUserId: string): Promise<string | null> {
    if (!supabase) return null;

    // Check if thread exists
    const { data: existingThreads } = await supabase
        .from('chat_threads')
        .select('*')
        .contains('participant_ids', [userId, otherUserId]);

    if (existingThreads && existingThreads.length > 0) {
        return existingThreads[0].id;
    }

    // Create new thread
    const { data: newThread, error } = await supabase
        .from('chat_threads')
        .insert({
            participant_ids: [userId, otherUserId],
            unread_count: 0,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating thread:', error);
        return null;
    }

    return newThread?.id || null;
}

/**
 * Send a message in a thread
 */
export async function sendMessage(
    threadId: string,
    senderId: string,
    content: string
): Promise<ChatMessage | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            thread_id: threadId,
            sender_id: senderId,
            content,
            read: false,
        })
        .select()
        .single();

    if (error) {
        console.error('Error sending message:', error);
        return null;
    }

    // Update thread's last message
    await supabase
        .from('chat_threads')
        .update({
            last_message: content,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', threadId);

    return data;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(threadId: string, userId: string): Promise<void> {
    if (!supabase) return;

    await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('thread_id', threadId)
        .neq('sender_id', userId)
        .eq('read', false);
}

/**
 * Get messages for a thread
 */
export async function getMessages(threadId: string): Promise<ChatMessage[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return data || [];
}

/**
 * Get all threads for a user
 */
export async function getThreads(userId: string): Promise<ChatThread[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .contains('participant_ids', [userId])
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching threads:', error);
        return [];
    }

    return data || [];
}

/**
 * Hook for real-time chat functionality
 */
export function useRealtimeChat(threadId: string | null, userId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<any>(null);

    // Load initial messages
    useEffect(() => {
        if (!threadId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        const loadMessages = async () => {
            setLoading(true);
            const data = await getMessages(threadId);
            setMessages(data);
            setLoading(false);

            // Mark messages as read
            await markMessagesAsRead(threadId, userId);
        };

        loadMessages();
    }, [threadId, userId]);

    // Subscribe to new messages
    useEffect(() => {
        if (!threadId || !supabase) return;

        const channel = supabase
            .channel(`messages:${threadId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `thread_id=eq.${threadId}`,
                },
                (payload) => {
                    const newMessage = payload.new as ChatMessage;
                    setMessages((prev) => {
                        // Prevent duplicates
                        if (prev.some(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });

                    // Mark as read if not from current user
                    if (newMessage.sender_id !== userId) {
                        markMessagesAsRead(threadId, userId);
                    }
                }
            )
            .subscribe();

        subscriptionRef.current = channel;

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, [threadId, userId]);

    // Optimistic send
    const send = useCallback(async (content: string) => {
        if (!threadId) return null;

        // Create optimistic message
        const optimisticMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            thread_id: threadId,
            sender_id: userId,
            content,
            read: false,
            created_at: new Date().toISOString(),
        };

        // Add optimistically
        setMessages((prev) => [...prev, optimisticMessage]);

        // Actually send
        const sentMessage = await sendMessage(threadId, userId, content);

        if (sentMessage) {
            // Replace optimistic with real
            setMessages((prev) =>
                prev.map(m => m.id === optimisticMessage.id ? sentMessage : m)
            );
        } else {
            // Remove failed message
            setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
            setError('Failed to send message');
        }

        return sentMessage;
    }, [threadId, userId]);

    return { messages, loading, error, send };
}

/**
 * Hook for real-time thread list
 */
export function useRealtimeThreads(userId: string) {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const loadThreads = async () => {
            setLoading(true);
            const data = await getThreads(userId);
            setThreads(data);
            setLoading(false);
        };

        loadThreads();

        // Subscribe to thread updates
        if (!supabase) return;

        const channel = supabase
            .channel(`threads:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_threads',
                },
                () => {
                    // Reload threads on any change
                    loadThreads();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { threads, loading };
}
