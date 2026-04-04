# Parity Matrix — FutureLab Reference vs Eduverse

**Date**: 2026-04-04  
**Branch**: `002-virtual-meeting-rooms`  
**Status**: Phase 1 baseline — will be updated through implementation  

Legend:  
- **MATCH** = Functional parity achieved  
- **PARTIAL** = Route exists but missing features/states/quality  
- **MISSING** = No equivalent in Eduverse  
- **BLOCKED** = Cannot implement (dependency/access issue)  
- **EXCLUDED** = Intentionally not implementing (with reason)  

---

## Public Pages

| # | Reference Page | Eduverse Route | Status | Gap Details |
|---|---------------|----------------|--------|-------------|
| P1 | `/ar` Landing | `/[locale]/page.tsx` | PARTIAL | Missing: feature cards, service sections, testimonials, partner logos, full marketing layout |
| P2 | `/ar/login` | `/[locale]/(auth)/login/page.tsx` | PARTIAL | Missing: phone+country code (uses email), password toggle, Google/Facebook OAuth buttons |
| P3 | `/ar/join` | `/[locale]/join/page.tsx` | PARTIAL | Missing: hero section, 6 feature cards, 4 service categories, testimonials, stats, FAQ, team profiles, newsletter |
| P4 | `/ar/about` | `/[locale]/about/page.tsx` + `/[locale]/about-us/page.tsx` | PARTIAL | Exists but content parity unverified |
| P5 | `/ar/services` | `/[locale]/services/page.tsx` | PARTIAL | Exists but content parity unverified |
| P6 | `/ar/contact` | `/[locale]/contact/page.tsx` | PARTIAL | Exists but content parity unverified |
| P7 | `/ar/policy` | `/[locale]/policy/page.tsx` | MATCH | Legal page exists |
| P8 | Language switch | next-intl `/[locale]/` | MATCH | AR/EN switching works |
| P9 | Header/Footer | Layout components | PARTIAL | Header nav links may not match; footer needs newsletter + legal links |

**Public score: 1 MATCH / 7 PARTIAL / 0 MISSING**

---

## Auth Flow

| # | Reference Feature | Eduverse Implementation | Status | Gap Details |
|---|------------------|------------------------|--------|-------------|
| AU1 | Phone + country code login | Email-based login | PARTIAL | Need phone field with country selector as primary |
| AU2 | Password visibility toggle | Standard password input | PARTIAL | Toggle icon not confirmed |
| AU3 | Google OAuth | NextAuth configured | PARTIAL | Button present but OAuth provider setup unverified |
| AU4 | Facebook OAuth | Not configured | MISSING | No Facebook provider in NextAuth config |
| AU5 | Forgot password flow | `/[locale]/forgot-password` + `/[locale]/auth/reset-password` | MATCH | Both routes exist |
| AU6 | Registration with role selection | `/[locale]/(auth)/register` | PARTIAL | Form exists but marketing sections missing |
| AU7 | Session management | NextAuth sessions | MATCH | Working |
| AU8 | Role-based redirect | NextAuth callbacks | MATCH | Redirects to correct portal |

**Auth score: 3 MATCH / 4 PARTIAL / 1 MISSING**

---

## Admin Dashboard

| # | Reference Page | Eduverse Route | Status | Gap Details |
|---|---------------|----------------|--------|-------------|
| AD1 | Dashboard home | `/[locale]/admin/home` | PARTIAL | KPI cards exist; live sessions, date filters, quick actions need audit |
| AD2 | Courses management | `/[locale]/admin/lessons` + `/(portal)/admin/courses` | PARTIAL | Dual implementation needs consolidation |
| AD3 | Student management | `/[locale]/admin/students` | MATCH | List + search exists |
| AD4 | Teacher management | `/[locale]/admin/teachers` | MATCH | List + search exists |
| AD5 | User management | `/[locale]/admin/users` | MATCH | Combined user management |
| AD6 | Calendar | `/[locale]/admin/calendar` | MATCH | Calendar view exists |
| AD7 | Fee management | `/[locale]/admin/fees` | MATCH | Fee table exists |
| AD8 | Messages/Chat | `/[locale]/dashboard/messages` | PARTIAL | Exists but not under `/admin/` path |
| AD9 | Settings | `/[locale]/admin/settings` | MATCH | Settings page exists |
| AD10 | Attendance | `/[locale]/admin/attendance` | MATCH | Attendance tracking exists |
| AD11 | Meetings | `/[locale]/admin/meetings` | MATCH | Live session management |
| AD12 | Support tickets | `/[locale]/admin/support` + `/[locale]/admin/support/[id]` | MATCH | List + detail exists |
| AD13 | Enrollment applications | `/[locale]/admin/enrollment-applications` | MATCH | List + detail exists |
| AD14 | Quizzes/Exams | `/[locale]/admin/quizzes-exams` | MATCH | Management page exists |
| AD15 | Content management | `/[locale]/admin/content` | MATCH | Content page exists |
| AD16 | Reels management | `/[locale]/admin/reels` | MATCH | Reel management (Eduverse-specific) |
| AD17 | Reports | `/(portal)/admin/reports/*` | PARTIAL | 4 report pages exist but consolidation needed |
| AD18 | Coupons/Expenses | `/[locale]/admin/coupons-expenses` | MATCH | Finance management |
| AD19 | Profile | `/(portal)/admin/profile` + `/[locale]/dashboard/profile` | PARTIAL | Dual location |

**Admin score: 13 MATCH / 5 PARTIAL / 0 MISSING**

---

## Teacher Portal

| # | Reference Feature | Eduverse Route | Status | Gap Details |
|---|------------------|----------------|--------|-------------|
| TE1 | Dashboard home | `/[locale]/teacher/home` + `/[locale]/teacher/page.tsx` | PARTIAL | Dashboard exists; widget parity unverified |
| TE2 | Course list + filter tabs | `/[locale]/teacher/courses` | PARTIAL | List exists; missing All/Active/Upcoming/Completed status tabs |
| TE3 | Create course | `/[locale]/teacher/courses/new` | MATCH | Form exists |
| TE4 | Course detail (7 tabs) | `/[locale]/teacher/courses/[id]` | PARTIAL | Route exists; needs 7-tab layout (Info/Lessons/Quizzes/Exams/Fees/Students/Schedule) |
| TE5 | Lesson management | `/[locale]/teacher/lessons/*` (4 routes) | MATCH | List, detail, edit, new all exist |
| TE6 | Lesson detail in course | `/[locale]/teacher/courses/[id]/lessons/[lessonId]` | MATCH | Nested route exists |
| TE7 | Subject management | `/[locale]/teacher/subjects/*` (5 routes) | MATCH | Full CRUD with materials |
| TE8 | Grade management | `/[locale]/teacher/grades` + `/[locale]/teacher/grades/[id]` | PARTIAL | Exists; tab completeness vs 7-tab reference unverified |
| TE9 | Assessment management | `/[locale]/teacher/assessments/*` (4 routes) | MATCH | Full CRUD with results |
| TE10 | Calendar | `/[locale]/teacher/calendar` | MATCH | Calendar exists |
| TE11 | Chat/Messages | `/[locale]/teacher/chat` | MATCH | Chat page exists |
| TE12 | Materials | `/[locale]/teacher/materials` | MATCH | Materials page exists |
| TE13 | Reels | `/[locale]/teacher/reels/*` (3 routes) | MATCH | List, upload, detail |
| TE14 | Profile | `/[locale]/teacher/profile` | MATCH | Profile page exists |
| TE15 | Attendance (course) | `/[locale]/teacher/courses/[id]/attendance` | MATCH | Attendance in course context |
| TE16 | Attendance (lesson) | `/[locale]/teacher/lessons/[id]/attendance` | MATCH | Lesson-level attendance |
| TE17 | Google Meet link | Lesson detail | PARTIAL | Meet link generation exists; real API vs mock needs verification |

**Teacher score: 12 MATCH / 4 PARTIAL / 0 MISSING**

---

## Student Portal

| # | Reference Feature | Eduverse Route | Status | Gap Details |
|---|------------------|----------------|--------|-------------|
| ST1 | Dashboard home | `/[locale]/student/home` + `/[locale]/student/page.tsx` | PARTIAL | Exists; widget/section parity unverified |
| ST2 | Course list | `/[locale]/student/courses` | MATCH | Course list exists |
| ST3 | Course detail | `/[locale]/student/courses/[id]` | MATCH | Detail page exists |
| ST4 | Lesson detail | `/[locale]/student/courses/[id]/lessons/[lessonId]` | MATCH | Nested lesson route |
| ST5 | Assessments | `/[locale]/student/assessments` + take assessment | MATCH | List + take flow |
| ST6 | Attendance | `/[locale]/student/attendance` | MATCH | Attendance records |
| ST7 | Calendar | `/[locale]/student/calendar` | MATCH | Calendar view |
| ST8 | Chat | `/[locale]/student/chat` | MATCH | Chat page |
| ST9 | Profile | `/[locale]/student/profile` | MATCH | Profile management |
| ST10 | Reels | `/[locale]/student/reels` | MATCH | Video content (Eduverse-specific) |
| ST11 | Support | `/[locale]/student/support` | MATCH | Support page |
| ST12 | Documents | `/[locale]/student/documents` | MATCH | Documents page (Eduverse-specific) |
| ST13 | Onboarding | `/[locale]/student/onboarding` | MATCH | Onboarding flow (Eduverse-specific) |

**Student score: 12 MATCH / 1 PARTIAL / 0 MISSING**

---

## Parent Portal

| # | Reference Feature | Eduverse Route | Status | Gap Details |
|---|------------------|----------------|--------|-------------|
| PA1 | Dashboard home | `/[locale]/parent/home` | PARTIAL | Exists; widget parity unverified |
| PA2 | Courses | `/[locale]/parent/courses` + `[id]` | MATCH | Course list + detail |
| PA3 | Invoices | `/[locale]/parent/invoices` + `[id]` | MATCH | Invoice list + detail |
| PA4 | Support | `/[locale]/parent/support/*` (3 routes) | MATCH | List + create + detail |
| PA5 | Applications | `/[locale]/parent/applications` | MATCH | Application tracking |
| PA6 | Add student | `/[locale]/parent/students/add` | MATCH | Child enrollment |
| PA7 | Payment success | `/[locale]/parent/payments/success` | MATCH | Payment confirmation |

**Parent score: 6 MATCH / 1 PARTIAL / 0 MISSING**

---

## Cross-Cutting Concerns

| # | Concern | Status | Gap Details |
|---|---------|--------|-------------|
| X1 | RTL Arabic layout | PARTIAL | `dir="rtl"` set correctly; `ml-`/`mr-` usage in components breaks RTL — needs logical property cleanup |
| X2 | Mobile responsiveness | PARTIAL | Pages render on mobile but no unified mobile drawer nav; table transformations incomplete |
| X3 | Loading states (skeleton) | PARTIAL | Skeleton component exists; most pages don't use `loading.tsx` or show skeletons |
| X4 | Empty states | MISSING | No shared `<EmptyState>` component; inline per-page or absent |
| X5 | Error states | MISSING | No shared `<ErrorPanel>` component; most pages don't handle API errors gracefully |
| X6 | RBAC enforcement | PARTIAL | NextAuth role exists; route-level middleware protection needs audit |
| X7 | Google Meet real links | PARTIAL | Integration exists; real API call vs mock data needs verification |
| X8 | Performance | PARTIAL | App Router code splitting automatic; Three.js not lazy-loaded; no explicit performance budget |
| X9 | Accessibility | PARTIAL | Semantic HTML varies; heading order not audited; focus management incomplete |
| X10 | Arabic typography | PARTIAL | Tajawal font loaded; line-height not optimized for Arabic |

---

## Overall Parity Summary

| Category | MATCH | PARTIAL | MISSING | BLOCKED | EXCLUDED | Total |
|----------|-------|---------|---------|---------|----------|-------|
| Public pages | 1 | 7 | 0 | 0 | 0 | 8 |
| Auth flow | 3 | 4 | 1 | 0 | 0 | 8 |
| Admin dashboard | 13 | 5 | 0 | 0 | 0 | 18 |
| Teacher portal | 12 | 4 | 0 | 0 | 0 | 16 |
| Student portal | 12 | 1 | 0 | 0 | 0 | 13 |
| Parent portal | 6 | 1 | 0 | 0 | 0 | 7 |
| Cross-cutting | 0 | 8 | 2 | 0 | 0 | 10 |
| **Total** | **47** | **30** | **3** | **0** | **0** | **80** |

**Parity rate**: 47/80 = **58.75% MATCH**  
**With partial**: 77/80 = **96.25% coverage** (routes exist)  

---

## Priority Action Items

### P1 — Critical for parity

1. **Create shared `EmptyState` component** (X4)
2. **Create shared `ErrorPanel` component** (X5)
3. **Create `MobileDrawerNav` component** (X2)
4. **Add phone + country code to login** (AU1)
5. **Add status filter tabs to course lists** (TE2)
6. **Complete 7-tab layout on grade/course detail** (TE4, TE8)
7. **Fix RTL logical properties** (X1)
8. **Add `loading.tsx` to all major routes** (X3)

### P2 — Important for quality

9. **Upgrade join/registration page** with marketing sections (P3)
10. **Upgrade landing page** with full marketing layout (P1)
11. **Consolidate dual admin implementations** (AD2, AD17, AD19)
12. **Verify Google Meet real API** (X7, TE17)
13. **RBAC middleware audit** (X6)
14. **Arabic typography optimization** (X10)
15. **Password visibility toggle** (AU2)

### P3 — Polish

16. **Facebook OAuth** (AU4)
17. **Performance optimization** (X8)
18. **Accessibility audit** (X9)
19. **Footer/header content parity** (P9)
20. **Public page content audit** (P4, P5, P6)
