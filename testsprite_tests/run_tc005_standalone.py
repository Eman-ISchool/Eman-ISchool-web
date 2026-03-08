import asyncio
import re
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        print("1. Login as Teacher")
        # Use 127.0.0.1 and relaxed wait
        await page.goto("http://127.0.0.1:3000/en/auth/signin", timeout=60000, wait_until="domcontentloaded")
        await page.fill("input[type='email']", "teacher@eduverse.com")
        await page.fill("input[type='password']", "password123")
        await page.click("button[type='submit']")

        print("Wait for navigation to dashboard")
        # Expect /en/teacher/home
        await expect(page).to_have_url(re.compile(r"/en/teacher/home"), timeout=30000)
        
        # Check for English welcome message to verify locale
        # "Welcome" or "Good" (morning/evening)
        # Verify we are NOT seeing Arabic
        content = await page.content()
        if "صباح الخير" in content or "مساء الخير" in content:
             print("WARNING: Arabic text detected in dashboard!")
        else:
             print("Locale seems to be English.")

        print("2. Navigate to Courses")
        # Use simple navigation
        await page.goto("http://127.0.0.1:3000/en/teacher/courses", wait_until="domcontentloaded")
        
        print("3. Add Lesson to first course")
        # Find a course card or assume we can click the first one if listing exists
        # We will try to find a link to a course detail
        # If no courses, this might fail, but let's assume seed data
        # We'll try to click the first card that links to a course
        
        # Wait for courses to load
        await page.wait_for_selector("a[href*='/teacher/courses/']", timeout=10000)
        
        # Get all links matching /teacher/courses/ID
        links = await page.locator("a[href*='/teacher/courses/']").all()
        # Filter out "new" if present
        course_link = None
        for link in links:
             href = await link.get_attribute("href")
             if href and "/new" not in href and href != "/teacher/courses":
                  course_link = link
                  break
        
        if course_link:
             print(f"Found course link, clicking...")
             await course_link.click()
        else:
             print("No course found. Creating one is out of scope for this specific test script, aborting.")
             await browser.close()
             return

        print("4. Click Add Lesson")
        # Find Add Lesson button
        await page.click("a[href*='/lessons/new']")
        
        print("5. Fill Lesson Form")
        await page.wait_for_selector("input[name='title']")
        
        lesson_title = "Test Lesson with Meet Link"
        meet_link = "https://meet.google.com/test-link-standalone"

        await page.fill("input[name='title']", lesson_title)
        
         # Set Date/Time
        await page.evaluate("document.querySelector('input[name=\"startDateTime\"]').value = '2026-06-01T10:00';")
        await page.fill("input[name='duration']", "60")

        print("6. Enter Manual Google Meet Link")
        # Check if checkbox exists (SHOULD NOT)
        checkbox_count = await page.locator("input[name='generateMeet']").count()
        if checkbox_count > 0:
             print("FAILURE: Auto-generate checkbox still exists!")
        else:
             print("SUCCESS: Auto-generate checkbox is gone.")

        await page.fill("input[name='meetLink']", meet_link)

        print("7. Save")
        await page.click("button[type='submit']")

        print("8. Verify Success")
        await expect(page).to_have_url(re.compile(r"/teacher/courses/.*"), timeout=15000)
        
        print("9. Verify Link Visibility")
        # Check if the title is visible
        await expect(page.locator(f"text={lesson_title}")).to_be_visible()
        
        # Check if link is present
        link_visible = await page.locator(f"a[href='{meet_link}']").is_visible()
        if link_visible:
             print("Test PASSED: Manual Meet Link saved and visible.")
        else:
             print("Test FAILED: Link not visible.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
