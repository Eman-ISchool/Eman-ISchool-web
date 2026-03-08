import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET: List all students for a parent
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is accessing their own data or is admin
        const userId = (session.user as any).id;
        const targetParentId = params.id;

        // Use type assertion for role check since we know it's there from authOptions
        const userRole = (session.user as any).role;
        const isAdmin = userRole === 'admin';

        if (userId !== targetParentId && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch students linked to this parent
        const { data: students, error } = await supabaseAdmin
            .from('parent_student')
            .select(`
                student_id,
                relationship,
                is_primary,
                student:users!parent_student_student_id_fkey (
                    id,
                    name,
                    email,
                    image,
                    created_at
                )
            `)
            .eq('parent_id', targetParentId);

        if (error) {
            console.error('Error fetching students:', error);
            return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
        }

        // Format response
        const formattedStudents = students.map(record => ({
            ...record.student, // User details
            relationship: record.relationship,
            is_primary: record.is_primary,
            link_id: (record as any).id // parent_student ID if needed, though strictly it's implicitly there if we selected it
        }));

        return NextResponse.json({ students: formattedStudents });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a student to a parent
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const targetParentId = params.id;
        const userRole = (session.user as any).role;
        const isAdmin = userRole === 'admin';

        if (userId !== targetParentId && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, relationship = 'parent' } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        // Check if student exists
        let studentId: string;

        // 1. Check existing user by email
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id, role')
            .eq('email', email)
            .single();

        if (existingUser) {
            // If user exists, ensure they are a student
            if (existingUser.role !== 'student') {
                return NextResponse.json({ error: 'User exists but is not a student' }, { status: 400 });
            }
            studentId = existingUser.id;
        } else {
            // 2. Create new student user
            // Note: Password generation or invitation flow would be better here, 
            // but for MVP we create a placeholder user that might need activation/password set later.
            // Or we just generate a random password (not ideal).
            // For now, let's create a user with a placeholder/empty password hash if allowed (it's nullable).
            const { data: newUser, error: createError } = await supabaseAdmin
                .from('users')
                .insert({
                    email,
                    name,
                    role: 'student',
                    is_active: true,
                    // No password_hash set, so they can't login via credentials yet until they set it/reset it
                })
                .select('id')
                .single();

            if (createError) {
                console.error('Error creating student:', createError);
                return NextResponse.json({ error: 'Failed to create student user' }, { status: 500 });
            }
            studentId = newUser.id;
        }

        // 3. Link to parent
        const { error: linkError } = await supabaseAdmin
            .from('parent_student')
            .insert({
                parent_id: targetParentId,
                student_id: studentId,
                relationship,
                is_primary: true // Assuming first link is primary, logic could be refined
            });

        if (linkError) {
            // Check for unique constraint violation (already linked)
            if (linkError.code === '23505') {
                return NextResponse.json({ error: 'Student already linked to this parent' }, { status: 409 });
            }
            console.error('Error linking student:', linkError);
            return NextResponse.json({ error: 'Failed to link student' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Student added successfully',
            student: { id: studentId, name, email }
        }, { status: 201 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
