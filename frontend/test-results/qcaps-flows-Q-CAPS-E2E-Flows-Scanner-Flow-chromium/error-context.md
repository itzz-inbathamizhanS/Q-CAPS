# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qcaps-flows.spec.ts >> Q-CAPS E2E Flows >> Scanner Flow
- Location: tests\qcaps-flows.spec.ts:25:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("INITIATE SCAN")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - img "Q-CAPS Logo" [ref=e6]
    - navigation [ref=e7]:
      - link "Dashboard" [ref=e8] [cursor=pointer]:
        - /url: /dashboard
      - link "My Learning" [ref=e12] [cursor=pointer]:
        - /url: /learning
      - link "Curriculum Map" [ref=e17] [cursor=pointer]:
        - /url: /curriculum
      - link "Assessments" [ref=e22] [cursor=pointer]:
        - /url: /assessment
      - link "Practical Labs" [ref=e27] [cursor=pointer]:
        - /url: /escape-room
      - link "Mission Control" [ref=e31] [cursor=pointer]:
        - /url: /missions
      - link "Crypto Scanner" [ref=e38] [cursor=pointer]:
        - /url: /scanner
      - generic [ref=e43]: Metrics
      - link "Progress" [ref=e44] [cursor=pointer]:
        - /url: /reassessment
      - link "Skills Profile" [ref=e49] [cursor=pointer]:
        - /url: /skills
      - link "Badges & Certs" [ref=e54] [cursor=pointer]:
        - /url: /badges
      - link "Leaderboard" [ref=e59] [cursor=pointer]:
        - /url: /organization
    - generic [ref=e67]:
      - generic [ref=e68]:
        - text: Logged in as
        - strong [ref=e69]: E2E Tester
      - button "Logout" [ref=e70] [cursor=pointer]
  - generic [ref=e75]:
    - banner [ref=e76]:
      - textbox "Search assessments & modules..." [ref=e79]
      - generic [ref=e80]:
        - button "Notifications" [ref=e81] [cursor=pointer]
        - button "Help & Documentation" [ref=e86] [cursor=pointer]
        - generic "E2E Tester" [ref=e90] [cursor=pointer]: E2
    - main [ref=e91]:
      - generic [ref=e93]:
        - generic [ref=e94]:
          - heading "Quantum Recon Scanner" [level=1] [ref=e95]
          - paragraph [ref=e96]: INITIATE CRYPTOGRAPHIC & OSINT VECTOR ANALYSIS
        - generic [ref=e97]:
          - generic [ref=e98]:
            - generic: travel_explore
            - textbox "Enter target domain vector — e.g. target.com" [active] [ref=e99]: google.com
          - button "EXECUTE" [ref=e100] [cursor=pointer]
        - generic [ref=e101]:
          - button "google.com" [ref=e102] [cursor=pointer]
          - button "github.com" [ref=e103] [cursor=pointer]
          - button "amazon.com" [ref=e104] [cursor=pointer]
          - button "facebook.com" [ref=e105] [cursor=pointer]
        - generic [ref=e106]:
          - heading "Recent Scans" [level=3] [ref=e107]
          - paragraph [ref=e108]: Awaiting input vector...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Q-CAPS E2E Flows', () => {
  4  |   // Helper to handle login
  5  |   const ensureLogin = async (page) => {
  6  |     await page.goto('/');
  7  |     const loginHeader = page.locator('text=Q-CAPS Terminal');
  8  |     if (await loginHeader.isVisible({ timeout: 3000 })) {
  9  |       await page.fill('input[type="text"]', 'E2E Tester');
  10 |       await page.click('button:has-text("Initialize Session")');
  11 |     }
  12 |     // Wait for the dashboard header to appear to ensure we are logged in
  13 |     await expect(page.locator('h1.dashboard-title')).toContainText('Welcome back,', { timeout: 10000 });
  14 |   };
  15 | 
  16 |   test('Dashboard and Auth Flow', async ({ page }) => {
  17 |     await ensureLogin(page);
  18 |     
  19 |     // Verify Dashboard
  20 |     await expect(page.locator('text=Global Rank')).toBeVisible();
  21 |     await expect(page.locator('text=Capability Readiness')).toBeVisible();
  22 |     await expect(page.locator('text=Total XP')).first().toBeVisible();
  23 |   });
  24 | 
  25 |   test('Scanner Flow', async ({ page }) => {
  26 |     await ensureLogin(page);
  27 | 
  28 |     // Navigate to Scanner
  29 |     await page.click('a[href="/scanner"]');
  30 |     await expect(page.locator('h1:has-text("Quantum Recon Scanner")')).toBeVisible();
  31 | 
  32 |     // Run Scan
  33 |     await page.fill('input[placeholder="Enter target domain vector — e.g. target.com"]', 'google.com');
> 34 |     await page.click('button:has-text("INITIATE SCAN")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  35 | 
  36 |     // Wait for scan to complete (it has a 6-second delay in the UI)
  37 |     await expect(page.locator('text=TARGET ACQUIRED')).toBeVisible({ timeout: 15000 });
  38 |     
  39 |     // Verify results UI
  40 |     await expect(page.locator('text=DOMAIN RECON')).toBeVisible();
  41 |     await expect(page.locator('text=DNS RECORDS')).toBeVisible();
  42 |     await expect(page.locator('text=QUANTUM THREAT ANALYSIS')).toBeVisible();
  43 |   });
  44 | 
  45 |   test('Curriculum Flow', async ({ page }) => {
  46 |     await ensureLogin(page);
  47 | 
  48 |     // Navigate to Learning
  49 |     await page.click('a[href="/learning"]');
  50 |     await expect(page.locator('h1:has-text("Curriculum Hub")')).toBeVisible();
  51 | 
  52 |     // Click on a module
  53 |     await page.click('text=Computing Foundations');
  54 |     await expect(page.locator('text=Mark as Complete')).toBeVisible();
  55 |   });
  56 | 
  57 |   test('Assessment Flow', async ({ page }) => {
  58 |     await ensureLogin(page);
  59 | 
  60 |     // Navigate to Assessment
  61 |     await page.click('a[href="/assessment"]');
  62 |     await expect(page.locator('h2:has-text("Module assessment")')).toBeVisible();
  63 | 
  64 |     // Start assessment
  65 |     await page.click('button:has-text("Begin Diagnostic Assessment")');
  66 |     await expect(page.locator('text=Question 1 of')).toBeVisible();
  67 |   });
  68 | });
  69 | 
  70 | 
  71 | 
```