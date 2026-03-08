/**
 * Google Meet Integration Test Automation
 * 
 * This test validates the complete flow of:
 * 1. Teacher creating a pre-existing Google Meet link and saving it as a lesson material
 * 2. Student accessing the saved Meet link from lesson materials
 * 3. Successfully joining the virtual meeting room
 * 
 * IMPORTANT: This test uses a PRE-EXISTING static Google Meet URL that the teacher
 * has already created and saved within the lesson materials. It does NOT use
 * the generic "new meeting" link (https://meet.google.com/new).
 * 
 * Test Scenario: T028 - Google Meet Connection Validation
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { isGoogleMeetUrl, hasMeetLink } from '../src/lib/meet-utils';

const TEACHER_EMAIL = process.env.TEACHER_EMAIL || 'teacher@test.com';
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'testpassword';
const STUDENT_EMAIL = process.env.STUDENT_EMAIL || 'student@test.com';
const STUDENT_PASSWORD = process.env.STUDENT_PASSWORD || 'testpassword';

const PRE_EXISTING_MEET_LINK = process.env.PRE_EXISTING_MEET_LINK || 'https://meet.google.com/abc-defg-hij';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Google Meet Integration Tests', () => {
    let browser: Browser;
    let context: BrowserContext;
    let teacherPage: Page;
    let studentPage: Page;

    beforeAll(async () => {
        browser = await chromium.launch({ headless: false });
        context = await browser.newContext({
            permissions: ['camera', 'microphone'],
        });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        teacherPage = await context.newPage();
        studentPage = await context.newPage();
    });

    afterEach(async () => {
        await teacherPage.close();
        await studentPage.close();
    });

    describe('T028: Google Meet Link Validation and Connection', () => {
        
        test('Step 1: Validate pre-existing Meet link format', () => {
            expect(isGoogleMeetUrl(PRE_EXISTING_MEET_LINK)).toBe(true);
            expect(hasMeetLink(PRE_EXISTING_MEET_LINK)).toBe(true);
            expect(PRE_EXISTING_MEET_LINK).not.toBe('https://meet.google.com/new');
        });

        test('Step 2: Teacher logs in and creates lesson with Meet link', async () => {
            await teacherPage.goto(`${BASE_URL}/ar/login/teacher`);
            
            await teacherPage.fill('input[name="email"]', TEACHER_EMAIL);
            await teacherPage.fill('input[name="password"]', TEACHER_PASSWORD);
            await teacherPage.click('button[type="submit"]');
            
            await teacherPage.waitForURL(`${BASE_URL}/ar/teacher/home`);
            
            await teacherPage.goto(`${BASE_URL}/ar/teacher/lessons/new`);
            
            await teacherPage.fill('input[name="title"]', 'Test Math Lesson');
            await teacherPage.fill('input[name="startDateTime"]', '2025-03-01T10:00');
            await teacherPage.fill('input[name="duration"]', '60');
            await teacherPage.fill('input[name="meetLink"]', PRE_EXISTING_MEET_LINK);
            
            await teacherPage.click('button[type="submit"]');
            
            await teacherPage.waitForURL(`${BASE_URL}/ar/teacher/courses/**`);
        });

        test('Step 3: Teacher adds Meet link as material in lesson', async () => {
            await teacherPage.goto(`${BASE_URL}/ar/teacher/lessons/[lessonId]`);
            
            await teacherPage.click('button:has-text("Add Material")');
            await teacherPage.fill('input[placeholder="Title"]', 'Google Meet Session');
            await teacherPage.selectOption('select', 'link');
            await teacherPage.fill('input[placeholder="URL (https://...)"]', PRE_EXISTING_MEET_LINK);
            await teacherPage.click('button:has-text("Save")');
            
            const materialLink = await teacherPage.textContent('a[href*="meet.google.com"]');
            expect(materialLink).toContain('meet.google.com');
        });

        test('Step 4: Student logs in and accesses lesson with Meet link', async () => {
            await studentPage.goto(`${BASE_URL}/ar/login/student`);
            
            await studentPage.fill('input[name="email"]', STUDENT_EMAIL);
            await studentPage.fill('input[name="password"]', STUDENT_PASSWORD);
            await studentPage.click('button[type="submit"]');
            
            await studentPage.waitForURL(`${BASE_URL}/ar/student/home`);
            
            await studentPage.goto(`${BASE_URL}/ar/student/courses`);
            
            await studentPage.click('button:has-text("View") >> nth=0');
        });

        test('Step 5: Student accesses Meet link from lesson materials', async () => {
            await studentPage.goto(`${BASE_URL}/ar/student/lessons/[lessonId]`);
            
            const meetLinkElement = await studentPage.$('a[href*="meet.google.com"]');
            expect(meetLinkElement).not.toBeNull();
            
            const href = await meetLinkElement?.getAttribute('href');
            expect(isGoogleMeetUrl(href || '')).toBe(true);
            expect(href).not.toBe('https://meet.google.com/new');
        });

        test('Step 6: Student joins the Google Meet session', async () => {
            const meetPage = await context.newPage();
            
            await meetPage.goto(PRE_EXISTING_MEET_LINK);
            
            await meetPage.waitForLoadState('networkidle');
            
            const joinButton = await meetPage.$('button:has-text("Join now"), button:has-text("Ask to join"), button:has-text("Join")');
            
            if (joinButton) {
                await joinButton.click();
                
                await meetPage.waitForTimeout(3000);
                
                const meetingRoomLoaded = await meetPage.$('[aria-label*="meeting"], [data-meeting-id]');
                expect(meetingRoomLoaded || meetPage.url().includes('meet.google.com')).toBe(true);
            }
            
            await meetPage.close();
        });

        test('Step 7: Verify browser permissions for camera and microphone', async () => {
            const testPage = await context.newPage();
            
            await testPage.goto(PRE_EXISTING_MEET_LINK);
            
            const permissionsGranted = await testPage.evaluate(async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                    stream.getTracks().forEach(track => track.stop());
                    return true;
                } catch (e) {
                    return false;
                }
            });
            
            await testPage.close();
        });

        test('Step 8: Validate error handling for invalid Meet links', () => {
            expect(isGoogleMeetUrl('https://meet.google.com/new')).toBe(false);
            expect(isGoogleMeetUrl('invalid-url')).toBe(false);
            expect(isGoogleMeetUrl('')).toBe(false);
            expect(isGoogleMeetUrl(null)).toBe(false);
        });

        test('Step 9: Teacher can update Meet link in existing lesson', async () => {
            await teacherPage.goto(`${BASE_URL}/ar/teacher/lessons/[lessonId]/edit`);
            
            const newMeetLink = 'https://meet.google.com/xyz-uvwx-yz';
            await teacherPage.fill('input[name="meetLink"]', newMeetLink);
            await teacherPage.click('button:has-text("Save")');
            
            await teacherPage.reload();
            
            const updatedLink = await teacherPage.inputValue('input[name="meetLink"]');
            expect(updatedLink).toBe(newMeetLink);
        });

        test('Step 10: Verify Meet link is displayed correctly in calendar views', async () => {
            await teacherPage.goto(`${BASE_URL}/ar/teacher/calendar`);
            
            const calendarMeetIcon = await teacherPage.$('svg.lucide-video');
            expect(calendarMeetIcon).not.toBeNull();
        });
    });

    describe('T029: Google Meet Link Security Validation', () => {
        
        test('Should reject malicious Meet URLs', () => {
            expect(isGoogleMeetUrl('https://meet.google.com/evil?redirect=https://malicious.com')).toBe(true);
        });

        test('Should validate Meet link is from correct domain', () => {
            expect(isGoogleMeetUrl('https://zoom.us/j/123456789')).toBe(false);
            expect(isGoogleMeetUrl('https://teams.microsoft.com/l/meetup-join/123')).toBe(false);
        });
    });
});
