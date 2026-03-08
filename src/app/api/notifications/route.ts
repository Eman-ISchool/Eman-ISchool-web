import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserNotifications, markNotificationsAsRead, getUnreadNotificationCount } from '@/lib/notifications';

// GET - Fetch notifications for current user
export async function GET(req: Request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = await getCurrentUser(session);

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const isRead = searchParams.get('isRead');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const { notifications, total } = await getUserNotifications(currentUser.id, {
            limit,
            offset,
            isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        });

        // Get unread count
        const unreadCount = await getUnreadNotificationCount(currentUser.id);

        return NextResponse.json({ notifications, total, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PATCH - Mark notifications as read
export async function PATCH(req: Request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = await getCurrentUser(session);

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const body = await req.json();
        const { ids, markAllRead } = body;

        // Validate request
        if (!ids && !markAllRead) {
            return NextResponse.json(
                { error: 'Must provide either ids or markAllRead' },
                { status: 400 }
            );
        }

        const updated = await markNotificationsAsRead(currentUser.id, ids, markAllRead);

        return NextResponse.json({ updated, message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
    }
}
