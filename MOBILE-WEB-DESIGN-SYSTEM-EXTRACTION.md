# EDUVERSE - Complete Design System Extraction & Mobile Web Build Specification

**Generated**: 2026-03-28
**Source Project**: Eduverse (Eman ISchool) - Arabic Educational Platform
**Framework**: Next.js 14.2.35 + React 18.3.1 + TypeScript 5 + Tailwind CSS v4
**Target**: Mobile Web Rebuild via Replit AI

---

## SECTION 1 - EXECUTIVE OVERVIEW

### Product Identity
Eduverse (branded as **Eman ISchool** / **المدرسة الإلكترونية الأولى**) is a production-grade Arabic-first educational platform serving the Egyptian and Gulf diaspora communities. It delivers the Egyptian national and Al-Azhar curricula through live virtual classrooms, AI-generated video reels, assessments, enrollment management, and payment processing.

### Visual Identity Summary
- **Primary Brand Color**: `#0D6EFD` (FutureLab Blue) - used for buttons, active states, links, CTAs
- **Legacy Brand Color**: `#FFD501` (Gold/Yellow) - used in marketing pages, hero sections
- **Typography**: Tajawal (Arabic-first, Google Font) with Inter as Latin fallback
- **Shape Language**: Rounded (buttons use `rounded-3xl` / pill shapes; cards use `rounded-lg` to `rounded-xl`)
- **Spacing Philosophy**: Generous padding (p-4 to p-6 on containers), comfortable mobile touch targets
- **Direction**: RTL-first (Arabic default), with LTR support for English/French
- **Tone**: Professional educational, clean, trustworthy, with subtle hover animations

### User Roles
1. **Student** - Course consumption, assessments, attendance, onboarding
2. **Teacher** - Course/lesson creation, grading, attendance, meetings
3. **Parent** - Child management, enrollment, invoices, course browsing
4. **Admin** - Full platform management, reports, user management, content moderation
5. **Supervisor** - Scoped admin permissions

### Key Feature Areas
- Multi-role authentication (phone + password, Google OAuth)
- Live lessons with Google Meet integration
- AI video reels generation pipeline
- 10-step enrollment wizard with document management
- Assessment builder and exam taking
- Stripe payment processing with sibling discounts
- 3D/VR educational experiences (Three.js)
- PWA with offline support
- Trilingual (Arabic, English, French)

---

## SECTION 2 - DESIGN SYSTEM MASTER SCHEMA

### 2.1 Color Tokens

#### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0D6EFD` | Buttons, links, active nav, focus rings, CTAs |
| `primary-hover` | `#0b5ed7` | Button hover state |
| `primary-light` | `#e7f1ff` | Light backgrounds, hover tints, badge backgrounds |
| `secondary` | `#0D6EFD` | Same as primary (aliased) |

#### Brand Legacy Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#FFD501` | Marketing hero sections, gold accents |
| `brand-primary-hover` | `#E6C200` | Hover on gold elements |
| `brand-dark` | `#111111` | Dark backgrounds, footer, dark cards |
| `brand-light` | `#F9FAFB` | Light page backgrounds |
| `brand-accent` | `#3A3A3A` | Secondary dark text |

#### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-soft` | `#FFFFFF` | Page background |
| `bg-card` | `#FFFFFF` | Card surfaces |
| `bg-muted` | `#F8FAFC` | Muted sections, table headers |
| `background` | `#FFFFFF` | Root background |

#### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#111827` | Headings, body text |
| `text-secondary` | `#6B7280` | Secondary labels, descriptions |
| `text-muted` | `#9CA3AF` | Placeholders, disabled text |
| `foreground` | `#111827` | Root foreground |

#### Semantic Status Colors
| Status | Background | Text | Usage |
|--------|-----------|------|-------|
| Success | `#dcfce7` | `#166534` | Approved, completed, active |
| Error | `#fee2e2` | `#991b1b` | Rejected, failed, danger |
| Warning | `#fef3c7` | `#92400e` | Pending, attention needed |
| Info/Upcoming | `#e0e7ff` | `#3730a3` | Upcoming events, info |
| Live | `#FEE2E2` | `#DC2626` | Live sessions (with pulse) |
| Completed | `#E5E7EB` | `#6B7280` | Past events |

#### Extended Color Usage (from Tailwind classes across codebase)
| Color Family | Primary Shades Used | Context |
|-------------|-------------------|---------|
| Blue | 50, 100, 200, 500, 600, 700 | Primary UI, links, interactive |
| Slate | 50, 100, 200, 600, 700, 800, 900, 950 | Text hierarchy, borders, dark surfaces |
| Gray | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 | Neutral backgrounds, borders |
| Emerald | 50, 100, 500, 600 | Student role accent, success |
| Teal | 50, 500, 600 | Teacher role accent |
| Purple | 50, 500, 600 | Analytics, special features |
| Orange | 50, 500, 600 | Warnings, secondary actions |
| Red | 50, 100, 500, 600 | Errors, destructive actions, live |
| Amber | 50, 100, 500 | Pending states |
| Pink | 500 | Occasional accent |
| Indigo | 50, 600, 700 | Charts, data visualization |

### 2.2 Typography

#### Font Families
| Token | Stack | Usage |
|-------|-------|-------|
| `font-sans` | `var(--font-cairo), "Helvetica Neue", Arial, Tahoma, sans-serif` | Theme default (CSS variable) |
| `font-tajawal` | Tajawal (Google Font) `weights: 400, 700, 800` `subsets: arabic, latin` | Primary application font |
| `font-geist` | Inter (Google Font) `subsets: latin` | Latin text fallback |
| `font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | Code blocks |

#### Font Size Scale (Tailwind defaults)
| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem (12px) | Badges, fine print, timestamps |
| `text-sm` | 0.875rem (14px) | Labels, descriptions, table cells, admin UI |
| `text-base` | 1rem (16px) | Body text, form inputs |
| `text-lg` | 1.125rem (18px) | Section headings, card titles |
| `text-xl` | 1.25rem (20px) | Sub-page titles |
| `text-2xl` | 1.5rem (24px) | Page headings, card titles (shadcn) |
| `text-3xl` | 1.875rem (30px) | Hero sub-headings |
| `text-4xl` | 2.25rem (36px) | Hero headings (desktop) |
| `text-5xl` | 3rem (48px) | Large hero text |

#### Font Weights
| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, admin text, nav items |
| `font-semibold` | 600 | Buttons, card titles, headings |
| `font-bold` | 700 | Page titles, emphasis |
| `font-extrabold` | 800 | Hero headings |

#### Line Heights
| Class | Value | Usage |
|-------|-------|-------|
| `leading-tight` | 1.25 | Headings |
| `leading-snug` | 1.375 | Cards |
| `leading-normal` | 1.5 | Body text |
| `leading-relaxed` | 1.625 | Descriptions |

### 2.3 Spacing Scale

#### Base Scale (Tailwind 4px grid)
| Value | Pixels | Common Usage |
|-------|--------|-------------|
| 0 | 0px | Reset |
| 0.5 | 2px | Fine-tune |
| 1 | 4px | Tight gaps |
| 1.5 | 6px | Badge padding-y |
| 2 | 8px | Small gaps, icon spacing |
| 3 | 12px | Button padding, small cards |
| 4 | 16px | Standard padding, card content |
| 5 | 20px | KPI card padding |
| 6 | 24px | Card headers/content (shadcn), section gaps |
| 8 | 32px | Section spacing |
| 10 | 40px | Large section spacing |
| 12 | 48px | Page section margins |
| 16 | 64px | Hero section padding |
| 20 | 80px | Side nav width, large margins |
| 24 | 96px | Hero vertical padding |

#### Key Spacing Patterns
- **Card padding**: `p-4` (16px) to `p-6` (24px)
- **Card header**: `p-4` to `px-5 py-4`
- **Section gaps**: `gap-4` (16px) to `gap-8` (32px)
- **Page padding**: `px-4` (mobile) to `px-6` (desktop)
- **Form field gap**: `gap-3` (12px) to `gap-4` (16px)
- **Button padding**: `px-4 py-2` (default) to `px-8` (large)
- **Inline element gap**: `gap-2` (8px)

### 2.4 Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Small elements, tags |
| `radius-md` | 6px | Inputs (admin), dropdowns |
| `radius` | 8px (0.5rem) | Base radius |
| `radius-lg` | 8px | Cards (shadcn), admin cards |
| `12px` | 12px | Side nav items, admin cards |
| `radius-xl` | 24px | Large cards, rounded containers |
| `rounded-3xl` | 1.5rem | Primary buttons, pill shapes |
| `radius-full` | 9999px | Badges, avatars, pill buttons, admin badges |

### 2.5 Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-card` | `0 2px 8px rgba(0,0,0,0.06)` | Default card elevation |
| `shadow-card-hover` | `0 4px 16px rgba(0,0,0,0.1)` | Card hover state |
| `shadow-sm` | Tailwind default | Subtle elevation (tabs, inputs) |
| `shadow-md` | Tailwind default | Moderate elevation |
| `shadow-lg` | Tailwind default | Dropdowns, popovers |
| `shadow-xl` | Tailwind default | Modals, mobile drawer |
| `shadow-2xl` | Tailwind default | Auth cards |
| Admin dropdown | `0 10px 15px -3px rgba(0,0,0,0.1)` | Admin dropdowns, toasts |
| Admin card hover | `0 4px 12px rgba(0,0,0,0.05)` | Admin card hover |

### 2.6 Z-Index Layers

| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default content |
| Elevated | 10 | Floating elements |
| Dropdown | 50 | Dropdowns, side nav, admin dropdowns |
| Sticky | 50 | Sticky header |
| Toast | 100 | Toast notifications |
| Overlay | 9999 | Offline indicator, critical overlays |

### 2.7 Animation & Transition Tokens

#### Keyframe Animations
| Name | Duration | Easing | Description |
|------|----------|--------|-------------|
| `float` | 6s | ease-in-out infinite | Floating Y-axis movement (-20px) |
| `pulse` | 2s | infinite | Opacity pulse (1 → 0.7 → 1) |
| `slideUp` | 0.3s | ease | Toast entrance (opacity + translateY) |

#### Transition Durations
| Duration | Usage |
|----------|-------|
| 0.1s ease | Dropdown item hover |
| 0.15s ease | Admin components, inputs |
| 0.2s ease | Cards, buttons, nav items |
| 0.3s ease | Toast, modal transitions |

### 2.8 Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Small tablets, landscape phones |
| `md` | 768px | Tablets, side nav → bottom nav transition |
| `lg` | 1024px | Desktop, full sidebar |
| `xl` | 1280px | Large desktop, 4-column grids |

**Key breakpoint behavior**:
- **< 768px**: Bottom navigation (70px), stacked layouts, mobile header, drawer nav
- **>= 768px**: Side navigation (80px), multi-column grids, desktop header

### 2.9 Container Widths
| Context | Width |
|---------|-------|
| Student content | `max-w-4xl` (896px) |
| Teacher content | `max-w-6xl` (1152px) |
| Auth card | `max-w-2xl` (672px) to `max-w-6xl` |
| Admin | Full width with `w-64` sidebar |
| Public pages | Container with responsive padding |

---

## SECTION 3 - COMPONENT INVENTORY

### 3.1 Core UI Components (Shadcn/UI-based)

#### Button
- **File**: `src/components/ui/button.tsx`
- **Library**: CVA (class-variance-authority) + Radix Slot
- **Base Classes**: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50`
- **Variants**:
  | Variant | Style |
  |---------|-------|
  | `default` | `bg-primary text-primary-foreground hover:bg-primary/90` |
  | `destructive` | `bg-destructive text-destructive-foreground hover:bg-destructive/90` |
  | `outline` | `border border-input bg-background hover:bg-accent` |
  | `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
  | `ghost` | `hover:bg-accent hover:text-accent-foreground` |
  | `link` | `text-primary underline-offset-4 hover:underline` |
- **Sizes**:
  | Size | Classes |
  |------|---------|
  | `default` | `h-12 px-4 py-2` |
  | `sm` | `h-9 rounded-md px-3` |
  | `lg` | `h-12 rounded-lg px-8` |
  | `icon` | `h-10 w-10` |
- **Mobile**: h-12 default is already thumb-friendly (48px)
- **Used**: Everywhere - CTAs, forms, navigation, dialogs

#### Card
- **File**: `src/components/ui/card.tsx`
- **Sub-components**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Card**: `rounded-lg border bg-card text-card-foreground shadow-sm`
- **CardHeader**: `flex flex-col space-y-1.5 p-6`
- **CardTitle**: `text-2xl font-semibold leading-none tracking-tight`
- **CardContent**: `p-6 pt-0`
- **CardFooter**: `flex items-center p-6 pt-0`
- **Used**: Course cards, stat cards, enrollment cards, auth cards, info panels

#### Input
- **File**: `src/components/ui/input.tsx`
- **Classes**: `flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`
- **Height**: 48px (h-12) - thumb-friendly
- **Shape**: Pill (rounded-3xl)
- **Used**: Login forms, search bars, all form inputs

#### Badge
- **File**: `src/components/ui/badge.tsx`
- **Base**: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2`
- **Variants**: default, secondary, destructive, outline
- **Used**: Status indicators, tags, grade labels, counts

#### Tabs
- **File**: `src/components/ui/tabs.tsx`
- **Library**: Radix UI Tabs
- **TabsList**: `inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground`
- **TabsTrigger**: `inline-flex items-center justify-center whitespace-nowrap border border-transparent rounded-md px-3 py-1.5 text-sm font-medium transition-all`
- **Active State**: `data-[state=active]:border-slate-800 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm`
- **Used**: Course detail views, grade tabs, admin sections, lesson details

#### Textarea
- **File**: `src/components/ui/textarea.tsx`
- **Classes**: `flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background`
- **Default rows**: 3

#### Select
- **File**: `src/components/ui/select.tsx`
- **Style**: Basic HTML select wrapper `w-full rounded-lg border border-gray-200 px-3 py-2 text-sm`

#### Alert
- **File**: `src/components/ui/alert.tsx`
- **Base**: `relative w-full rounded-lg border p-4`
- **Variants**: default, destructive

#### Avatar
- **File**: `src/components/ui/avatar.tsx`
- **Size**: `h-10 w-10 overflow-hidden rounded-full`

#### Skeleton
- **File**: `src/components/ui/skeleton.tsx`
- **Exports**: Skeleton (bar), SkeletonCard, SkeletonList
- **Animation**: `animate-pulse rounded-md bg-gray-200`

#### EmptyState
- **File**: `src/components/ui/EmptyState.tsx`
- **Props**: icon, title, description, action (label + href/onClick)
- **Classes**: `flex flex-col items-center justify-center p-8 min-h-[300px] border border-dashed rounded-xl`

#### PageError
- **File**: `src/components/ui/page-error.tsx`
- **Props**: message, onRetry, className
- **Shows**: AlertCircle icon + message + retry button

### 3.2 CSS-Only Component Classes (globals.css)

#### `.card-soft`
- Background: white, rounded-lg, shadow-card, hover shadow-card-hover
- Usage: Student portal cards

#### `.btn-primary`
- Background: primary blue, white text, rounded-full, p-3 px-6, font-weight 600
- Hover: darker blue
- Disabled: gray #9CA3AF

#### Status Badges (`.badge-*`)
- `.badge-upcoming`: light blue bg, blue text
- `.badge-live`: light red bg, red text, pulse animation
- `.badge-completed`: light gray bg, gray text

#### Admin Design System (`.admin-*`)
**Buttons**: `.admin-btn` base + variants:
- `.admin-btn-primary`: Blue #0D6EFD
- `.admin-btn-secondary`: Slate f1f5f9 / 475569
- `.admin-btn-ghost`: Transparent
- `.admin-btn-danger`: Red #ef4444
- `.admin-btn-icon`: 36px square

**Cards**: `.admin-card` + `.admin-card-header` + `.admin-card-title` + `.admin-card-body`
- Border: `#e2e8f0`, radius `0.75rem`, hover shadow

**Table**: `.admin-table`
- Header: bg `#f8fafc`, font-weight 600, color `#475569`
- Cells: padding `0.75rem 1rem`, color `#334155`
- Row hover: bg `#f8fafc`

**Badges**: `.admin-badge` + variants
- Success: green `#dcfce7` / `#166534`
- Error: red `#fee2e2` / `#991b1b`
- Warning: yellow `#fef3c7` / `#92400e`
- Upcoming: indigo `#e0e7ff` / `#3730a3`
- Live: red with pulse
- Completed: gray `#f1f5f9` / `#64748b`

**Forms**: `.admin-input`, `.admin-label`, `.admin-form-row`, `.admin-radio-item`
- Input: border `#e2e8f0`, radius `0.5rem`, focus border `#0D6EFD` + blue ring

**Dropdown**: `.admin-dropdown-container`, `.admin-dropdown`, `.admin-dropdown-item`
- Shadow: `0 10px 15px -3px rgba(0,0,0,0.1)`, z-50
- RTL: dropdown flips right→left

**Toast**: `.admin-toast`
- Fixed bottom-right (RTL: bottom-left), bg `#1e293b`, white text, z-100, slideUp animation

### 3.3 Navigation Components

#### Side Navigation (`.side-nav`)
- **Desktop (>768px)**: Fixed right side, 80px wide, vertical column, z-50
- **Mobile (<=768px)**: Fixed bottom, 100% width, 70px height, horizontal row
- **Items (`.side-nav-item`)**: Column-flex, icon + label, radius 12px
- **Hover**: primary-light bg + primary text
- **Active**: primary bg + white text
- **RTL**: Always visual right side (forced with `!important`)
- **Safe area**: Respects `env(safe-area-inset-bottom)` on mobile

#### Main Content (`.main-with-sidenav`)
- **Desktop**: `margin-right: 80px`
- **Mobile**: `margin-bottom: 70px`

#### TeacherSideNav
- **Items**: Home, My Classes (Grades), Assessments, Calendar, Chat, Profile
- **Icons**: LayoutDashboard, GraduationCap, ClipboardCheck, Calendar, MessageCircle, User
- **Memoized**: React.memo for performance

#### StudentSideNav
- **Items**: Home, Onboarding, My Courses, Assessments, Documents, Calendar, Attendance, Support

#### ParentSideNav
- **Items**: Home, Courses, Applications, Invoices, Support

#### AdminLayout Sidebar
- **Width**: 264px (w-64)
- **Groups**: Academic, Admin, Finance, Communication, Content, Analytics, Data Management
- **Mobile**: Overlay with backdrop, triggered by hamburger
- **Features**: Collapsible nav groups, user profile header, supervisor permission filtering

#### Header (Public)
- **Style**: `sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur`
- **Features**: Logo, nav links, language toggle (AR/EN), mobile drawer, auth buttons
- **Mobile**: Hamburger → drawer

#### Footer
- **Style**: `border-t border-slate-200 bg-slate-950 text-slate-200`
- **Layout**: 3-column grid on desktop, stacked on mobile

#### MobileDrawerNav
- **Width**: 320px (w-80)
- **Features**: Fixed position, backdrop overlay, nested nav, badges, active tracking

### 3.4 Auth Components

#### LoginForm
- **Props**: role (admin/teacher/student), title, description
- **Layout**: 2-column grid (gradient panel + form) `md:grid-cols-[2fr_3fr]`
- **Gradient Colors**: Admin (slate), Teacher (teal), Student (emerald)
- **Fields**: Country code selector + phone input, password with show/hide toggle
- **Features**: Google OAuth button, role-based routing, form validation

#### PhoneField / PhoneCountryInput
- **Layout**: `grid-cols-[130px_minmax(0,1fr)]`
- **Countries**: JO (+962), AE (+971), SA (+966), EG (+20), KW (+965), QA (+974)
- **Input height**: h-11, rounded-xl

#### ReferenceAuthCard
- **Tabs**: Login / Join
- **Login**: Phone or Email toggle, password with visibility
- **Join**: Full registration form with confirmation, consent checkbox
- **Layout**: `grid lg:grid-cols-[1.1fr_0.9fr]`
- **Shape**: `rounded-[2rem]` with dramatic shadow

### 3.5 Course Components

#### CourseCard
- **Structure**: Image (h-48 with fallback) → Grade badge → Title → Description → Teacher avatar + enrollment count → Price
- **Hover**: `hover:shadow-lg`
- **Grid**: `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

#### CourseFilters
- **Layout**: `flex-col md:flex-row gap-4`
- **Search**: Debounced (500ms), syncs to URL params
- **Filter**: Grade dropdown

#### CourseStatusTabs
- **Values**: all, active, upcoming, completed

### 3.6 Admin Components

#### DataTable
- **Features**: Search (debounced), sortable columns, pagination (10/page), custom renderers, row actions, RTL sorting
- **Classes**: admin-card, admin-table, admin-input

#### Modal
- **Sizes**: sm, md, lg, xl
- **Features**: Backdrop, ESC handler, click-outside close, body scroll lock
- **Also exports**: FormGroup, FormLabel, FormInput, FormSelect, FormTextarea

#### KPIStatCard
- **Variants**: default, blue, teal, purple, orange
- **Features**: Title, value, icon, trend (up/down), optional link
- **Classes**: `rounded-2xl border p-5 transition-all`

#### DashboardChart
- **Library**: Recharts
- **Types**: bar, line, area
- **Features**: Custom tooltips, grid, axis labels

### 3.7 Enrollment Components

#### EnrollmentWizard
- **10 Steps**: Start → Student Info → Academic → Guardian → Identity → Medical → Documents → Review → Submit → Status
- **Features**: Auto-save (30s debounce), progress indicator, step validation, draft loading, form locking after submission
- **15 Application Statuses**: draft → submitted → under_review → ... → enrollment_activated

### 3.8 Lesson Components

#### LessonDetailPage
- **Tabs**: Info, Materials, Attendance, Homework, Quiz, Exam
- **Features**: Lazy-loaded sections (Suspense), lifecycle bar, role-based rendering, breadcrumbs

#### JoinMeetButton
- **Features**: Attendance logging, meet link validation, live session detection, loading spinner
- **Live style**: `bg-green-500 hover:bg-green-600 text-white`

### 3.9 Reel Components
- ReelFeed, ReelEditor, SourceUploader, TranscriptViewer, VisibilitySelector, ProcessingStatus

### 3.10 Support Components
- CreateTicketForm, TicketChat, AdminTicketActions

### 3.11 PWA Components
- InstallBanner, ServiceWorkerRegistration

### 3.12 Carousel
- `.carousel-container`: flex, gap-1rem, scroll-snap-x mandatory, hidden scrollbar
- `.carousel-item`: flex 0 0 280px, scroll-snap-align start
- RTL support with `[dir="rtl"]`

### 3.13 Icon System
- **Library**: lucide-react v0.460.0
- **Common Icons**: Home, BookOpen, Users, Calendar, ChevronLeft/Right, Menu, X, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, GraduationCap, LayoutDashboard, ClipboardCheck, MessageCircle, User, Shield, Copy, Check, Video, Save, Lock, ShieldCheck, Search, Bell, Settings, Plus, Trash2, Edit, MoreVertical, Filter, Download, Upload, FileText, MapPin, Phone, Mail, Clock, Star, Heart, Bookmark, Play, Pause, ExternalLink, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Sparkles, Globe, Wifi, WifiOff
- **Size**: Default `size-4` (16px), custom sizing via className

---

## SECTION 4 - PAGE MAP

### 4.1 Authentication Flow

| Page | Route | Type | Key Components | Mobile Notes |
|------|-------|------|---------------|-------------|
| Unified Login | `/{locale}/login` | Client | ReferenceAuthCard | Full mobile support, gradient panel hidden on sm |
| Admin Login | `/{locale}/login/admin` | Server | LoginForm (role=admin) | 2-col → single col |
| Teacher Login | `/{locale}/login/teacher` | Server | LoginForm (role=teacher) | 2-col → single col |
| Student Login | `/{locale}/login/student` | Server | LoginForm (role=student) | 2-col → single col |
| Register | `/{locale}/register` | Server | ReferenceAuthCard (tab=join) | Same as login |
| Forgot Password | `/{locale}/auth/forgot-password` | Client | Email form | Single column, centered |
| Reset Password | `/{locale}/auth/reset-password` | Client | Password + confirm | Single column |

### 4.2 Student Portal

| Page | Route | Key Features | Mobile Adaptation |
|------|-------|-------------|-------------------|
| Home | `/{locale}/student/home` | Greeting, stats, announcements, lesson countdown, carousel, assignments, teachers, payments | Stacked vertically, carousel horizontal scroll |
| My Courses | `/{locale}/student/courses` | Status tabs, course grid, filters | Single column cards, sticky filter |
| Course Detail | `/{locale}/student/courses/[id]` | Learning hub, tabs (overview, topics, sessions, materials) | Tab scroll, stacked content |
| Lesson Detail | `/{locale}/student/courses/[id]/lessons/[lessonId]` | Tab panels (info, materials, attendance, homework, quiz, exam) | Full-width tabs, stacked panels |
| Assessments | `/{locale}/student/assessments` | Assessment cards with status, scores | Single column cards |
| Take Assessment | `/{locale}/student/assessments/[id]/take` | Exam interface | Full screen, focus mode |
| Onboarding | `/{locale}/student/onboarding` | Enrollment status card, checklist | Full width, stacked tasks |
| Calendar | `/{locale}/student/calendar` | Schedule view | Simplified mobile calendar |
| Attendance | `/{locale}/student/attendance` | Attendance records | Cards instead of table |
| Documents | `/{locale}/student/documents` | Document list | Card-based |
| Chat | `/{locale}/student/chat` | Messaging | Full screen chat |
| Reels | `/{locale}/student/reels` | Video feed | Vertical scroll TikTok-style |
| Support | `/{locale}/student/support` | Ticket list | Card-based |
| Profile | `/{locale}/student/profile` | User profile | Stacked form |

### 4.3 Teacher Portal

| Page | Route | Key Features | Mobile Adaptation |
|------|-------|-------------|-------------------|
| Home | `/{locale}/teacher/home` | Stats (courses, students, lessons), upcoming lessons list | Stacked stats, scrollable lessons |
| Courses | `/{locale}/teacher/courses` | Course grid with create button | Single column cards |
| New Course | `/{locale}/teacher/courses/new` | CreateCourseForm | Full-width form |
| Course Detail | `/{locale}/teacher/courses/[id]` | Course management, lessons list | Stacked sections |
| Lesson Detail | `/{locale}/teacher/courses/[id]/lessons/[lessonId]` | LessonDetailPage with all tabs | Tabbed interface |
| Course Attendance | `/{locale}/teacher/courses/[id]/attendance` | AttendanceSheet | Horizontal scroll table or cards |
| Grades | `/{locale}/teacher/grades` | Grade list | Card-based |
| Grade Detail | `/{locale}/teacher/grades/[id]` | Tabs: courses, students, info | Tabbed panels |
| Subjects | `/{locale}/teacher/subjects` | Subject list, create | Card-based |
| Subject Detail | `/{locale}/teacher/subjects/[id]` | Lessons, materials tabs | Tabbed |
| Assessments | `/{locale}/teacher/assessments` | Assessment list | Card-based |
| New Assessment | `/{locale}/teacher/assessments/new` | AssessmentBuilder | Full-width form |
| Assessment Results | `/{locale}/teacher/assessments/[id]/results` | Results table | Cards on mobile |
| Submission Grader | `/{locale}/teacher/assessments/[id]/results/[submissionId]` | SubmissionGrader | Full-width grading |
| Lessons | `/{locale}/teacher/lessons/new`, `/[id]`, `/[id]/edit` | LessonForm | Full-width form |
| Materials | `/{locale}/teacher/materials` | Material management | Card-based |
| Reels | `/{locale}/teacher/reels` | Reel management, upload | Card + upload flow |
| Calendar | `/{locale}/teacher/calendar` | Schedule | Simplified calendar |
| Chat | `/{locale}/teacher/chat` | Messaging | Full screen |
| Profile | `/{locale}/teacher/profile` | Profile management | Stacked form |

### 4.4 Parent Portal

| Page | Route | Key Features | Mobile Adaptation |
|------|-------|-------------|-------------------|
| Home | `/{locale}/parent/home` | Children grid, stats (children, enrollments, payments) | Stacked cards |
| Add Student | `/{locale}/parent/students/add` | Link child form | Full-width form |
| Courses | `/{locale}/parent/courses` | Browse courses | Card grid |
| Course Detail | `/{locale}/parent/courses/[id]` | Course info for parent | Card layout |
| Applications | `/{locale}/parent/applications` | Enrollment applications | Card-based |
| Invoices | `/{locale}/parent/invoices` | Invoice list | Card-based |
| Invoice Detail | `/{locale}/parent/invoices/[id]` | Invoice details | Stacked sections |
| Payment Success | `/{locale}/parent/payments/success` | Confirmation | Simple centered |
| Support | `/{locale}/parent/support` | Tickets | Card-based |
| New Ticket | `/{locale}/parent/support/new` | CreateTicketForm | Full-width form |
| Ticket Detail | `/{locale}/parent/support/[id]` | TicketChat | Full screen |

### 4.5 Admin Portal

| Page | Route | Key Features |
|------|-------|-------------|
| Dashboard | `/{locale}/dashboard` | ReferenceDashboardShell + Overview, stats |
| Students | `/{locale}/admin/students` | DataTable, filters, CRUD |
| Teachers | `/{locale}/admin/teachers` | DataTable, TeacherFormModal, TeacherDetailModal |
| Users | `/{locale}/admin/users` | User management table |
| Attendance | `/{locale}/admin/attendance` | Filters (status, date), paginated table |
| Admissions | `/{locale}/admin/admissions` | Application review cards |
| Enrollment Apps | `/{locale}/admin/enrollment-applications` | Application management |
| Grades | `/{locale}/admin/grades` | Grade management |
| Lessons | `/{locale}/admin/lessons` | Lesson management |
| Live Sessions | `/{locale}/admin/live` | Active sessions |
| Meetings | `/{locale}/admin/meetings` | Meeting management |
| Fees | `/{locale}/admin/fees` | Fee structure |
| Calendar | `/{locale}/admin/calendar` | Calendar view |
| Content | `/{locale}/admin/content` | Content management |
| Quizzes/Exams | `/{locale}/admin/quizzes-exams` | Assessment management |
| Reels | `/{locale}/admin/reels` | Reel moderation |
| Reports | `/{locale}/admin/reports/*` | courses, sales, students, teachers |
| Support | `/{locale}/admin/support` | Admin ticket management |
| Settings | `/{locale}/admin/settings` | System settings |
| Messages Audit | `/{locale}/admin/messages-audit` | Communication audit |

### 4.6 Public/Marketing Pages

| Page | Route | Purpose |
|------|-------|---------|
| Home/Landing | `/{locale}` | Auth card / landing |
| About Us | `/{locale}/about-us` | Vision, mission, benefits |
| Services | `/{locale}/services` | Service offerings |
| Contact | `/{locale}/contact` | Contact form |
| Policy | `/{locale}/policy` | Privacy policy |
| Blogs | `/{locale}/blogs` | Blog listing |
| Search | `/{locale}/search` | Search results |
| Egypt Curriculum | `/{locale}/egypt-curriculum` | Curriculum info |
| National School | `/{locale}/national-school` | School info |
| Al-Azhar School | `/{locale}/al-azhar-school` | School info |
| Download | `/{locale}/download` | App download |
| Join | `/{locale}/join` | Community join |
| Exam Simulation | `/{locale}/exam-simulation` | Practice exams |

### 4.7 Enrollment Flow

| Page | Route | Purpose |
|------|-------|---------|
| Root | `/{locale}/enrollment` | Redirects to apply |
| Apply | `/{locale}/enrollment/apply` | 10-step EnrollmentWizard |
| Success | `/{locale}/enrollment/success` | Confirmation |

### 4.8 Checkout Flow

| Page | Route | Purpose |
|------|-------|---------|
| Cart | `/{locale}/cart` | Shopping cart |
| Checkout | `/{locale}/checkout` | Order summary + payment form |

### 4.9 VR Eduverse

| Page | Route | Purpose |
|------|-------|---------|
| Hub | `/{locale}/vr-eduverse` | VR feature landing |
| Field Trips Hub | `/{locale}/vr-eduverse/field-trips` | 3 Egyptian destinations |
| Pyramids | `/{locale}/vr-eduverse/field-trips/pyramids-of-giza` | VR experience |
| Egyptian Museum | `/{locale}/vr-eduverse/field-trips/egyptian-museum` | VR experience |
| Abu Simbel | `/{locale}/vr-eduverse/field-trips/abu-simbel` | VR experience |
| Science Hub | `/{locale}/vr-eduverse/science` | Science VR landing |
| Solar System | `/{locale}/vr-eduverse/science/solar-system` | 3D experience |
| Human Cell | `/{locale}/vr-eduverse/science/human-cell` | 3D experience |

### 4.10 Dashboard (Multi-role Admin)

Over 30 sub-routes under `/{locale}/dashboard/` covering: announcements, applications, bundles, calendar, categories, classroom, CMS, courses, exams, fees, lessons, live, messages, payments, profile, quizzes, role-management, settings, students, system-settings, teachers, users, admin/reports.

---

## SECTION 5 - MOBILE WEB TRANSFORMATION RULES

### 5.1 What Stays Exactly The Same
- Color palette and brand identity
- Font family (Tajawal primary)
- Icon system (lucide-react)
- Card visual style (rounded, shadow, white background)
- Button pill shape (rounded-3xl)
- Badge styles and status colors
- Form input styles (rounded-3xl, h-12)
- RTL/LTR direction support
- Locale routing structure
- API integration patterns
- Authentication flow logic
- Business rules and validation

### 5.2 Navigation Transformation

**Desktop Side Nav → Mobile Bottom Nav**
- Already implemented in CSS: `@media (max-width: 768px)` converts side-nav to bottom nav
- Bottom nav: 100% width, 70px height, horizontal row, safe-area padding
- Main content: margin-bottom instead of margin-right
- **Rule**: Show max 5 items in bottom nav; overflow items go into "More" drawer

**Desktop Admin Sidebar → Mobile**
- Convert 264px sidebar to hamburger-triggered overlay drawer
- Keep nav group structure but make collapsible
- Add backdrop overlay on open

**Desktop Header → Mobile**
- Simplify to: hamburger + logo + user avatar
- Move language toggle to settings/drawer
- Hide desktop nav links

### 5.3 Layout Transformations

| Desktop Pattern | Mobile Transformation |
|----------------|----------------------|
| Multi-column grid (2-4 cols) | Single column stack |
| Side-by-side panels | Stacked vertically |
| Wide tables | Card list or horizontal scroll cards |
| Auth 2-column (gradient + form) | Full-width form, gradient as header accent |
| Dashboard stat row (4 cols) | 2x2 grid or horizontal scroll |
| Course grid (3-4 cols) | 1-2 column card list |
| Enrollment wizard sidebar + form | Full-width steps, stepper at top |

### 5.4 Component Mobile Adaptations

| Component | Mobile Rule |
|-----------|------------|
| DataTable | Convert to card list with key data; add expandable rows for details |
| Modal | Convert to full-screen bottom sheet on mobile |
| Dropdown | Convert to bottom sheet picker |
| Date range filter | Stack filters vertically, use native date inputs |
| Tabs (horizontal) | Horizontal scroll with scroll indicators |
| Charts (Recharts) | Reduce to simpler visual; horizontal scroll if needed |
| Multi-step forms | Full-width with progress bar at top |
| Search bar | Sticky at top of page |
| Breadcrumbs | Simplify to "Back" button + current title |
| KPI stat cards | 2x2 grid instead of 4-col row |
| Carousel | Already mobile-optimized (scroll-snap) |

### 5.5 Touch & Interaction Rules

| Rule | Specification |
|------|--------------|
| Minimum tap target | 44x44px (h-11 minimum) |
| Button height | 48px (h-12) - already compliant |
| Spacing between tap targets | Minimum 8px gap |
| Swipe gestures | Support swipe-back for navigation |
| Pull-to-refresh | Implement on list pages |
| Long press | Not required initially |
| Form inputs | 16px+ font to prevent iOS zoom |
| Scroll | Natural momentum scrolling, no horizontal scroll on body |
| Fixed elements | Bottom nav + sticky headers only |

### 5.6 Spacing Adjustments for Mobile

| Element | Desktop | Mobile |
|---------|---------|--------|
| Page padding | px-6 to px-8 | px-4 |
| Card padding | p-6 | p-4 |
| Section gaps | gap-8 | gap-4 to gap-6 |
| Grid gaps | gap-6 | gap-3 to gap-4 |
| Hero padding | py-24 | py-12 to py-16 |
| Typography scale | text-4xl headings | text-2xl to text-3xl |

### 5.7 Sticky & Fixed Elements

| Element | Behavior |
|---------|----------|
| Bottom navigation | Fixed bottom, 70px, safe-area aware |
| Page header/title | Sticky top on scroll |
| Search bar | Sticky below header on list pages |
| CTA buttons (forms) | Sticky bottom on long forms |
| Toast notifications | Fixed bottom-center (above nav) |
| Lesson "Join Now" | Sticky bottom CTA when lesson is live |

### 5.8 Form Optimization for Mobile

| Rule | Implementation |
|------|---------------|
| Input font size | min 16px (prevents iOS zoom) |
| Label position | Above input (not beside) |
| Submit button | Full-width, sticky bottom |
| Phone input | Country code dropdown + phone in one row |
| File upload | Camera + gallery options via native picker |
| Multi-step wizard | One step per screen, progress bar top |
| Validation | Inline errors below field, shake animation |
| Select | Native mobile select on small screens |

### 5.9 Content Density Rules

| Rule | Detail |
|------|--------|
| Text truncation | Single-line truncate for card titles; 2-line clamp for descriptions |
| Table → Cards | Max 3-4 key fields shown; expandable for details |
| Long forms | Break into multiple screens/steps |
| Stats | Show top 4, hide rest behind "View All" |
| Lists | Paginate at 10 items; load more button |
| Empty states | Simplified (icon + 1 line + CTA) |

---

## SECTION 6 - REBUILD RISKS / GAPS

### 6.1 Confirmed Gaps
1. **No formal design token file** - tokens are split between globals.css `@theme` block and inline Tailwind classes; some inconsistency between admin and portal styles
2. **Dual design systems** - shadcn/ui components AND admin CSS class system coexist; admin portal uses `.admin-*` classes while portal uses shadcn components
3. **Incomplete French translations** - fr.json is 2.8KB vs ar.json at 38KB; French is barely functional
4. **Some pages not fully documented** - Several admin and dashboard pages were too large to fully read; behavior inferred from patterns
5. **No explicit dark mode** - dark: classes appear in admin layout but no systematic dark theme

### 6.2 Inconsistencies Found
1. **Button styles diverge**: shadcn Button (rounded-3xl) vs admin-btn (rounded-0.5rem) vs btn-primary (rounded-full)
2. **Card radius varies**: Card (rounded-lg) vs admin-card (0.75rem) vs card-soft (radius-lg) vs some components using rounded-xl
3. **Input styles differ**: UI Input (rounded-3xl, h-12) vs admin-input (rounded-0.5rem, standard height)
4. **Badge implementations**: shadcn Badge vs admin-badge vs status badge CSS classes - different padding, radius, and sizing
5. **Two font families declared**: CSS theme says Cairo but actual fonts loaded are Tajawal + Inter
6. **Color aliasing**: primary and secondary are identical (#0D6EFD)

### 6.3 Assumptions Made
1. **All dashboard/* routes** follow the same admin shell pattern (ReferenceDashboardShell)
2. **VR pages** are likely excluded from mobile web rebuild (WebGL/Three.js is heavy for mobile)
3. **Sanity CMS studio** route (/studio) is admin-only tooling, excluded from rebuild
4. **E2E test pages** and seed/migration API routes are dev-only, excluded
5. **Capacitor-specific code** (native bridge, splash screen, status bar) will be replaced with PWA equivalents

### 6.4 Technical Risks for Mobile Rebuild
1. **Three.js VR pages**: Heavy 3D rendering will perform poorly on mobile web; consider simplified 2D alternatives or lazy-loading
2. **Large page count**: 180+ pages is substantial; phase implementation carefully
3. **Complex enrollment wizard**: 10-step wizard with auto-save needs careful mobile UX
4. **Google Meet integration**: Opening external links on mobile needs careful handling (in-app browser vs external)
5. **File upload**: TUS resumable uploads need mobile network resilience
6. **Charts (Recharts)**: May need simplified mobile chart views
7. **RTL complexity**: Bi-directional layout across all components requires thorough testing

---

## SECTION 7 - REPLIT AI BUILD PROMPT

```
You are building a MOBILE-FIRST WEB APPLICATION called "Eduverse" (branded as "Eman ISchool").

This is an Arabic-first educational platform that serves students, teachers, parents, and administrators. You MUST build the mobile web version using the exact design system and component specifications provided below. Do NOT invent new patterns or redesign the visual identity. Preserve the exact brand, colors, typography, and UX logic.

## TECHNOLOGY STACK
- Framework: Next.js 14 (App Router) with TypeScript
- Styling: Tailwind CSS v4
- UI Components: Build a reusable component library matching the specs below
- State: Zustand for client state
- Auth: NextAuth.js with JWT strategy
- Database: Supabase (PostgreSQL)
- Icons: lucide-react
- i18n: next-intl (Arabic default, English secondary)
- Charts: Recharts (simplified for mobile)

## FOLDER STRUCTURE
```
src/
├── app/
│   ├── [locale]/
│   │   ├── (auth)/           # Login, register, password reset
│   │   ├── student/          # Student portal pages
│   │   ├── teacher/          # Teacher portal pages
│   │   ├── parent/           # Parent portal pages
│   │   ├── admin/            # Admin portal pages
│   │   ├── enrollment/       # Enrollment wizard
│   │   ├── layout.tsx        # Locale layout with providers
│   │   └── page.tsx          # Landing/home
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout (fonts, metadata)
│   ├── globals.css           # Design tokens + global styles
│   └── page.tsx              # Root redirect
├── components/
│   ├── ui/                   # Base UI components (Button, Card, Input, Badge, Tabs, etc.)
│   ├── layout/               # Header, Footer, MobileNav, BottomNav
│   ├── auth/                 # LoginForm, PhoneField
│   ├── student/              # Student-specific components
│   ├── teacher/              # Teacher-specific components
│   ├── parent/               # Parent-specific components
│   ├── admin/                # Admin components (DataTable→CardList, Modal→BottomSheet)
│   ├── courses/              # Course cards, filters, catalog
│   ├── lessons/              # Lesson detail, lifecycle
│   ├── enrollment/           # Wizard, steps, document upload
│   └── shared/               # Shared (EmptyState, PageError, Skeleton)
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── supabase.ts           # Supabase client
│   ├── utils.ts              # cn() utility
│   ├── store.ts              # Zustand stores
│   └── ...                   # Other utilities
├── hooks/                    # Custom hooks
├── types/                    # TypeScript interfaces
├── i18n/                     # i18n config
└── messages/                 # Translation files (ar.json, en.json)
```

## DESIGN TOKENS (globals.css)
Implement these EXACT tokens in your @theme block:

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-tajawal), "Helvetica Neue", Arial, Tahoma, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --color-primary: #0D6EFD;
  --color-primary-hover: #0b5ed7;
  --color-primary-light: #e7f1ff;

  --color-bg-soft: #FFFFFF;
  --color-bg-card: #FFFFFF;
  --color-bg-muted: #F8FAFC;

  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;

  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 4px 16px rgba(0, 0, 0, 0.1);

  --radius: 0.5rem;
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-lg: var(--radius);
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

## CRITICAL MOBILE RULES

1. ALL navigation uses BOTTOM TAB BAR (70px height, max 5 items, safe-area padding)
2. ALL tables convert to CARD LISTS on mobile
3. ALL modals convert to FULL-SCREEN BOTTOM SHEETS on mobile
4. ALL forms use FULL-WIDTH inputs with 16px+ font size (prevent iOS zoom)
5. ALL tap targets are minimum 44x44px
6. ALL page headers are STICKY on scroll
7. RTL is DEFAULT direction (Arabic-first)
8. Safe area insets are respected on all fixed/sticky elements
9. Horizontal scroll only for carousels (scroll-snap)
10. No body horizontal overflow

## COMPONENT SPECIFICATIONS

### Button (MUST BUILD FIRST)
Build with CVA (class-variance-authority):
- Base: `inline-flex items-center justify-center gap-2 rounded-3xl text-sm font-semibold transition-all disabled:opacity-50`
- Variants: default (blue), destructive (red), outline (border), secondary (gray), ghost (transparent), link (underline)
- Sizes: default (h-12 px-4), sm (h-9 px-3 rounded-md), lg (h-12 px-8 rounded-lg), icon (h-10 w-10)
- MUST support asChild prop via @radix-ui/react-slot

### Card
- Card: `rounded-lg border bg-white shadow-sm`
- CardHeader: `p-4 space-y-1.5` (mobile: p-4 not p-6)
- CardTitle: `text-lg font-semibold` (mobile: text-lg not text-2xl)
- CardContent: `p-4 pt-0`
- CardFooter: `flex items-center p-4 pt-0`

### Input
- `h-12 w-full rounded-3xl border px-4 py-2 text-base focus:ring-2 focus:ring-primary/30`
- MUST be 16px font minimum (text-base)

### Badge
- `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`
- Status variants: success (green), error (red), warning (amber), info (blue), live (red + pulse)

### BottomNav
- Fixed bottom, 100% width, 70px height
- Horizontal flex, justify-around
- Items: icon (20px) + label (10px font)
- Active: primary blue bg, white text
- Inactive: gray-500 text
- Safe area: `padding-bottom: max(0.5rem, env(safe-area-inset-bottom))`
- Max 5 items visible; 5th is "More" that opens drawer

### MobileHeader
- Sticky top, white bg, backdrop-blur
- Layout: hamburger | logo (centered) | avatar/bell
- Height: 56px
- Border-bottom: 1px slate-200

### EmptyState
- Centered: icon + title + description + optional CTA
- Min-height: 200px on mobile
- Dashed border optional

### Skeleton
- `animate-pulse rounded-md bg-gray-200`
- Provide SkeletonCard and SkeletonList variants

### PageError
- AlertCircle icon (red) + message + retry button
- Centered layout

## PAGE IMPLEMENTATION ORDER

### Phase 1: Foundation (Build First)
1. Root layout with Tajawal font, RTL support, metadata
2. Locale layout with next-intl provider
3. All UI components (Button, Card, Input, Badge, Tabs, Skeleton, EmptyState, PageError)
4. BottomNav component
5. MobileHeader component
6. Auth pages (login with phone field, register)

### Phase 2: Student Portal
7. Student layout (bottom nav + header)
8. Student home (greeting, stats, lesson countdown, carousel)
9. Student courses list
10. Student course detail with tabs
11. Lesson detail with tabs
12. Student assessments list
13. Assessment taking interface

### Phase 3: Teacher Portal
14. Teacher layout
15. Teacher home (stats, upcoming lessons)
16. Teacher courses list + detail
17. Create course form
18. Lesson management (create, edit, detail)
19. Assessment builder
20. Grades management

### Phase 4: Parent Portal
21. Parent layout
22. Parent home (children grid, stats)
23. Course browsing
24. Invoice management

### Phase 5: Enrollment & Payments
25. Enrollment wizard (10 steps, mobile-optimized)
26. Checkout flow
27. Payment success

### Phase 6: Admin Portal
28. Admin layout with hamburger sidebar
29. Dashboard overview with stats
30. Student management (card list)
31. Teacher management
32. Attendance tracking
33. Reports

### Phase 7: Extras
34. Support ticket system
35. Calendar views
36. Chat interface
37. Reels feed
38. Public marketing pages

## DATA PATTERNS
- Server components for initial data fetching (Supabase queries)
- Client components for interactive pages with fetch() to API routes
- API routes at /api/* for mutations (POST, PATCH, DELETE)
- NextAuth session for all protected pages
- Role-based redirects from /dashboard based on user role

## STATES TO IMPLEMENT FOR EVERY PAGE
1. Loading state (skeleton loaders)
2. Empty state (icon + message + CTA)
3. Error state (message + retry button)
4. Success state (confirmation + next action)
5. Authenticated vs unauthenticated state
6. Role-based content visibility

## FORM VALIDATION RULES
- Inline error messages below fields
- Red border on invalid fields (border-red-500)
- Error text in text-sm text-red-600
- Required field indicator (asterisk or label text)
- Phone validation: international format with country code
- Password: minimum 6 characters
- Email: standard format validation

## ACCESSIBILITY REQUIREMENTS
- All interactive elements have focus rings (ring-2 ring-primary/30)
- All images have alt text
- Form fields have labels (explicit <label> with htmlFor)
- Buttons have type attribute
- ARIA roles on dialogs, alerts, tabs
- Semantic HTML (nav, main, section, article, header, footer)
- Touch targets minimum 44x44px
- Color contrast ratio minimum 4.5:1

## WHAT NOT TO DO
- Do NOT add dark mode
- Do NOT use Material UI, Chakra, or other UI libraries
- Do NOT change the color palette
- Do NOT add features not described
- Do NOT use server actions (use API routes)
- Do NOT skip loading/empty/error states
- Do NOT use CSS-in-JS (use Tailwind only)
- Do NOT make desktop-first layouts
- Do NOT add horizontal scroll to body
- Do NOT use px units for font sizes (use Tailwind classes)
```

---

## SECTION 8 - JSON SCHEMA EXPORT

```json
{
  "project": {
    "name": "Eduverse (Eman ISchool)",
    "type": "educational-platform",
    "direction": "rtl-first",
    "locales": ["ar", "en", "fr"],
    "defaultLocale": "ar",
    "framework": "next-14-app-router",
    "styling": "tailwind-css-v4"
  },
  "designTokens": {
    "colors": {
      "primary": "#0D6EFD",
      "primaryHover": "#0b5ed7",
      "primaryLight": "#e7f1ff",
      "brandGold": "#FFD501",
      "brandDark": "#111111",
      "bgSoft": "#FFFFFF",
      "bgCard": "#FFFFFF",
      "bgMuted": "#F8FAFC",
      "textPrimary": "#111827",
      "textSecondary": "#6B7280",
      "textMuted": "#9CA3AF",
      "success": { "bg": "#dcfce7", "text": "#166534" },
      "error": { "bg": "#fee2e2", "text": "#991b1b" },
      "warning": { "bg": "#fef3c7", "text": "#92400e" },
      "info": { "bg": "#e0e7ff", "text": "#3730a3" },
      "live": { "bg": "#FEE2E2", "text": "#DC2626" },
      "completed": { "bg": "#E5E7EB", "text": "#6B7280" }
    },
    "typography": {
      "fontFamily": {
        "primary": "Tajawal",
        "primaryWeights": [400, 700, 800],
        "primarySubsets": ["arabic", "latin"],
        "fallback": "Inter",
        "mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      },
      "scale": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem"
      },
      "weights": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700,
        "extrabold": 800
      }
    },
    "spacing": {
      "unit": "4px",
      "scale": [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24],
      "cardPadding": "16px",
      "sectionGap": "16px-32px",
      "pageHorizontalPadding": "16px",
      "bottomNavHeight": "70px",
      "headerHeight": "56px"
    },
    "radii": {
      "sm": "4px",
      "md": "6px",
      "base": "8px",
      "lg": "8px",
      "xl": "24px",
      "full": "9999px",
      "button": "1.5rem",
      "card": "0.5rem",
      "adminCard": "0.75rem",
      "navItem": "12px"
    },
    "shadows": {
      "card": "0 2px 8px rgba(0,0,0,0.06)",
      "cardHover": "0 4px 16px rgba(0,0,0,0.1)",
      "dropdown": "0 10px 15px -3px rgba(0,0,0,0.1)",
      "adminCardHover": "0 4px 12px rgba(0,0,0,0.05)"
    },
    "zIndex": {
      "base": 0,
      "dropdown": 50,
      "stickyHeader": 50,
      "bottomNav": 50,
      "toast": 100,
      "overlay": 9999
    },
    "animations": {
      "float": { "duration": "6s", "easing": "ease-in-out", "type": "infinite" },
      "pulse": { "duration": "2s", "type": "infinite" },
      "slideUp": { "duration": "0.3s", "easing": "ease" },
      "transition": {
        "fast": "0.1s ease",
        "normal": "0.15s ease",
        "default": "0.2s ease",
        "slow": "0.3s ease"
      }
    },
    "breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px"
    }
  },
  "components": {
    "button": {
      "variants": ["default", "destructive", "outline", "secondary", "ghost", "link"],
      "sizes": ["default", "sm", "lg", "icon"],
      "defaultHeight": "48px",
      "borderRadius": "1.5rem"
    },
    "card": {
      "subComponents": ["Card", "CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter"],
      "borderRadius": "0.5rem",
      "shadow": "shadow-sm"
    },
    "input": {
      "height": "48px",
      "borderRadius": "1.5rem",
      "fontSize": "16px"
    },
    "badge": {
      "shape": "rounded-full",
      "variants": ["default", "secondary", "destructive", "outline", "success", "warning", "info", "live", "completed"]
    },
    "tabs": {
      "library": "radix-ui",
      "activeIndicator": "border-bottom or pill"
    },
    "bottomNav": {
      "height": "70px",
      "maxItems": 5,
      "safeArea": true
    },
    "mobileHeader": {
      "height": "56px",
      "sticky": true,
      "backdropBlur": true
    },
    "skeleton": {
      "animation": "pulse",
      "color": "gray-200",
      "variants": ["bar", "card", "list"]
    },
    "emptyState": {
      "minHeight": "200px",
      "elements": ["icon", "title", "description", "cta"]
    },
    "modal": {
      "mobilePresentation": "bottom-sheet",
      "sizes": ["sm", "md", "lg", "xl", "full"]
    },
    "toast": {
      "position": "bottom-center",
      "aboveBottomNav": true,
      "animation": "slideUp"
    }
  },
  "navigation": {
    "studentNav": {
      "items": ["Home", "Courses", "Assessments", "Calendar", "Profile"],
      "icons": ["Home", "BookOpen", "ClipboardCheck", "Calendar", "User"]
    },
    "teacherNav": {
      "items": ["Home", "Classes", "Assessments", "Calendar", "Profile"],
      "icons": ["LayoutDashboard", "GraduationCap", "ClipboardCheck", "Calendar", "User"]
    },
    "parentNav": {
      "items": ["Home", "Courses", "Applications", "Invoices", "Support"],
      "icons": ["Home", "BookOpen", "FileText", "CreditCard", "HelpCircle"]
    },
    "adminNav": {
      "type": "hamburger-sidebar",
      "groups": ["Academic", "Admin", "Finance", "Communication", "Content", "Analytics"]
    }
  },
  "pages": {
    "auth": [
      { "route": "/{locale}/login", "component": "AuthCard", "tabs": ["login", "register"] },
      { "route": "/{locale}/login/{role}", "component": "LoginForm", "roles": ["admin", "teacher", "student"] },
      { "route": "/{locale}/register", "component": "AuthCard" },
      { "route": "/{locale}/auth/forgot-password", "component": "ForgotPasswordForm" },
      { "route": "/{locale}/auth/reset-password", "component": "ResetPasswordForm" }
    ],
    "student": [
      { "route": "/{locale}/student/home", "sections": ["greeting", "stats", "announcements", "lessonCountdown", "carousel", "assignments", "teachers"] },
      { "route": "/{locale}/student/courses", "sections": ["statusTabs", "courseGrid"] },
      { "route": "/{locale}/student/courses/{id}", "sections": ["learningHub", "tabs"] },
      { "route": "/{locale}/student/courses/{id}/lessons/{lessonId}", "sections": ["lessonDetail", "tabPanels"] },
      { "route": "/{locale}/student/assessments", "sections": ["assessmentCards"] },
      { "route": "/{locale}/student/assessments/{id}/take", "sections": ["examInterface"] },
      { "route": "/{locale}/student/onboarding", "sections": ["enrollmentStatus", "checklist"] },
      { "route": "/{locale}/student/calendar", "sections": ["calendarView"] },
      { "route": "/{locale}/student/attendance", "sections": ["attendanceRecords"] },
      { "route": "/{locale}/student/documents", "sections": ["documentList"] },
      { "route": "/{locale}/student/chat", "sections": ["chatInterface"] },
      { "route": "/{locale}/student/reels", "sections": ["reelFeed"] },
      { "route": "/{locale}/student/support", "sections": ["ticketList"] },
      { "route": "/{locale}/student/profile", "sections": ["profileForm"] }
    ],
    "teacher": [
      { "route": "/{locale}/teacher/home", "sections": ["stats", "upcomingLessons"] },
      { "route": "/{locale}/teacher/courses", "sections": ["courseGrid", "createButton"] },
      { "route": "/{locale}/teacher/courses/new", "sections": ["courseForm"] },
      { "route": "/{locale}/teacher/courses/{id}", "sections": ["courseDetail", "lessonsList"] },
      { "route": "/{locale}/teacher/grades", "sections": ["gradeList"] },
      { "route": "/{locale}/teacher/grades/{id}", "sections": ["gradeDetail", "tabs"] },
      { "route": "/{locale}/teacher/subjects", "sections": ["subjectList"] },
      { "route": "/{locale}/teacher/assessments", "sections": ["assessmentList"] },
      { "route": "/{locale}/teacher/assessments/new", "sections": ["assessmentBuilder"] },
      { "route": "/{locale}/teacher/assessments/{id}/results", "sections": ["resultsList"] },
      { "route": "/{locale}/teacher/calendar", "sections": ["calendarView"] },
      { "route": "/{locale}/teacher/materials", "sections": ["materialList"] },
      { "route": "/{locale}/teacher/reels", "sections": ["reelManagement"] },
      { "route": "/{locale}/teacher/chat", "sections": ["chatInterface"] },
      { "route": "/{locale}/teacher/profile", "sections": ["profileForm"] }
    ],
    "parent": [
      { "route": "/{locale}/parent/home", "sections": ["childrenGrid", "stats"] },
      { "route": "/{locale}/parent/courses", "sections": ["courseCatalog"] },
      { "route": "/{locale}/parent/courses/{id}", "sections": ["courseDetail"] },
      { "route": "/{locale}/parent/students/add", "sections": ["addChildForm"] },
      { "route": "/{locale}/parent/applications", "sections": ["applicationList"] },
      { "route": "/{locale}/parent/invoices", "sections": ["invoiceList"] },
      { "route": "/{locale}/parent/invoices/{id}", "sections": ["invoiceDetail"] },
      { "route": "/{locale}/parent/support", "sections": ["ticketList"] },
      { "route": "/{locale}/parent/support/new", "sections": ["ticketForm"] },
      { "route": "/{locale}/parent/support/{id}", "sections": ["ticketChat"] }
    ],
    "admin": [
      { "route": "/{locale}/dashboard", "sections": ["overview", "stats", "charts"] },
      { "route": "/{locale}/admin/students", "sections": ["studentCardList", "filters"] },
      { "route": "/{locale}/admin/teachers", "sections": ["teacherCardList", "forms"] },
      { "route": "/{locale}/admin/attendance", "sections": ["filters", "attendanceCards"] },
      { "route": "/{locale}/admin/admissions", "sections": ["applicationCards"] },
      { "route": "/{locale}/admin/grades", "sections": ["gradeManagement"] },
      { "route": "/{locale}/admin/lessons", "sections": ["lessonManagement"] },
      { "route": "/{locale}/admin/fees", "sections": ["feeStructure"] },
      { "route": "/{locale}/admin/reports/*", "sections": ["reportViews"] },
      { "route": "/{locale}/admin/settings", "sections": ["systemSettings"] },
      { "route": "/{locale}/admin/support", "sections": ["ticketManagement"] }
    ],
    "enrollment": [
      { "route": "/{locale}/enrollment/apply", "sections": ["wizardSteps"], "steps": 10 }
    ],
    "checkout": [
      { "route": "/{locale}/cart", "sections": ["cartItems"] },
      { "route": "/{locale}/checkout", "sections": ["orderSummary", "paymentForm"] }
    ],
    "public": [
      { "route": "/{locale}", "sections": ["authCard"] },
      { "route": "/{locale}/about-us", "sections": ["hero", "vision", "benefits", "cta"] },
      { "route": "/{locale}/services", "sections": ["serviceGrid"] },
      { "route": "/{locale}/contact", "sections": ["contactForm"] },
      { "route": "/{locale}/policy", "sections": ["policyContent"] },
      { "route": "/{locale}/blogs", "sections": ["blogGrid"] }
    ]
  },
  "formPatterns": {
    "login": {
      "fields": ["countryCode", "phone", "password"],
      "validation": ["required", "phoneFormat", "minLength6"],
      "alternatives": ["googleOAuth"]
    },
    "register": {
      "fields": ["name", "email", "phone", "password", "confirmPassword", "consent"],
      "validation": ["required", "emailFormat", "passwordMatch", "minLength6"]
    },
    "courseCreate": {
      "fields": ["title", "description", "gradeId", "subjectId", "price", "currency"],
      "validation": ["required", "positiveNumber"]
    },
    "enrollmentWizard": {
      "steps": 10,
      "autoSave": true,
      "autoSaveInterval": "30s",
      "fields": "studentPersonal + academic + guardian + identity + medical + documents + review",
      "documentTypes": 18
    },
    "supportTicket": {
      "fields": ["subject", "category", "description", "priority"],
      "validation": ["required", "minLength10"]
    }
  },
  "states": {
    "loading": { "component": "Skeleton", "variants": ["bar", "card", "list"] },
    "empty": { "component": "EmptyState", "props": ["icon", "title", "description", "cta"] },
    "error": { "component": "PageError", "props": ["message", "onRetry"] },
    "offline": { "component": "OfflineBanner", "fullScreen": true },
    "unauthorized": { "redirect": "/login" },
    "forbidden": { "component": "AccessDenied" }
  },
  "mobileAdaptation": {
    "navigation": "bottom-tab-bar",
    "tables": "card-list",
    "modals": "bottom-sheet",
    "forms": "full-width-stacked",
    "dropdowns": "bottom-sheet-picker",
    "breadcrumbs": "back-button",
    "stats": "2x2-grid",
    "grids": "single-column",
    "header": "sticky-compact",
    "cta": "sticky-bottom",
    "minTapTarget": "44px",
    "safeArea": true
  }
}
```

---

## FINAL RECOMMENDATIONS

### Top 20 Most Reusable Components (Build First)

1. **Button** - Used everywhere; 6 variants, 4 sizes
2. **Card** (with sub-components) - Every page uses cards
3. **Input** - All forms
4. **BottomNav** - All portal layouts
5. **MobileHeader** - All portal layouts
6. **Badge** - Status indicators on every list
7. **Tabs** - Course details, lesson details, grade details
8. **EmptyState** - Every list page
9. **Skeleton / SkeletonCard** - Every async page
10. **PageError** - Every page with data fetching
11. **PhoneField** - Login, registration, enrollment
12. **CourseCard** - Student, teacher, parent, admin
13. **Avatar** - User profiles, teacher cards, chat
14. **Alert** - Form validation, system messages
15. **Modal / BottomSheet** - Admin CRUD, confirmations
16. **Toast** - Success/error feedback
17. **Select / DropdownPicker** - All filter UIs
18. **SearchBar** - Course, student, teacher lists
19. **StatusBadge** - Enrollment, lesson, assessment statuses
20. **StatCard** - All home/dashboard pages

### Top 10 Mobile UX Risks to Solve First

1. **RTL layout bugs** - Test every component in both directions early
2. **Bottom nav overlap** - Content must not be hidden behind fixed 70px nav
3. **Table→Card conversion** - Admin tables need complete redesign for mobile
4. **Form scroll issues** - Keyboard pushing content, sticky submit buttons
5. **Safe area handling** - iPhone notch/home indicator
6. **Touch target sizing** - Ensure all interactive elements ≥ 44px
7. **Text overflow** - Arabic text is often longer; test truncation
8. **Multi-step wizard** - 10-step enrollment needs careful mobile flow
9. **Chart readability** - Recharts on small screens needs simplified views
10. **External links** - Google Meet links must open correctly from mobile browser

### Recommended Implementation Phases

**Phase 1 (Foundation)**: Design tokens, UI components, layouts, auth → 1-2 weeks
**Phase 2 (Student Portal)**: Most-used portal, validates component library → 1-2 weeks
**Phase 3 (Teacher Portal)**: Second most complex, course/lesson management → 1-2 weeks
**Phase 4 (Parent Portal)**: Simpler, reuses student components → 3-5 days
**Phase 5 (Enrollment + Checkout)**: Complex wizard, payment flow → 1 week
**Phase 6 (Admin Portal)**: Card-list redesign, reports → 1-2 weeks
**Phase 7 (Extras)**: Support, calendar, chat, reels, marketing pages → 1-2 weeks
