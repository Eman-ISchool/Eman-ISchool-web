# Reference Page Inventory — futurelab.school

**Source**: Direct web audit + Playwright exploration + codebase inference  
**Date**: 2026-04-04  
**Discovery method**: Partial live crawl (2026-03-09) + HTML/JS analysis + existing spec research  

---

## Public Pages (No Auth)

| # | Reference URL | Title/Purpose | Content Sections | Priority |
|---|--------------|---------------|-----------------|----------|
| P1 | `/ar` | Landing/Home | Hero, Features (6 cards), CTAs to login/join, Partner logos, Footer | P1 |
| P2 | `/ar/login` | Login | Email+password, Google/Facebook OAuth, language switcher, forgot password, create account links | P1 |
| P3 | `/ar/join` | Registration/Join | Hero + 2 CTAs, 6 feature cards, 4 service categories, 3 testimonials, stats, FAQ, team profiles, newsletter, footer | P1 |
| P4 | `/en/login` | Login (English) | Same as P2, LTR layout | P2 |
| P5 | `/en/join` | Registration (English) | Same as P3, LTR layout | P2 |
| P6 | `/ar/about` | About Us | Company info, team, mission (inferred from nav) | P2 |
| P7 | `/ar/services` | Services | Service categories, descriptions (inferred from nav) | P2 |
| P8 | `/ar/contact` | Contact Us | Contact form, address, map (inferred from nav) | P2 |
| P9 | `/ar/policy` | Privacy Policy | Legal text | P3 |

**Public nav links discovered**: حولنا (About), اتصل بنا (Contact), خدماتنا (Services), تسجيل الدخول (Login), انضم (Join)

---

## Authenticated Pages — Dashboard (Admin View)

| # | Reference URL | Title/Purpose | Sidebar Category | Content Elements |
|---|--------------|---------------|-----------------|-----------------|
| A1 | `/ar/dashboard` | Main Overview | لوحة التحكم (Dashboard) | KPI widgets, summary cards, quick actions, live sessions counter |
| A2 | `/ar/dashboard/profile` | Profile Management | Header menu | Personal info, password, language, avatar |
| A3 | `/ar/dashboard/courses` | Course/Subject Mgmt | الإدارة الأكاديمية | Course list, status filter tabs (All/Active/Upcoming/Completed), create button, course cards |
| A4 | `/ar/dashboard/students` | Student Management | إدارة المستخدمين | Student list table, search, filters, status indicators |
| A5 | `/ar/dashboard/messages` | Chat/Messaging | التواصل | Two-panel: conversation list + message area, new conversation button |
| A6 | `/ar/dashboard/calendar` | Calendar View | الإدارة الأكاديمية | Calendar grid, event markers, date navigation |
| A7 | `/ar/dashboard/fees` | Fee Management | الإدارة المالية | Fee structure table, payment tracking |

---

## Authenticated Pages — Sidebar Navigation Categories (9 categories)

| # | Arabic | English | Expected Sub-routes |
|---|--------|---------|-------------------|
| S1 | لوحة التحكم | Dashboard | `/dashboard` (home overview) |
| S2 | إدارة المحتوى | Content Management | `/dashboard/courses`, `/dashboard/categories`, `/dashboard/bundles` |
| S3 | إدارة المستخدمين | User Management | `/dashboard/students`, `/dashboard/teachers`, `/dashboard/users` |
| S4 | الإدارة الأكاديمية | Academic Management | `/dashboard/calendar`, `/dashboard/exams`, `/dashboard/quizzes`, `/dashboard/lessons` |
| S5 | إدارة المدرسة | School Management | `/dashboard/classes`, `/dashboard/attendance` |
| S6 | الإدارة المالية | Financial Management | `/dashboard/fees`, `/dashboard/payments`, `/dashboard/coupons` |
| S7 | التواصل | Communication | `/dashboard/messages`, `/dashboard/announcements` |
| S8 | التحليلات والتقارير | Analytics & Reports | `/dashboard/reports`, `/dashboard/analytics` |
| S9 | إدارة النظام | System Administration | `/dashboard/settings`, `/dashboard/system-settings`, `/dashboard/role-management` |

---

## Authenticated Pages — Grade/Course Detail (7-Tab Layout)

| # | Tab Name (AR) | Tab Name (EN) | Content |
|---|--------------|---------------|---------|
| T1 | معلومات | Info | Course/grade basic info, description, metadata |
| T2 | الدروس | Lessons | Lesson list, schedule, meeting links |
| T3 | الاختبارات القصيرة | Quizzes | Quiz management, results |
| T4 | الامتحانات | Exams | Exam groups, results, scheduling |
| T5 | الرسوم | Fees | Fee structure, payment status per student |
| T6 | الطلاب | Students | Enrolled student list, status indicators |
| T7 | الجدول | Schedule | Class timetable, weekly view |

---

## Authenticated Pages — Student Portal (Inferred)

| # | Expected Route | Purpose |
|---|---------------|---------|
| ST1 | `/ar/student` or `/ar/dashboard` | Student dashboard home |
| ST2 | `/ar/student/courses` | Enrolled courses list |
| ST3 | `/ar/student/courses/[id]` | Course detail with lessons |
| ST4 | `/ar/student/attendance` | Attendance records |
| ST5 | `/ar/student/grades` or course grades tab | Grade reports |
| ST6 | `/ar/student/calendar` | Schedule/timetable |
| ST7 | `/ar/student/messages` or `/ar/student/chat` | Messaging |
| ST8 | `/ar/student/profile` | Profile management |

---

## Authenticated Pages — Teacher Portal (Inferred)

| # | Expected Route | Purpose |
|---|---------------|---------|
| TE1 | `/ar/teacher` | Teacher dashboard home |
| TE2 | `/ar/teacher/courses` | Course management |
| TE3 | `/ar/teacher/courses/[id]` | Course detail (7 tabs) |
| TE4 | `/ar/teacher/lessons` | Lesson management |
| TE5 | `/ar/teacher/grades` | Grade management |
| TE6 | `/ar/teacher/assessments` | Quiz/exam creation |
| TE7 | `/ar/teacher/attendance` | Attendance taking |
| TE8 | `/ar/teacher/calendar` | Schedule |
| TE9 | `/ar/teacher/messages` or `/ar/teacher/chat` | Messaging |
| TE10 | `/ar/teacher/profile` | Profile |

---

## Authenticated Pages — Parent Portal (Inferred)

| # | Expected Route | Purpose |
|---|---------------|---------|
| PA1 | `/ar/parent/home` | Parent dashboard |
| PA2 | `/ar/parent/children` or `/ar/parent/students` | Children management |
| PA3 | `/ar/parent/courses` | Children's courses |
| PA4 | `/ar/parent/invoices` | Payment/invoices |
| PA5 | `/ar/parent/support` | Support tickets |

---

## Summary

| Category | Discovered Count | Confidence |
|----------|-----------------|------------|
| Public pages | 9 | High (direct observation) |
| Admin dashboard | 7 core routes | High (Playwright exploration) |
| Sidebar categories | 9 categories (~25-30 sub-routes) | Medium (category names confirmed, sub-routes inferred) |
| Grade detail tabs | 7 tabs | High (HTML analysis) |
| Student portal | 8 expected routes | Medium (inferred from domain model) |
| Teacher portal | 10 expected routes | Medium (inferred from domain model) |
| Parent portal | 5 expected routes | Medium (inferred from domain model) |
| **Total estimated** | **~70-80 unique pages** | |

> **Discovery limitation**: Full authenticated route enumeration blocked by Cloudflare bot protection + session requirements. Confidence levels reflect this constraint.
