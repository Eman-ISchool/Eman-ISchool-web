#!/usr/bin/env node
/**
 * Standalone seed script - run with: node seed-database.mjs
 * No dev server needed. Connects directly to Supabase.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const AFN = ['أحمد','محمد','علي','عمر','خالد','سارة','نورة','ليلى','فاطمة','مريم','يوسف','إبراهيم','حسن','حسين','عبدالله'];
const ALN = ['المنصور','الخالدي','العتيبي','الشمري','المطيري','القحطاني','السعيد','الغامدي','الزهراني','العمري','الحربي','الدوسري'];
const pick = a => a[Math.floor(Math.random()*a.length)];
const rn = () => `${pick(AFN)} ${pick(ALN)}`;
const re = () => `u_${Date.now()}_${Math.random().toString(36).slice(2,8)}@eman-ischool.com`;
const rd = d => { const t=new Date(); t.setDate(t.getDate()-Math.floor(Math.random()*d)); return t; };
const ts = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);

async function main() {
    console.log('=== Eduverse Database Seeder ===\n');

    // Step 0: Discover actual table columns to avoid schema cache mismatches
    console.log('Probing table schemas...');
    const probe = async (table) => {
        const { data, error } = await sb.from(table).select('*').limit(0);
        if (error) return { exists: false, error: error.message };
        return { exists: true };
    };

    const tableStatus = {};
    const tablesToCheck = ['users','grades','subjects','courses','lessons','enrollments','attendance',
        'materials','lesson_meetings','meetings','enrollment_applications','assessments',
        'assessment_questions','assessment_submissions','invoices','invoice_items','payments',
        'orders','support_tickets','ticket_messages','discounts','bundles','student_performance',
        'parent_student'];
    for (const t of tablesToCheck) {
        tableStatus[t] = await probe(t);
    }
    console.log('Tables found:', Object.entries(tableStatus).filter(([,v])=>v.exists).map(([k])=>k).join(', '));
    console.log('Tables missing:', Object.entries(tableStatus).filter(([,v])=>!v.exists).map(([k])=>k).join(', ') || 'none');
    console.log();

    const log = [];
    const errors = [];
    const teacherIds = [];
    const studentIds = [];
    const parentIds = [];

    // ─── 1. Check existing data first ──────────────────────
    const { count: existingUsers } = await sb.from('users').select('*', {count:'exact',head:true});
    console.log(`Existing users in DB: ${existingUsers}`);

    // ─── 2. Teachers ───────────────────────────────────────
    const tBatch = Array.from({length:10}, () => ({
        email: re(), name: `أ. ${rn()}`, role: 'teacher', is_active: true,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=t${Math.random()}`,
    }));
    const {data:tD, error:tE} = await sb.from('users').insert(tBatch).select('id');
    if (tE) errors.push(`teachers: ${tE.message}`);
    if (tD) { teacherIds.push(...tD.map(t=>t.id)); log.push(`Teachers: ${tD.length}`); }

    // ─── 3. Students ───────────────────────────────────────
    const sBatch = Array.from({length:60}, () => ({
        email: re(), name: rn(), role: 'student', is_active: true,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=s${Math.random()}`,
    }));
    const {data:sD, error:sE} = await sb.from('users').insert(sBatch).select('id');
    if (sE) errors.push(`students: ${sE.message}`);
    if (sD) { studentIds.push(...sD.map(s=>s.id)); log.push(`Students: ${sD.length}`); }

    // ─── 4. Parent-like users (try parent role, fallback admin) ──
    let pBatch = Array.from({length:25}, () => ({
        email: re(), name: rn(), role: 'parent', is_active: true,
    }));
    let {data:pD, error:pE} = await sb.from('users').insert(pBatch).select('id');
    if (pE) {
        console.log(`  parent role failed (${pE.message}), trying admin...`);
        pBatch = pBatch.map(p => ({...p, role: 'admin', email: re()}));
        const r2 = await sb.from('users').insert(pBatch).select('id');
        pD = r2.data; pE = r2.error;
    }
    if (pE) errors.push(`parents: ${pE.message}`);
    if (pD) { parentIds.push(...pD.map(p=>p.id)); log.push(`Parents: ${pD.length}`); }

    // ─── 5. Grades ──────────────────────────────────────────
    const gradeIds = [];
    const gradeRows = [
        {name:'الأول الابتدائي',name_en:'Grade 1',slug:'grade-1'},
        {name:'الثاني الابتدائي',name_en:'Grade 2',slug:'grade-2'},
        {name:'الثالث الابتدائي',name_en:'Grade 3',slug:'grade-3'},
        {name:'الرابع الابتدائي',name_en:'Grade 4',slug:'grade-4'},
        {name:'الخامس الابتدائي',name_en:'Grade 5',slug:'grade-5'},
        {name:'السادس الابتدائي',name_en:'Grade 6',slug:'grade-6'},
        {name:'الأول المتوسط',name_en:'Grade 7',slug:'grade-7'},
        {name:'الثاني المتوسط',name_en:'Grade 8',slug:'grade-8'},
    ];
    for (const g of gradeRows) {
        const {data:ex} = await sb.from('grades').select('id').eq('slug',g.slug).maybeSingle();
        if (ex) { gradeIds.push(ex.id); continue; }
        const {data,error} = await sb.from('grades').insert({...g, sort_order:gradeIds.length+1, is_active:true}).select('id').single();
        if (error) errors.push(`grade ${g.slug}: ${error.message}`);
        if (data) gradeIds.push(data.id);
    }
    log.push(`Grades: ${gradeIds.length}`);

    // ─── 6. Subjects ──────────────────────────────────────
    const subjectIds = [];
    const subjData = [
        {title:'القرآن الكريم',slug:'quran'},{title:'اللغة العربية',slug:'arabic'},
        {title:'الفقه الإسلامي',slug:'fiqh'},{title:'التاريخ الإسلامي',slug:'islamic-history'},
        {title:'الحديث الشريف',slug:'hadith'},{title:'الرياضيات',slug:'math'},
        {title:'العلوم',slug:'science'},{title:'اللغة الإنجليزية',slug:'english'},
    ];
    for (let i=0; i<subjData.length; i++) {
        const s = subjData[i];
        const {data:ex} = await sb.from('subjects').select('id').eq('slug',s.slug).maybeSingle();
        if (ex) { subjectIds.push(ex.id); continue; }
        const {data,error} = await sb.from('subjects').insert({...s, description:s.title, teacher_id:pick(teacherIds), sort_order:i+1, is_active:true}).select('id').single();
        if (error) errors.push(`subject: ${error.message}`);
        if (data) subjectIds.push(data.id);
    }
    log.push(`Subjects: ${subjectIds.length}`);

    // ─── 7. Courses (probe columns first) ─────────────────
    const courseIds = [];
    const courseTeachers = {};
    const gLabels = ['الأول الابتدائي','الثاني الابتدائي','الثالث الابتدائي','الرابع الابتدائي','الخامس الابتدائي','السادس الابتدائي'];
    const cNames = ['القرآن - حفظ','القرآن - تجويد','العربية - نحو','العربية - قراءة','الفقه - العبادات',
        'التاريخ - السيرة','الحديث - الأربعون','الرياضيات - حساب','العلوم - أحياء',
        'إنجليزية - مستوى 1','إنجليزية - مستوى 2','القرآن - تفسير','رياضيات - جبر','علوم - فيزياء','عربية - إنشاء'];

    // Try with grade_id first
    const testCourse = { title:'test', slug:`test-${ts()}`, price:100, teacher_id:pick(teacherIds), is_published:true, max_students:20, subject:pick(cNames).split(' - ')[0], grade_level:pick(gLabels), grade_id:pick(gradeIds), duration_hours:20 };
    const {error:testCE} = await sb.from('courses').insert(testCourse);
    const hasGradeId = !testCE || !testCE.message.includes('grade_id');
    if (testCE && !testCE.message.includes('grade_id')) {
        // Delete test course if created successfully (shouldn't happen on error)
    }
    // Clean up test course
    await sb.from('courses').delete().eq('slug', testCourse.slug);
    console.log(`  courses.grade_id: ${hasGradeId ? 'EXISTS' : 'NOT FOUND'}`);

    for (const t of cNames) {
        const gl = pick(gLabels);
        const tid = pick(teacherIds);
        const glIdx = gLabels.indexOf(gl);
        const row = {
            title: `${t} - ${gl}`, slug: `c-${ts()}`,
            description: `دورة شاملة في ${t} لطلاب ${gl}`,
            price: pick([150,200,250,300,400,500]), teacher_id: tid,
            is_published: true, max_students: pick([20,25,30]),
            subject: t.split(' - ')[0], grade_level: gl,
            duration_hours: pick([15,20,25,30]),
            image_url: 'https://placehold.co/600x400/2563eb/ffffff?text=Course',
        };
        if (hasGradeId && gradeIds.length > 0) {
            row.grade_id = glIdx >= 0 && glIdx < gradeIds.length ? gradeIds[glIdx] : pick(gradeIds);
        }
        const {data,error} = await sb.from('courses').insert(row).select('id').single();
        if (error) { errors.push(`course: ${error.message}`); break; }
        if (data) { courseIds.push(data.id); courseTeachers[data.id] = tid; }
    }
    log.push(`Courses: ${courseIds.length}`);

    // ─── 8. Enrollments ─────────────────────────────────────
    let enrollTotal = 0;
    for (const cid of courseIds) {
        const enrolled = [...studentIds].sort(()=>0.5-Math.random()).slice(0,12+Math.floor(Math.random()*8));
        const eBatch = enrolled.map(sid => ({
            student_id:sid, course_id:cid,
            status: pick(['active','active','active','completed','pending']),
            progress_percent: Math.floor(Math.random()*100),
        }));
        const {data:eD,error:eE} = await sb.from('enrollments').insert(eBatch).select('id');
        if (eE) { errors.push(`enrollments: ${eE.message}`); break; }
        if (eD) enrollTotal += eD.length;
    }
    log.push(`Enrollments: ${enrollTotal}`);

    // ─── 9. Lessons + Attendance ────────────────────────────
    const lessonIds = [];
    // Probe attendance columns
    const testAtt = { lesson_id: '00000000-0000-0000-0000-000000000000', user_id: pick(studentIds), status: 'present' };
    const {error:attProbe} = await sb.from('attendance').insert(testAtt);
    const attUsesUserId = !attProbe || !attProbe.message.includes('user_id');
    const attUsesStudentId = attProbe && attProbe.message.includes('user_id');
    console.log(`  attendance id column: ${attUsesUserId ? 'user_id' : 'student_id'}`);
    // cleanup
    if (!attProbe) await sb.from('attendance').delete().eq('lesson_id', '00000000-0000-0000-0000-000000000000');

    for (const cid of courseIds) {
        const base = new Date(); base.setMonth(base.getMonth()-2);
        const tid = courseTeachers[cid] || pick(teacherIds);
        const lessonBatch = Array.from({length:12}, (_,i) => {
            const d = new Date(base); d.setDate(base.getDate()+i*5);
            const past = d < new Date();
            const hasMeet = Math.random() > 0.3;
            return {
                course_id:cid, title:`الدرس ${i+1}`, description:`محتوى الدرس ${i+1}`,
                start_date_time:d.toISOString(), end_date_time:new Date(d.getTime()+3600000).toISOString(),
                status: past ? pick(['completed','completed','completed','cancelled']) : 'scheduled',
                teacher_id: tid,
                meet_link: hasMeet ? `https://meet.google.com/abc-${Math.random().toString(36).slice(2,6)}-xyz` : null,
            };
        });
        const {data:lD,error:lE} = await sb.from('lessons').insert(lessonBatch).select('id,start_date_time');
        if (lE) { errors.push(`lessons: ${lE.message}`); break; }
        if (lD) {
            lessonIds.push(...lD.map(l=>l.id));
            const pastLessons = lD.filter(l => new Date(l.start_date_time) < new Date());
            if (pastLessons.length > 0) {
                const attBatch = [];
                for (const les of pastLessons) {
                    for (const sid of studentIds.slice(0,8)) {
                        const st = pick(['present','present','present','present','absent','late']);
                        const row = { lesson_id: les.id, status: st };
                        row[attUsesUserId ? 'user_id' : 'student_id'] = sid;
                        attBatch.push(row);
                    }
                }
                const {error:aE} = await sb.from('attendance').insert(attBatch);
                if (aE && !aE.message.includes('duplicate')) errors.push(`attendance: ${aE.message}`);
            }
        }
    }
    log.push(`Lessons: ${lessonIds.length}`);

    // ─── 10. Meetings / Lesson Meetings ─────────────────────
    if (lessonIds.length > 0) {
        if (tableStatus['lesson_meetings']?.exists) {
            const meetBatch = lessonIds.slice(-30).filter(()=>Math.random()>0.3).map(lid => ({
                lesson_id:lid, meet_url:`https://meet.google.com/live-${Math.random().toString(36).slice(2,8)}`,
                status:pick(['active','active','invalid']), provider:'google_calendar', created_by_teacher_id:pick(teacherIds),
            }));
            const {error:mE} = await sb.from('lesson_meetings').insert(meetBatch);
            if (mE) errors.push(`lesson_meetings: ${mE.message}`);
            else log.push(`LessonMeetings: ${meetBatch.length}`);
        }
        if (tableStatus['meetings']?.exists) {
            const meetBatch = lessonIds.slice(-30).filter(()=>Math.random()>0.3).map(lid => ({
                lesson_id:lid, meet_link:`https://meet.google.com/live-${Math.random().toString(36).slice(2,8)}`,
                status:pick(['created','active','ended']), created_by:pick(teacherIds),
            }));
            const {error:mE} = await sb.from('meetings').insert(meetBatch);
            if (mE) errors.push(`meetings: ${mE.message}`);
            else log.push(`Meetings: ${meetBatch.length}`);
        }
    }

    // ─── 11. Materials (probe url vs file_url) ──────────────
    if (courseIds.length > 0) {
        const matBatch = [];
        const mts = [{t:'كتاب المنهج',ty:'book'},{t:'ملف تمارين',ty:'file'},{t:'فيديو شرح',ty:'video'},{t:'رابط مرجعي',ty:'link'}];
        for (const cid of courseIds) {
            for (let i=0; i<4; i++) {
                const m = pick(mts);
                matBatch.push({
                    title:m.t, description:`${m.t} - مادة تعليمية`, type:m.ty, course_id:cid,
                    url: `https://storage.example.com/${Math.random().toString(36).slice(7)}.pdf`,
                });
            }
        }
        let {error:matE} = await sb.from('materials').insert(matBatch);
        if (matE && matE.message.includes('url')) {
            // Try file_url instead
            const matBatch2 = matBatch.map(m => { const {url,...rest} = m; return {...rest, file_url: url}; });
            const r2 = await sb.from('materials').insert(matBatch2);
            matE = r2.error;
        }
        if (matE) errors.push(`materials: ${matE.message}`);
        else log.push(`Materials: ${matBatch.length}`);
    }

    // ─── 12. Applications ───────────────────────────────────
    const appUsers = parentIds.length > 0 ? parentIds : studentIds.slice(0,5);
    if (gradeIds.length > 0 && appUsers.length > 0) {
        const appBatch = Array.from({length:80}, () => ({
            user_id:pick(appUsers), grade_id:pick(gradeIds),
            student_details:{name:rn(),phone:`9665${Math.floor(1e7+Math.random()*9e7)}`},
            parent_details:{name:rn(),phone:`9665${Math.floor(1e7+Math.random()*9e7)}`},
            payment_method:pick(['stripe','bank_transfer','cash']),
            total_amount:pick([150,200,300,500,800]), currency:'AED',
            status:pick(['pending','approved','approved','approved','payment_pending','payment_completed','rejected']),
            created_at:rd(120).toISOString(),
        }));
        const {data:appD,error:appE} = await sb.from('enrollment_applications').insert(appBatch).select('id');
        if (appE) errors.push(`applications: ${appE.message}`);
        log.push(`Applications: ${appD?.length||0}`);
    }

    // ─── 13. Assessments + Questions + Submissions ──────────
    const asmtIds = [];
    const asmtRows = [
        {title:'اختبار منتصف الفصل - العربية',assessment_type:'exam',duration_minutes:60},
        {title:'اختبار نهاية الفصل - القرآن',assessment_type:'exam',duration_minutes:90},
        {title:'اختبار قصير - الفقه',assessment_type:'quiz',duration_minutes:15},
        {title:'اختبار شامل - التاريخ',assessment_type:'exam',duration_minutes:120},
        {title:'اختبار سريع - الحديث',assessment_type:'quiz',duration_minutes:20},
        {title:'تقييم شفهي - القرآن',assessment_type:'quiz',duration_minutes:10},
        {title:'اختبار تحريري - الرياضيات',assessment_type:'exam',duration_minutes:45},
        {title:'اختبار الوحدة 1 - العلوم',assessment_type:'quiz',duration_minutes:30},
        {title:'اختبار الوحدة 2 - الإنجليزية',assessment_type:'quiz',duration_minutes:25},
        {title:'الاختبار النهائي الشامل',assessment_type:'exam',duration_minutes:120},
        {title:'اختبار التجويد',assessment_type:'quiz',duration_minutes:30},
        {title:'اختبار قواعد النحو',assessment_type:'exam',duration_minutes:60},
    ].map(a => ({
        ...a, teacher_id:pick(teacherIds),
        course_id:courseIds.length>0?pick(courseIds):null,
        lesson_id:lessonIds.length>0?pick(lessonIds):null,
        short_description:`${a.title} - وصف`, is_published:true,
        attempt_limit: a.assessment_type==='quiz'?3:1,
    }));
    const {data:aD,error:aE} = await sb.from('assessments').insert(asmtRows).select('id');
    if (aE) errors.push(`assessments: ${aE.message}`);
    if (aD) asmtIds.push(...aD.map(a=>a.id));

    if (asmtIds.length > 0) {
        const qBatch = [];
        for (const aid of asmtIds) {
            qBatch.push(
                {assessment_id:aid,question_type:'multiple_choice',question_text:'ما هو الحرف الأول في الأبجدية؟',is_mandatory:true,options_json:[{id:'1',text:'ألف',is_correct:true},{id:'2',text:'باء',is_correct:false}],points:10,sort_order:1},
                {assessment_id:aid,question_type:'multiple_choice',question_text:'كم عدد سور القرآن؟',is_mandatory:true,options_json:[{id:'1',text:'100',is_correct:false},{id:'2',text:'114',is_correct:true}],points:10,sort_order:2},
                {assessment_id:aid,question_type:'multiple_choice',question_text:'من خاتم الأنبياء؟',is_mandatory:true,options_json:[{id:'1',text:'موسى',is_correct:false},{id:'2',text:'محمد ﷺ',is_correct:true}],points:10,sort_order:3},
            );
        }
        const {error:qE} = await sb.from('assessment_questions').insert(qBatch);
        if (qE) errors.push(`questions: ${qE.message}`);

        const subBatch = [];
        for (const aid of asmtIds) {
            for (const sid of studentIds.slice(0,12)) {
                subBatch.push({assessment_id:aid, student_id:sid, status:pick(['submitted','graded','graded']), score:Math.floor(30+Math.random()*71), submitted_at:rd(30).toISOString()});
            }
        }
        const {error:subE} = await sb.from('assessment_submissions').insert(subBatch);
        if (subE) errors.push(`submissions: ${subE.message}`);
        log.push(`Assessments: ${asmtIds.length}, Q: ${qBatch.length}, Sub: ${subBatch.length}`);
    }

    // ─── 14. Invoices ───────────────────────────────────────
    const invUsers = parentIds.length>0 ? parentIds : studentIds.slice(0,5);
    if (invUsers.length > 0) {
        const invBatch = Array.from({length:40}, (_,i) => {
            const amt = pick([150,200,300,500,800]);
            const da = rd(90);
            const paid = Math.random()>0.35;
            return {
                invoice_number:`INV-${ts()}-${i}`,
                status: paid?'paid':pick(['pending','overdue','pending']),
                currency:'AED',
                due_date:new Date(da.getTime()+30*864e5).toISOString(),
                paid_at:paid?da.toISOString():null, created_at:da.toISOString(),
            };
        });
        // Try with parent_id, then user_id, then without
        for (const field of ['parent_id','user_id', null]) {
            const batch = field ? invBatch.map(inv=>({...inv, [field]:pick(invUsers)})) : invBatch;
            const {data:invD, error:invE} = await sb.from('invoices').insert(batch).select('id,status');
            if (!invE && invD) {
                log.push(`Invoices: ${invD.length} (using ${field||'no user field'})`);
                break;
            }
            if (field === null) errors.push(`invoices: ${invE?.message}`);
        }
    }

    // ─── 15. Orders ────────────────────────────────────────
    if (tableStatus['orders']?.exists) {
        const orderBatch = Array.from({length:20}, (_,i) => ({
            order_number:`ORD-${ts()}-${i}`,
            type:pick(['enrollment','invoice_request','support','class_change','refund','general']),
            status:'pending',
            user_id:pick([...parentIds,...studentIds.slice(0,5)]),
            title:pick(['طلب تغيير فصل','طلب استرداد','طلب تسجيل','استفسار','طلب شهادة']),
            description:'تفاصيل الطلب', metadata:{},
            created_at:rd(60).toISOString(),
        }));
        const {error:oE} = await sb.from('orders').insert(orderBatch);
        if (oE) errors.push(`orders: ${oE.message}`);
        else log.push('Orders: 20');
    }

    // ─── 16. Support Tickets ────────────────────────────────
    if (tableStatus['support_tickets']?.exists) {
        const ticketBatch = Array.from({length:15}, (_,i) => ({
            ticket_number:`TKT-${ts()}-${i}`,
            user_id:pick([...parentIds,...studentIds.slice(0,5)]),
            category:pick(['technical','billing','enrollment','general']),
            subject:pick(['مشكلة تسجيل','استفسار رسوم','طلب تغيير','مشكلة تقنية','استفسار منهج']),
            status:pick(['open','in_progress','resolved','closed']),
            priority:pick(['low','medium','high']),
            created_at:rd(45).toISOString(),
        }));
        const {data:tkD,error:tkE} = await sb.from('support_tickets').insert(ticketBatch).select('id');
        if (tkE) errors.push(`tickets: ${tkE.message}`);
        if (tkD) log.push(`Tickets: ${tkD.length}`);
    }

    // ─── 17. Discounts ──────────────────────────────────────
    if (tableStatus['discounts']?.exists) {
        const discRows = [{name:'خصم الأخوة 10%',type:'sibling',discount_type:'percentage',value:10},
            {name:'خصم الأخوة 15%',type:'sibling',discount_type:'percentage',value:15},
            {name:'خصم الأخوة 20%',type:'sibling',discount_type:'percentage',value:20}];
        let dc = 0;
        for (const d of discRows) {
            const {error} = await sb.from('discounts').insert({...d,is_active:true,max_uses:100,used_count:Math.floor(Math.random()*20),created_by:pick(teacherIds)});
            if (!error) dc++;
        }
        log.push(`Discounts: ${dc}`);
    }

    // ─── Final: Count all rows ──────────────────────────────
    console.log('\n=== RESULTS ===');
    for (const l of log) console.log(`  ✅ ${l}`);
    if (errors.length > 0) {
        console.log('\n=== ERRORS ===');
        for (const e of errors) console.log(`  ❌ ${e}`);
    }

    console.log('\n=== FINAL ROW COUNTS ===');
    for (const t of ['users','grades','subjects','courses','lessons','enrollments','attendance','materials','lesson_meetings','enrollment_applications','assessments','assessment_questions','assessment_submissions','invoices','orders','support_tickets','discounts']) {
        if (!tableStatus[t]?.exists) { console.log(`  ${t}: TABLE NOT FOUND`); continue; }
        const {count} = await sb.from(t).select('*',{count:'exact',head:true});
        console.log(`  ${t}: ${count} rows`);
    }

    console.log('\n=== DONE ===');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
