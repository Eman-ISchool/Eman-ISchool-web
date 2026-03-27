import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Updates all lessons that have no meet_link with a valid Google Meet link
 * and varies the start/end times so they don't all show the same time.
 *
 * GET /api/admin/fix-meet-links              — fix ALL lessons
 * GET /api/admin/fix-meet-links?course=<id>  — fix lessons for one course
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('course');

  const MEET_LINK = 'https://meet.google.com/zup-kupx-cih';

  // Varied times (Jordan time UTC+3): 09:00, 10:30, 14:00, 16:00, 18:00, 20:00
  const TIME_SLOTS = [
    { startUTC: '06:00:00', endUTC: '07:00:00', label: '09:00 AM' },
    { startUTC: '07:30:00', endUTC: '08:30:00', label: '10:30 AM' },
    { startUTC: '11:00:00', endUTC: '12:00:00', label: '02:00 PM' },
    { startUTC: '13:00:00', endUTC: '14:00:00', label: '04:00 PM' },
    { startUTC: '15:00:00', endUTC: '16:00:00', label: '06:00 PM' },
    { startUTC: '17:00:00', endUTC: '18:00:00', label: '08:00 PM' },
  ];

  // Fetch lessons to update
  let query = supabaseAdmin
    .from('lessons')
    .select('id, start_date_time, end_date_time, meet_link, course_id')
    .order('start_date_time', { ascending: true });

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { data: lessons, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  for (let i = 0; i < (lessons || []).length; i++) {
    const lesson = lessons![i];
    const slot = TIME_SLOTS[i % TIME_SLOTS.length];
    const dateStr = lesson.start_date_time?.split('T')[0] || '2026-03-01';

    const { error: updateErr } = await supabaseAdmin
      .from('lessons')
      .update({
        meet_link: lesson.meet_link || MEET_LINK,
        start_date_time: `${dateStr}T${slot.startUTC}+00:00`,
        end_date_time: `${dateStr}T${slot.endUTC}+00:00`,
      })
      .eq('id', lesson.id);

    if (!updateErr) updated++;
  }

  return NextResponse.json({
    success: true,
    updated,
    total: lessons?.length || 0,
    meetLink: MEET_LINK,
    message: `Updated ${updated} lessons with meet links and varied times`,
  });
}
