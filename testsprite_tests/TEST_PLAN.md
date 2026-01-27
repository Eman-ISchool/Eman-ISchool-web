# Eman ISchool - Comprehensive Test Plan for TestSprite

> **Document Version**: 1.0  
> **Last Updated**: 2026-01-20  
> **Platform**: Eman ISchool (Eduverse)  
> **Purpose**: Systematic testing validation document for TestSprite

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Concepts & Entities](#2-core-concepts--entities)
3. [Page Inventory](#3-page-inventory)
4. [User Roles & Permissions Matrix](#4-user-roles--permissions-matrix)
5. [End-to-End User Flows](#5-end-to-end-user-flows)
6. [Testing Checklist](#6-testing-checklist)
7. [Test Data & Credentials](#7-test-data--credentials)

---

## 1. Project Overview

### 1.1 Application Description
Eman ISchool is a comprehensive online education platform built with Next.js that provides:
- **Live virtual classrooms** with Google Meet integration
- **Course management** for teachers and administrators
- **Student portal** for learning, assignments, and progress tracking
- **Administrative tools** for managing users, fees, attendance, and content
- **Parent dashboard** for monitoring children's progress
- **Multilingual support** (Arabic/English)

### 1.2 Technology Stack
| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Styling | Tailwind CSS, Custom CSS |
| Authentication | NextAuth.js (Google OAuth + Credentials) |
| Database | Supabase (PostgreSQL) |
| Video Conferencing | Google Meet API |
| CMS | Sanity.io |

### 1.3 Base URL
- Development: `http://localhost:3000`
- Production: TBD

---

## 2. Core Concepts & Entities

### 2.1 Database Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **Users** | All platform users | `id`, `email`, `name`, `role`, `is_active`, `last_login` |
| **Courses** | Educational courses | `id`, `title`, `slug`, `price`, `teacher_id`, `is_published` |
| **Lessons** | Individual class sessions | `id`, `title`, `start_date_time`, `meet_link`, `status`, `course_id` |
| **Attendance** | Lesson attendance records | `id`, `lesson_id`, `user_id`, `status`, `joined_at`, `duration_minutes` |
| **Enrollments** | Student-course relationships | `id`, `student_id`, `course_id`, `status`, `progress_percent` |
| **Assignments** | Homework/tasks | `id`, `course_id`, `title`, `due_date`, `max_score` |
| **Assignment Submissions** | Student work submissions | `id`, `assignment_id`, `student_id`, `score`, `feedback` |
| **Notifications** | User notifications | `id`, `user_id`, `title`, `message`, `is_read` |
| **Reels** | Short educational videos | `id`, `title_en`, `title_ar`, `video_url`, `teacher_id`, `status` |
| **Audit Logs** | System activity tracking | `id`, `action`, `table_name`, `user_id`, `old_data`, `new_data` |
| **Posts** | Blog/announcement posts | `id`, `title`, `slug`, `content`, `is_published` |
| **Exam Simulations** | Practice exams | `id`, `course_id`, `title`, `duration_minutes`, `total_score` |

### 2.2 Enum Types

| Type | Values |
|------|--------|
| **UserRole** | `student`, `teacher`, `admin`, `parent` |
| **LessonStatus** | `scheduled`, `live`, `completed`, `cancelled` |
| **AttendanceStatus** | `present`, `absent`, `late`, `early_exit` |
| **EnrollmentStatus** | `active`, `completed`, `dropped`, `pending` |
| **ReelStatus** | `queued`, `processing`, `pending_review`, `approved`, `rejected`, `failed` |
| **NotificationChannel** | `email`, `push`, `sms`, `in_app` |
| **NotificationStatus** | `pending`, `sent`, `delivered`, `failed`, `read` |

---

## 3. Page Inventory

### 3.1 Public Pages

| Page | Path | Description |
|------|------|-------------|
| Landing Page | `/` | Main marketing homepage |
| About Us | `/about-us` | Company information |
| Blogs | `/blogs` | Educational blog posts |
| Policy | `/policy` | Privacy policy & terms |
| Egypt Curriculum | `/egypt-curriculum` | Egyptian curriculum programs |
| Al-Azhar School | `/al-azhar-school` | Al-Azhar specialized programs |
| National School | `/national-school` | National curriculum programs |
| Search | `/search` | Course search functionality |
| Product by Subject | `/product/by-subject` | Subject-based browsing |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Payment checkout |
| Exam Simulation | `/exam-simulation` | Public exam demo |
| VR Eduverse | `/vr-eduverse` | VR educational experience |

### 3.2 Authentication Pages

| Page | Path | Description |
|------|------|-------------|
| General Login | `/login` | Universal login page |
| Admin Login | `/login/admin` | Admin-specific login |
| Teacher Login | `/login/teacher` | Teacher-specific login |
| Student Login | `/login/student` | Student-specific login |
| Register | `/register` | New user registration |

### 3.3 Admin Portal Pages (`/admin/*`)

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/admin` | Admin main dashboard with KPIs |
| Attendance | `/admin/attendance` | Attendance management & reports |
| Calendar | `/admin/calendar` | School calendar management |
| Content | `/admin/content` | Content/curriculum management |
| Coupons & Expenses | `/admin/coupons-expenses` | Financial promotions & expenses |
| Currency Compare | `/admin/currency-compare` | Multi-currency tools |
| Fees | `/admin/fees` | Student fee management |
| Lessons | `/admin/lessons` | Lesson scheduling & management |
| Live Sessions | `/admin/live` | Live class monitoring |
| Meetings | `/admin/meetings` | Meeting management |
| Messages & Audit | `/admin/messages-audit` | Activity logs & messaging |
| Quizzes & Exams | `/admin/quizzes-exams` | Assessment management |
| Settings | `/admin/settings` | Platform settings |
| Students | `/admin/students` | Student management |
| Teachers | `/admin/teachers` | Teacher management |
| Users | `/admin/users` | All user management |

### 3.4 Student Portal Pages (`/student/*`)

| Page | Path | Description |
|------|------|-------------|
| Home | `/student/home` | Student dashboard |
| Calendar | `/student/calendar` | Personal schedule |
| Chat | `/student/chat` | Messaging system |
| Profile | `/student/profile` | Profile settings |
| Reels | `/student/reels` | Educational short videos |

### 3.5 Teacher Portal Pages (`/teacher/*`)

| Page | Path | Description |
|------|------|-------------|
| Home | `/teacher/home` | Teacher dashboard |
| Calendar | `/teacher/calendar` | Teaching schedule |
| Chat | `/teacher/chat` | Messaging system |
| Materials | `/teacher/materials` | Teaching materials management |
| Profile | `/teacher/profile` | Profile settings |
| Reels | `/teacher/reels` | Educational content creation |

### 3.6 Dashboard Pages

| Page | Path | Description |
|------|------|-------------|
| General Dashboard | `/dashboard` | Role-based redirect dashboard |
| Virtual Classroom | `/dashboard/classroom/[lessonId]` | Live lesson interface |

### 3.7 Parent Dashboard

| Page | Path | Description |
|------|------|-------------|
| Parent Dashboard | `/parent-dashboard` | Child progress monitoring |

---

## 4. User Roles & Permissions Matrix

### 4.1 Role Definitions

| Role | Description | Default Landing Page |
|------|-------------|---------------------|
| **Admin** | Platform administrators with full access | `/admin` |
| **Teacher** | Instructors who create and conduct lessons | `/teacher/home` |
| **Student** | Learners enrolled in courses | `/student/home` |
| **Parent** | Guardians monitoring children's progress | `/parent-dashboard` |

### 4.2 Permissions Matrix

#### Portal Access

| Portal/Section | Admin | Teacher | Student | Parent |
|----------------|:-----:|:-------:|:-------:|:------:|
| Admin Portal (`/admin/*`) | ✅ | ❌ | ❌ | ❌ |
| Teacher Portal (`/teacher/*`) | ✅ | ✅ | ❌ | ❌ |
| Student Portal (`/student/*`) | ✅ | ❌ | ✅ | ❌ |
| Parent Dashboard | ✅ | ❌ | ❌ | ✅ |
| Public Pages | ✅ | ✅ | ✅ | ✅ |

#### User Management

| Action | Admin | Teacher | Student | Parent |
|--------|:-----:|:-------:|:-------:|:------:|
| View all users | ✅ | ❌ | ❌ | ❌ |
| Create users | ✅ | ❌ | ❌ | ❌ |
| Update any user | ✅ | ❌ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ | ❌ |
| Update own profile | ✅ | ✅ | ✅ | ✅ |
| Change user roles | ✅ | ❌ | ❌ | ❌ |

#### Course Management

| Action | Admin | Teacher | Student | Parent |
|--------|:-----:|:-------:|:-------:|:------:|
| View all courses | ✅ | ✅ | ✅ (enrolled) | ✅ (child's) |
| Create courses | ✅ | ✅ | ❌ | ❌ |
| Update any course | ✅ | ❌ | ❌ | ❌ |
| Update own courses | ✅ | ✅ | ❌ | ❌ |
| Delete courses | ✅ | ✅ (own) | ❌ | ❌ |
| Publish courses | ✅ | ✅ (own) | ❌ | ❌ |

#### Lesson Management

| Action | Admin | Teacher | Student | Parent |
|--------|:-----:|:-------:|:-------:|:------:|
| View all lessons | ✅ | ❌ | ❌ | ❌ |
| View assigned lessons | ✅ | ✅ | ✅ | ✅ (child's) |
| Create lessons | ✅ | ✅ | ❌ | ❌ |
| Update lessons | ✅ | ✅ (own) | ❌ | ❌ |
| Delete lessons | ✅ | ✅ (own) | ❌ | ❌ |
| Start live session | ✅ | ✅ (own) | ❌ | ❌ |
| Join live session | ✅ | ✅ | ✅ | ❌ |

#### Attendance Management

| Action | Admin | Teacher | Student | Parent |
|--------|:-----:|:-------:|:-------:|:------:|
| View all attendance | ✅ | ❌ | ❌ | ❌ |
| View class attendance | ✅ | ✅ (own classes) | ❌ | ❌ |
| Mark attendance | ✅ | ✅ | ❌ | ❌ |
| View own attendance | ✅ | ✅ | ✅ | ✅ (child's) |

#### Assignment Management

| Action | Admin | Teacher | Student | Parent |
|--------|:-----:|:-------:|:-------:|:------:|
| Create assignments | ✅ | ✅ (own courses) | ❌ | ❌ |
| Update assignments | ✅ | ✅ (own courses) | ❌ | ❌ |
| Delete assignments | ✅ | ✅ (own courses) | ❌ | ❌ |
| Submit assignments | ❌ | ❌ | ✅ | ❌ |
| Grade assignments | ✅ | ✅ (own courses) | ❌ | ❌ |
| View submissions | ✅ | ✅ (own) | ✅ (own) | ✅ (child's) |

#### Administrative Functions

| Action | Admin | Teacher | Student | Parent |
|--------|:-----:|:-------:|:-------:|:------:|
| View audit logs | ✅ | ❌ | ❌ | ❌ |
| Manage fees | ✅ | ❌ | ❌ | ❌ |
| View platform stats | ✅ | ❌ | ❌ | ❌ |
| Manage coupons | ✅ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ |

---

## 5. End-to-End User Flows

### 5.1 Admin User Flows

#### Flow A1: Admin Login & Dashboard Access
```
1. Navigate to /login/admin
2. Enter credentials (admin@eduverse.com / password123)
3. Click "Login" button
4. Verify redirect to /admin dashboard
5. Confirm KPI cards load with statistics
6. Confirm management links are visible
7. Confirm quick actions bar is functional
```

#### Flow A2: Create New Student
```
1. Login as Admin
2. Navigate to /admin/students
3. Click "Add New Student" button
4. Fill in student form:
   - Name, Email, Phone
   - Grade level, Parent info
5. Submit form
6. Verify success notification
7. Confirm student appears in list
8. Verify student can login with new credentials
```

#### Flow A3: Create New Teacher
```
1. Login as Admin
2. Navigate to /admin/teachers
3. Click "Add Teacher" button
4. Fill teacher details:
   - Name, Email, Specialization
   - Schedule preferences
5. Submit form
6. Verify success notification
7. Confirm teacher appears in list
```

#### Flow A4: Schedule New Lesson
```
1. Login as Admin
2. Navigate to /admin/lessons
3. Click "Create Lesson" button
4. Select course and teacher
5. Set date, time, and duration
6. Add lesson title and description
7. Submit form
8. Verify Google Meet link generated
9. Confirm lesson appears in calendar
10. Verify teacher receives notification
```

#### Flow A5: Manage Attendance
```
1. Login as Admin
2. Navigate to /admin/attendance
3. Select date range
4. Select specific lesson
5. View attendance list
6. Mark students as present/absent/late
7. Save changes
8. Verify attendance statistics update
```

#### Flow A6: View Audit Logs
```
1. Login as Admin
2. Navigate to /admin/messages-audit
3. Apply filters (date, action type, user)
4. Review activity log entries
5. Click on entry for expanded details
6. Export data if needed
```

#### Flow A7: Manage Fees
```
1. Login as Admin
2. Navigate to /admin/fees
3. View pending payments
4. Select student
5. Record payment or mark as unpaid
6. Generate receipt
7. Verify balance updates
```

### 5.2 Teacher User Flows

#### Flow T1: Teacher Login & Dashboard
```
1. Navigate to /login/teacher
2. Enter credentials (teacher@eduverse.com / password123)
3. Verify redirect to /teacher/home
4. Confirm upcoming lessons display
5. Confirm student quiz list loads
6. Confirm announcement bar visible
```

#### Flow T2: View Teaching Schedule
```
1. Login as Teacher
2. Navigate to /teacher/calendar
3. View weekly schedule
4. Click on lesson for details
5. Verify lesson info displays correctly
```

#### Flow T3: Start Live Lesson
```
1. Login as Teacher
2. Navigate to /teacher/home or /teacher/calendar
3. Find scheduled lesson with "Start" available
4. Click "Start Session" button
5. Verify Google Meet opens/redirects
6. Confirm lesson status changes to "live"
7. Students should see "Join" button appear
```

#### Flow T4: Upload Teaching Materials
```
1. Login as Teacher
2. Navigate to /teacher/materials
3. Click "Upload Material" button
4. Select file(s) to upload
5. Add title, description, associated course
6. Submit upload
7. Verify material appears in list
8. Confirm students can access material
```

#### Flow T5: Create Educational Reel
```
1. Login as Teacher
2. Navigate to /teacher/reels
3. Click "Create Reel" button
4. Upload video or select from lesson
5. Add English and Arabic titles
6. Add descriptions
7. Set subject and grade level
8. Submit for review
9. Verify reel enters queue
```

#### Flow T6: Grade Student Assignments
```
1. Login as Teacher
2. Navigate to teaching course
3. View assignment submissions
4. Select student submission
5. Review work
6. Enter score and feedback
7. Save grade
8. Verify student notification sent
```

### 5.3 Student User Flows

#### Flow S1: Student Login & Dashboard
```
1. Navigate to /login/student
2. Enter credentials (student@eduverse.com / password123)
3. Verify redirect to /student/home
4. Confirm announcements display
5. Confirm upcoming lessons carousel loads
6. Confirm subject grid displays enrolled subjects
```

#### Flow S2: View Personal Calendar
```
1. Login as Student
2. Navigate to /student/calendar
3. View monthly/weekly schedule
4. Click on lesson for details
5. Verify lesson time and meet link shown
```

#### Flow S3: Join Live Lesson
```
1. Login as Student
2. Navigate to /student/home
3. Find lesson with "Join Now" button
4. Click "Join" button
5. Verify redirect to Google Meet
6. After joining, verify attendance recorded
```

#### Flow S4: Submit Assignment
```
1. Login as Student
2. Navigate to assignment section
3. Select pending assignment
4. Upload file or complete online form
5. Click "Submit" button
6. Verify submission confirmation
7. Check submission appears in history
```

#### Flow S5: Watch Educational Reels
```
1. Login as Student
2. Navigate to /student/reels
3. Browse available reels
4. Click on reel to play
5. Verify progress tracking
6. Save reel for later (optional)
7. Mark as completed
```

#### Flow S6: Send Message via Chat
```
1. Login as Student
2. Navigate to /student/chat
3. Select teacher or start new conversation
4. Type message
5. Send message
6. Verify message appears in thread
7. Wait for response (or check notification)
```

#### Flow S7: Update Profile
```
1. Login as Student
2. Navigate to /student/profile
3. Update profile information
4. Change profile picture
5. Update notification preferences
6. Save changes
7. Verify updates persist
```

### 5.4 Parent User Flows

#### Flow P1: Parent Dashboard Access
```
1. Navigate to /login (as parent)
2. Login with parent credentials
3. Verify redirect to /parent-dashboard
4. Confirm children list displays
5. Select child to view details
6. View attendance, grades, and progress
```

#### Flow P2: Monitor Child Progress
```
1. Login as Parent
2. View child's enrolled courses
3. Check course progress percentages
4. View recent grades
5. Check attendance history
6. Review upcoming lessons
```

---

## 6. Testing Checklist

### 6.1 Authentication Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| AUTH-001 | Admin login with valid credentials redirects to /admin | High | ⬜ |
| AUTH-002 | Teacher login with valid credentials redirects to /teacher/home | High | ⬜ |
| AUTH-003 | Student login with valid credentials redirects to /student/home | High | ⬜ |
| AUTH-004 | Invalid credentials show error message | High | ⬜ |
| AUTH-005 | Google OAuth login creates/updates user | Medium | ⬜ |
| AUTH-006 | Session persists across page navigation | High | ⬜ |
| AUTH-007 | Logout clears session and redirects to login | High | ⬜ |
| AUTH-008 | Password hash validation works correctly | High | ⬜ |
| AUTH-009 | Role-based redirect after login works | High | ⬜ |
| AUTH-010 | JWT token contains correct user data | Medium | ⬜ |

### 6.2 Authorization Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| AUTHZ-001 | Non-admin cannot access /admin/* pages | Critical | ⬜ |
| AUTHZ-002 | Non-teacher cannot access /teacher/* pages | Critical | ⬜ |
| AUTHZ-003 | Unauthenticated user redirected to login | Critical | ⬜ |
| AUTHZ-004 | isAdmin() helper correctly identifies admins | High | ⬜ |
| AUTHZ-005 | isTeacherOrAdmin() allows both roles | High | ⬜ |
| AUTHZ-006 | API endpoints enforce role checks | Critical | ⬜ |
| AUTHZ-007 | Teacher can only modify own courses | High | ⬜ |
| AUTHZ-008 | Student cannot access other students' data | Critical | ⬜ |

### 6.3 Admin Portal Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| ADMIN-001 | Dashboard loads with correct statistics | High | ⬜ |
| ADMIN-002 | KPI cards display accurate counts | High | ⬜ |
| ADMIN-003 | Today's sessions widget shows correct lessons | Medium | ⬜ |
| ADMIN-004 | Pending actions widget displays tasks | Medium | ⬜ |
| ADMIN-005 | Quick actions bar navigation works | Medium | ⬜ |
| ADMIN-006 | Chatbot widget responds correctly | Low | ⬜ |
| ADMIN-007 | Student list pagination works | Medium | ⬜ |
| ADMIN-008 | Student search/filter functionality | Medium | ⬜ |
| ADMIN-009 | Create student form validation | High | ⬜ |
| ADMIN-010 | Update student saves changes | High | ⬜ |
| ADMIN-011 | Delete student with confirmation | High | ⬜ |
| ADMIN-012 | Teacher list displays correctly | Medium | ⬜ |
| ADMIN-013 | Add teacher modal works | High | ⬜ |
| ADMIN-014 | Calendar view renders events | Medium | ⬜ |
| ADMIN-015 | Create lesson generates meet link | High | ⬜ |
| ADMIN-016 | Attendance marking saves correctly | High | ⬜ |
| ADMIN-017 | Attendance report export works | Medium | ⬜ |
| ADMIN-018 | Fee management CRUD operations | High | ⬜ |
| ADMIN-019 | Audit log filtering works | Medium | ⬜ |
| ADMIN-020 | Settings save and persist | Medium | ⬜ |

### 6.4 Teacher Portal Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| TEACH-001 | Dashboard loads for teacher | High | ⬜ |
| TEACH-002 | Upcoming lessons display correctly | High | ⬜ |
| TEACH-003 | Start lesson creates live session | High | ⬜ |
| TEACH-004 | Calendar shows teacher's schedule | Medium | ⬜ |
| TEACH-005 | Material upload functionality | High | ⬜ |
| TEACH-006 | Reel creation workflow | Medium | ⬜ |
| TEACH-007 | Chat messaging works | Medium | ⬜ |
| TEACH-008 | Profile update saves | Medium | ⬜ |
| TEACH-009 | View enrolled students list | Medium | ⬜ |
| TEACH-010 | Grade assignment submission | High | ⬜ |

### 6.5 Student Portal Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| STUD-001 | Dashboard loads for student | High | ⬜ |
| STUD-002 | Enrolled courses display | High | ⬜ |
| STUD-003 | Lesson carousel shows upcoming classes | Medium | ⬜ |
| STUD-004 | Subject grid navigation works | Medium | ⬜ |
| STUD-005 | Join lesson button works | High | ⬜ |
| STUD-006 | Calendar shows enrolled lessons | Medium | ⬜ |
| STUD-007 | Assignment submission works | High | ⬜ |
| STUD-008 | View grades and feedback | High | ⬜ |
| STUD-009 | Reels playback and progress | Medium | ⬜ |
| STUD-010 | Chat messaging works | Medium | ⬜ |
| STUD-011 | Profile update saves | Medium | ⬜ |
| STUD-012 | Notifications display | Medium | ⬜ |

### 6.6 API Endpoint Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| API-001 | GET /api/admin/stats returns data | High | ⬜ |
| API-002 | GET /api/admin/users lists all users | High | ⬜ |
| API-003 | POST /api/admin/users creates user | High | ⬜ |
| API-004 | PUT /api/admin/users updates user | High | ⬜ |
| API-005 | DELETE /api/admin/users deletes user | High | ⬜ |
| API-006 | GET /api/courses lists courses | High | ⬜ |
| API-007 | POST /api/courses creates course | High | ⬜ |
| API-008 | GET /api/lessons lists lessons | High | ⬜ |
| API-009 | POST /api/lessons creates lesson with meet | High | ⬜ |
| API-010 | GET /api/attendance returns records | Medium | ⬜ |
| API-011 | POST /api/attendance marks attendance | High | ⬜ |
| API-012 | GET /api/enrollments returns enrollments | Medium | ⬜ |
| API-013 | POST /api/enrollments enrolls student | High | ⬜ |
| API-014 | GET /api/assignments lists assignments | Medium | ⬜ |
| API-015 | POST /api/assignments creates assignment | High | ⬜ |
| API-016 | GET /api/reels lists approved reels | Medium | ⬜ |
| API-017 | GET /api/admin/audit returns logs | Medium | ⬜ |
| API-018 | API returns 401 for unauthenticated | Critical | ⬜ |
| API-019 | API returns 403 for unauthorized roles | Critical | ⬜ |
| API-020 | API handles malformed requests gracefully | High | ⬜ |

### 6.7 UI/UX Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| UI-001 | Responsive design on mobile viewport | Medium | ⬜ |
| UI-002 | Responsive design on tablet viewport | Medium | ⬜ |
| UI-003 | RTL layout for Arabic language | Medium | ⬜ |
| UI-004 | Language toggle switches content | Medium | ⬜ |
| UI-005 | Loading states display correctly | Low | ⬜ |
| UI-006 | Error states display correctly | Medium | ⬜ |
| UI-007 | Empty states display correctly | Low | ⬜ |
| UI-008 | Navigation sidebar works | High | ⬜ |
| UI-009 | Dropdown menus accessible | Medium | ⬜ |
| UI-010 | Modal dialogs open/close properly | Medium | ⬜ |

### 6.8 Integration Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| INT-001 | Google Meet link generated for lessons | High | ⬜ |
| INT-002 | Supabase data syncs correctly | High | ⬜ |
| INT-003 | NextAuth session management | High | ⬜ |
| INT-004 | Notification delivery (in-app) | Medium | ⬜ |
| INT-005 | File upload to storage | Medium | ⬜ |
| INT-006 | Sanity CMS content loads | Low | ⬜ |

### 6.9 Edge Case Tests

| ID | Test Case | Priority | Status |
|----|-----------|----------|--------|
| EDGE-001 | Handle concurrent lesson joins | Medium | ⬜ |
| EDGE-002 | Handle large file uploads (>10MB) | Low | ⬜ |
| EDGE-003 | Handle network disconnection | Low | ⬜ |
| EDGE-004 | Handle expired session gracefully | Medium | ⬜ |
| EDGE-005 | Handle special characters in inputs | Medium | ⬜ |
| EDGE-006 | Handle duplicate email registration | High | ⬜ |
| EDGE-007 | Handle timezone differences | Medium | ⬜ |
| EDGE-008 | Handle missing required fields | High | ⬜ |

---

## 7. Test Data & Credentials

### 7.1 Test User Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eduverse.com | password123 |
| Teacher | teacher@eduverse.com | password123 |
| Student | student@eduverse.com | password123 |

### 7.2 Test Environment Setup

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.

# Seed test data
npm run seed

# Start development server
npm run dev
```

### 7.3 Database Seeding

The platform may have seed scripts in `/scripts/` or `/supabase/` directories:
- `seed-test-users.ts` - Creates test user accounts
- `seed-users.ts` - Bulk user creation

---

## Appendix A: API Endpoint Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/users` | List users | Admin |
| POST | `/api/admin/users` | Create user | Admin |
| PUT | `/api/admin/users` | Update user | Admin |
| DELETE | `/api/admin/users` | Delete user | Admin |
| GET | `/api/admin/audit` | Audit logs | Admin |
| GET | `/api/courses` | List courses | Any |
| POST | `/api/courses` | Create course | Teacher/Admin |
| PUT | `/api/courses` | Update course | Teacher/Admin |
| DELETE | `/api/courses` | Delete course | Teacher/Admin |
| GET | `/api/lessons` | List lessons | Any |
| POST | `/api/lessons` | Create lesson | Teacher/Admin |
| PUT | `/api/lessons` | Update lesson | Teacher/Admin |
| DELETE | `/api/lessons` | Delete lesson | Teacher/Admin |
| GET | `/api/attendance` | Get attendance | Teacher/Admin |
| POST | `/api/attendance` | Mark attendance | Teacher/Admin |
| GET | `/api/enrollments` | List enrollments | Any |
| POST | `/api/enrollments` | Create enrollment | Admin |
| PUT | `/api/enrollments` | Update enrollment | Admin |
| DELETE | `/api/enrollments` | Remove enrollment | Admin |
| GET | `/api/assignments` | List assignments | Any |
| POST | `/api/assignments` | Create assignment | Teacher/Admin |
| PUT | `/api/assignments` | Update assignment | Teacher/Admin |
| DELETE | `/api/assignments` | Delete assignment | Teacher/Admin |
| GET | `/api/reels` | List reels | Any |
| GET | `/api/currencies` | Currency rates | Any |

---

## Appendix B: Component Inventory

### Admin Components (`/components/admin/`)
- `KPIStatCard.tsx` - Stats display card
- `StateComponents.tsx` - Loading/Error states
- `widgets/AttendanceWidget.tsx` - Attendance chart
- `widgets/TodaySessionsWidget.tsx` - Today's lessons
- `widgets/PendingActionsWidget.tsx` - Action items
- `widgets/QuickActionsBar.tsx` - Quick action buttons
- `widgets/InstantChatbotWidget.tsx` - AI assistant

### Student Components (`/components/student/`)
- `AnnouncementCard.tsx` - Announcement display
- `LessonCarousel.tsx` - Lesson slider
- `SubjectGrid.tsx` - Subject navigation
- `TeacherCardList.tsx` - Teacher listing

### Teacher Components (`/components/teacher/`)
- `AnnouncementBar.tsx` - Announcements
- `StudentQuizList.tsx` - Quiz overview

### Shared Components
- `Logo.tsx` - Platform logo
- `LessonCard.tsx` - Lesson display
- `JoinMeetButton.tsx` - Meeting join button
- `AuthProvider.tsx` - Auth context
- `LanguageProviderWrapper.tsx` - i18n context

---

> **Note**: This test plan should be updated as new features are added to the platform. Each test should be executed in a clean testing environment with fresh test data.
