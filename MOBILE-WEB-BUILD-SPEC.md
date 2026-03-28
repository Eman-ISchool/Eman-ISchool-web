# EDUVERSE MOBILE WEB BUILD SPECIFICATION

> **Generated:** 2026-03-28
> **Source Project:** Eduverse (Arabic Educational Platform)
> **Purpose:** Complete design-system extraction + Replit AI mobile-web rebuild prompt
> **Confidence Level:** HIGH (extracted from full codebase analysis of 137+ components, 80+ pages, 100+ API routes)

---

## TABLE OF CONTENTS

1. [SECTION 1 -- EXECUTIVE OVERVIEW](#section-1--executive-overview)
2. [SECTION 2 -- DESIGN SYSTEM MASTER SCHEMA](#section-2--design-system-master-schema)
3. [SECTION 3 -- COMPONENT INVENTORY](#section-3--component-inventory)
4. [SECTION 4 -- PAGE MAP](#section-4--page-map)
5. [SECTION 5 -- MOBILE WEB TRANSFORMATION RULES](#section-5--mobile-web-transformation-rules)
6. [SECTION 6 -- REBUILD RISKS / GAPS](#section-6--rebuild-risks--gaps)
7. [SECTION 7 -- REPLIT AI BUILD PROMPT](#section-7--replit-ai-build-prompt)
8. [SECTION 8 -- JSON SCHEMA EXPORT](#section-8--json-schema-export)

---

# SECTION 1 -- EXECUTIVE OVERVIEW

## 1.1 Product Identity

**Eduverse** (branded as "Eman-Academy" in user-facing text) is a comprehensive Arabic-first educational platform targeting Egyptian families abroad. It provides K-12 Egyptian curriculum (National + Al-Azhar) through live classes, recorded lessons, assessments, VR experiences, and AI-generated educational video reels.

## 1.2 Target Users (4 Roles)

| Role | Primary Use | Key Flows |
|------|-------------|-----------|
| **Student** | Attend classes, take assessments, track progress | Home dashboard, courses, lessons, assessments, attendance, reels, support |
| **Teacher** | Manage courses, conduct lessons, grade work | Course CRUD, lesson management, assessment builder, grading, materials |
| **Parent** | Monitor children, manage payments, enrollment | Child overview, invoices, payments, enrollment applications, support tickets |
| **Admin** | Manage entire platform operations | User management, grades, courses, attendance, meetings, fees, reports, settings |

## 1.3 Brand Visual Identity

- **Primary Color:** `#0D6EFD` (FutureLab Blue)
- **Legacy Accent:** `#FFD501` (Brand Yellow -- used in marketing)
- **Hero Gradients:** Teal-to-emerald (`teal-700` via `teal-600` to `emerald-500`) for student dashboard
- **Typography:** Cairo (Arabic-optimized Google font) + system sans-serif fallback
- **Shape Language:** Heavily rounded (3xl/2xl for buttons and cards, full-round for avatars/badges)
- **Shadow System:** Subtle (`0 2px 8px rgba(0,0,0,0.06)`) with hover elevation
- **Overall Feel:** Clean, modern, card-based, mobile-friendly, Arabic RTL-first

## 1.4 Technical Foundation

| Aspect | Technology |
|--------|-----------|
| Framework | Next.js 14.2.35 (App Router, React 18.3.1) |
| Styling | Tailwind CSS v4 + custom CSS classes + shadcn/ui |
| Auth | NextAuth.js 4.24.13 (Google OAuth + Credentials) |
| Database | Supabase (PostgreSQL 15) + Supabase Storage |
| State | Zustand 5.0.9 (cart), React useState (forms) |
| i18n | next-intl 4.7.0 (Arabic default, English, French) |
| Icons | lucide-react 0.460.0 |
| Charts | Recharts 3.8.0 |
| Payments | Stripe 14.14.0 |
| VR | Three.js + React Three Fiber + XR |
| PWA | next-pwa + service worker |
| Mobile | Capacitor 8.x (Android/iOS wrappers) |

## 1.5 Internationalization

- **Default locale:** Arabic (`ar`) -- RTL
- **Additional locales:** English (`en`), French (`fr`) -- LTR
- **URL Pattern:** Always prefixed: `/{locale}/...`
- **Direction:** `dir="rtl"` for Arabic, `dir="ltr"` for English/French
- **Font:** Cairo covers Arabic + Latin glyphs

## 1.6 Navigation Architecture

**Desktop:** Fixed right-side sidebar (80px wide) with icon navigation
**Mobile (< 768px):** Fixed bottom navigation bar (70px height) with horizontal icon row
**Public pages:** Top sticky header (72px) + footer
**Admin:** Left sidebar (256px) with collapsible groups

---

# SECTION 2 -- DESIGN SYSTEM MASTER SCHEMA

## 2.1 Color Tokens

### 2.1.1 Primary Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#0D6EFD` | Buttons, links, active states, CTAs |
| `--color-primary-hover` | `#0b5ed7` | Button hover, link hover |
| `--color-primary-light` | `#e7f1ff` | Light backgrounds, hover states, upcoming badges |
| `--color-secondary` | `#0D6EFD` | Same as primary (unified brand) |

### 2.1.2 Legacy Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand-primary` | `#FFD501` | Marketing pages, accents |
| `--color-brand-primary-hover` | `#E6C200` | Marketing button hover |
| `--color-brand-dark` | `#111111` | Dark backgrounds |
| `--color-brand-light` | `#F9FAFB` | Light backgrounds |
| `--color-brand-accent` | `#3A3A3A` | Dark gray accent |

### 2.1.3 Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#111827` | Headings, body text |
| `--color-text-secondary` | `#6B7280` | Secondary text, labels |
| `--color-text-muted` | `#9CA3AF` | Placeholders, disabled text |
| `#1e293b` | -- | Admin card titles |
| `#334155` | -- | Admin table body text |
| `#475569` | -- | Admin labels, secondary buttons |
| `#64748b` | -- | Ghost button text, completed badges |

### 2.1.4 Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#FFFFFF` | Page background |
| `--color-bg-soft` | `#FFFFFF` | Content areas |
| `--color-bg-card` | `#FFFFFF` | Card surfaces |
| `--color-bg-muted` | `#F8FAFC` | Muted backgrounds, table headers |
| `#f1f5f9` | -- | Secondary button bg, dropdown hover, table row borders |
| `#f8fafc` | -- | Admin table header, row hover |

### 2.1.5 Border Colors

| Value | Usage |
|-------|-------|
| `#E5E7EB` | Side nav border, general dividers |
| `#e2e8f0` | Admin card border, form input border, dropdown border |
| `#f1f5f9` | Admin card header border, table row border (light) |

### 2.1.6 Semantic Status Colors

| Status | Background | Text |
|--------|-----------|------|
| Success | `#dcfce7` | `#166534` |
| Error | `#fee2e2` | `#991b1b` |
| Warning | `#fef3c7` | `#92400e` |
| Upcoming | `#e0e7ff` | `#3730a3` |
| Live | `#fee2e2` | `#dc2626` (+ pulse animation) |
| Completed | `#f1f5f9` | `#64748b` |
| Danger | `#ef4444` bg / `#dc2626` hover | `#FFFFFF` |
| Danger Light | `#fef2f2` | `#dc2626` |

### 2.1.7 Hero Gradient (Student Dashboard)

```
bg-linear-to-br from-teal-700 via-teal-600 to-emerald-500
```

Decorative orbs:
- `bg-white/10` (top-right, 44x44)
- `bg-emerald-400/25` (bottom-left, 28x28)
- `bg-teal-300/20` (center-right, 12x12)

### 2.1.8 Stat Card Colors (Student Quick Stats)

| Stat | BG | Icon/Value | Label |
|------|----|-----------|-------|
| Today's Lessons | `teal-50` | `teal-700` / `teal-500` | `teal-500` |
| Pending Tasks | `amber-50` | `amber-700` / `amber-500` | `amber-500` |
| Attendance | `emerald-50` | `emerald-700` / `emerald-500` | `emerald-500` |

## 2.2 Typography

### 2.2.1 Font Stack

```css
--font-sans: var(--font-cairo), "Helvetica Neue", Arial, Tahoma, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```

**Primary Font:** Cairo (Google Fonts) -- Arabic-optimized, covers Latin characters

### 2.2.2 Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem (12px) | Badges, timestamps, small labels |
| `text-[11px]` | 11px | Stat labels in compact cards |
| `text-sm` | 0.875rem (14px) | Body text, form inputs, table text, buttons |
| `text-base` | 1rem (16px) | Default body, admin card titles |
| `text-lg` | 1.125rem (18px) | Card titles, next lesson title |
| `text-xl` | 1.25rem (20px) | Stat values (compact) |
| `text-2xl` | 1.5rem (24px) | Page headings, hero greeting |
| `text-3xl+` | 1.875rem+ | Marketing hero titles |

### 2.2.3 Font Weights

| Weight | Token | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Labels, admin buttons, badge text |
| 600 | `font-semibold` | Buttons (shadcn), section headings, table headers |
| 700 | `font-bold` | Card titles, stat values, CTA text |
| 800 | `font-extrabold` | Hero heading, stat numbers |

### 2.2.4 Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `leading-none` | 1 | Stat numbers, tight headings |
| `leading-tight` | 1.25 | Hero heading |
| `leading-snug` | 1.375 | Next lesson title |
| `leading-relaxed` | 1.625 | Body text |

### 2.2.5 Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-tight` | -0.025em | Card titles |
| `tracking-wide` | 0.025em | Greeting subtext |
| `tracking-widest` | 0.1em | Uppercase labels ("NEXT LESSON") |

## 2.3 Spacing Scale

### 2.3.1 Padding/Margin Scale (used consistently)

| Value | Rem | Usage |
|-------|-----|-------|
| 0.125rem | 2px | Badge vertical padding |
| 0.25rem | 4px | Dropdown padding, small gaps |
| 0.375rem | 6px | Label margin-bottom |
| 0.5rem | 8px | Button padding, icon button padding, mobile nav padding |
| 0.625rem | 10px | Badge horizontal padding |
| 0.75rem | 12px | Table cell padding, side nav item padding, card padding (compact), form input padding |
| 1rem | 16px | Card header padding, general gaps, grid gaps |
| 1.25rem | 20px | Card body/footer padding, admin card body |
| 1.5rem | 24px | Hero padding, button horizontal padding, toast position |
| 2rem | 32px | Side nav top/bottom padding |

### 2.3.2 Gap Scale

| Value | Usage |
|-------|-------|
| `gap-1.5` | Icon + text inline |
| `gap-2` | Button icon + text, notification icon + badge |
| `gap-3` | Stat cards grid, small card grids |
| `gap-4` | Card grids, carousel items |
| `gap-5` | Main content sections (space-y-5) |

### 2.3.3 Container Widths

| Token | Value | Usage |
|-------|-------|-------|
| `max-w-4xl` | 56rem (896px) | Student main content area |
| `max-w-6xl` | 72rem (1152px) | Teacher/Admin content |
| `max-w-md` | 28rem (448px) | Modal small |
| `max-w-lg` | 32rem (512px) | Modal medium |
| `max-w-2xl` | 42rem (672px) | Modal large |
| `max-w-4xl` | 56rem (896px) | Modal XL |
| `w-64` | 16rem (256px) | Admin sidebar width |
| `w-80` | 20rem (320px) | Mobile drawer width |

## 2.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.25rem (4px) | Small elements |
| `--radius-md` | 0.375rem (6px) | Dropdown items, textarea |
| `--radius` / `--radius-lg` | 0.5rem (8px) | Cards (shadcn), admin buttons, inputs, dropdowns |
| `0.75rem` | 12px | Admin cards, side nav items |
| `--radius-xl` | 1.5rem (24px) | Large cards |
| `rounded-2xl` | 1rem (16px) | Stat cards, hero inner card, announcement cards |
| `rounded-3xl` | 1.5rem (24px) | Buttons (shadcn default), hero container |
| `--radius-full` / `rounded-full` | 9999px | Avatars, badges, pill buttons, notification dots |

## 2.5 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 2px 8px rgba(0,0,0,0.06)` | Card default |
| `--shadow-card-hover` | `0 4px 16px rgba(0,0,0,0.1)` | Card hover |
| `shadow-sm` | Tailwind default | Stat cards, base cards |
| Admin card hover | `0 4px 12px rgba(0,0,0,0.05)` | Admin card hover |
| Admin dropdown | `0 10px 15px -3px rgba(0,0,0,0.1)` | Dropdown menus |
| Admin toast | `0 10px 15px -3px rgba(0,0,0,0.1)` | Toast notifications |
| Hero shadow | `shadow-2xl shadow-teal-200/60` | Student hero card |

## 2.6 Z-Index Layers

| Value | Usage |
|-------|-------|
| `z-40` | Mobile header (sticky) |
| `z-50` | Side navigation, admin dropdown, mobile drawer |
| `z-100` | Toast notifications |
| `z-9999` | Offline overlay (highest) |

## 2.7 Breakpoints

| Breakpoint | Value | Behavior |
|-----------|-------|----------|
| Mobile | `< 768px` | Bottom nav, single column, stacked layouts |
| Tablet | `768px - 1023px` | 2-column grids, side nav visible |
| Desktop | `>= 1024px` | 3-4 column grids, full layout |

**Critical breakpoint:** `768px` -- below this, side nav becomes bottom nav

## 2.8 Animations & Transitions

### 2.8.1 Keyframe Animations

| Name | Definition | Usage |
|------|-----------|-------|
| `float` | `translateY(0) -> translateY(-20px) -> translateY(0)`, 6s ease-in-out infinite | Decorative orbs |
| `pulse` | `opacity 1 -> 0.7 -> 1`, 2s infinite | Live badges, urgent countdowns |
| `slideUp` | `opacity 0, translateY(1rem) -> opacity 1, translateY(0)`, 0.3s ease | Toast notifications |
| `animate-pulse` | Tailwind default | Loading skeletons |
| `animate-spin` | Tailwind default | Loading spinners |

### 2.8.2 Transitions

| Duration | Easing | Usage |
|----------|--------|-------|
| `0.1s` | ease | Dropdown item hover |
| `0.15s` | ease | Admin buttons, form controls, card shadows |
| `0.2s` | ease | Card shadows, backgrounds, button hover, general hover |
| `0.3s` | ease | Toast/modal animations |
| `transition-all` | -- | General interactive elements |
| `transition-colors` | -- | Button color changes |
| `transition-transform` | -- | Mobile drawer slide |

### 2.8.3 Interactive Feedback

| Interaction | Effect |
|-------------|--------|
| Button press (mobile) | `active:scale-[0.98]` |
| KPI card hover | `hover:-translate-y-1 hover:shadow-lg` |
| Card hover | Shadow elevation change |
| Notification bell | Red dot with ring ring-2 |

## 2.9 Responsive Rules

### 2.9.1 Grid Patterns

| Context | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Quick stats | `grid-cols-3` | `grid-cols-3` | `grid-cols-3` |
| Course cards | `grid-cols-1` | `grid-cols-2` | `grid-cols-3` to `grid-cols-4` |
| Subject grid | `grid-cols-4` | `grid-cols-4` | `grid-cols-8` |
| Admin KPI cards | `grid-cols-1` | `grid-cols-2` | `grid-cols-4` to `grid-cols-5` |
| Assessment cards | `grid-cols-1` | `grid-cols-2` | `grid-cols-2` |

### 2.9.2 Navigation Responsive

| Breakpoint | Desktop | Mobile |
|-----------|---------|--------|
| Side nav | Fixed right, 80px, vertical icons | Fixed bottom, 70px, horizontal icons |
| Main content | `margin-right: 80px` | `margin-bottom: 70px` |
| Mobile header | Hidden (`hidden md:block`) | Visible with hamburger drawer |
| Admin sidebar | Fixed left, 256px | Transform slide-in with overlay |

---

# SECTION 3 -- COMPONENT INVENTORY

## 3.1 Base UI Components (shadcn/ui)

### 3.1.1 Button

| Property | Detail |
|----------|--------|
| **File** | `src/components/ui/button.tsx` |
| **Variants** | `default` (primary bg), `destructive` (red), `outline` (border), `secondary` (secondary bg), `ghost` (transparent), `link` (underline) |
| **Sizes** | `default` (h-12, px-4), `sm` (h-9, px-3, rounded-md), `lg` (h-12, px-8, rounded-lg), `icon` (h-10, w-10) |
| **Default Shape** | `rounded-3xl` (pill-like) |
| **States** | hover (opacity/color shift), focus-visible (ring-2), disabled (opacity-50, pointer-events-none) |
| **Features** | `asChild` prop for polymorphic rendering via Radix Slot |
| **Mobile Note** | h-12 default is thumb-friendly (48px). Good for mobile. |

### 3.1.2 Input

| Property | Detail |
|----------|--------|
| **File** | `src/components/ui/input.tsx` |
| **Height** | `h-12` (48px) |
| **Shape** | `rounded-3xl` |
| **Padding** | `px-4 py-2` |
| **States** | focus (ring-2), disabled (opacity-50), aria-invalid (border-destructive) |
| **Mobile Note** | 48px height is ideal for touch. |

### 3.1.3 Card (Compound)

| Sub-component | Styling |
|---------------|---------|
| `Card` | `rounded-lg border bg-card shadow-sm` |
| `CardHeader` | `flex flex-col gap-1.5 p-6` |
| `CardTitle` | `text-2xl font-semibold leading-none tracking-tight` |
| `CardDescription` | `text-sm text-muted-foreground` |
| `CardContent` | `p-6 pt-0` |
| `CardFooter` | `flex items-center p-6 pt-0` |

### 3.1.4 Badge

| Variant | Styling |
|---------|---------|
| `default` | `bg-primary text-primary-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground` |
| `destructive` | `bg-destructive text-destructive-foreground` |
| `outline` | `border bg-transparent` |
| **Shape** | `rounded-full` always |
| **Size** | `px-2.5 py-0.5 text-xs` |

### 3.1.5 Tabs (Radix)

| Sub-component | Styling |
|---------------|---------|
| `TabsList` | Container with pill or underline style |
| `TabsTrigger` | `data-[state=active]` styling via `.tabs-pill-active` |
| `TabsContent` | Content panel |
| **Pill Style** | Active tab gets `border: 1px solid #1e293b` + `bg-white` |

### 3.1.6 Skeleton

| Variant | Styling |
|---------|---------|
| Base | `animate-pulse bg-muted rounded-md` |
| `SkeletonCard` | Card-shaped placeholder |
| `SkeletonList` | Multiple row placeholders |
| Student variant | `animate-pulse bg-teal-100/70 rounded-2xl` |

### 3.1.7 EmptyState

| Property | Detail |
|----------|--------|
| **Icon** | 64x64 rounded-full bg-slate-100 container |
| **Title** | text-lg font-semibold text-slate-700 |
| **Description** | text-sm text-slate-500 |
| **Action** | Optional button or link |
| **Container** | `min-h-[300px]` centered, `border-dashed border-gray-300` |

### 3.1.8 PageError

| Property | Detail |
|----------|--------|
| **Icon** | AlertCircle in red |
| **Border** | `border-red-200 bg-red-100` |
| **Action** | Retry button |

### 3.1.9 Other Base Components

| Component | Key Properties |
|-----------|---------------|
| **Label** | `text-sm peer-disabled:opacity-70` |
| **Select** | `rounded-lg` border, dropdown pattern |
| **Textarea** | `min-h-[80px] rounded-md px-3 py-2` |
| **Avatar** | `h-10 w-10 rounded-full`, fallback: `bg-gray-100` |
| **Alert** | Variants: `default`, `destructive`. Icon positioned `absolute start-4 top-4` |

## 3.2 Layout Components

### 3.2.1 Header (Public)

| Property | Detail |
|----------|--------|
| **Height** | 72px (`h-[72px]`) |
| **Position** | Sticky top |
| **Content** | Logo, nav links, language toggle, auth buttons |
| **Mobile** | Hamburger trigger for `MobileDrawerNav` |

### 3.2.2 MobileDrawerNav

| Property | Detail |
|----------|--------|
| **Width** | `w-80` (320px) |
| **Animation** | `transform-gpu transition-transform` slide from side |
| **Backdrop** | Dark overlay |
| **Features** | Nested items, badges, close on backdrop click |
| **Side** | Configurable: `left` or `right` |

### 3.2.3 Footer

| Property | Detail |
|----------|--------|
| **Background** | `bg-slate-950` (dark) |
| **Layout** | `lg:grid-cols-[1.1fr_0.9fr_0.8fr]` |
| **Content** | Quick links, contact info, copyright |

### 3.2.4 ConditionalLayout

Wraps `Header` + `Footer` only on public pages. Excluded paths: `/teacher`, `/student`, `/admin`, `/parent`, `/auth`, `/dashboard`.

### 3.2.5 StudentSideNav

| Property | Detail |
|----------|--------|
| **CSS Class** | `.side-nav` |
| **Desktop** | Fixed right, 80px wide, vertical icon column |
| **Mobile** | Fixed bottom, 70px tall, horizontal icon row |
| **Items** | Home, Onboarding, Courses, Assessments, Documents, Calendar, Attendance, Support |
| **Icon Size** | `w-5 h-5` |
| **Active State** | `bg-primary text-white` |
| **Hover State** | `bg-primary-light text-primary` |

### 3.2.6 StudentMobileHeader

| Property | Detail |
|----------|--------|
| **Position** | `sticky top-0 z-40` |
| **Border** | `border-b border-slate-200` |
| **Content** | Logo + MobileDrawerNav trigger |
| **Visibility** | Mobile only |

### 3.2.7 AdminLayout

| Property | Detail |
|----------|--------|
| **Sidebar** | `w-64` (256px), fixed/relative |
| **Navigation Groups** | Academic, Admin, Finance, Communication, Content, Analytics, Data |
| **Collapsible** | ChevronLeft icon rotation for group expand/collapse |
| **Role Filtering** | Admin vs Supervisor see different items |
| **RTL** | `direction="rtl"` handling |
| **Mobile** | Transform translate overlay |

## 3.3 Business Components

### 3.3.1 Student Home Sections

| Component | Purpose | Structure |
|-----------|---------|-----------|
| **Hero Card** | Greeting + next lesson | Gradient card, orbs, countdown, join CTA |
| **Quick Stats Strip** | 3 stats in a row | `grid-cols-3` with colored icon cards |
| **EnrollmentStatusCard** | Application progress | Status badge, pending items, last update |
| **AnnouncementCard** | Priority notifications | Color-coded by priority (normal/high/urgent) |
| **LessonCarousel** | Upcoming lessons | Horizontal scroll with snap, arrow controls |
| **AssignmentList** | Due assignments | Vertical list with type icon, due date, status |
| **TeacherCardList** | Teacher profiles | Horizontal scroll cards with message CTA |
| **PaymentList** | Pending payments | Payment records |
| **SubjectGrid** | Subject quick access | `grid-cols-4` with icon + name |

### 3.3.2 Course Components

| Component | Purpose | Key Details |
|-----------|---------|-------------|
| **CourseCard** | Course preview | Image (h-48), grade badge, teacher avatar, price, CTA |
| **CourseCatalog** | Grid browser | Search, grade filter, responsive grid |
| **CourseFilters** | Filter controls | Grade dropdown + search input |
| **CourseStatusTabs** | Tab filters | Status-based tab switching |

### 3.3.3 Lesson Components

| Component | Purpose | Key Details |
|-----------|---------|-------------|
| **LessonDetailPage** | Full lesson view | 6 tabs: info, materials, attendance, homework, quiz, exam |
| **LessonLifecycleBar** | Status progress | Visual progress indicator |
| **LessonSlide** | Carousel item | Title, datetime, status badge |
| **JoinLessonButton** | Meeting join | Opens Google Meet link |
| **AttendanceRoster** | Attendance marking | Student list with status toggles |

### 3.3.4 Assessment Components

| Component | Purpose | Key Details |
|-----------|---------|-------------|
| **AssessmentBuilder** | Create/edit tests | Question types: multiple_choice, text, file_upload. Settings panel, questions list, options editor. Sticky bottom action bar |
| **ExamTaker** | Take assessment | Full-screen, resumable, timed, auto-save |
| **SubmissionGrader** | Grade responses | Question-by-question scoring |

### 3.3.5 Enrollment Wizard

| Property | Detail |
|----------|--------|
| **Steps** | 10 total: Start, StudentInfo, Academic, Guardian, Identity, Medical, Documents, Review, Submit, Status |
| **Progress** | Step indicator with progress bar |
| **Auto-save** | 30s debounce |
| **Persistence** | Application ID tracking, draft resume |
| **Validation** | Step-specific, completeness score |
| **Locked State** | After submission, read-only |

### 3.3.6 Admin Components

| Component | Purpose | Key Details |
|-----------|---------|-------------|
| **DataTable** | Generic data table | Search, sort (asc/desc), pagination (10/page), custom column renderers |
| **KPIStatCard** | Dashboard stat | 5 color variants (default/blue/teal/purple/orange), trend arrows, hover lift |
| **Modal** | Dialog overlay | Sizes: sm/md/lg/xl. ESC close, scroll lock. Includes FormGroup/FormLabel/FormInput sub-components |
| **PageHeader** | Page title bar | Title, breadcrumbs, action buttons |
| **TabPanel** | Tab navigation | Pill-style active tabs |
| **DropdownMenu** | Action menu | Position: absolute, z-50, min-w-12rem |
| **DateRangeFilter** | Date filtering | Start/end date inputs |
| **StateComponents** | Loading/Error/Empty | CardSkeleton, TableRowSkeleton, TableSkeleton, LoadingState, ErrorState, EmptyState |

### 3.3.7 Reel Components

| Component | Purpose | Key Details |
|-----------|---------|-------------|
| **ReelFeed** | TikTok-style feed | Full-screen video, swipe up/down, keyboard controls (arrows/space/m), bookmark, progress bar |
| **ReelEditor** | Edit metadata | Title, description, visibility |
| **SourceUploader** | Upload content | File upload interface |
| **ProcessingStatus** | Job progress | Status indicator for AI generation |

### 3.3.8 VR Components (OPTIONAL for mobile)

| Component | Purpose |
|-----------|---------|
| **VRCanvas** | Three.js + WebXR renderer |
| **VRScene** | 3D environment wrapper |
| **VRHotspot** | Interactive points (info/nav/interactive/quiz) |
| **VRNavigation** | Navigation UI overlay |
| **VRInfoPanel** | Information panel |

### 3.3.9 Support Components

| Component | Purpose |
|-----------|---------|
| **CreateTicketForm** | Subject + message form |
| **TicketChat** | Conversation thread |
| **AdminTicketActions** | Admin management controls |

### 3.3.10 Auth Components

| Component | Purpose |
|-----------|---------|
| **ReferenceAuthCard** | Login/Register card with tabs |
| **LoginForm** | Email/phone + password |
| **PhoneCountryInput** | Country code + phone input |

## 3.4 Component Variants Summary

| Component | Variants |
|-----------|----------|
| Button (shadcn) | default, destructive, outline, secondary, ghost, link x sizes: default, sm, lg, icon |
| Button (admin) | primary, secondary, outline, ghost, danger x sizes: sm, md, lg |
| Badge (shadcn) | default, secondary, destructive, outline |
| Admin Badge | success, error, warning, upcoming, live, completed |
| KPIStatCard | default, blue, teal, purple, orange |
| Modal | sm, md, lg, xl |
| Alert | default, destructive |
| Skeleton | base, card, list, student (teal-tinted) |

---

# SECTION 4 -- PAGE MAP

## 4.1 Authentication Pages

### 4.1.1 Login Page

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/(auth)/login` |
| **Variants** | Generic, Admin (`/login/admin`), Student (`/login/student`), Teacher (`/login/teacher`) |
| **Layout** | Centered card on gradient background |
| **Components** | ReferenceAuthCard (tabbed: login/join), LoginForm |
| **Fields** | Email or Phone, Password |
| **Actions** | Login, Switch to Register, Forgot Password link |
| **States** | idle, loading (spinner), error (message), success (redirect) |

### 4.1.2 Register Page

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/(auth)/register` |
| **Components** | ReferenceAuthCard with `defaultTab="join"` |
| **Fields** | Name, Email, Phone, Password, Role selector |

### 4.1.3 Forgot Password

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/auth/forgot-password` |
| **Fields** | Email |
| **States** | form, loading, success (always shows success for security) |
| **i18n** | AR/EN bilingual |

### 4.1.4 Reset Password

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/auth/reset-password` |
| **Fields** | New password, Confirm password |
| **Validation** | Min 6 chars, must match |
| **Post-success** | Auto-redirect to login after 3s |

## 4.2 Student Pages

### 4.2.1 Student Home Dashboard

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/student/home` |
| **Layout** | Single column, max-w-4xl, space-y-5 |
| **Sections (top to bottom)** | 1. AnnouncementBar, 2. Hero card (greeting + next lesson), 3. Quick stats strip (3-col), 4. Enrollment status (conditional), 5. Announcement card, 6. Lesson carousel, 7. Assignment list, 8. Teacher cards, 9. Payments, 10. Subject grid |
| **Data Fetching** | Client-side: announcements API + mock data for lessons/assignments/teachers |
| **States** | Loading (skeleton), Error (PageError with retry), Success |
| **Mobile Notes** | Already mobile-first. Hero card has full-width gradient. Bottom nav visible. |

### 4.2.2 Student Courses

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/student/courses` |
| **Layout** | Course catalog with search and grade filter |
| **Grid** | `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| **Empty State** | BookOpen icon + "No courses found" |

### 4.2.3 Student Course Detail

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/student/courses/[id]` |
| **Sections** | Course header (thumbnail, teacher, grade), Enrollment status, Lessons list |
| **Lesson Items** | Status badges (completed/cancelled/live/scheduled), date/time display |
| **Breadcrumb** | Back to courses |

### 4.2.4 Student Assessments

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/student/assessments` |
| **Layout** | Grid of assessment cards (2-col responsive) |
| **Card Content** | Title, description, duration, student count, status badge, score (if completed), action button |
| **Actions** | Start / Retake / Resume based on status |
| **Empty State** | Icon + message |

### 4.2.5 Take Assessment

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/student/assessments/[assessmentId]/take` |
| **Component** | ExamTaker (full screen) |
| **Features** | Resumable, timed, auto-save, server sanitization (removes correct answers) |

### 4.2.6 Student Attendance

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/student/attendance` |
| **Stats** | 4 cards: Rate %, Present count, Late count, Absent count |
| **Table** | Date, Course, Lesson, Status (color badge), Notes |
| **Status Colors** | Green (present), Yellow (late), Red (absent) |

### 4.2.7 Student Reels

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/student/reels` |
| **Layout** | Full-screen video feed (TikTok-style) |
| **Filters** | All / Bookmarked / Not Understood |
| **Controls** | Swipe up/down, keyboard (arrows, space, m), bookmark, mark understood, progress bar |
| **Pagination** | 20 items per page |

### 4.2.8 Student Support

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/student/support` |
| **Form** | Subject + Message textarea |
| **States** | Form, loading, success (with "send another" option) |
| **RTL** | Full support |

### 4.2.9 Other Student Pages

| Page | Route | Purpose |
|------|-------|---------|
| Calendar | `/{locale}/student/calendar` | Schedule view |
| Chat | `/{locale}/student/chat` | Teacher messaging |
| Documents | `/{locale}/student/documents` | Document management |
| Profile | `/{locale}/student/profile` | Student profile |
| Onboarding | `/{locale}/student/onboarding` | Setup checklist |

## 4.3 Teacher Pages

### 4.3.1 Teacher Courses

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/teacher/courses` |
| **Header** | Title + "New Course" button |
| **Grid** | 3-col responsive |
| **Card** | Thumbnail (placeholder icon), title, description, subject badge, enrollment count |
| **Hover** | Shadow elevation + smooth transition |
| **Empty State** | CTA to create first course |

### 4.3.2 Create Course

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/teacher/courses/new` |
| **Form** | Title, Description, Price, Duration, Grade (select), Subject (select), Image URL |
| **Validation** | Required fields |
| **Data** | Grade levels from API, subjects from Supabase |

### 4.3.3 Lesson Detail

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/teacher/courses/[id]/lessons/[lessonId]` |
| **Tabs** | Info, Materials, Attendance, Homework, Quiz, Exam |
| **Lazy Loading** | Homework, Quiz, Exam tabs loaded on demand |
| **Components** | LessonLifecycleBar, LessonInfoSection, LessonMaterialsSection, AttendanceRoster |

### 4.3.4 Assessment Builder

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/teacher/assessments/new` |
| **Sections** | Settings card (title, course, duration, description), Questions section (add/edit/delete) |
| **Question Types** | Multiple choice, Text, File upload |
| **Features** | Options editor for MC, correct answer marking, sort order |
| **Actions** | Save as Draft / Publish (sticky bottom bar) |

### 4.3.5 Teacher Profile

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/teacher/profile` |
| **Content** | Avatar, name, email, menu items |
| **Menu** | Edit Profile, Language toggle, My Classes, My Subjects, Settings |
| **Modals** | Edit profile, Classes list, Subjects, Settings |
| **Action** | Logout with confirmation |

### 4.3.6 Other Teacher Pages

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/{locale}/teacher/home` | Dashboard overview |
| Assessments | `/{locale}/teacher/assessments` | Manage/Results tabs |
| Grades | `/{locale}/teacher/grades` | Grade list with course count |
| Grade Detail | `/{locale}/teacher/grades/[id]` | 5 tabs: info, courses, schedule, students, fees |
| Calendar | `/{locale}/teacher/calendar` | Teaching schedule |
| Chat | `/{locale}/teacher/chat` | Student messaging |
| Materials | `/{locale}/teacher/materials` | Teaching resources |
| Subjects | `/{locale}/teacher/subjects` | Subject management |
| Reels | `/{locale}/teacher/reels` | Educational video content |
| Reel Upload | `/{locale}/teacher/reels/upload` | Create new reel |

## 4.4 Parent Pages

### 4.4.1 Parent Home

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/parent/home` |
| **Sections** | Hero banner (greeting + decorative orbs), Quick stats (Children/Enrollments/Payments), Children cards, Browse courses CTA |
| **Children Card** | Avatar (color-coded), name, email, grade, relationship badge, view courses link |
| **Empty State** | Centered CTA to add child |

### 4.4.2 Add Child

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/parent/students/add` |
| **Form** | Name, Grade (dropdown), Student ID, Email (optional) |
| **Validation** | Client-side with error display |
| **Post-success** | Animation then redirect to home |

### 4.4.3 Invoice Detail

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/parent/invoices/[id]` |
| **Sections** | Invoice header (number + status), Bill-to + Company, Items table, Summary (subtotal/discount/total) |
| **Actions** | Print, Download PDF, Request Refund, Pay Now (conditional) |

### 4.4.4 Payment Success

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/parent/payments/success` |
| **Content** | Large check icon, success message, customer name |
| **CTAs** | Go to Dashboard, View Invoice |

### 4.4.5 Other Parent Pages

| Page | Route |
|------|-------|
| Students | `/{locale}/parent/students` |
| Student Detail | `/{locale}/parent/students/[id]` |
| Applications | `/{locale}/parent/applications` |
| Courses | `/{locale}/parent/courses` |
| Course Detail | `/{locale}/parent/courses/[id]` |
| Invoices | `/{locale}/parent/invoices` |
| Payments | `/{locale}/parent/payments` |
| Support | `/{locale}/parent/support` |
| Create Ticket | `/{locale}/parent/support/new` |
| Ticket Detail | `/{locale}/parent/support/[id]` |

## 4.5 Admin Pages

### 4.5.1 Students Management

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/admin/students` |
| **Components** | DataTable with search/filters |
| **Columns** | Name (+ avatar), Email, Grade, Status, Actions |
| **Stats Cards** | Total, Active, Inactive |
| **Bulk Actions** | Download, Add New |

### 4.5.2 Teachers Management

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/admin/teachers` |
| **Columns** | Teacher (avatar), Email, Phone, Groups (badges), Lessons, Performance (stars), Attendance (progress bar), Salary (base + bonus), Bank info, Status |
| **Actions** | View, Edit, Attendance, Ratings, Documents, Deactivate, Delete |
| **Stats** | 5 KPI cards: total, active, total lessons, avg performance, total salary |
| **Modals** | Add/Edit form, Detail view, Attendance calendar |

### 4.5.3 Attendance

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/admin/attendance` |
| **Stats** | 4 cards: Present, Absent, Late, Early Exit (color-coded) |
| **Filters** | Status dropdown, Date range (start/end), Clear |
| **Table** | User (avatar + type), Lesson, Status (editable select), Join time, Leave time, Duration, Actions |
| **Pagination** | 50 items/page with prev/next |

### 4.5.4 Grades Management

| Field | Detail |
|-------|--------|
| **Route** | `/{locale}/admin/grades` |
| **Filters** | Search by name/description, Active/Inactive filter |
| **Grid** | Grade cards with image, name (EN/AR), description preview, status badge, supervisor badge |
| **Detail Route** | `/{locale}/admin/grades/[id]` with 5 tabs: Info, Courses, Schedule, Students, Fees |

### 4.5.5 Other Admin Pages

| Page | Route | Key Features |
|------|-------|-------------|
| Home/Dashboard | `/{locale}/dashboard` | Workspace modules with lazy loading |
| Users | `/{locale}/admin/users` | User management |
| Courses | `/{locale}/admin/courses` | Course oversight |
| Lessons | `/{locale}/admin/lessons` | Lesson management |
| Calendar | `/{locale}/admin/calendar` | School calendar |
| Fees | `/{locale}/admin/fees` | Fee management |
| Meetings | `/{locale}/admin/meetings` | 4 stat cards + card-based meeting list |
| Quizzes/Exams | `/{locale}/admin/quizzes-exams` | Assessment admin |
| Content | `/{locale}/admin/content` | CMS management |
| Reels | `/{locale}/admin/reels` | Video content admin |
| Settings | `/{locale}/admin/settings` | System settings |
| Admissions | `/{locale}/admin/admissions` | Admission management |
| Enrollment Apps | `/{locale}/admin/enrollment-applications` | Application review |
| Support Tickets | `/{locale}/admin/support` | Ticket management |
| Coupons/Expenses | `/{locale}/admin/coupons-expenses` | Financial tools |
| Messages Audit | `/{locale}/admin/messages-audit` | Communication logs |
| Live Sessions | `/{locale}/admin/live` | Live session monitor |

## 4.6 Public/Marketing Pages

| Page | Route | Purpose |
|------|-------|---------|
| Landing/Home | `/{locale}` | Marketing hero, benefits, USP, features, testimonials |
| About | `/{locale}/about` | Stats, features, CTAs |
| Contact | `/{locale}/contact` | Contact form + info |
| Services | `/{locale}/services` | Service overview |
| Policy | `/{locale}/policy` | Privacy policy, terms, refund |
| Blog | `/{locale}/blogs` | Blog listing grid |
| Search | `/{locale}/search` | Global search |
| Courses Catalog | `/{locale}/courses` | Public course browser |
| Course Detail | `/{locale}/courses/[id]` | Role-based redirect |
| Grade Selector | `/{locale}/grades` | Grade/level browser |
| Checkout | `/{locale}/checkout` | Payment checkout |
| Cart | `/{locale}/cart` | Shopping cart |
| Download | `/{locale}/download` | App download cards |
| National School | `/{locale}/national-school` | Program page |
| Al-Azhar School | `/{locale}/al-azhar-school` | Program page |
| Enrollment | `/{locale}/enrollment` | Enrollment home |
| Enrollment Apply | `/{locale}/enrollment/apply` | 10-step wizard |
| VR Hub | `/{locale}/vr-eduverse` | VR experiences hub |
| VR Field Trips | `/{locale}/vr-eduverse/field-trips` | 3 destinations |
| Offline | `/{locale}/offline` | PWA offline fallback |

---

# SECTION 5 -- MOBILE WEB TRANSFORMATION RULES

## 5.1 What Stays Exactly the Same

1. **Student Home Dashboard** -- Already mobile-first design with single column, gradient hero, 3-col stats strip, carousels, and vertical sections
2. **Color palette** -- All tokens remain identical
3. **Typography scale** -- Cairo font, same sizes
4. **Auth pages** -- Already centered card layout
5. **Reels feed** -- Already full-screen mobile-native
6. **Badge system** -- Same styling and variants
7. **Button heights** -- h-12 (48px) is perfect for mobile touch
8. **Input heights** -- h-12 (48px) is ideal
9. **Card radius** -- rounded-2xl/3xl already mobile-friendly
10. **Status colors** -- All semantic colors preserved
11. **PWA behavior** -- Service worker, offline support
12. **i18n/RTL** -- Arabic RTL handling preserved exactly

## 5.2 Navigation Transformation

### Desktop -> Mobile

| Desktop Pattern | Mobile Transformation |
|----------------|----------------------|
| Fixed right sidebar (80px) | **Fixed bottom tab bar** (70px) -- ALREADY IMPLEMENTED |
| Admin left sidebar (256px) | **Slide-in drawer** from left, with backdrop overlay |
| Public top header (72px) | **Sticky top header** (56px) with hamburger menu |
| Breadcrumbs | **Back arrow** + page title (breadcrumbs hidden on mobile) |
| Tab systems (horizontal) | **Scrollable tab bar** with horizontal overflow |

### Bottom Navigation Items (by role)

**Student (max 5 items):**
1. Home (icon: Home)
2. Courses (icon: BookOpen)
3. Calendar (icon: Calendar)
4. Assessments (icon: FileText)
5. Profile (icon: User)

**Teacher (max 5 items):**
1. Home (icon: Home)
2. Courses (icon: BookOpen)
3. Calendar (icon: Calendar)
4. Grades (icon: Award)
5. Profile (icon: User)

**Parent (max 5 items):**
1. Home (icon: Home)
2. Children (icon: Users)
3. Payments (icon: CreditCard)
4. Support (icon: HelpCircle)
5. Profile (icon: User)

## 5.3 Tables -> Cards Conversion

All admin data tables MUST convert to cards on mobile:

| Table Column | Card Representation |
|-------------|-------------------|
| User (avatar + name) | Card header with avatar inline |
| Status badge | Top-right corner badge |
| Email/Phone | Stacked secondary text |
| Actions dropdown | Bottom card action row or long-press menu |
| Pagination | Infinite scroll or load-more button |
| Sort controls | Filter bar at top with dropdown |
| Search | Sticky search bar above list |

### Mobile Card Template
```
+-----------------------------------+
| [Avatar] Name         [Status]    |
| email@example.com                 |
| Grade: 5A | Enrolled: 3 courses   |
| [View] [Edit] [...]              |
+-----------------------------------+
```

## 5.4 Forms Mobile Optimization

| Desktop Pattern | Mobile Rule |
|----------------|-------------|
| Multi-column form rows | **Single column always** |
| Side-by-side buttons | **Stacked full-width buttons** |
| Date pickers | **Native date input** (`type="date"`) |
| Select dropdowns | **Native select** on mobile |
| File upload | **Camera + file picker** combined |
| Form sections | **Accordion sections** that expand/collapse |
| Enrollment wizard | **Full-screen step** with sticky progress bar at top |
| Assessment builder questions | **One question per screen** with swipe navigation |

## 5.5 Vertical Stacking Rules

| Desktop Layout | Mobile Layout |
|---------------|---------------|
| 2-col grid | Single column, full width |
| 3-col grid | Single column, full width |
| 4-col grid | 2-col grid |
| Side-by-side info panels | Stacked vertically |
| Horizontal stat cards (5+) | 2-col grid or horizontal scroll |
| Invoice items table | Stacked cards per line item |

## 5.6 Bottom Sheet Conversions

These desktop patterns MUST become bottom sheets on mobile:

| Desktop Element | Mobile Bottom Sheet |
|----------------|-------------------|
| Modal dialogs (sm/md) | Bottom sheet (half screen) |
| Modal dialogs (lg/xl) | Full-screen sheet with close |
| Dropdown action menus | Bottom action sheet with options |
| Filter panels | Bottom sheet with filter controls |
| Sort options | Bottom sheet with radio options |
| Language selector | Bottom sheet with language options |
| Profile menu | Bottom sheet with menu items |
| Confirm dialogs | Bottom sheet with confirm/cancel |

## 5.7 Sticky Elements

| Element | Mobile Behavior |
|---------|----------------|
| Bottom navigation | Fixed bottom, z-50, safe-area-inset-bottom |
| Search bar (in lists) | Sticky top below header |
| Form submit button | Sticky bottom bar with padding |
| Assessment action bar | Sticky bottom |
| Enrollment wizard progress | Sticky top |
| Lesson join button | Sticky bottom CTA |
| Chat input | Sticky bottom |

## 5.8 Touch Target Rules

| Rule | Minimum Size |
|------|-------------|
| All tappable elements | 44x44px minimum |
| Icon buttons | `min-w-[44px] min-h-[44px]` |
| List items | Full-width tap target, min-h-[48px] |
| Tab triggers | min-h-[44px], min-w-[44px] |
| Checkbox/Radio | 44x44 tap area (padding if needed) |
| Close buttons | 44x44 tap target |
| Back buttons | 44x44 tap target |

## 5.9 Spacing Mobile Rules

| Desktop | Mobile |
|---------|--------|
| `p-6` on cards | `p-4` on cards |
| `gap-4` grids | `gap-3` grids |
| `py-6` sections | `py-4` sections |
| `max-w-4xl mx-auto` | `w-full px-4` |
| `space-y-5` sections | `space-y-4` sections |

## 5.10 Collapsible/Hidden Content

| Content | Mobile Rule |
|---------|-------------|
| Long descriptions | Truncate to 2 lines + "Read more" |
| Table columns (6+) | Show 3-4, rest in expandable row |
| Sidebar filters | Hidden behind "Filters" button |
| Admin navigation groups | Collapsed by default |
| Course description on card | 2-line clamp |
| Invoice details | Accordion sections |

## 5.11 Swipe/Gesture Patterns

| Pattern | Usage |
|---------|-------|
| Swipe up/down | Reel feed navigation |
| Horizontal swipe | Lesson carousel, teacher cards |
| Pull to refresh | All list/feed pages |
| Swipe left on list item | Quick action (delete/archive) -- for admin |
| Swipe between tabs | Tab content navigation |

## 5.12 Mobile-Specific UX Improvements

1. **One-hand usage:** All primary actions in bottom 60% of screen
2. **Thumb zone:** CTAs, navigation, and primary actions in thumb-reachable area
3. **Reduced text crowding:** Increase line-height to `leading-relaxed` on mobile for body text
4. **Safe scrolling:** `overscroll-behavior: contain` to prevent accidental navigation
5. **Form focus:** Auto-scroll to focused input, avoid keyboard covering inputs
6. **Loading states:** Skeleton screens over spinners for content areas
7. **Offline indicator:** Banner at top when connection lost
8. **Safe area:** `env(safe-area-inset-*)` padding for notched devices

---

# SECTION 6 -- REBUILD RISKS / GAPS

## 6.1 Data Gaps (Information Not Fully Extractable)

| Gap | Risk Level | Detail |
|-----|-----------|--------|
| **Mock data prevalence** | HIGH | Student home, teacher dashboard, and several admin pages use extensive mock/hardcoded data rather than real API calls. The mobile rebuild may need real API integration from day one. |
| **Form validation schemas** | MEDIUM | No zod/yup schemas found. Validation is inline in components. Each form's validation rules need manual extraction. |
| **Exact API response shapes** | MEDIUM | API routes return varying shapes. TypeScript types exist in `src/types/database.ts` but actual API responses may differ. |
| **Google Meet integration** | LOW | Meet link generation is server-side. Mobile web just opens links. |
| **Stripe checkout flow** | MEDIUM | Checkout creates Stripe sessions server-side. Mobile needs same flow but may need mobile-optimized Stripe Elements. |
| **VR experiences** | LOW | Three.js + WebXR may not work well on mobile browsers. Consider fallback or skip for initial mobile build. |
| **Email/notification templates** | LOW | Server-side, not relevant to mobile frontend. |

## 6.2 Design Inconsistencies Found

| Issue | Location | Severity |
|-------|----------|----------|
| **Duplicate button systems** | shadcn Button (rounded-3xl) vs Admin Button (rounded-0.5rem) vs CSS `.btn-primary` (rounded-full) vs CSS `.admin-btn` | HIGH -- Needs normalization |
| **Inconsistent card styling** | shadcn Card (rounded-lg, shadow-sm) vs `.card-soft` (radius-lg, shadow-card) vs `.admin-card` (0.75rem, 1px border) | MEDIUM |
| **Mixed input styles** | shadcn Input (h-12, rounded-3xl) vs `.admin-input` (0.5rem padding, rounded-0.5rem) | MEDIUM |
| **Inconsistent skeleton colors** | shadcn skeleton (bg-muted) vs student skeleton (bg-teal-100/70) | LOW |
| **Color system split** | Brand colors (`#FFD501`) on marketing vs Primary (`#0D6EFD`) on portals | LOW -- Intentional |
| **Badge duplication** | shadcn Badge variants vs `.admin-badge-*` CSS classes | MEDIUM |
| **RTL handling** | Some components use `[dir="rtl"]` CSS, others use Tailwind `rtl:` prefix, others check `isRTL` in JS | MEDIUM |

## 6.3 Assumptions Made

| Assumption | Confidence |
|------------|-----------|
| Cairo font is available via Google Fonts CDN | HIGH |
| Supabase API endpoints remain unchanged | HIGH |
| NextAuth session structure stays the same | HIGH |
| Stripe integration is standard checkout redirect flow | HIGH |
| VR features are optional for mobile MVP | MEDIUM |
| PWA install prompt behavior is browser-dependent | HIGH |
| Arabic is the primary locale and RTL is the default | CONFIRMED |
| All roles share the same backend APIs | HIGH |
| Safe-area-inset CSS is sufficient for notch handling | HIGH |

## 6.4 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Performance on low-end phones** | Loading 137+ components | Aggressive code splitting, route-based lazy loading |
| **Three.js/VR on mobile** | Heavy 3D rendering | Defer VR to phase 3 or provide 2D fallback |
| **Recharts responsiveness** | Charts not touch-optimized | Use simpler mobile chart variants or replace with summary stats |
| **10-step enrollment wizard** | Complex form on small screen | Full-screen per step, sticky progress, auto-save |
| **Large data tables on mobile** | Admin tables have 10+ columns | Card-based mobile views with expandable details |
| **RTL layout bugs** | Directional issues on mobile | Thorough RTL testing with Arabic content |
| **Network dependency** | Many client-side fetches | Implement optimistic UI + offline-first with service worker |

---

# SECTION 7 -- REPLIT AI BUILD PROMPT

```
=== REPLIT AI BUILD PROMPT: EDUVERSE MOBILE WEB ===

You are building the MOBILE WEB version of Eduverse, an Arabic-first educational platform
for Egyptian families abroad. This is NOT a redesign. You are rebuilding the existing
product for mobile web using the exact design system, components, and behavior
extracted below.

=== PROJECT SETUP ===

Tech Stack:
- Framework: Next.js 14 (App Router) with TypeScript 5.x
- Styling: Tailwind CSS v4 with custom CSS variables
- UI Components: Build from scratch following the component spec below (shadcn-inspired)
- Auth: NextAuth.js 4.x (Google OAuth + Credentials provider)
- Database: Supabase (PostgreSQL) -- use @supabase/supabase-js
- State Management: Zustand for global state, React useState for forms
- i18n: next-intl with Arabic (ar) as default locale, English (en), French (fr)
- Icons: lucide-react
- Charts: Recharts (lazy loaded)
- Payments: Stripe checkout redirect flow

Folder Structure:
```
src/
  app/
    [locale]/
      (auth)/
        login/page.tsx
        register/page.tsx
      student/
        layout.tsx        # Bottom nav + mobile header
        home/page.tsx
        courses/page.tsx
        courses/[id]/page.tsx
        assessments/page.tsx
        assessments/[id]/take/page.tsx
        attendance/page.tsx
        calendar/page.tsx
        support/page.tsx
        profile/page.tsx
        reels/page.tsx
      teacher/
        layout.tsx
        home/page.tsx
        courses/page.tsx
        courses/new/page.tsx
        courses/[id]/page.tsx
        courses/[id]/lessons/[lessonId]/page.tsx
        assessments/page.tsx
        assessments/new/page.tsx
        grades/page.tsx
        grades/[id]/page.tsx
        calendar/page.tsx
        profile/page.tsx
      parent/
        layout.tsx
        home/page.tsx
        students/page.tsx
        students/add/page.tsx
        invoices/page.tsx
        invoices/[id]/page.tsx
        payments/page.tsx
        payments/success/page.tsx
        support/page.tsx
      admin/
        layout.tsx        # Drawer nav for mobile
        home/page.tsx
        students/page.tsx
        teachers/page.tsx
        grades/page.tsx
        grades/[id]/page.tsx
        courses/page.tsx
        attendance/page.tsx
        meetings/page.tsx
        fees/page.tsx
        settings/page.tsx
      page.tsx            # Marketing landing
      about/page.tsx
      contact/page.tsx
      courses/page.tsx
      enrollment/
        apply/page.tsx
    layout.tsx            # Root: fonts, providers
    globals.css
  components/
    ui/                   # Base reusable components
      button.tsx
      input.tsx
      card.tsx
      badge.tsx
      tabs.tsx
      avatar.tsx
      skeleton.tsx
      empty-state.tsx
      bottom-sheet.tsx    # NEW: mobile bottom sheet
      bottom-nav.tsx      # NEW: bottom tab navigation
      mobile-header.tsx   # NEW: sticky mobile header
    student/              # Student-specific components
    teacher/              # Teacher-specific components
    parent/               # Parent-specific components
    admin/                # Admin-specific components
    layout/               # Layout wrappers
    enrollment/           # Enrollment wizard steps
  lib/
    auth.ts               # NextAuth config
    supabase.ts           # Supabase client
    utils.ts              # cn() helper
    store.ts              # Zustand stores
    permissions.ts        # Role-based access
  context/
    LanguageContext.tsx
  i18n/
    config.ts
  types/
    database.ts
  middleware.ts           # next-intl locale routing
messages/
  ar.json
  en.json
  fr.json
```

=== DESIGN TOKENS (globals.css) ===

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-cairo), "Helvetica Neue", Arial, Tahoma, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --color-primary: #0D6EFD;
  --color-primary-hover: #0b5ed7;
  --color-primary-light: #e7f1ff;
  --color-secondary: #0D6EFD;

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

:root {
  --background: #FFFFFF;
  --foreground: #111827;
}
```

=== MOBILE-FIRST RULES ===

1. ALL layouts are single-column by default. Use grid-cols-2 only at md: breakpoint.
2. Bottom tab navigation (70px) for student/teacher/parent. Drawer nav for admin.
3. All modals become bottom sheets on mobile.
4. All data tables become card lists on mobile.
5. All form rows are single-column. Buttons stack full-width.
6. Minimum touch target: 44x44px for all interactive elements.
7. Safe area padding: env(safe-area-inset-*) on body and fixed elements.
8. Content max-width: 100% on mobile, max-w-4xl on tablet+.
9. Hero sections: full-width gradient cards with no horizontal margin.
10. RTL is the DEFAULT direction (Arabic). Support dir="rtl" and dir="ltr".

=== COMPONENT SPECIFICATIONS ===

BUILD THESE COMPONENTS FIRST (in order):

1. **Button** - Variants: default (primary bg), destructive, outline, secondary, ghost, link.
   Sizes: default (h-12 px-4), sm (h-9 px-3), lg (h-12 px-8), icon (h-10 w-10).
   Default shape: rounded-3xl. Font: text-sm font-semibold. Disabled: opacity-50.

2. **Input** - h-12, rounded-3xl, px-4, border, focus ring. File variant. aria-invalid state.

3. **Card** - Compound: Card (rounded-lg border shadow-sm), CardHeader, CardTitle, CardContent, CardFooter.

4. **Badge** - rounded-full, px-2.5 py-0.5 text-xs. Variants: default, secondary, destructive, outline.
   Status variants: success (#dcfce7/#166534), error (#fee2e2/#991b1b), warning (#fef3c7/#92400e),
   live (#fee2e2/#dc2626 + pulse animation), upcoming (#e0e7ff/#3730a3), completed (#f1f5f9/#64748b).

5. **BottomNav** - Fixed bottom, h-[70px], flex-row justify-around, border-top, bg-white, z-50.
   Items: icon (w-5 h-5) + label (text-[11px]). Active: bg-primary text-white rounded-xl.
   Safe area: padding-bottom env(safe-area-inset-bottom).

6. **MobileHeader** - Sticky top-0, h-14, flex items-center justify-between, px-4,
   bg-white border-b, z-40. Logo left, actions right.

7. **BottomSheet** - Fixed bottom, rounded-t-2xl, bg-white, z-50. Backdrop: bg-black/50.
   Handle bar: w-10 h-1 rounded-full bg-gray-300 mx-auto mt-2.
   Sizes: half (50vh), full (90vh). Slide-up animation.

8. **Tabs** - Scrollable horizontal, snap-x, gap-2. Active: border-b-2 border-primary or
   pill style (border-1 border-slate-800 bg-white).

9. **Skeleton** - animate-pulse bg-gray-200 rounded-lg. Variants: text, card, list, avatar.

10. **EmptyState** - Centered, min-h-[200px], icon (64x64 rounded-full bg-slate-100),
    title (text-lg font-semibold), description (text-sm text-gray-500), optional action button.

11. **Avatar** - Rounded-full, sizes: sm (h-8 w-8), md (h-10 w-10), lg (h-14 w-14).
    Fallback: bg-gray-100 with initials.

12. **DataCard** (mobile table replacement) - Replaces DataTable on mobile. Card with:
    header row (avatar + name + status badge), detail rows (label: value), action row (buttons).

13. **KPIStatCard** - rounded-2xl, p-3, text-center. Icon (h-4 w-4 colored) + value
    (text-xl font-extrabold) + label (text-[11px] font-semibold). Color variants:
    teal, amber, emerald, blue, purple, orange.

14. **Select** - Native select on mobile (better UX). Styled wrapper with chevron icon.

15. **Textarea** - min-h-[100px], rounded-lg, px-3 py-2, resize-none on mobile.

=== PAGE IMPLEMENTATIONS ===

PHASE 1 -- Core (Build First):
1. Root layout with providers (AuthProvider, NextIntlClientProvider, LanguageProvider)
2. Auth pages (Login, Register) -- centered card, form fields, RTL support
3. Student Home Dashboard -- gradient hero, stats strip, lesson carousel, assignment list
4. Student Courses list + Course detail
5. Student Assessments list + Take assessment
6. Student Attendance
7. Teacher Home Dashboard
8. Teacher Courses list + Create course
9. Teacher Lesson detail (6 tabs)
10. Teacher Assessments + Assessment Builder

PHASE 2 -- Extended:
11. Parent Home + Children management
12. Parent Invoices + Payments
13. Admin Home with KPI dashboard
14. Admin Students + Teachers management (card-based mobile views)
15. Admin Grades management
16. Admin Attendance tracking
17. Enrollment wizard (10 steps, full-screen per step)
18. Support ticket system (create + chat)

PHASE 3 -- Advanced:
19. Calendar pages (all roles)
20. Chat/messaging
21. Reels feed (TikTok-style video)
22. Marketing/public pages (landing, about, contact, courses catalog)
23. Admin remaining pages (meetings, fees, content, settings)
24. Profile pages (all roles)

=== RTL / i18n RULES ===

1. Default locale: Arabic (ar). URL: /ar/student/home
2. dir="rtl" on <html> for Arabic
3. All flex/grid layouts must work in both directions
4. Use logical CSS properties where possible (start/end not left/right)
5. Icons like ChevronRight must rotate 180deg in RTL
6. Side nav anchor: always visual RIGHT side regardless of dir
7. Text alignment: start (not left)
8. Messages loaded from JSON files per locale

=== STATES TO IMPLEMENT ===

Every page MUST have:
1. **Loading** -- Skeleton screen matching the page layout
2. **Empty** -- EmptyState component with relevant icon and CTA
3. **Error** -- Error card with retry button
4. **Success** -- Content rendered
5. **Offline** -- Banner indicating no connection

Every form MUST have:
1. Field-level validation with error messages below field
2. Submit button with loading spinner
3. Success feedback (toast or redirect)
4. Error feedback (inline message)
5. Disabled state during submission

=== ACCESSIBILITY BASELINE ===

1. All interactive elements must have aria-labels
2. Focus indicators: ring-2 ring-primary ring-offset-2
3. Color contrast: WCAG AA minimum (4.5:1 for text)
4. Semantic HTML: nav, main, section, article, h1-h6
5. Form labels linked to inputs
6. Screen reader text for icon-only buttons
7. Touch targets: 44x44px minimum
8. Keyboard navigation support

=== DATA FETCHING PATTERN ===

Use this pattern for all data fetching:
1. Server components for initial page data where possible
2. Client components with useEffect + fetch for interactive data
3. API routes under /api/* for all mutations
4. Loading states with Skeleton components
5. Error handling with retry capability
6. Optimistic updates for instant feedback

=== DO NOT ===

- Do NOT invent new color values. Use only the tokens defined above.
- Do NOT add desktop-first layouts. Everything is mobile-first.
- Do NOT use custom fonts beyond Cairo.
- Do NOT redesign the visual language. Preserve rounded shapes, subtle shadows, blue primary.
- Do NOT skip RTL support. Arabic is the primary language.
- Do NOT use modals on mobile. Use bottom sheets instead.
- Do NOT use hover-dependent interactions. Everything must work with touch.
- Do NOT skip loading/empty/error states on any page.
- Do NOT create unnecessary abstractions. Keep it simple and direct.
- Do NOT skip the bottom navigation bar. It is critical for mobile UX.

=== END OF REPLIT BUILD PROMPT ===
```

---

# SECTION 8 -- JSON SCHEMA EXPORT

```json
{
  "projectName": "Eduverse Mobile Web",
  "version": "1.0.0",
  "defaultLocale": "ar",
  "locales": ["ar", "en", "fr"],
  "direction": {
    "ar": "rtl",
    "en": "ltr",
    "fr": "ltr"
  },
  "designTokens": {
    "colors": {
      "primary": "#0D6EFD",
      "primaryHover": "#0b5ed7",
      "primaryLight": "#e7f1ff",
      "secondary": "#0D6EFD",
      "background": "#FFFFFF",
      "foreground": "#111827",
      "bgSoft": "#FFFFFF",
      "bgCard": "#FFFFFF",
      "bgMuted": "#F8FAFC",
      "textPrimary": "#111827",
      "textSecondary": "#6B7280",
      "textMuted": "#9CA3AF",
      "borderDefault": "#E5E7EB",
      "borderLight": "#e2e8f0",
      "borderLighter": "#f1f5f9",
      "brandPrimary": "#FFD501",
      "brandPrimaryHover": "#E6C200",
      "brandDark": "#111111",
      "brandLight": "#F9FAFB",
      "brandAccent": "#3A3A3A",
      "semantic": {
        "success": { "bg": "#dcfce7", "text": "#166534" },
        "error": { "bg": "#fee2e2", "text": "#991b1b" },
        "warning": { "bg": "#fef3c7", "text": "#92400e" },
        "upcoming": { "bg": "#e0e7ff", "text": "#3730a3" },
        "live": { "bg": "#fee2e2", "text": "#dc2626", "animation": "pulse 2s infinite" },
        "completed": { "bg": "#f1f5f9", "text": "#64748b" },
        "danger": { "bg": "#ef4444", "hover": "#dc2626", "text": "#FFFFFF" },
        "dangerLight": { "bg": "#fef2f2", "text": "#dc2626" }
      },
      "statCards": {
        "teal": { "bg": "teal-50", "icon": "teal-500", "value": "teal-700", "label": "teal-500" },
        "amber": { "bg": "amber-50", "icon": "amber-500", "value": "amber-700", "label": "amber-500" },
        "emerald": { "bg": "emerald-50", "icon": "emerald-500", "value": "emerald-700", "label": "emerald-500" },
        "blue": { "bg": "blue-50", "icon": "blue-500", "value": "blue-700", "label": "blue-500" },
        "purple": { "bg": "purple-50", "icon": "purple-500", "value": "purple-700", "label": "purple-500" }
      },
      "heroGradient": {
        "from": "teal-700",
        "via": "teal-600",
        "to": "emerald-500",
        "direction": "to-br"
      }
    },
    "typography": {
      "fontFamily": {
        "sans": "var(--font-cairo), 'Helvetica Neue', Arial, Tahoma, sans-serif",
        "mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      },
      "fontSize": {
        "xs": "0.75rem",
        "compact": "11px",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem"
      },
      "fontWeight": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700,
        "extrabold": 800
      },
      "lineHeight": {
        "none": 1,
        "tight": 1.25,
        "snug": 1.375,
        "normal": 1.5,
        "relaxed": 1.625
      },
      "letterSpacing": {
        "tight": "-0.025em",
        "wide": "0.025em",
        "widest": "0.1em"
      }
    },
    "spacing": {
      "0.5": "0.125rem",
      "1": "0.25rem",
      "1.5": "0.375rem",
      "2": "0.5rem",
      "2.5": "0.625rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem"
    },
    "borderRadius": {
      "sm": "0.25rem",
      "md": "0.375rem",
      "default": "0.5rem",
      "lg": "0.5rem",
      "xl": "1.5rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      "full": "9999px"
    },
    "shadows": {
      "card": "0 2px 8px rgba(0, 0, 0, 0.06)",
      "cardHover": "0 4px 16px rgba(0, 0, 0, 0.1)",
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "adminCardHover": "0 4px 12px rgba(0, 0, 0, 0.05)",
      "dropdown": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      "hero": "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    },
    "zIndex": {
      "header": 40,
      "nav": 50,
      "dropdown": 50,
      "toast": 100,
      "offline": 9999
    },
    "breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px"
    },
    "animations": {
      "float": { "duration": "6s", "easing": "ease-in-out", "iteration": "infinite" },
      "pulse": { "duration": "2s", "easing": "ease-in-out", "iteration": "infinite" },
      "slideUp": { "duration": "0.3s", "easing": "ease" },
      "transition": {
        "fast": "0.1s ease",
        "default": "0.15s ease",
        "normal": "0.2s ease",
        "slow": "0.3s ease"
      }
    }
  },
  "components": {
    "button": {
      "variants": ["default", "destructive", "outline", "secondary", "ghost", "link"],
      "sizes": {
        "default": { "height": "48px", "paddingX": "16px", "paddingY": "8px" },
        "sm": { "height": "36px", "paddingX": "12px" },
        "lg": { "height": "48px", "paddingX": "32px" },
        "icon": { "height": "40px", "width": "40px" }
      },
      "defaultRadius": "rounded-3xl",
      "fontWeight": "semibold",
      "fontSize": "sm"
    },
    "input": {
      "height": "48px",
      "radius": "rounded-3xl",
      "paddingX": "16px",
      "paddingY": "8px",
      "states": ["default", "focus", "disabled", "error"]
    },
    "card": {
      "radius": "rounded-lg",
      "border": true,
      "shadow": "sm",
      "padding": {
        "header": "16px 24px",
        "body": "24px",
        "footer": "24px"
      }
    },
    "badge": {
      "radius": "rounded-full",
      "paddingX": "10px",
      "paddingY": "2px",
      "fontSize": "xs",
      "variants": ["default", "secondary", "destructive", "outline", "success", "error", "warning", "upcoming", "live", "completed"]
    },
    "bottomNav": {
      "height": "70px",
      "position": "fixed bottom",
      "zIndex": 50,
      "maxItems": 5,
      "iconSize": "20px",
      "labelSize": "11px"
    },
    "mobileHeader": {
      "height": "56px",
      "position": "sticky top",
      "zIndex": 40
    },
    "bottomSheet": {
      "radius": "rounded-t-2xl",
      "zIndex": 50,
      "sizes": ["half", "full"],
      "handleBar": { "width": "40px", "height": "4px", "radius": "full", "color": "gray-300" }
    },
    "tabs": {
      "style": "scrollable",
      "activeIndicator": "pill or underline",
      "minHeight": "44px"
    },
    "skeleton": {
      "animation": "pulse",
      "color": "gray-200",
      "radius": "lg"
    },
    "emptyState": {
      "minHeight": "200px",
      "iconSize": "64px",
      "iconBg": "slate-100",
      "iconRadius": "full"
    },
    "avatar": {
      "sizes": { "sm": "32px", "md": "40px", "lg": "56px" },
      "radius": "full",
      "fallbackBg": "gray-100"
    },
    "dataCard": {
      "description": "Mobile replacement for DataTable",
      "sections": ["header", "details", "actions"],
      "radius": "lg",
      "shadow": "sm"
    },
    "statCard": {
      "radius": "2xl",
      "padding": "12px",
      "variants": ["teal", "amber", "emerald", "blue", "purple", "orange"]
    }
  },
  "navigation": {
    "student": {
      "type": "bottomNav",
      "items": [
        { "label": "Home", "icon": "Home", "route": "/student/home" },
        { "label": "Courses", "icon": "BookOpen", "route": "/student/courses" },
        { "label": "Calendar", "icon": "Calendar", "route": "/student/calendar" },
        { "label": "Assessments", "icon": "FileText", "route": "/student/assessments" },
        { "label": "Profile", "icon": "User", "route": "/student/profile" }
      ]
    },
    "teacher": {
      "type": "bottomNav",
      "items": [
        { "label": "Home", "icon": "Home", "route": "/teacher/home" },
        { "label": "Courses", "icon": "BookOpen", "route": "/teacher/courses" },
        { "label": "Calendar", "icon": "Calendar", "route": "/teacher/calendar" },
        { "label": "Grades", "icon": "Award", "route": "/teacher/grades" },
        { "label": "Profile", "icon": "User", "route": "/teacher/profile" }
      ]
    },
    "parent": {
      "type": "bottomNav",
      "items": [
        { "label": "Home", "icon": "Home", "route": "/parent/home" },
        { "label": "Children", "icon": "Users", "route": "/parent/students" },
        { "label": "Payments", "icon": "CreditCard", "route": "/parent/payments" },
        { "label": "Support", "icon": "HelpCircle", "route": "/parent/support" },
        { "label": "Profile", "icon": "User", "route": "/parent/profile" }
      ]
    },
    "admin": {
      "type": "drawerNav",
      "groups": [
        {
          "label": "Academic",
          "items": [
            { "label": "Grades", "route": "/admin/grades" },
            { "label": "Courses", "route": "/admin/courses" },
            { "label": "Lessons", "route": "/admin/lessons" },
            { "label": "Attendance", "route": "/admin/attendance" }
          ]
        },
        {
          "label": "People",
          "items": [
            { "label": "Students", "route": "/admin/students" },
            { "label": "Teachers", "route": "/admin/teachers" },
            { "label": "Users", "route": "/admin/users" }
          ]
        },
        {
          "label": "Finance",
          "items": [
            { "label": "Fees", "route": "/admin/fees" },
            { "label": "Coupons", "route": "/admin/coupons-expenses" }
          ]
        },
        {
          "label": "Content",
          "items": [
            { "label": "Content", "route": "/admin/content" },
            { "label": "Quizzes", "route": "/admin/quizzes-exams" },
            { "label": "Reels", "route": "/admin/reels" }
          ]
        },
        {
          "label": "Communication",
          "items": [
            { "label": "Meetings", "route": "/admin/meetings" },
            { "label": "Support", "route": "/admin/support" },
            { "label": "Messages", "route": "/admin/messages-audit" }
          ]
        }
      ]
    }
  },
  "pages": {
    "auth": {
      "login": {
        "route": "/{locale}/(auth)/login",
        "layout": "centered-card",
        "components": ["ReferenceAuthCard", "LoginForm"],
        "fields": ["emailOrPhone", "password"],
        "states": ["idle", "loading", "error", "success"]
      },
      "register": {
        "route": "/{locale}/(auth)/register",
        "layout": "centered-card",
        "fields": ["name", "email", "phone", "password", "role"]
      },
      "forgotPassword": {
        "route": "/{locale}/auth/forgot-password",
        "fields": ["email"],
        "states": ["form", "loading", "success"]
      },
      "resetPassword": {
        "route": "/{locale}/auth/reset-password",
        "fields": ["newPassword", "confirmPassword"],
        "validation": { "minLength": 6, "mustMatch": true }
      }
    },
    "student": {
      "home": {
        "route": "/{locale}/student/home",
        "sections": [
          "announcementBar",
          "heroCard",
          "quickStatsStrip",
          "enrollmentStatus",
          "announcementCard",
          "lessonCarousel",
          "assignmentList",
          "teacherCards",
          "paymentList",
          "subjectGrid"
        ]
      },
      "courses": {
        "route": "/{locale}/student/courses",
        "layout": "grid",
        "filters": ["search", "grade"],
        "gridCols": { "mobile": 1, "tablet": 2, "desktop": 3 }
      },
      "courseDetail": {
        "route": "/{locale}/student/courses/[id]",
        "sections": ["courseHeader", "enrollmentStatus", "lessonsList"]
      },
      "assessments": {
        "route": "/{locale}/student/assessments",
        "layout": "grid",
        "cardContent": ["title", "description", "duration", "statusBadge", "score", "actionButton"]
      },
      "takeAssessment": {
        "route": "/{locale}/student/assessments/[id]/take",
        "layout": "fullScreen",
        "features": ["resumable", "timed", "autoSave"]
      },
      "attendance": {
        "route": "/{locale}/student/attendance",
        "stats": ["rate", "present", "late", "absent"],
        "table": ["date", "course", "lesson", "status", "notes"]
      },
      "reels": {
        "route": "/{locale}/student/reels",
        "layout": "fullScreenFeed",
        "controls": ["swipeUpDown", "bookmark", "understood", "mute"]
      },
      "support": {
        "route": "/{locale}/student/support",
        "form": ["subject", "message"]
      }
    },
    "teacher": {
      "home": { "route": "/{locale}/teacher/home" },
      "courses": {
        "route": "/{locale}/teacher/courses",
        "layout": "grid",
        "actions": ["create"]
      },
      "createCourse": {
        "route": "/{locale}/teacher/courses/new",
        "form": ["title", "description", "price", "duration", "grade", "subject", "imageUrl"]
      },
      "lessonDetail": {
        "route": "/{locale}/teacher/courses/[id]/lessons/[lessonId]",
        "tabs": ["info", "materials", "attendance", "homework", "quiz", "exam"]
      },
      "assessmentBuilder": {
        "route": "/{locale}/teacher/assessments/new",
        "questionTypes": ["multiple_choice", "text", "file_upload"],
        "actions": ["saveDraft", "publish"]
      },
      "grades": {
        "route": "/{locale}/teacher/grades",
        "detail": {
          "route": "/{locale}/teacher/grades/[id]",
          "tabs": ["info", "courses", "schedule", "students", "fees"]
        }
      }
    },
    "parent": {
      "home": {
        "route": "/{locale}/parent/home",
        "sections": ["heroBanner", "quickStats", "childrenCards", "browseCourseCTA"]
      },
      "addChild": {
        "route": "/{locale}/parent/students/add",
        "form": ["name", "grade", "studentId", "email"]
      },
      "invoiceDetail": {
        "route": "/{locale}/parent/invoices/[id]",
        "sections": ["header", "billTo", "itemsTable", "summary", "actions"]
      },
      "paymentSuccess": {
        "route": "/{locale}/parent/payments/success",
        "content": ["checkIcon", "successMessage", "dashboardCTA", "invoiceCTA"]
      }
    },
    "admin": {
      "students": {
        "route": "/{locale}/admin/students",
        "mobileView": "dataCards",
        "columns": ["name", "email", "grade", "status", "actions"],
        "stats": ["total", "active", "inactive"]
      },
      "teachers": {
        "route": "/{locale}/admin/teachers",
        "mobileView": "dataCards",
        "stats": ["total", "active", "totalLessons", "avgPerformance", "totalSalary"],
        "modals": ["addEdit", "detail", "attendanceCalendar"]
      },
      "attendance": {
        "route": "/{locale}/admin/attendance",
        "stats": ["present", "absent", "late", "earlyExit"],
        "filters": ["status", "dateRange"],
        "pagination": { "pageSize": 50 }
      },
      "grades": {
        "route": "/{locale}/admin/grades",
        "filters": ["search", "status"],
        "detail": {
          "tabs": ["info", "courses", "schedule", "students", "fees"]
        }
      }
    },
    "enrollment": {
      "wizard": {
        "route": "/{locale}/enrollment/apply",
        "totalSteps": 10,
        "steps": [
          "start",
          "studentInfo",
          "academicInfo",
          "guardianInfo",
          "identityInfo",
          "medicalInfo",
          "documents",
          "review",
          "submit",
          "status"
        ],
        "features": ["autoSave30s", "draftResume", "completenessScore", "lockedAfterSubmit"]
      }
    }
  },
  "formPatterns": {
    "validation": {
      "approach": "inline-useState",
      "errorDisplay": "below-field",
      "requiredIndicator": "red-asterisk"
    },
    "submission": {
      "loadingState": "spinner-on-button",
      "successFeedback": "toast-or-redirect",
      "errorFeedback": "inline-message"
    },
    "mobileRules": {
      "layout": "single-column",
      "buttonLayout": "stacked-full-width",
      "datePicker": "native-input",
      "select": "native-select",
      "submitButton": "sticky-bottom"
    }
  },
  "mobileAdaptation": {
    "tableToCard": true,
    "modalToBottomSheet": true,
    "sidebarToDrawer": true,
    "sideNavToBottomNav": true,
    "breadcrumbToBackButton": true,
    "multiColumnToSingleColumn": true,
    "minTouchTarget": "44px",
    "safeAreaPadding": true,
    "pullToRefresh": true,
    "stickySubmitButtons": true,
    "overscrollContain": true
  },
  "roles": ["student", "teacher", "parent", "admin", "supervisor"],
  "authStrategy": "JWT",
  "apiBasePattern": "/api/*"
}
```

---

# APPENDIX A -- TOP 20 MOST REUSABLE COMPONENTS (Build First)

| Priority | Component | Reason |
|----------|-----------|--------|
| 1 | **Button** | Used on every page, all variants needed immediately |
| 2 | **Input** | Every form requires it |
| 3 | **Card** | Primary content container across all roles |
| 4 | **Badge** | Status indicators everywhere (lessons, assessments, enrollments) |
| 5 | **BottomNav** | Core mobile navigation for 3/4 roles |
| 6 | **MobileHeader** | Every portal page needs it |
| 7 | **BottomSheet** | Replaces all modals on mobile |
| 8 | **Skeleton** | Every page needs loading states |
| 9 | **EmptyState** | Every list/grid page needs it |
| 10 | **Avatar** | User representation across all roles |
| 11 | **Tabs** | Lesson detail, grade detail, assessment views, admin pages |
| 12 | **Select** | All forms with dropdowns |
| 13 | **Textarea** | Support tickets, descriptions, messages |
| 14 | **DataCard** | Mobile replacement for all admin tables |
| 15 | **KPIStatCard** | Dashboard stats across all roles |
| 16 | **PageError** | Error handling on every page |
| 17 | **Breadcrumb/BackButton** | Navigation across all detail pages |
| 18 | **Label** | All form fields |
| 19 | **Alert** | System messages, warnings |
| 20 | **MobileDrawerNav** | Admin navigation, public menu |

# APPENDIX B -- TOP 10 MOBILE UX RISKS

| Priority | Risk | Solution |
|----------|------|----------|
| 1 | **Admin tables on small screens** | Convert all DataTable instances to DataCard with expandable details |
| 2 | **10-step enrollment wizard** | Full-screen per step, sticky progress bar, auto-save, prevent data loss |
| 3 | **RTL layout bugs** | Test every component in both AR and EN; use logical CSS properties |
| 4 | **Assessment builder complexity** | Single-question-per-screen flow with swipe navigation |
| 5 | **Tab overflow on small screens** | Scrollable tab bar with horizontal snap |
| 6 | **Charts not touch-friendly** | Simplified stat cards on mobile, charts only on tablet+ |
| 7 | **Long forms obscured by keyboard** | Auto-scroll to focused input, avoid fixed bottom bar covering inputs |
| 8 | **Modal stack overflow** | Replace all modals with bottom sheets; prevent multiple sheets |
| 9 | **Offline data loss** | Service worker caching, form auto-save to localStorage |
| 10 | **Slow initial load** | Aggressive code splitting, route-based lazy loading, skeleton-first |

# APPENDIX C -- RECOMMENDED IMPLEMENTATION ORDER

## Phase 1: Foundation (Week 1-2)
1. Project setup (Next.js, Tailwind, providers, i18n)
2. Design tokens + globals.css
3. All 20 base UI components
4. Auth pages (login, register, forgot/reset password)
5. Student layout (bottom nav + header)
6. Student home dashboard

## Phase 2: Student Core (Week 2-3)
7. Student courses list + detail
8. Student assessments list + take assessment
9. Student attendance
10. Student support
11. Student reels feed

## Phase 3: Teacher Core (Week 3-4)
12. Teacher layout
13. Teacher home dashboard
14. Teacher courses + create course
15. Teacher lesson detail (6 tabs)
16. Teacher assessment builder
17. Teacher grades

## Phase 4: Parent & Enrollment (Week 4-5)
18. Parent layout
19. Parent home + children management
20. Parent invoices + payments
21. Enrollment wizard (10 steps)

## Phase 5: Admin & Advanced (Week 5-7)
22. Admin layout (drawer nav)
23. Admin dashboard with KPIs
24. Admin students + teachers (card views)
25. Admin grades + attendance
26. Admin meetings + fees
27. Support ticket system (all roles)
28. Calendar pages (all roles)
29. Chat/messaging
30. Profile pages (all roles)

## Phase 6: Polish & Public (Week 7-8)
31. Marketing/landing page
32. About, contact, services pages
33. Public course catalog + checkout
34. PWA optimization
35. Performance audit + code splitting
36. RTL comprehensive testing
37. Accessibility audit

---

*END OF SPECIFICATION*
