# Complete Site Map — futurelab.school

Generated from Playwright crawl on 2026-04-04.
Reference: https://futurelab.school

---

## PRE-LOGIN ROUTES

### ROUTE: /ar/login (and /en/login)
- ROUTE TYPE: static (tabbed form — Login + Register)
- REACHABLE FROM: root redirect, /forgot-password back link, /ar/join nav button
- AUTH REQUIRED: no
- PAGE TYPE: authentication
- TABS FOUND:
  - تسجيل الدخول (Login): phone+country selector, password, submit, forgot password link
  - تسجيل (Register): profile picture upload, name, phone+country, email, parent name (optional), parent phone (optional), password, confirm password, submit
- MODALS FOUND: country selector dialog (32 countries, searchable)
- ELEMENTS:
  - PWA install banner (Arabic: تثبيت التطبيق)
  - Country selector: 32 countries (US, UK, Sudan, Saudi, Egypt, UAE, Qatar, Kuwait, Bahrain, Oman, Jordan, Lebanon, Iraq, Yemen, Syria, Palestine, Libya, Tunisia, Algeria, Mauritania, Uganda, Tanzania, Kenya, Nigeria, Ghana, Senegal, Chad, Rwanda, Burundi, Zambia, Zimbabwe, South Sudan)
  - Background image: two children holding books
- NOTES: English locale shows broken key `auth.login.phonePlaceholder` for phone label
- STATUS: discovered

### ROUTE: /ar/join (and /en/join)
- ROUTE TYPE: static (single-page multi-section form)
- REACHABLE FROM: nav bar "انضم" button
- AUTH REQUIRED: no
- PAGE TYPE: school enrollment application
- NAV BAR: Future Labs Academy logo, حولنا (/about), اتصل بنا (/contact), خدماتنا (/services), English/العربية toggle, تسجيل الدخول, انضم
- FORM SECTIONS:
  1. اختر الفصل (Select Class): dropdown with 2 options (كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الأول/الثاني)
  2. المعلومات الشخصية (Personal Info): full name, date of birth (date picker), gender (أنثى/ذكر), password, student photo upload
  3. معلومات الاتصال (Contact Info): phone+country selector (default Sudan +249), address
  4. المعلومات التعليمية (Educational Info): previous education textarea
  5. معلومات ولي الامر (Guardian Info): guardian name, guardian phone+country, passport upload (optional), national ID upload (optional)
- SUBMIT BUTTON: "إرسال الطلب"
- NOTES:
  - Student photo upload has untranslated English strings: "Drag and drop an image here, or", "Upload Image", "Supported formats..."
  - English locale shows broken keys: `navbar.register`, `applications.form.fields.passport`, `applications.form.fields.nationalNumber`
  - WhatsApp floating button visible
- STATUS: discovered

### ROUTE: /ar/forgot-password (and /en/forgot-password)
- ROUTE TYPE: static
- REACHABLE FROM: login page "نسيت كلمة المرور؟" link
- AUTH REQUIRED: no
- PAGE TYPE: password reset
- ELEMENTS:
  - Heading: "نسيت كلمة المرور"
  - Description: "أدخل عنوان بريدك الإلكتروني وسنرسل لك رمزًا لإعادة تعيين كلمة المرور."
  - Email field: "أدخل بريدك الإلكتروني"
  - Submit button: "إرسال الرمز"
  - Back link: "العودة لتسجيل الدخول" → /login
  - Same background image as login
- STATUS: discovered

### ROUTE: /ar/about (and /en/about)
- ROUTE TYPE: static (marketing page)
- REACHABLE FROM: nav bar on /join, /contact, /services
- AUTH REQUIRED: no
- PAGE TYPE: about page
- SECTIONS:
  - Hero: "حول Future Labs Academy" with description and CTAs
  - Vision & Mission cards (رؤيتنا / مهمتنا)
  - Core Values: التميز الأكاديمي, التعلم التعاوني, الانفتاح العالمي
  - Stats: 500+ طالب, 50+ معلم, 20+ برنامج, 10+ سنوات
  - Why Choose section: 6 feature cards (معلمون مؤهلون, مناهج حديثة, بيئة تفاعلية, تقنيات متقدمة, متابعة فردية, قيم أصيلة)
  - CTA banner: "ابدأ رحلة التعلم معنا اليوم" with احجز جولة / تقدم بطلب buttons
- STATUS: discovered

### ROUTE: /ar/contact (and /en/contact)
- ROUTE TYPE: static (marketing page)
- REACHABLE FROM: nav bar
- AUTH REQUIRED: no
- PAGE TYPE: contact page
- SECTIONS:
  - Hero: "Contact Us" (NOTE: English text on Arabic locale!)
  - Contact form: First Name, Last Name, Email, Phone, Subject, Message, Send button
  - Contact info: Address (Omdurman, Sudan), Phone (+249912672055, +971562792004), Email (info@azizaschool.online, admissions@azizaschool.online), Working Hours (Sun-Thu 7AM-3PM)
  - Map placeholder: "Interactive Map - Coming Soon"
  - FAQ section: 4 questions
- NOTES: Entire page is in English even on /ar/ locale
- STATUS: discovered

### ROUTE: /ar/services (and /en/services)
- ROUTE TYPE: static (marketing page)
- REACHABLE FROM: nav bar
- AUTH REQUIRED: no
- PAGE TYPE: services page
- SECTIONS:
  - Hero: "Our Educational Services" (English on Arabic locale)
  - Core Services: Primary Education, Bilingual Education, Digital Learning, Collaborative Learning
  - Support Services: Transportation, Meals, Security, Counseling
  - Extracurricular: Sports, Artistic, Musical, Scientific
  - Specialized Programs: Gifted, Learning Support, Leadership
  - CTA: "Interested in Our Services?"
- NOTES: Entire page in English even on /ar/ locale
- STATUS: discovered

### ROUTE: / (root)
- ROUTE TYPE: redirect
- REDIRECTS TO: /ar/login (unauthenticated) or /ar/dashboard (authenticated)
- STATUS: discovered

---

## AUTHENTICATED ROUTES — SIDEBAR NAVIGATION

### User Context
- Logged in as: Fadi (ADMIN role)
- Sidebar position: right side (RTL)
- Profile link at bottom of sidebar

---

### ROUTE: /ar/dashboard
- ROUTE TYPE: static
- REACHABLE FROM: sidebar "الرئيسية" link, post-login redirect
- AUTH REQUIRED: yes
- PAGE TYPE: dashboard home
- NOTES: Currently crashes with "Application error: a client-side exception" due to /api/dashboard returning 500. TypeError: Cannot read properties of undefined (reading 'toLowerCase')
- STATUS: discovered (error state)

---

### ACADEMIC SECTION (الأكاديمي)

### ROUTE: /ar/dashboard/courses
- ROUTE TYPE: static (list page)
- REACHABLE FROM: sidebar → الأكاديمي → المواد الدراسية
- AUTH REQUIRED: yes
- PAGE TYPE: course listing
- ELEMENTS:
  - Title: "المواد الدراسية" / "إدارة والوصول إلى المواد الدراسية"
  - Search field
  - Import/Export buttons (broken keys: dashboard.courses.actions.import/export)
  - Create button: "إنشاء مادة دراسية"
  - Grid of course cards (20 courses found): each with image placeholder, title, instructor name, bundle name, preview/edit/delete buttons
- DETAIL ROUTE: /ar/dashboard/courses/:id (via "معاينة" button)
- STATUS: discovered

### ROUTE: /ar/dashboard/courses/:id
- EXAMPLE URL: /ar/dashboard/courses/1
- ROUTE TYPE: detail page (dynamic)
- REACHABLE FROM: course card "معاينة" button
- AUTH REQUIRED: yes
- PAGE TYPE: course detail/edit
- ELEMENTS:
  - Back button, course title, Save button
  - PWA install banner
- TABS FOUND:
  1. المعلومات (Information): course name, teacher dropdown, rich text description editor, image upload, meeting section (Google Meet link + create meeting button)
  2. الدروس (Lessons): lesson list with add button, draft/published status
  3. الواجبات (Assignments): assignment management
  4. الامتحانات (Exams): exam management
  5. الحصص المباشرة (Live Sessions): calendar view with month/week/day/agenda, join buttons, nested sub-tabs (الفصول المباشرة / dashboard.common.view)
- GOOGLE MEET: Real meet link displayed (https://meet.google.com/zup-kupx-cih), "انشاء اجتماع" button
- STATUS: discovered

### ROUTE: /ar/dashboard/categories
- ROUTE TYPE: static (list page)
- REACHABLE FROM: sidebar → الأكاديمي → الفئات
- AUTH REQUIRED: yes
- PAGE TYPE: categories management
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/bundles
- ROUTE TYPE: static (list page)
- REACHABLE FROM: sidebar → الأكاديمي → الفصول
- AUTH REQUIRED: yes
- PAGE TYPE: bundles/classes management
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/exams
- ROUTE TYPE: static (list page)
- REACHABLE FROM: sidebar → الأكاديمي → الامتحانات
- AUTH REQUIRED: yes
- PAGE TYPE: exams management
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/quizzes
- ROUTE TYPE: static (list page)
- REACHABLE FROM: sidebar → الأكاديمي → الاختبارات
- AUTH REQUIRED: yes
- PAGE TYPE: quizzes management
- STATUS: discovered (not yet visited in detail)

---

### ADMINISTRATION SECTION (الإدارة)

### ROUTE: /ar/dashboard/users
- ROUTE TYPE: static (list page with table)
- REACHABLE FROM: sidebar → الإدارة → المستخدمون
- AUTH REQUIRED: yes
- PAGE TYPE: user management
- ELEMENTS:
  - Title: "المستخدمون" / "إدارة حسابات المستخدمين والصلاحيات"
  - Search: "بحث عن المستخدمين..."
  - 2 filter dropdowns: "جميع المستخدمين"
  - Add button: "إضافة مستخدم"
  - Table: columns — الاسم, البريد الإلكتروني, الدور, الحالة, تاريخ الاضافة, الإجراءات
  - Pagination: 91 total results, 10 per page, page navigation
  - Action button per row: "dashboard.users.actions.open" (broken key)
- POSSIBLE DETAIL ROUTE: /ar/dashboard/users/:id (needs verification)
- STATUS: discovered

### ROUTE: /ar/dashboard/applications
- ROUTE TYPE: static (list page)
- REACHABLE FROM: sidebar → الإدارة → الطلبات
- AUTH REQUIRED: yes
- PAGE TYPE: applications management
- ELEMENTS:
  - Title: "الطلبات" / "إدارة ومتابعة الطلبات"
- STATUS: discovered

### ROUTE: /ar/dashboard/lookups
- ROUTE TYPE: static
- REACHABLE FROM: sidebar → الإدارة → البيانات المرجعية
- AUTH REQUIRED: yes
- PAGE TYPE: reference data management
- STATUS: discovered (not yet visited in detail)

---

### FINANCE SECTION (المالية)

### ROUTE: /ar/dashboard/payments
- REACHABLE FROM: sidebar → المالية → المدفوعات
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/salaries
- REACHABLE FROM: sidebar → المالية → الرواتب
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/payslips
- REACHABLE FROM: sidebar → المالية → قسائم الراتب
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/banks
- REACHABLE FROM: sidebar → المالية → البنوك
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/currencies
- REACHABLE FROM: sidebar → المالية → العملات
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/expenses
- REACHABLE FROM: sidebar → المالية → المصروفات
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/coupons
- REACHABLE FROM: sidebar → المالية → الكوبونات
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

---

### COMMUNICATION SECTION (التواصل)

### ROUTE: /ar/dashboard/announcements
- REACHABLE FROM: sidebar → التواصل → الإعلانات
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/messages
- REACHABLE FROM: sidebar → التواصل → الرسائل
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

---

### CONTENT SECTION (المحتوى)

### ROUTE: /ar/dashboard/cms
- REACHABLE FROM: sidebar → المحتوى → إدارة المحتوى
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/blogs
- REACHABLE FROM: sidebar → المحتوى → المدونات
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/translations
- REACHABLE FROM: sidebar → المحتوى → الترجمة
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

---

### ANALYTICS SECTION (التحليلات)

### ROUTE: /ar/dashboard/reports
- REACHABLE FROM: sidebar → التحليلات → التقارير
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

---

### DATA MANAGEMENT SECTION (إدارة البيانات)

### ROUTE: /ar/dashboard/backup
- REACHABLE FROM: sidebar → إدارة البيانات → النسخ الاحتياطي والاستعادة
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

---

### STANDALONE ROUTES

### ROUTE: /ar/dashboard/system-settings
- REACHABLE FROM: sidebar → الإعدادات
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

### ROUTE: /ar/dashboard/profile
- REACHABLE FROM: sidebar bottom → الملف الشخصي
- AUTH REQUIRED: yes
- STATUS: discovered (not yet visited in detail)

---

## DETAIL PAGE ROUTE FAMILIES (DYNAMIC /:id ROUTES)

### ROUTE: /ar/dashboard/courses/:id
- EXAMPLE: /ar/dashboard/courses/1
- CONFIRMED: yes (via course card "معاينة" click)
- TABS: المعلومات, الدروس, الواجبات, الامتحانات, الحصص المباشرة
- STATUS: discovered

### ROUTE: /ar/dashboard/lessons/:id
- EXAMPLE: /ar/dashboard/lessons/19
- CONFIRMED: yes (directly navigated)
- TABS: عنوان الدرس, مواد الدرس, حضور الطلاب
- ELEMENTS: lesson title, content, video upload, order, date, published toggle, save button
- PARENT: shown as course name (e.g., "Phonatics")
- STATUS: discovered

### ROUTE: /ar/dashboard/users/:id
- CONFIRMED: not yet (action button has broken key)
- STATUS: needs verification

### ROUTE: /ar/dashboard/bundles/:id
- CONFIRMED: not yet
- STATUS: needs verification

### ROUTE: /ar/dashboard/exams/:id
- CONFIRMED: not yet
- STATUS: needs verification

### ROUTE: /ar/dashboard/quizzes/:id
- CONFIRMED: not yet
- STATUS: needs verification

### ROUTE: /ar/dashboard/applications/:id
- CONFIRMED: not yet
- STATUS: needs verification

---

## ROUTE COUNT SUMMARY

| Category | Count |
|----------|-------|
| Pre-login static routes | 7 (login, join, forgot-password, about, contact, services, root redirect) |
| Dashboard home | 1 |
| Academic sidebar routes | 5 (courses, categories, bundles, exams, quizzes) |
| Administration sidebar routes | 3 (users, applications, lookups) |
| Finance sidebar routes | 7 (payments, salaries, payslips, banks, currencies, expenses, coupons) |
| Communication sidebar routes | 2 (announcements, messages) |
| Content sidebar routes | 3 (cms, blogs, translations) |
| Analytics sidebar routes | 1 (reports) |
| Data Management sidebar routes | 1 (backup) |
| Standalone sidebar routes | 2 (system-settings, profile) |
| Confirmed detail routes | 2 (courses/:id, lessons/:id) |
| Unconfirmed detail routes | 5 (users/:id, bundles/:id, exams/:id, quizzes/:id, applications/:id) |
| **TOTAL DISCOVERED** | **39** |

---

## SIDEBAR NAVIGATION STRUCTURE (Arabic Labels)

```
الرئيسية → /ar/dashboard
الأكاديمي ▼
  ├─ المواد الدراسية → /ar/dashboard/courses
  ├─ الفئات → /ar/dashboard/categories
  ├─ الفصول → /ar/dashboard/bundles
  ├─ الامتحانات → /ar/dashboard/exams
  └─ الاختبارات → /ar/dashboard/quizzes
الإدارة ▼
  ├─ المستخدمون → /ar/dashboard/users
  ├─ الطلبات → /ar/dashboard/applications
  └─ البيانات المرجعية → /ar/dashboard/lookups
المالية ▼
  ├─ المدفوعات → /ar/dashboard/payments
  ├─ الرواتب → /ar/dashboard/salaries
  ├─ قسائم الراتب → /ar/dashboard/payslips
  ├─ البنوك → /ar/dashboard/banks
  ├─ العملات → /ar/dashboard/currencies
  ├─ المصروفات → /ar/dashboard/expenses
  └─ الكوبونات → /ar/dashboard/coupons
التواصل ▼
  ├─ الإعلانات → /ar/dashboard/announcements
  └─ الرسائل → /ar/dashboard/messages
المحتوى ▼
  ├─ إدارة المحتوى → /ar/dashboard/cms
  ├─ المدونات → /ar/dashboard/blogs
  └─ الترجمة → /ar/dashboard/translations
التحليلات ▼
  └─ التقارير → /ar/dashboard/reports
إدارة البيانات ▼
  └─ النسخ الاحتياطي والاستعادة → /ar/dashboard/backup
الإعدادات → /ar/dashboard/system-settings
الملف الشخصي → /ar/dashboard/profile
```

---

## KNOWN ISSUES IN REFERENCE SITE

1. Dashboard home (/ar/dashboard) crashes with client-side error (API returns 500)
2. Multiple broken translation keys:
   - `dashboard.courses.actions.import` / `dashboard.courses.actions.export`
   - `dashboard.courses.noInstructor`
   - `dashboard.users.actions.open`
   - `dashboard.common.view`
   - `dashboard.lessons.form.uploadVideoPlaceholder`
   - `auth.login.phonePlaceholder` (English locale)
   - `navbar.register` (English locale)
   - `applications.form.fields.passport` (English locale)
   - `applications.form.fields.nationalNumber` (English locale)
3. Contact page (/ar/contact) and Services page (/ar/services) show English text on Arabic locale
4. Student photo upload on /ar/join has untranslated English strings
5. Calendar headers in live sessions use English day abbreviations (Sun, Mon, etc.)
