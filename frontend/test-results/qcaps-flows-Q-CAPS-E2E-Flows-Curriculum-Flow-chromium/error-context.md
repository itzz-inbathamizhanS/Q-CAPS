# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qcaps-flows.spec.ts >> Q-CAPS E2E Flows >> Curriculum Flow
- Location: tests\qcaps-flows.spec.ts:45:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Mark as Complete')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text=Mark as Complete') with timeout 5000ms
  - waiting for locator('text=Mark as Complete')

```

```yaml
- complementary:
  - img "Q-CAPS Logo"
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
      - img
      - text: Dashboard
    - link "My Learning":
      - /url: /learning
      - img
      - text: My Learning
    - link "Curriculum Map":
      - /url: /curriculum
      - img
      - text: Curriculum Map
    - link "Assessments":
      - /url: /assessment
      - img
      - text: Assessments
    - link "Practical Labs":
      - /url: /escape-room
      - img
      - text: Practical Labs
    - link "Mission Control":
      - /url: /missions
      - img
      - text: Mission Control
    - link "Crypto Scanner":
      - /url: /scanner
      - img
      - text: Crypto Scanner
    - text: Metrics
    - link "Progress":
      - /url: /reassessment
      - img
      - text: Progress
    - link "Skills Profile":
      - /url: /skills
      - img
      - text: Skills Profile
    - link "Badges & Certs":
      - /url: /badges
      - img
      - text: Badges & Certs
    - link "Leaderboard":
      - /url: /organization
      - img
      - text: Leaderboard
  - text: Logged in as
  - strong: E2E Tester
  - button "Logout":
    - img
    - text: Logout
- banner:
  - img
  - textbox "Search assessments & modules..."
  - button "Notifications":
    - img
  - button "Help & Documentation":
    - img
  - text: E2
- main:
  - text: Q-CAPS / Learning
  - img
  - text: Full Curriculum Catalog
  - heading "Curriculum Hub" [level=1]
  - paragraph: Structured progression from foundations to enterprise quantum security. Begin with Track A.
  - img
  - text: Operator Level Level 1 Total XP 0 Streak
  - img
  - text: 0d Next Lv. 500 XP
  - img
  - text: COMPLETE YOUR BASELINE
  - heading "Unlock Personalized Learning Recommendations" [level=3]
  - paragraph: Complete the initial Q-CAPS diagnostic assessment to identify your exact skill gaps and generate a prioritized curriculum path.
  - button "Start Diagnostic Assessment":
    - img
    - text: Start Diagnostic Assessment
    - img
  - img
  - text: Full Catalog
  - heading "All Learning Modules" [level=2]
  - paragraph: Follow the structured Q-CAPS progression from foundations to enterprise quantum security.
  - img
  - textbox "Search modules..."
  - button "All Modules"
  - button "Foundations"
  - button "Cryptography"
  - button "PQC"
  - button "Applied PQC"
  - text: Track A Foundations CQF · Certificate in Quantum Foundations Progress 0 / 8 8 modules A1 → Available
  - heading "Computing Foundations" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Explain what a computer actually does at the hardware level (CPU, memory, storage).
  - img
  - text: Understand what an operating system and a process are, and why that matters for security later.
  - img
  - text: Write and run basic Python programs.
  - img
  - text: 120 min
  - img
  - text: 8 sections Beginner
  - button "Start Module":
    - text: Start Module
    - img
  - text: A2 🔒 Locked
  - heading "Mathematics Foundations" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete A1 — Computing Foundations to unlock
  - img
  - text: 150 min
  - img
  - text: 8 sections Beginner
  - img
  - text: Locked A3 🔒 Locked
  - heading "Networking Foundations" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete A2 — Mathematics Foundations to unlock
  - img
  - text: 130 min
  - img
  - text: 10 sections Beginner
  - img
  - text: Locked A4 🔒 Locked
  - heading "Cybersecurity Foundations" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete A3 — Networking Foundations to unlock
  - img
  - text: 130 min
  - img
  - text: 9 sections Beginner
  - img
  - text: Locked A5 🔒 Locked
  - heading "Cryptography Foundations" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete A4 — Cybersecurity Foundations to unlock
  - img
  - text: 140 min
  - img
  - text: 11 sections Beginner
  - img
  - text: Locked A6 🔒 Locked
  - heading "Quantum Foundations" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete A5 — Cryptography Foundations to unlock
  - img
  - text: 140 min
  - img
  - text: 11 sections Beginner
  - img
  - text: Locked A7 🔒 Locked
  - heading "A 1-qubit circuit" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete A6 — Quantum Foundations to unlock
  - img
  - text: 150 min
  - img
  - text: 8 sections Beginner
  - img
  - text: Locked A8 🔒 Locked
  - 'heading "Module 3: PQC Mitigation" [level=3]'
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete A7 — A 1-qubit circuit to unlock
  - img
  - text: 110 min
  - img
  - text: 7 sections Intermediate
  - img
  - text: Locked Track B Intermediate / Engineering CQSE · Certificate in Quantum Security Engineering Progress 0 / 11 11 modules B1 🔒 Locked
  - heading "Advanced Mathematics for Quantum" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: "Complete A8 — Module 3: PQC Mitigation to unlock"
  - img
  - text: 160 min
  - img
  - text: 9 sections Intermediate
  - img
  - text: Locked B2 🔒 Locked
  - heading "Quantum Information" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B1 — Advanced Mathematics for Quantum to unlock
  - img
  - text: 150 min
  - img
  - text: 9 sections Intermediate
  - img
  - text: Locked B3 🔒 Locked
  - heading "Quantum Algorithms" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B2 — Quantum Information to unlock
  - img
  - text: 180 min
  - img
  - text: 11 sections Intermediate
  - img
  - text: Locked B4 🔒 Locked
  - heading "Quantum Programming" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B3 — Quantum Algorithms to unlock
  - img
  - text: 170 min
  - img
  - text: 10 sections Intermediate
  - img
  - text: Locked B5 🔒 Locked
  - heading "Quantum Hardware" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B4 — Quantum Programming to unlock
  - img
  - text: 140 min
  - img
  - text: 10 sections Intermediate
  - img
  - text: Locked B6 🔒 Locked
  - heading "Network & Security Engineering" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B5 — Quantum Hardware to unlock
  - img
  - text: 150 min
  - img
  - text: 11 sections Intermediate
  - img
  - text: Locked B7 🔒 Locked
  - heading "Advanced Cryptography" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B6 — Network & Security Engineering to unlock
  - img
  - text: 160 min
  - img
  - text: 11 sections Intermediate
  - img
  - text: Locked B8 🔒 Locked
  - heading "Quantum Threats" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B7 — Advanced Cryptography to unlock
  - img
  - text: 140 min
  - img
  - text: 8 sections Intermediate
  - img
  - text: Locked B9 🔒 Locked
  - heading "PQC Fundamentals" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B8 — Quantum Threats to unlock
  - img
  - text: 150 min
  - img
  - text: 8 sections Intermediate
  - img
  - text: Locked B10 🔒 Locked
  - heading "PQC Standards" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B9 — PQC Fundamentals to unlock
  - img
  - text: 130 min
  - img
  - text: 6 sections Intermediate
  - img
  - text: Locked B11 🔒 Locked
  - heading "Intermediate PQC Labs" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B10 — PQC Standards to unlock
  - img
  - text: 200 min
  - img
  - text: 9 sections Intermediate
  - img
  - text: Locked Track C Advanced / Specialist QCE / PQC-E / QNE · Quantum & PQC Specialist Certification Progress 0 / 11 11 modules C1 🔒 Locked
  - heading "Advanced Quantum Information" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete B11 — Intermediate PQC Labs to unlock
  - img
  - text: 170 min
  - img
  - text: 8 sections Advanced
  - img
  - text: Locked C2 🔒 Locked
  - heading "Advanced Quantum Algorithms" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C1 — Advanced Quantum Information to unlock
  - img
  - text: 190 min
  - img
  - text: 11 sections Advanced
  - img
  - text: Locked C3 🔒 Locked
  - heading "Quantum Error Correction" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C2 — Advanced Quantum Algorithms to unlock
  - img
  - text: 180 min
  - img
  - text: 10 sections Advanced
  - img
  - text: Locked C4 🔒 Locked
  - heading "Quantum Networking" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C3 — Quantum Error Correction to unlock
  - img
  - text: 150 min
  - img
  - text: 9 sections Advanced
  - img
  - text: Locked C5 🔒 Locked
  - heading "Quantum Communications" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C4 — Quantum Networking to unlock
  - img
  - text: 140 min
  - img
  - text: 8 sections Advanced
  - img
  - text: Locked C6 🔒 Locked
  - heading "Quantum Key Distribution" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C5 — Quantum Communications to unlock
  - img
  - text: 160 min
  - img
  - text: 11 sections Advanced
  - img
  - text: Locked C7 🔒 Locked
  - heading "Advanced Cryptography" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C6 — Quantum Key Distribution to unlock
  - img
  - text: 170 min
  - img
  - text: 10 sections Advanced
  - img
  - text: Locked C8 🔒 Locked
  - heading "PQC Mathematics" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C7 — Advanced Cryptography to unlock
  - img
  - text: 190 min
  - img
  - text: 10 sections Advanced
  - img
  - text: Locked C9 🔒 Locked
  - heading "PQC Implementation Engineering" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C8 — PQC Mathematics to unlock
  - img
  - text: 200 min
  - img
  - text: 12 sections Advanced
  - img
  - text: Locked C10 🔒 Locked
  - heading "PQC Attack Surface" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C9 — PQC Implementation Engineering to unlock
  - img
  - text: 180 min
  - img
  - text: 12 sections Advanced
  - img
  - text: Locked C11 🔒 Locked
  - heading "PQC Defense Engineering" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C10 — PQC Attack Surface to unlock
  - img
  - text: 190 min
  - img
  - text: 14 sections Advanced
  - img
  - text: Locked Track D Enterprise Architect QSA · Quantum Security Architect Certificate Progress 0 / 6 6 modules E1 🔒 Locked
  - heading "Quantum Risk Management" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete C11 — PQC Defense Engineering to unlock
  - img
  - text: 130 min
  - img
  - text: 7 sections Enterprise
  - img
  - text: Locked E2 🔒 Locked
  - heading "Cryptographic Discovery" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete E1 — Quantum Risk Management to unlock
  - img
  - text: 140 min
  - img
  - text: 8 sections Enterprise
  - img
  - text: Locked E3 🔒 Locked
  - heading "Quantum Readiness Assessment" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete E2 — Cryptographic Discovery to unlock
  - img
  - text: 140 min
  - img
  - text: 6 sections Enterprise
  - img
  - text: Locked E4 🔒 Locked
  - heading "Crypto-Agility" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete E3 — Quantum Readiness Assessment to unlock
  - img
  - text: 130 min
  - img
  - text: 8 sections Enterprise
  - img
  - text: Locked E5 🔒 Locked
  - heading "Enterprise PQC Migration" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete E4 — Crypto-Agility to unlock
  - img
  - text: 160 min
  - img
  - text: 12 sections Enterprise
  - img
  - text: Locked E6 🔒 Locked
  - heading "Governance" [level=3]
  - paragraph: Master foundational concepts and techniques for this curriculum track.
  - img
  - text: Complete E5 — Enterprise PQC Migration to unlock
  - img
  - text: 130 min
  - img
  - text: 10 sections Enterprise
  - img
  - text: Locked
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
> 54 |     await expect(page.locator('text=Mark as Complete')).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
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