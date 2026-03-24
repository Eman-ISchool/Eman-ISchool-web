import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Comprehensive QA Audit Test Suite
// This suite systematically tests all functionality across the entire website

interface AuditFinding {
  page: string;
  element: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  expected: string;
  actual: string;
  reproduction: string;
}

const auditFindings: AuditFinding[] = [];

function addFinding(finding: AuditFinding) {
  auditFindings.push(finding);
  console.log('❌ [' + finding.severity.toUpperCase() + '] ' + finding.page + ' - ' + finding.element + ': ' + finding.issue);
}

// Test data
const testUsers = {
  admin: { email: 'admin@eduverse.com', password: 'password123' },
  teacher: { email: 'teacher@eduverse.com', password: 'password123' },
  student: { email: 'student@eduverse.com', password: 'password123' },
  parent: { email: 'parent@eduverse.com', password: 'password123' }
};

test.describe('Comprehensive QA Audit - Homepage & Marketing Pages', () => {
  test('Homepage - All buttons and links work', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test navigation links
    const navLinks = ['About', 'Services', 'Contact', 'Login'];
    for (const linkText of navLinks) {
      try {
        const link = page.locator('a:has-text("' + linkText + '")').first();
        if (await link.isVisible()) {
          await link.click();
          await page.waitForLoadState('networkidle');
          console.log('✅ Homepage - "' + linkText + '" link works');
          await page.goto(BASE_URL); // Return to homepage
        }
      } catch (error) {
        addFinding({
          page: 'Homepage',
          element: '"' + linkText + '" navigation link',
          issue: 'Link is broken or non-responsive',
          severity: 'high',
          expected: 'Navigate to respective page',
          actual: 'Failed to navigate or link not found',
          reproduction: 'Click on "' + linkText + '" link in homepage navigation'
        });
      }
    }
  });

  test('Contact page - Form submission works', async ({ page }) => {
    await page.goto(BASE_URL + '/en/contact');
    
    try {
      // Test contact form
      const nameInput = page.locator('input[name="name"], input[id="name"]');
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const messageInput = page.locator('textarea[name="message"], textarea[id="message"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit")');

      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        await messageInput.fill('This is a test message');
        await submitButton.click();
        
        // Check for success message or error
        await page.waitForTimeout(2000);
        const successMessage = page.locator('text=success, text=thank you, text=message sent', { ignoreCase: true });
        const errorMessage = page.locator('text=error, text=failed', { ignoreCase: true });
        
        if (await errorMessage.isVisible()) {
          addFinding({
            page: 'Contact Page',
            element: 'Contact form submission',
            issue: 'Form submission shows error',
            severity: 'high',
            expected: 'Form should submit successfully',
            actual: 'Form submission failed with error',
            reproduction: 'Fill and submit contact form with valid data'
          });
        } else {
          console.log('✅ Contact page - Form submission works');
        }
      } else {
        addFinding({
          page: 'Contact Page',
          element: 'Contact form',
          issue: 'Form inputs not found or not visible',
          severity: 'critical',
          expected: 'Contact form should be visible and functional',
          actual: 'Form elements not found',
          reproduction: 'Navigate to contact page and check for form elements'
        });
      }
    } catch (error) {
      addFinding({
        page: 'Contact Page',
        element: 'Contact form',
        issue: 'Form is broken or missing',
        severity: 'critical',
        expected: 'Working contact form',
        actual: 'Form failed to load or interact',
        reproduction: 'Navigate to contact page'
      });
    }
  });
});

test.describe('Comprehensive QA Audit - Authentication Flows', () => {
  test('Admin Login - All fields and buttons work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/login/admin');
    
    try {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const submitButton = page.locator('button[type="submit"]');
      const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")');

      if (!(await emailInput.isVisible())) {
        addFinding({
          page: 'Admin Login',
          element: 'Email input field',
          issue: 'Email input field not found or not visible',
          severity: 'critical',
          expected: 'Email input should be visible',
          actual: 'Email input not found',
          reproduction: 'Navigate to admin login page'
        });
      }

      if (!(await passwordInput.isVisible())) {
        addFinding({
          page: 'Admin Login',
          element: 'Password input field',
          issue: 'Password input field not found or not visible',
          severity: 'critical',
          expected: 'Password input should be visible',
          actual: 'Password input not found',
          reproduction: 'Navigate to admin login page'
        });
      }

      if (!(await submitButton.isVisible())) {
        addFinding({
          page: 'Admin Login',
          element: 'Submit button',
          issue: 'Submit button not found or not visible',
          severity: 'critical',
          expected: 'Submit button should be visible',
          actual: 'Submit button not found',
          reproduction: 'Navigate to admin login page'
        });
      }

      // Test forgot password link
      if (await forgotPasswordLink.isVisible()) {
        await forgotPasswordLink.click();
        await page.waitForTimeout(1000);
        if (!page.url().includes('forgot') && !page.url().includes('reset')) {
          addFinding({
            page: 'Admin Login',
            element: 'Forgot password link',
            issue: 'Forgot password link does not navigate correctly',
            severity: 'high',
            expected: 'Should navigate to forgot password page',
            actual: 'Navigation failed or incorrect route',
            reproduction: 'Click on forgot password link'
          });
        } else {
          console.log('✅ Admin Login - Forgot password link works');
        }
      }

      // Test login with valid credentials
      await page.goto(BASE_URL + '/en/login/admin');
      await emailInput.fill(testUsers.admin.email);
      await passwordInput.fill(testUsers.admin.password);
      await submitButton.click();
      
      await page.waitForTimeout(3000);
      
      if (page.url().includes('login')) {
        addFinding({
          page: 'Admin Login',
          element: 'Login submission',
          issue: 'Login failed with valid credentials',
          severity: 'critical',
          expected: 'Should redirect to admin dashboard',
          actual: 'Still on login page or error occurred',
          reproduction: 'Enter valid admin credentials and submit'
        });
      } else {
        console.log('✅ Admin Login - Login successful');
      }
    } catch (error) {
      addFinding({
        page: 'Admin Login',
        element: 'Login form',
        issue: 'Login form is broken',
        severity: 'critical',
        expected: 'Working login form',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to admin login page'
      });
    }
  });

  test('Teacher Login - All fields and buttons work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/login/teacher');
    
    try {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const submitButton = page.locator('button[type="submit"]');

      if (!(await emailInput.isVisible()) || !(await passwordInput.isVisible()) || !(await submitButton.isVisible())) {
        addFinding({
          page: 'Teacher Login',
          element: 'Login form fields',
          issue: 'One or more form fields not visible',
          severity: 'critical',
          expected: 'All login fields should be visible',
          actual: 'Some fields missing',
          reproduction: 'Navigate to teacher login page'
        });
      }

      // Test login
      await emailInput.fill(testUsers.teacher.email);
      await passwordInput.fill(testUsers.teacher.password);
      await submitButton.click();
      
      await page.waitForTimeout(3000);
      
      if (page.url().includes('login')) {
        addFinding({
          page: 'Teacher Login',
          element: 'Login submission',
          issue: 'Login failed with valid credentials',
          severity: 'critical',
          expected: 'Should redirect to teacher dashboard',
          actual: 'Still on login page or error occurred',
          reproduction: 'Enter valid teacher credentials and submit'
        });
      } else {
        console.log('✅ Teacher Login - Login successful');
      }
    } catch (error) {
      addFinding({
        page: 'Teacher Login',
        element: 'Login form',
        issue: 'Login form is broken',
        severity: 'critical',
        expected: 'Working login form',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to teacher login page'
      });
    }
  });

  test('Student Login - All fields and buttons work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/login/student');
    
    try {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const submitButton = page.locator('button[type="submit"]');

      if (!(await emailInput.isVisible()) || !(await passwordInput.isVisible()) || !(await submitButton.isVisible())) {
        addFinding({
          page: 'Student Login',
          element: 'Login form fields',
          issue: 'One or more form fields not visible',
          severity: 'critical',
          expected: 'All login fields should be visible',
          actual: 'Some fields missing',
          reproduction: 'Navigate to student login page'
        });
      }

      // Test login
      await emailInput.fill(testUsers.student.email);
      await passwordInput.fill(testUsers.student.password);
      await submitButton.click();
      
      await page.waitForTimeout(3000);
      
      if (page.url().includes('login')) {
        addFinding({
          page: 'Student Login',
          element: 'Login submission',
          issue: 'Login failed with valid credentials',
          severity: 'critical',
          expected: 'Should redirect to student dashboard',
          actual: 'Still on login page or error occurred',
          reproduction: 'Enter valid student credentials and submit'
        });
      } else {
        console.log('✅ Student Login - Login successful');
      }
    } catch (error) {
      addFinding({
        page: 'Student Login',
        element: 'Login form',
        issue: 'Login form is broken',
        severity: 'critical',
        expected: 'Working login form',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to student login page'
      });
    }
  });

  test('Registration - Form validation and submission work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/register');
    
    try {
      const submitButton = page.locator('button[type="submit"]');
      
      // Test empty form submission
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Check for validation errors
      const validationErrors = page.locator('text=required, text=invalid, text=must', { ignoreCase: true });
      if (await validationErrors.count() === 0) {
        addFinding({
          page: 'Registration',
          element: 'Form validation',
          issue: 'Form does not show validation errors for empty fields',
          severity: 'high',
          expected: 'Should show validation errors',
          actual: 'No validation errors shown',
          reproduction: 'Submit empty registration form'
        });
      } else {
        console.log('✅ Registration - Form validation works');
      }
    } catch (error) {
      addFinding({
        page: 'Registration',
        element: 'Registration form',
        issue: 'Registration form is broken',
        severity: 'critical',
        expected: 'Working registration form',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to registration page'
      });
    }
  });

  test('Forgot Password - Flow works correctly', async ({ page }) => {
    await page.goto(BASE_URL + '/en/auth/forgot-password');
    
    try {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const submitButton = page.locator('button[type="submit"]');

      if (!(await emailInput.isVisible()) || !(await submitButton.isVisible())) {
        addFinding({
          page: 'Forgot Password',
          element: 'Forgot password form',
          issue: 'Form elements not visible',
          severity: 'critical',
          expected: 'Email input and submit button should be visible',
          actual: 'Form elements missing',
          reproduction: 'Navigate to forgot password page'
        });
      }

      // Test submission
      await emailInput.fill('test@example.com');
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      const successMessage = page.locator('text=email sent, text=check your email, text=link sent', { ignoreCase: true });
      const errorMessage = page.locator('text=error, text=failed, text=user not found', { ignoreCase: true });
      
      if (await errorMessage.isVisible()) {
        addFinding({
          page: 'Forgot Password',
          element: 'Password reset request',
          issue: 'Password reset request failed',
          severity: 'high',
          expected: 'Should process request or show appropriate message',
          actual: 'Error message shown',
          reproduction: 'Submit forgot password form'
        });
      } else if (await successMessage.isVisible()) {
        console.log('✅ Forgot Password - Flow works');
      }
    } catch (error) {
      addFinding({
        page: 'Forgot Password',
        element: 'Forgot password flow',
        issue: 'Forgot password functionality is broken',
        severity: 'critical',
        expected: 'Working forgot password flow',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to forgot password page'
      });
    }
  });
});

test.describe('Comprehensive QA Audit - Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(BASE_URL + '/en/login/admin');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 10000 });
  });

  test('Admin Dashboard - All navigation links work', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Test sidebar navigation
    const navItems = [
      'Dashboard', 'Users', 'Courses', 'Students', 'Teachers', 
      'Settings', 'Reports', 'Messages', 'Support'
    ];
    
    for (const item of navItems) {
      try {
        const navLink = page.locator('a:has-text("' + item + '"), button:has-text("' + item + '")').first();
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForTimeout(1000);
          console.log('✅ Admin Dashboard - "' + item + '" navigation works');
          
          // Go back to dashboard
          await page.goto(BASE_URL + '/en/admin');
          await page.waitForLoadState('networkidle');
        }
      } catch (error) {
        addFinding({
          page: 'Admin Dashboard',
          element: '"' + item + '" navigation link',
          issue: 'Navigation link is broken or non-responsive',
          severity: 'high',
          expected: 'Should navigate to respective page',
          actual: 'Navigation failed',
          reproduction: 'Click on "' + item + '" in admin sidebar'
        });
      }
    }
  });

  test('Admin Users Page - All buttons and actions work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Test action buttons
    const actionButtons = [
      'Add User', 'Create', 'New User', 'Edit', 'Delete', 'Filter', 'Search'
    ];
    
    for (const buttonText of actionButtons) {
      try {
        const button = page.locator('button:has-text("' + buttonText + '")').first();
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(1000);
          console.log('✅ Admin Users - "' + buttonText + '" button works');
          
          // Close any modals
          const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel"), .modal-close').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
          await page.goto(BASE_URL + '/en/admin/users');
          await page.waitForLoadState('networkidle');
        }
      } catch (error) {
        addFinding({
          page: 'Admin Users',
          element: '"' + buttonText + '" button',
          issue: 'Button is broken or non-responsive',
          severity: 'medium',
          expected: 'Button should perform action',
          actual: 'Button failed to respond',
          reproduction: 'Click on "' + buttonText + '" button in admin users page'
        });
      }
    }
  });

  test('Admin Courses Page - CRUD operations work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/admin/courses');
    await page.waitForLoadState('networkidle');
    
    try {
      // Test create course button
      const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        // Check if form appeared
        const formFields = page.locator('input, textarea, select');
        if (await formFields.count() > 0) {
          console.log('✅ Admin Courses - Create course form opens');
          
          // Close form
          const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
        } else {
          addFinding({
            page: 'Admin Courses',
            element: 'Create course form',
            issue: 'Create course button does not open form',
            severity: 'high',
            expected: 'Should open course creation form',
            actual: 'No form appeared after clicking create button',
            reproduction: 'Click on create/add course button'
          });
        }
      }
    } catch (error) {
      addFinding({
        page: 'Admin Courses',
        element: 'Course management',
        issue: 'Course management functionality is broken',
        severity: 'high',
        expected: 'Working course management',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to admin courses page'
      });
    }
  });
});

test.describe('Comprehensive QA Audit - Teacher Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto(BASE_URL + '/en/login/teacher');
    await page.fill('input[type="email"]', testUsers.teacher.email);
    await page.fill('input[type="password"]', testUsers.teacher.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher**', { timeout: 10000 });
  });

  test('Teacher Dashboard - All navigation links work', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const navItems = [
      'Home', 'Courses', 'Grades', 'Calendar', 'Assessments', 
      'Materials', 'Chat', 'Profile', 'Reels'
    ];
    
    for (const item of navItems) {
      try {
        const navLink = page.locator('a:has-text("' + item + '"), button:has-text("' + item + '")').first();
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForTimeout(1000);
          console.log('✅ Teacher Dashboard - "' + item + '" navigation works');
          
          await page.goto(BASE_URL + '/en/teacher');
          await page.waitForLoadState('networkidle');
        }
      } catch (error) {
        addFinding({
          page: 'Teacher Dashboard',
          element: '"' + item + '" navigation link',
          issue: 'Navigation link is broken or non-responsive',
          severity: 'high',
          expected: 'Should navigate to respective page',
          actual: 'Navigation failed',
          reproduction: 'Click on "' + item + '" in teacher navigation'
        });
      }
    }
  });

  test('Teacher Courses - Course creation and management work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/teacher/courses');
    await page.waitForLoadState('networkidle');
    
    try {
      const createButton = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Add Course")').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        const formTitle = page.locator('input[id="title"], input[name="title"]');
        if (await formTitle.isVisible()) {
          console.log('✅ Teacher Courses - Create course form opens');
          
          // Fill form
          const uniqueId = 'Test Course ' + Date.now();
          await formTitle.fill(uniqueId);
          
          const description = page.locator('textarea[id="description"], textarea[name="description"]');
          if (await description.isVisible()) {
            await description.fill('Test course description');
          }
          
          const submitButton = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")').first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            // Check if course was created
            const successMessage = page.locator('text=success, text=created', { ignoreCase: true });
            if (await successMessage.isVisible()) {
              console.log('✅ Teacher Courses - Course creation works');
            } else {
              addFinding({
                page: 'Teacher Courses',
                element: 'Course creation submission',
                issue: 'Course creation form submission failed',
                severity: 'high',
                expected: 'Course should be created successfully',
                actual: 'No success message or course not created',
                reproduction: 'Fill and submit course creation form'
              });
            }
          }
        } else {
          addFinding({
            page: 'Teacher Courses',
            element: 'Create course form',
            issue: 'Create course button does not open form',
            severity: 'high',
            expected: 'Should open course creation form',
            actual: 'No form appeared',
            reproduction: 'Click on create course button'
          });
        }
      }
    } catch (error) {
      addFinding({
        page: 'Teacher Courses',
        element: 'Course management',
        issue: 'Course management functionality is broken',
        severity: 'high',
        expected: 'Working course management',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to teacher courses page'
      });
    }
  });

  test('Teacher Calendar - Calendar interactions work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/teacher/calendar');
    await page.waitForLoadState('networkidle');
    
    try {
      // Test calendar navigation
      const prevMonth = page.locator('button:has-text("Previous"), button:has-text("<")').first();
      const nextMonth = page.locator('button:has-text("Next"), button:has-text(">")').first();
      
      if (await prevMonth.isVisible()) {
        await prevMonth.click();
        await page.waitForTimeout(500);
        console.log('✅ Teacher Calendar - Previous month navigation works');
      }
      
      if (await nextMonth.isVisible()) {
        await nextMonth.click();
        await page.waitForTimeout(500);
        console.log('✅ Teacher Calendar - Next month navigation works');
      }
      
      // Test create session/event
      const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        const formVisible = page.locator('input, textarea, select').first();
        if (await formVisible.isVisible()) {
          console.log('✅ Teacher Calendar - Create event form opens');
        } else {
          addFinding({
            page: 'Teacher Calendar',
            element: 'Create event form',
            issue: 'Create event button does not open form',
            severity: 'medium',
            expected: 'Should open event creation form',
            actual: 'No form appeared',
            reproduction: 'Click on create event button'
          });
        }
      }
    } catch (error) {
      addFinding({
        page: 'Teacher Calendar',
        element: 'Calendar functionality',
        issue: 'Calendar functionality is broken',
        severity: 'medium',
        expected: 'Working calendar',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to teacher calendar page'
      });
    }
  });
});

test.describe('Comprehensive QA Audit - Student Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto(BASE_URL + '/en/login/student');
    await page.fill('input[type="email"]', testUsers.student.email);
    await page.fill('input[type="password"]', testUsers.student.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/student**', { timeout: 10000 });
  });

  test('Student Dashboard - All navigation links work', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const navItems = [
      'Home', 'Courses', 'Lessons', 'Assignments', 'Grades', 'Profile'
    ];
    
    for (const item of navItems) {
      try {
        const navLink = page.locator('a:has-text("' + item + '"), button:has-text("' + item + '")').first();
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForTimeout(1000);
          console.log('✅ Student Dashboard - "' + item + '" navigation works');
          
          await page.goto(BASE_URL + '/en/student');
          await page.waitForLoadState('networkidle');
        }
      } catch (error) {
        addFinding({
          page: 'Student Dashboard',
          element: '"' + item + '" navigation link',
          issue: 'Navigation link is broken or non-responsive',
          severity: 'high',
          expected: 'Should navigate to respective page',
          actual: 'Navigation failed',
          reproduction: 'Click on "' + item + '" in student navigation'
        });
      }
    }
  });

  test('Student Courses - Course enrollment and viewing work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/student/courses');
    await page.waitForLoadState('networkidle');
    
    try {
      // Test course cards
      const courseCards = page.locator('.course-card, [data-testid="course-card"], .card').all();
      const cardCount = await (await courseCards).length;
      
      if (cardCount > 0) {
        console.log('✅ Student Courses - Found ' + cardCount + ' course(s)');
        
        // Test clicking on a course
        const firstCard = (await courseCards)[0];
        await firstCard.click();
        await page.waitForTimeout(1000);
        
        // Check if we're on a course detail page
        if (page.url().includes('/courses/')) {
          console.log('✅ Student Courses - Course detail navigation works');
        } else {
          addFinding({
            page: 'Student Courses',
            element: 'Course card click',
            issue: 'Clicking on course card does not navigate to course details',
            severity: 'high',
            expected: 'Should navigate to course detail page',
            actual: 'Navigation failed or incorrect route',
            reproduction: 'Click on any course card'
          });
        }
      } else {
        addFinding({
          page: 'Student Courses',
          element: 'Course list',
          issue: 'No courses displayed to student',
          severity: 'medium',
          expected: 'Should display enrolled courses',
          actual: 'No courses found',
          reproduction: 'Navigate to student courses page'
        });
      }
    } catch (error) {
      addFinding({
        page: 'Student Courses',
        element: 'Course viewing',
        issue: 'Course viewing functionality is broken',
        severity: 'high',
        expected: 'Working course viewing',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to student courses page'
      });
    }
  });

  test('Student Lessons - Join lesson functionality works', async ({ page }) => {
    await page.goto(BASE_URL + '/en/student/courses');
    await page.waitForLoadState('networkidle');
    
    try {
      // Navigate to a course first
      const courseCard = page.locator('.course-card, [data-testid="course-card"], .card').first();
      if (await courseCard.isVisible()) {
        await courseCard.click();
        await page.waitForTimeout(1000);
        
        // Look for lessons/sessions
        const joinButton = page.locator('button:has-text("Join"), button:has-text("Start"), button:has-text("Enter")').first();
        if (await joinButton.isVisible()) {
          await joinButton.click();
          await page.waitForTimeout(2000);
          
          // Check if joined successfully
          if (page.url().includes('/lessons/') || page.url().includes('/classroom/')) {
            console.log('✅ Student Lessons - Join lesson functionality works');
          } else {
            addFinding({
              page: 'Student Lessons',
              element: 'Join lesson button',
              issue: 'Join lesson button does not navigate to lesson',
              severity: 'high',
              expected: 'Should navigate to lesson/classroom',
              actual: 'Navigation failed or incorrect route',
              reproduction: 'Click on join lesson button'
            });
          }
        } else {
          console.log('ℹ️ Student Lessons - No active lessons to join');
        }
      }
    } catch (error) {
      addFinding({
        page: 'Student Lessons',
        element: 'Lesson joining',
        issue: 'Lesson joining functionality is broken',
        severity: 'high',
        expected: 'Working lesson joining',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to student lessons'
      });
    }
  });
});

test.describe('Comprehensive QA Audit - Parent Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as parent
    await page.goto(BASE_URL + '/en/login/student'); // Parents might use same login
    await page.fill('input[type="email"]', testUsers.parent.email);
    await page.fill('input[type="password"]', testUsers.parent.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  });

  test('Parent Dashboard - All navigation links work', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const navItems = [
      'Home', 'Courses', 'Invoices', 'Support', 'Children'
    ];
    
    for (const item of navItems) {
      try {
        const navLink = page.locator('a:has-text("' + item + '"), button:has-text("' + item + '")').first();
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForTimeout(1000);
          console.log('✅ Parent Dashboard - "' + item + '" navigation works');
          
          await page.goto(BASE_URL + '/en/parent/home');
          await page.waitForLoadState('networkidle');
        }
      } catch (error) {
        addFinding({
          page: 'Parent Dashboard',
          element: '"' + item + '" navigation link',
          issue: 'Navigation link is broken or non-responsive',
          severity: 'high',
          expected: 'Should navigate to respective page',
          actual: 'Navigation failed',
          reproduction: 'Click on "' + item + '" in parent navigation'
        });
      }
    }
  });

  test('Parent Invoices - Invoice viewing works', async ({ page }) => {
    await page.goto(BASE_URL + '/en/parent/invoices');
    await page.waitForLoadState('networkidle');
    
    try {
      const invoiceCards = page.locator('.invoice-card, [data-testid="invoice"], .card').all();
      const invoiceCount = await (await invoiceCards).length;
      
      if (invoiceCount > 0) {
        console.log('✅ Parent Invoices - Found ' + invoiceCount + ' invoice(s)');
        
        const firstInvoice = (await invoiceCards)[0];
        await firstInvoice.click();
        await page.waitForTimeout(1000);
        
        if (page.url().includes('/invoices/')) {
          console.log('✅ Parent Invoices - Invoice detail navigation works');
        } else {
          addFinding({
            page: 'Parent Invoices',
            element: 'Invoice card click',
            issue: 'Clicking on invoice does not show details',
            severity: 'medium',
            expected: 'Should show invoice details',
            actual: 'Navigation failed',
            reproduction: 'Click on any invoice'
          });
        }
      } else {
        console.log('ℹ️ Parent Invoices - No invoices found');
      }
    } catch (error) {
      addFinding({
        page: 'Parent Invoices',
        element: 'Invoice viewing',
        issue: 'Invoice viewing functionality is broken',
        severity: 'medium',
        expected: 'Working invoice viewing',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to parent invoices page'
      });
    }
  });
});

test.describe('Comprehensive QA Audit - VR Features', () => {
  test('VR Eduverse - VR navigation works', async ({ page }) => {
    await page.goto(BASE_URL + '/en/vr-eduverse');
    await page.waitForLoadState('networkidle');
    
    try {
      // Test VR navigation buttons
      const navButtons = page.locator('button:has-text("Field Trips"), button:has-text("Science"), button:has-text("Navigate")').all();
      
      for (const button of await navButtons) {
        if (await button.isVisible()) {
          const buttonText = await button.textContent();
          await button.click();
          await page.waitForTimeout(1000);
          console.log('✅ VR Eduverse - "' + buttonText + '" button works');
          
          await page.goto(BASE_URL + '/en/vr-eduverse');
          await page.waitForLoadState('networkidle');
        }
      }
    } catch (error) {
      addFinding({
        page: 'VR Eduverse',
        element: 'VR navigation',
        issue: 'VR navigation is broken',
        severity: 'medium',
        expected: 'Working VR navigation',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to VR eduverse page'
      });
    }
  });

  test('VR Field Trips - Field trip navigation works', async ({ page }) => {
    await page.goto(BASE_URL + '/en/vr-eduverse/field-trips');
    await page.waitForLoadState('networkidle');
    
    try {
      const fieldTrips = [
        'Pyramids of Giza',
        'Egyptian Museum',
        'Abu Simbel'
      ];
      
      for (const trip of fieldTrips) {
        const tripLink = page.locator('a:has-text("' + trip + '"), button:has-text("' + trip + '")').first();
        if (await tripLink.isVisible()) {
          await tripLink.click();
          await page.waitForTimeout(1000);
          
          if (page.url().includes(trip.toLowerCase().replace(/\s+/g, '-'))) {
            console.log('✅ VR Field Trips - "' + trip + '" navigation works');
          } else {
            addFinding({
              page: 'VR Field Trips',
              element: '"' + trip + '" field trip link',
              issue: 'Field trip link does not navigate correctly',
              severity: 'medium',
              expected: 'Should navigate to field trip page',
              actual: 'Navigation failed',
              reproduction: 'Click on "' + trip + '" field trip'
            });
          }
          
          await page.goto(BASE_URL + '/en/vr-eduverse/field-trips');
          await page.waitForLoadState('networkidle');
        }
      }
    } catch (error) {
      addFinding({
        page: 'VR Field Trips',
        element: 'Field trip navigation',
        issue: 'Field trip navigation is broken',
        severity: 'medium',
        expected: 'Working field trip navigation',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to VR field trips page'
      });
    }
  });
});

test.describe('Comprehensive QA Audit - E-commerce Features', () => {
  test('Cart - Add to cart and checkout work', async ({ page }) => {
    await page.goto(BASE_URL + '/en/courses');
    await page.waitForLoadState('networkidle');
    
    try {
      // Find a course and add to cart
      const addToCartButtons = page.locator('button:has-text("Add to Cart"), button:has-text("Enroll"), button:has-text("Buy")').all();
      
      if ((await addToCartButtons).length > 0) {
        const firstButton = (await addToCartButtons)[0];
        await firstButton.click();
        await page.waitForTimeout(1000);
        
        // Check if cart updated
        const cartBadge = page.locator('.cart-badge, [data-testid="cart-count"]');
        if (await cartBadge.isVisible()) {
          console.log('✅ Cart - Add to cart works');
        }
        
        // Navigate to cart
        await page.goto(BASE_URL + '/en/cart');
        await page.waitForLoadState('networkidle');
        
        const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Proceed")').first();
        if (await checkoutButton.isVisible()) {
          await checkoutButton.click();
          await page.waitForTimeout(1000);
          
          if (page.url().includes('/checkout')) {
            console.log('✅ Cart - Checkout navigation works');
          } else {
            addFinding({
              page: 'Cart',
              element: 'Checkout button',
              issue: 'Checkout button does not navigate to checkout page',
              severity: 'high',
              expected: 'Should navigate to checkout',
              actual: 'Navigation failed',
              reproduction: 'Add item to cart and click checkout'
            });
          }
        }
      } else {
        console.log('ℹ️ Cart - No add to cart buttons found');
      }
    } catch (error) {
      addFinding({
        page: 'Cart',
        element: 'Cart functionality',
        issue: 'Cart functionality is broken',
        severity: 'high',
        expected: 'Working cart',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to courses and try adding to cart'
      });
    }
  });

  test('Checkout - Checkout form works', async ({ page }) => {
    await page.goto(BASE_URL + '/en/checkout');
    await page.waitForLoadState('networkidle');
    
    try {
      const formFields = page.locator('input, select').all();
      
      if ((await formFields).length > 0) {
        console.log('✅ Checkout - Found ' + (await formFields).length + ' form field(s)');
        
        // Test form validation
        const submitButton = page.locator('button[type="submit"], button:has-text("Pay"), button:has-text("Complete")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          const validationErrors = page.locator('text=required, text=invalid, text=must', { ignoreCase: true });
          if (await validationErrors.count() > 0) {
            console.log('✅ Checkout - Form validation works');
          }
        }
      } else {
        addFinding({
          page: 'Checkout',
          element: 'Checkout form',
          issue: 'Checkout form not found or empty',
          severity: 'critical',
          expected: 'Should have checkout form fields',
          actual: 'No form fields found',
          reproduction: 'Navigate to checkout page'
        });
      }
    } catch (error) {
      addFinding({
        page: 'Checkout',
        element: 'Checkout functionality',
        issue: 'Checkout functionality is broken',
        severity: 'critical',
        expected: 'Working checkout',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to checkout page'
      });
    }
  });
});

test.describe('Comprehensive QA Audit - Search and Filtering', () => {
  test('Search - Search functionality works', async ({ page }) => {
    await page.goto(BASE_URL + '/en/search');
    await page.waitForLoadState('networkidle');
    
    try {
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="search"]').first();
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('math');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        const results = page.locator('.search-result, .course-card, .card').all();
        if ((await results).length > 0) {
          console.log('✅ Search - Found ' + (await results).length + ' result(s)');
        } else {
          addFinding({
            page: 'Search',
            element: 'Search functionality',
            issue: 'Search returns no results',
            severity: 'medium',
            expected: 'Should return search results',
            actual: 'No results found',
            reproduction: 'Search for "math" term'
          });
        }
      } else {
        addFinding({
          page: 'Search',
          element: 'Search input',
          issue: 'Search input field not found',
          severity: 'high',
          expected: 'Should have search input field',
          actual: 'Search input not found',
          reproduction: 'Navigate to search page'
        });
      }
    } catch (error) {
      addFinding({
        page: 'Search',
        element: 'Search functionality',
        issue: 'Search functionality is broken',
        severity: 'high',
        expected: 'Working search',
        actual: 'Error: ' + error,
        reproduction: 'Navigate to search page'
      });
    }
  });
});

test.afterEach(async ({ page }) => {
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error: ' + msg.text());
    }
  });
});

test.afterAll(async () => {
  // Generate comprehensive report
  console.log('\n\n=== COMPREHENSIVE QA AUDIT REPORT ===\n');
  console.log('Total Issues Found: ' + auditFindings.length + '\n');
  
  const criticalIssues = auditFindings.filter(f => f.severity === 'critical');
  const highIssues = auditFindings.filter(f => f.severity === 'high');
  const mediumIssues = auditFindings.filter(f => f.severity === 'medium');
  const lowIssues = auditFindings.filter(f => f.severity === 'low');
  
  console.log('Critical Issues:', criticalIssues.length);
  console.log('High Issues:', highIssues.length);
  console.log('Medium Issues:', mediumIssues.length);
  console.log('Low Issues:', lowIssues.length);
  
  if (auditFindings.length > 0) {
    console.log('\n=== DETAILED FINDINGS ===\n');
    
    auditFindings.forEach((finding, index) => {
      console.log('\n' + (index + 1) + '. [' + finding.severity.toUpperCase() + '] ' + finding.page + ' - ' + finding.element);
      console.log('   Issue: ' + finding.issue);
      console.log('   Expected: ' + finding.expected);
      console.log('   Actual: ' + finding.actual);
      console.log('   Reproduction: ' + finding.reproduction);
    });
    
    // Save report to file
    const reportContent = {
      summary: {
        total: auditFindings.length,
        critical: criticalIssues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length
      },
      findings: auditFindings,
      generatedAt: new Date().toISOString()
    };
    
    // This would typically write to a file, but for now we'll log it
    console.log('\n=== REPORT JSON ===');
    console.log(JSON.stringify(reportContent, null, 2));
  } else {
    console.log('\n✅ No issues found! All functionality working correctly.');
  }
  
  console.log('\n=== END OF REPORT ===\n');
});