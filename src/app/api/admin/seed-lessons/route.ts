import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Comprehensive seed to match reference site (futurelab.school) data:
 * - Creates/updates courses matching reference
 * - Creates bundles (grades table) matching reference
 * - Seeds live-session lessons with meet links
 * - Teacher: ابراهيم محمد
 * - Recurring Tue/Sat at 20:00–21:00 (Jordan time, UTC+3)
 */
export async function GET() {
  const MEET_LINK = 'https://meet.google.com/zup-kupx-cih';
  const results: any = { steps: [] };

  // ─── Step 1: Ensure teacher exists ──────────────────────────────────────────
  let teacherId: string;
  const { data: existingTeacher } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('name', 'ابراهيم محمد')
    .maybeSingle();

  if (existingTeacher) {
    teacherId = existingTeacher.id;
    results.steps.push('Teacher found: ابراهيم محمد');
  } else {
    const { data: newTeacher, error: teacherErr } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'ibrahim.mohammed@eman-ischool.com',
        name: 'ابراهيم محمد',
        role: 'teacher',
        is_active: true,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim',
      } as any)
      .select()
      .single();

    if (teacherErr || !newTeacher) {
      return NextResponse.json({ error: 'Failed to create teacher', details: teacherErr }, { status: 500 });
    }
    teacherId = (newTeacher as any).id;
    results.steps.push('Teacher created: ابراهيم محمد');
  }

  // ─── Step 2: Create/update courses matching reference ──────────────────────
  const coursesData = [
    {
      title: 'Basics',
      slug: 'basics-english-level-1',
      description: '✨ تعلم الحروف ونطقها الصحيح 🔤 التعرف على الكلمات الأساسية والجمل البسيطة 📚 تدريبات عملية تساعد الطفل على القراءة والكتابة خطوة بخطوة',
      is_published: true,
      teacher_id: teacherId,
      image_url: 'https://placehold.co/600x400/f97316/ffffff?text=Basics+Level+1',
      price: 150,
      max_students: 30,
      subject: 'اللغات',
      grade_level: 'المستوى الأول',
    },
    {
      title: 'كورس المعلم الإلكتروني',
      slug: 'electronic-teacher-course',
      description: 'كورس المعلم الإلكتروني',
      is_published: true,
      teacher_id: teacherId,
      image_url: 'https://placehold.co/600x400/3b82f6/ffffff?text=Electronic+Teacher',
      price: 200,
      max_students: 25,
      subject: 'تكنولوجيا التعليم',
      grade_level: 'عام',
    },
    {
      title: 'كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الثاني',
      slug: 'basics-english-level-2',
      description: 'بنهاية المستوى الثاني سيتعلم الطلاب أن: يستخدموا اللغة الإنجليزية الأساسية للتحدث عن مواضيع يومية مألوفة. يكونوا جملاً بسيطة وصحيحة باستخدام التراكيب اللغوية',
      is_published: true,
      teacher_id: teacherId,
      image_url: 'https://placehold.co/600x400/f97316/ffffff?text=Basics+Level+2',
      price: 150,
      max_students: 30,
      subject: 'اللغات',
      grade_level: 'المستوى الثاني',
    },
  ];

  const createdCourseIds: string[] = [];

  for (const courseData of coursesData) {
    const { data: existingCourse } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('slug', courseData.slug)
      .maybeSingle();

    if (existingCourse) {
      await supabaseAdmin
        .from('courses')
        .update({
          title: courseData.title,
          description: courseData.description,
          is_published: courseData.is_published,
          teacher_id: courseData.teacher_id,
          image_url: courseData.image_url,
        })
        .eq('id', (existingCourse as any).id);
      createdCourseIds.push((existingCourse as any).id);
      results.steps.push(`Course updated: ${courseData.title}`);
    } else {
      const { data: newCourse, error: courseErr } = await supabaseAdmin
        .from('courses')
        .insert({
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          is_published: courseData.is_published,
          teacher_id: courseData.teacher_id,
          image_url: courseData.image_url,
          price: courseData.price,
          max_students: courseData.max_students,
          subject: courseData.subject,
          grade_level: courseData.grade_level,
        } as any)
        .select()
        .single();

      if (courseErr) {
        results.steps.push(`Course creation failed: ${courseData.title} - ${courseErr.message}`);
        continue;
      }
      createdCourseIds.push((newCourse as any).id);
      results.steps.push(`Course created: ${courseData.title}`);
    }
  }

  // ─── Step 3: Create bundles (grades table) matching reference ───────────────
  // Bundles = grades table in this codebase
  const bundlesData = [
    { name: 'كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الأول', description: '✨ تعلم الحروف ونطقها الصحيح 🔤 التعرف على الكلمات الأساسية والجمل البسيطة 📚 تدريبات عملية تساعد الطفل على القراءة والكتابة خطوة بخطوة', is_active: true, sort_order: 1, image_url: 'https://placehold.co/600x400/f97316/ffffff?text=Basics+Level+1' },
    { name: 'كورس المعلم الإلكتروني', description: 'كورس المعلم الإلكتروني', is_active: true, sort_order: 2, image_url: 'https://placehold.co/600x400/3b82f6/ffffff?text=Electronic+Teacher' },
    { name: 'كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الثاني', description: 'بنهاية المستوى الثاني سيتعلم الطلاب أن: يستخدموا اللغة الإنجليزية الأساسية للتحدث عن مواضيع يومية مألوفة. يكونوا جملاً بسيطة وصحيحة باستخدام التراكيب اللغوية', is_active: true, sort_order: 3, image_url: 'https://placehold.co/600x400/f97316/ffffff?text=Basics+Level+2' },
    { name: 'الصف الخامس ابتدائي', description: 'الصف الخامس من الأول إلى الأربع', is_active: false, sort_order: 4 },
    { name: 'الصف الثالث ابتدائي', description: 'الصف الثالث من الأول إلى الأربع', is_active: false, sort_order: 5 },
    { name: 'الصف الأول ثانوي', description: 'الصف التاسع من الأول إلى الأربع', is_active: false, sort_order: 6 },
  ];

  for (const bundle of bundlesData) {
    const slug = bundle.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '')
      .slice(0, 100);

    const { data: existingGrade } = await supabaseAdmin
      .from('grades')
      .select('id')
      .eq('name', bundle.name)
      .maybeSingle();

    if (existingGrade) {
      await supabaseAdmin
        .from('grades')
        .update({
          description: bundle.description,
          is_active: bundle.is_active,
          sort_order: bundle.sort_order,
          image_url: bundle.image_url || null,
        })
        .eq('id', (existingGrade as any).id);
      results.steps.push(`Bundle updated: ${bundle.name}`);
    } else {
      const { error: bundleErr } = await supabaseAdmin
        .from('grades')
        .insert({
          name: bundle.name,
          name_en: bundle.name,
          slug: slug + '-' + Date.now(),
          description: bundle.description,
          is_active: bundle.is_active,
          sort_order: bundle.sort_order,
          image_url: bundle.image_url || null,
        } as any);

      if (bundleErr) {
        results.steps.push(`Bundle creation failed: ${bundle.name} - ${bundleErr.message}`);
      } else {
        results.steps.push(`Bundle created: ${bundle.name}`);
      }
    }
  }

  // ─── Step 4: Seed live-session lessons for the first course (Basics) ───────
  const basicsCourseId = createdCourseIds[0];
  if (basicsCourseId) {
    // Clear existing lessons for this course
    await supabaseAdmin.from('lessons').delete().eq('course_id', basicsCourseId);

    // Generate recurring sessions: every Tue (2) and Sat (6) from March 1 to April 30, 2026
    // Times: 20:00-21:00 Jordan time (UTC+3) = 17:00-18:00 UTC
    const lessons: any[] = [];
    const startDate = new Date('2026-03-01');
    const endDate = new Date('2026-04-30');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay(); // 0=Sun, 2=Tue, 6=Sat
      if (dayOfWeek === 2 || dayOfWeek === 6) {
        const dateStr = d.toISOString().split('T')[0];
        const startTime = `${dateStr}T17:00:00+00:00`; // 20:00 Jordan (UTC+3)
        const endTime = `${dateStr}T18:00:00+00:00`;   // 21:00 Jordan (UTC+3)

        lessons.push({
          title: 'Basics',
          description: 'كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الأول',
          course_id: basicsCourseId,
          teacher_id: teacherId,
          start_date_time: startTime,
          end_date_time: endTime,
          status: 'scheduled',
          meet_link: MEET_LINK,
          meeting_provider: 'google_meet',
        });
      }
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('lessons')
      .insert(lessons)
      .select('id, title, start_date_time, status, meet_link');

    if (insertErr) {
      results.steps.push(`Live sessions failed: ${insertErr.message}`);
    } else {
      results.steps.push(`Live sessions created: ${inserted?.length || 0} for Basics`);
    }

    // Also create regular lessons (without meet_link) for the lessons tab
    const regularLessons: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const lessonDate = new Date('2026-03-01');
      lessonDate.setDate(lessonDate.getDate() + (i * 3));
      regularLessons.push({
        title: `درس ${i} - ${i <= 3 ? 'الحروف الأبجدية' : i <= 6 ? 'الكلمات الأساسية' : 'الجمل البسيطة'}`,
        description: `محتوى الدرس رقم ${i}`,
        course_id: basicsCourseId,
        teacher_id: teacherId,
        start_date_time: lessonDate.toISOString(),
        end_date_time: new Date(lessonDate.getTime() + 60 * 60 * 1000).toISOString(),
        status: lessonDate < new Date() ? 'completed' : 'scheduled',
      });
    }

    const { error: regErr } = await supabaseAdmin.from('lessons').insert(regularLessons);
    if (regErr) {
      results.steps.push(`Regular lessons failed: ${regErr.message}`);
    } else {
      results.steps.push(`Regular lessons created: ${regularLessons.length}`);
    }
  }

  // ─── Step 5: Seed lessons for other courses too ────────────────────────────
  for (let ci = 1; ci < createdCourseIds.length; ci++) {
    const courseId = createdCourseIds[ci];
    await supabaseAdmin.from('lessons').delete().eq('course_id', courseId);

    const courseLessons: any[] = [];
    for (let i = 1; i <= 8; i++) {
      const lessonDate = new Date('2026-03-01');
      lessonDate.setDate(lessonDate.getDate() + (i * 4));
      courseLessons.push({
        title: `درس ${i}`,
        description: `محتوى الدرس رقم ${i}`,
        course_id: courseId,
        teacher_id: teacherId,
        start_date_time: lessonDate.toISOString(),
        end_date_time: new Date(lessonDate.getTime() + 60 * 60 * 1000).toISOString(),
        status: lessonDate < new Date() ? 'completed' : 'scheduled',
      });
    }

    const { error } = await supabaseAdmin.from('lessons').insert(courseLessons);
    if (error) {
      results.steps.push(`Lessons for course ${ci + 1} failed: ${error.message}`);
    } else {
      results.steps.push(`Lessons for course ${ci + 1} created: ${courseLessons.length}`);
    }
  }

  // ─── Step 6: Create additional inactive courses ────────────────────────────
  const inactiveCourses = [
    { title: 'الصف الخامس ابتدائي', slug: 'grade-5-elementary', description: 'الصف الخامس من الأول إلى الأربع' },
    { title: 'الصف الثالث ابتدائي', slug: 'grade-3-elementary', description: 'الصف الثالث من الأول إلى الأربع' },
    { title: 'الصف الأول ثانوي', slug: 'grade-9-secondary', description: 'الصف التاسع من الأول إلى الأربع' },
  ];

  for (const courseData of inactiveCourses) {
    const { data: existing } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('slug', courseData.slug)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin
        .from('courses')
        .insert({
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          is_published: false,
          teacher_id: teacherId,
          price: 0,
          max_students: 30,
        } as any);

      if (error) {
        results.steps.push(`Inactive course failed: ${courseData.title} - ${error.message}`);
      } else {
        results.steps.push(`Inactive course created: ${courseData.title}`);
      }
    } else {
      results.steps.push(`Inactive course exists: ${courseData.title}`);
    }
  }

  return NextResponse.json({
    success: true,
    results,
    courseIds: createdCourseIds,
    teacherId,
  });
}
