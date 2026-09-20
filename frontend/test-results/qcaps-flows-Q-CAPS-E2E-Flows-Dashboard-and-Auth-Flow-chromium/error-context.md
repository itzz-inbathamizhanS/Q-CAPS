# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qcaps-flows.spec.ts >> Q-CAPS E2E Flows >> Dashboard and Auth Flow
- Location: tests\qcaps-flows.spec.ts:16:3

# Error details

```
TypeError: expect(...).first is not a function
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
      - generic [ref=e92]:
        - heading "Welcome back, E2E Tester." [level=1] [ref=e93]
        - paragraph [ref=e94]: Continue building the skills needed for a quantum-safe future.
      - generic [ref=e95]:
        - generic [ref=e96]:
          - generic [ref=e97]:
            - generic [ref=e99]:
              - heading "Capability Readiness" [level=3] [ref=e100]
              - generic [ref=e101]: 0%
            - paragraph [ref=e107]: Based on quiz performance
          - link "View Skill Matrix" [ref=e108] [cursor=pointer]:
            - /url: /learning
        - generic [ref=e112]:
          - generic [ref=e114]:
            - heading "Active Streak" [level=3] [ref=e115]
            - generic [ref=e116]: 0 Days
          - paragraph [ref=e121]: Current learning streak
        - generic [ref=e123]:
          - generic [ref=e125]:
            - heading "Level 1" [level=3] [ref=e126]
            - generic [ref=e127]: 0 XP
          - paragraph [ref=e132]: Total Experience
        - generic [ref=e134]:
          - generic [ref=e136]:
            - heading "Global Rank" [level=3] [ref=e137]
            - generic [ref=e138]: "#5"
          - paragraph [ref=e143]: Global Leaderboard
      - generic [ref=e144]:
        - generic [ref=e145]:
          - generic [ref=e146]:
            - generic [ref=e147]: "Priority: not_attempted"
            - heading "Quantum Foundations" [level=3] [ref=e149]
            - paragraph [ref=e150]: You have not yet attempted the 'Quantum Foundations' assessment. Starting this course is recommended to establish baseline knowledge.
          - generic [ref=e151]:
            - generic [ref=e152]:
              - generic [ref=e153]:
                - generic [ref=e154]: Level
                - generic [ref=e155]: Beginner
              - generic [ref=e156]:
                - generic [ref=e157]: Duration
                - generic [ref=e158]: 140 mins
              - generic [ref=e162]: Progress (0%)
            - button [ref=e166] [cursor=pointer]
        - generic [ref=e171]:
          - generic [ref=e172]:
            - heading "OSINT Asset Discovery" [level=3] [ref=e181]
            - paragraph [ref=e182]: Use the interactive scanner to identify exposed endpoints and analyze their cryptographic posture.
          - button [ref=e183] [cursor=pointer]
      - generic [ref=e190]:
        - generic [ref=e191]:
          - heading "Recent Achievements" [level=3] [ref=e193]
          - generic [ref=e200]:
            - generic [ref=e201]: First Steps
            - generic [ref=e202]: Complete your first module
        - generic [ref=e203]:
          - heading "Weekly Practice" [level=3] [ref=e204]
          - paragraph [ref=e205]: 0 active days this week
          - generic [ref=e206]:
            - generic [ref=e207]: M
            - generic [ref=e211]: T
            - generic [ref=e215]: W
            - generic [ref=e219]: T
            - generic [ref=e223]: F
            - generic [ref=e227]: S
            - generic [ref=e231]: S
        - generic [ref=e235]:
          - generic [ref=e236]:
            - heading "PQC Skill Breakdown" [level=3] [ref=e237]
            - paragraph [ref=e238]: Current demonstrated capability by skill domain
          - generic [ref=e239]:
            - generic [ref=e241]:
              - generic [ref=e242]: Quantum & PQC
              - generic [ref=e243]: 0%
            - generic [ref=e246]:
              - generic [ref=e247]: Applied Cryptography
              - generic [ref=e248]: 0%
            - generic [ref=e251]:
              - generic [ref=e252]: Cybersecurity
              - generic [ref=e253]: 0%
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
> 22 |     await expect(page.locator('text=Total XP')).first().toBeVisible();
     |                                                 ^ TypeError: expect(...).first is not a function
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
  34 |     await page.click('button:has-text("INITIATE SCAN")');
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