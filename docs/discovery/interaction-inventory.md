# Interaction Inventory

**Source**: Reference site audit + codebase analysis  
**Date**: 2026-04-04  

---

## Navigation Interactions

| # | Interaction | Location | Expected Behavior | Eduverse Status |
|---|------------|----------|-------------------|-----------------|
| N1 | Click sidebar category | All auth pages | Expands sub-items, navigates to section | Exists |
| N2 | Click sidebar sub-item | All auth pages | Navigates to page, highlights active | Exists |
| N3 | Click hamburger menu | Mobile all auth pages | Opens mobile drawer from correct RTL edge | **MISSING** |
| N4 | Click mobile drawer item | Mobile all auth pages | Navigates + closes drawer | **MISSING** |
| N5 | Click breadcrumb segment | Nested pages | Navigates to parent | Partial |
| N6 | Click tab | Grade detail, course detail | Switches tab content, updates URL hash | Exists |
| N7 | Click language switcher | All pages | Toggles AR↔EN, flips layout direction | Exists |
| N8 | Click profile avatar | Auth header | Opens profile dropdown | Exists |
| N9 | Click back/cancel | Form pages | Returns to list without saving | Partial |
| N10 | Click logo | All pages | Returns to home/dashboard | Exists |

## Form Interactions

| # | Interaction | Location | Expected Behavior | Eduverse Status |
|---|------------|----------|-------------------|-----------------|
| F1 | Submit login (valid) | Login page | Authenticates, redirects to dashboard | Exists |
| F2 | Submit login (invalid) | Login page | Shows inline error, retains email | Exists |
| F3 | Submit login (empty) | Login page | Shows field-level required errors | Needs audit |
| F4 | Click forgot password | Login page | Navigates to password reset | Exists |
| F5 | Click Google OAuth | Login page | Opens Google OAuth popup | **Not confirmed** |
| F6 | Click Facebook OAuth | Login page | Opens Facebook OAuth popup | **Not confirmed** |
| F7 | Toggle password visibility | Login/Register | Shows/hides password text | **Needs upgrade** |
| F8 | Select country code | Login (reference) | Opens searchable dropdown with flags | **MISSING** |
| F9 | Submit registration | Join page | Creates account, redirects | Exists |
| F10 | Submit create course | Teacher portal | Validates, creates, shows success toast | Exists |
| F11 | Submit create lesson | Teacher portal | Validates, creates with meeting link | Exists |
| F12 | Submit create assessment | Teacher portal | Validates, creates quiz/exam | Exists |
| F13 | Cancel form | All create/edit forms | Resets form, navigates back | Partial |
| F14 | Edit profile | Profile page | Inline edit or modal, save changes | Exists |

## Table Interactions

| # | Interaction | Location | Expected Behavior | Eduverse Status |
|---|------------|----------|-------------------|-----------------|
| T1 | Click table row | Student/teacher/course lists | Navigates to detail page | Exists |
| T2 | Click sort header | Data tables | Sorts column asc/desc with indicator | Partial |
| T3 | Click pagination | Data tables | Loads page, scrolls to top | Partial |
| T4 | Type in search | Data tables | Debounced filter of rows | Partial |
| T5 | Click row action (edit) | Data tables | Opens edit form/modal | Exists |
| T6 | Click row action (delete) | Data tables | Shows confirmation dialog | Exists |
| T7 | Click row action (view) | Data tables | Navigates to detail | Exists |
| T8 | Select filter tab | Course list | Filters by status (All/Active/Upcoming/Completed) | **Needs creation** |

## Button/Action Interactions

| # | Interaction | Location | Expected Behavior | Eduverse Status |
|---|------------|----------|-------------------|-----------------|
| B1 | Click "Create Course" | Course list page | Navigates to create form | Exists |
| B2 | Click "Create Lesson" | Lesson list/course detail | Opens lesson form | Exists |
| B3 | Click "Start Assessment" | Assessment list | Navigates to take assessment | Exists |
| B4 | Click "Join Meeting" | Lesson detail | Opens Google Meet link in new tab | Exists |
| B5 | Click notification bell | Auth header | Opens notification panel/dropdown | Partial |
| B6 | Click "Sign Out" | Profile dropdown | Signs out, redirects to login | Exists |
| B7 | Click "Save" (form) | All edit forms | Validates + saves + shows feedback | Exists |
| B8 | Click "Download" | Materials/documents | Downloads file | Exists |
| B9 | Click "Upload" (reels) | Reels page | Opens file picker/upload flow | Exists |
| B10 | Click "Mark Attendance" | Attendance page | Toggles present/absent per student | Exists |

## State Transitions

| # | Interaction | Expected States | Eduverse Status |
|---|------------|----------------|-----------------|
| S1 | Page load (data) | idle → loading (skeleton) → success (data) OR empty OR error | **Incomplete** — most pages skip loading/empty/error |
| S2 | Form submit | idle → submitting (disabled button) → success (toast) OR error (inline) | Partial |
| S3 | Delete action | confirm dialog → deleting → success (item removed) OR error | Exists |
| S4 | Search/filter | current → loading → filtered results OR no-results | Partial |
| S5 | Tab switch | current tab → loading (if async) → new tab content | Exists |
| S6 | Session expiry | Any page → redirect to login with message | **Needs audit** |

---

## Gap Summary

| Category | Total | Exists | Needs Upgrade | Missing |
|----------|-------|--------|--------------|---------|
| Navigation | 10 | 7 | 1 | 2 (mobile drawer) |
| Forms | 14 | 9 | 2 | 3 (OAuth, country code) |
| Tables | 8 | 5 | 2 | 1 (status filter tabs) |
| Buttons | 10 | 9 | 1 | 0 |
| States | 6 | 2 | 2 | 2 (full state coverage) |
| **Total** | **48** | **32** | **8** | **8** |

**Critical gaps**: Mobile drawer navigation (N3/N4), country code selector (F8), status filter tabs (T8), full state machine coverage (S1/S6)
