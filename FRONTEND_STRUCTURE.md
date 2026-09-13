# Q-CAPS Frontend Architecture & Directory Structure

> **Path**: `d:\Q-CAPS\qcaps-frontend-main\`  
> **Development Server**: `http://localhost:5173/`  
> **Tech Stack**: React 18, Vite 5, TypeScript 5, Lucide React, Framer Motion, Recharts, Custom Design System CSS + Tailwind CSS v4 (scoped for Scanner)

---

## 1. High-Level Architecture Overview

The Q-CAPS Frontend is organized around a **feature-sliced architecture**:

```
qcaps-frontend-main/
├── public/                 # Public static assets (branding, logos, favicons)
├── scripts/                # Build & content compilation utilities
├── src/
│   ├── app/                # App-level routing and shell configuration
│   ├── assets/             # Bundled static assets (logos, images)
│   ├── components/         # Shared global design system (layout, UI atoms)
│   ├── data/               # Static course, quiz, badge, and curriculum datasets
│   ├── features/           # Domain-specific feature modules (logic, components, types)
│   │   ├── assessment/     # Interactive diagnostic assessments & domain scoring
│   │   ├── curriculum/     # Interactive 4-track curriculum graph & nodes
│   │   ├── dashboard/      # Executive & learner KPI widgets, bento grid
│   │   ├── learning/       # Course catalog, recommended modules, progress
│   │   ├── scanner/        # Quantum Recon Scanner tool & OSINT integration
│   │   └── skills/         # Skill breakdown, capability radar, gap analysis
│   ├── pages/              # Top-level route views
│   ├── services/           # Backend API clients & integration layer
│   ├── styles/             # Global design tokens, layout CSS & tactical themes
│   ├── types/              # Global TypeScript interfaces
│   └── utils/              # Local storage, data transformation helpers
```

---

## 2. Complete Annotated Directory Tree

```
qcaps-frontend-main/
│
├── .env                                # Local environment config (API URLs, ports)
├── .env.example                        # Template environment variables
├── eslint.config.js                    # ESLint 9 configuration
├── index.html                          # Single-page HTML host + Google Fonts links
├── package.json                        # Dependencies, scripts & package metadata
├── postcss.config.cjs                  # PostCSS plugins config (@tailwindcss/postcss)
├── tsconfig.json                       # Base TypeScript configuration
├── tsconfig.app.json                   # Client-side TypeScript compiler options
├── tsconfig.node.json                  # Vite Node tooling TypeScript configuration
├── vite.config.ts                      # Vite build, alias (@/*), and dev server config
│
├── public/
│   └── brand/
│       └── qcaps-logo.png              # Public-accessible logo asset
│
├── scripts/
│   └── compile-content.cjs             # Node script compiling curriculum markdown to JSON
│
└── src/
    ├── App.tsx                         # Root component rendering AppShell + Router
    ├── main.tsx                        # Application DOM entry point (React 18 createRoot)
    ├── vite-env.d.ts                   # Ambient type declarations for Vite & asset imports
    │
    ├── app/
    │   └── routes/
    │       └── index.tsx               # Master React Router v6 route configuration
    │
    ├── assets/
    │   └── brand/
    │       └── qcaps-logo.png          # High-resolution brand logo
    │
    ├── components/
    │   ├── layout/                     # Application framing and navigation shells
    │   │   ├── AppShell.tsx            # Main layout wrapper: Sidebar + Header + Content
    │   │   ├── Header.tsx              # Top navigation bar with user status and breadcrumbs
    │   │   ├── Sidebar.tsx             # Collapsible primary navigation sidebar
    │   │   └── MobileNavigation.tsx    # Responsive mobile navigation drawer / bottom bar
    │   │
    │   └── ui/                         # Atomic Design System components (Vanilla CSS tokens)
    │       ├── Badge.tsx               # Status, tag, and priority pill badges
    │       ├── Button.tsx              # Primary, secondary, ghost, and tactical buttons
    │       ├── Card.tsx                # Glassmorphic and surface content containers
    │       ├── ProgressBar.tsx         # Linear progression indicator
    │       ├── ProgressRing.tsx        # Circular SVG progress gauge
    │       └── StatCard.tsx            # KPI metric cards with indicators and trend badges
    │
    ├── data/                           # Comprehensive static data stores
    │   ├── assessmentData.ts           # 4-domain diagnostic assessment question banks
    │   ├── badgesData.ts               # Badge tiers, unlock criteria, and certificate data
    │   ├── curriculumData.ts           # 36+ module curriculum graph across Tracks A–D
    │   ├── dashboardData.ts            # Default KPI metrics, mock user, practice streaks
    │   ├── escapeRoomData.ts           # 7 Escape room challenge scenarios & terminal states
    │   ├── learningData.ts             # Course cards, lesson duration, and track groupings
    │   ├── missionsData.ts             # Quantum hacker missions and scenario playbooks
    │   └── quizzesData.ts              # Full quiz question banks for all curriculum modules
    │
    ├── features/                       # Modular business domain features
    │   │
    │   ├── assessment/                 # Diagnostic Skill Assessment
    │   │   ├── assessmentTypes.ts      # DomainScore, SubmissionResult, Question types
    │   │   └── components/
    │   │       ├── AnswerOption.tsx    # Multiple-choice selectable option card
    │   │       ├── AssessmentActions.ts# Next, Previous, and Submit action triggers
    │   │       ├── AssessmentHeader.tsx# Assessment timer, domain tag, and progress bar
    │   │       ├── AssessmentResult.tsx# Radar graph & domain breakdown results screen
    │   │       ├── AssessmentReviewModal.tsx # Pre-submission unanswered check modal
    │   │       └── QuestionCard.tsx    # Assessment question presentation container
    │   │
    │   ├── curriculum/                 # 4-Track Visual Curriculum Graph
    │   │   ├── curriculumTypes.ts      # Track, Module, Prerequisite & Status types
    │   │   ├── curriculumStore.ts      # Zustand/local store for module completion states
    │   │   └── components/
    │   │       ├── ModuleNode.tsx      # Individual interactive curriculum module node
    │   │       └── TrackSection.tsx    # Section wrapper for Tracks A, B, C, and D
    │   │
    │   ├── dashboard/                  # Dashboard Analytics & Widgets
    │   │   └── components/
    │   │       ├── BentoSection.tsx    # 8-col recommended module + 4-col daily challenge
    │   │       ├── KpiSection.tsx      # 4-column KPI metric summary cards
    │   │       └── LowerSection.tsx    # 3-column achievements, streak & skill domains
    │   │
    │   ├── learning/                   # Learning Modules & Courses
    │   │   ├── learningTypes.ts        # Course, Lesson, and Module schema definitions
    │   │   ├── learningRecommendation.ts# Client-side heuristic recommendation fallback
    │   │   └── components/
    │   │       ├── LearningCatalog.tsx # Filterable grid of all training courses
    │   │       ├── LearningEmptyState.tsx # Filter reset placeholder view
    │   │       ├── LearningHeader.tsx  # Track search, filters, and catalog statistics
    │   │       ├── LearningModuleCard.tsx # Course preview card with progress meter
    │   │       └── RecommendedLearning.tsx# Highlighted next course banner
    │   │
    │   ├── scanner/                    # Quantum Recon Scanner Engine
    │   │   ├── scannerService.js       # Client caller for Python Flask scanner (Port 5000)
    │   │   ├── ScannerTool.d.ts        # TypeScript declaration for JSX component
    │   │   └── ScannerTool.jsx         # Full cyber-terminal OSINT & crypto scanner UI
    │   │
    │   └── skills/                     # Skill Profile & Gap Analysis
    │       ├── skillsTypes.ts          # Competency levels & domain skill types
    │       └── components/
    │           ├── CapabilitySummary.tsx# Executive skill readiness summary card
    │           ├── PriorityGap.tsx     # High-priority skills requiring remediation
    │           ├── SkillBreakdown.tsx  # Granular topic percentage gauges
    │           ├── SkillDomainCard.tsx # Detailed card with domain sub-skills
    │           └── SkillsEmptyState.tsx# Placeholder before assessment completion
    │
    ├── pages/                          # Primary Application Views
    │   ├── Dashboard.tsx               # Executive dashboard: KPIs, recommendations, streak
    │   ├── Assessment.tsx              # Interactive diagnostic assessment exam view
    │   ├── Skills.tsx                  # Skill inventory, domain competency & gap report
    │   ├── Learning.tsx                # Training catalog and enrolled courses view
    │   ├── CourseModule.tsx            # Deep lesson reader with interactive content
    │   ├── CurriculumMap.tsx           # Full visual node-graph of 36+ modules
    │   ├── QuizPage.tsx                # Knowledge-check quiz runner with score feedback
    │   ├── ScannerPage.tsx             # Quantum Recon Scanner page (wrapper for ScannerTool)
    │   ├── MissionHub.tsx              # Cyber assessment missions & tactical challenges
    │   ├── MissionPlay.tsx             # Live interactive hacker assessment mission player
    │   ├── EscapeRoomPage.tsx          # Cryptographic migration escape room challenge lab
    │   └── BadgesAndCerts.tsx          # Micro-credentials, badges & certification tracker
    │
    ├── services/                       # API Integration Layer
    │   └── backendService.ts           # Client for Vishnu Priya's FastAPI Backend (Port 8000)
    │                                   # (Profiles, Recommendations, Leaderboard, Logging)
    │
    ├── styles/                         # Style Sheets & Design Systems
    │   ├── index.css                   # Core Design System: HSL tokens, typography, glass UI
    │   └── scanner.css                 # Isolated Tailwind CSS v4 & cyber-terminal styling
    │
    ├── types/                          # Shared Global Type Definitions
    │   └── index.ts                    # Root TypeScript exports and global entities
    │
    └── utils/                          # Utility & Persistence Helpers
        └── assessmentStorage.ts        # LocalStorage serialization for assessment states
```

---

## 3. Routing Table (`src/app/routes/index.tsx`)

| Path | Component | Description |
|---|---|---|
| `/` | `Dashboard` | Executive overview, live readiness score, and course recommendations |
| `/assessment` | `Assessment` | Diagnostic assessment engine across 4 cryptographic domains |
| `/skills` | `Skills` | Competency matrix, skill gap analysis, and readiness breakdown |
| `/learning` | `Learning` | Filterable catalog of all training tracks and courses |
| `/learning/:moduleId` | `CourseModule` | Full-text lesson reader with interactive components |
| `/curriculum` | `CurriculumMap` | Visual interactive node graph of Tracks A, B, C, and D |
| `/quiz/:moduleId` | `QuizPage` | Knowledge-check quiz runner feeding XP into the scoring backend |
| `/scanner` | `ScannerPage` | Quantum Recon Scanner (OSINT, SSL/TLS, Shor vulnerability analysis) |
| `/missions` | `MissionHub` | List of scenario-based quantum defense challenges |
| `/missions/:missionId` | `MissionPlay` | Interactive tactical cybersecurity simulation |
| `/challenges` | `EscapeRoomPage`| Cryptographic agility escape room scenario lab |
| `/badges` | `BadgesAndCerts`| Unlocked badge showcase and professional certification tracks |

---

## 4. Backend Communication & Integration Architecture

The frontend communicates with **two independent microservices**:

```
                              ┌───────────────────────────────────┐
                              │     Q-CAPS React Frontend         │
                              │       http://localhost:5173       │
                              └─────────┬───────────────┬─────────┘
                                        │               │
                                        │               │
                 POST /api/scan (Port 5000)             │ REST API (Port 8000)
             [scannerService.js]        │               │ [backendService.ts]
                                        ▼               ▼
                      ┌──────────────────────┐   ┌───────────────────────────┐
                      │    Scanner Engine    │   │     Analytics Backend     │
                      │   (Python / Flask)   │   │     (Python / FastAPI)    │
                      │                      │   │                           │
                      │ • SSL handshake      │   │ • User Profiles           │
                      │ • DNS & WHOIS lookup │   │ • Recommendation Engine   │
                      │ • Shor Threat Engine │   │ • Dynamic Leaderboard     │
                      └──────────────────────┘   │ • Quiz & Scanner DB Logs  │
                                                 └─────────────┬─────────────┘
                                                               │
                                                               ▼
                                                 ┌───────────────────────────┐
                                                 │   SQLite DB (qcaps.db)    │
                                                 └───────────────────────────┘
```

1. **Scanner API (`http://127.0.0.1:5000/api/scan`)**:
   - Called by `src/features/scanner/scannerService.js` to perform live OSINT and cryptographic scans against target domains.
2. **Analytics & Scoring Backend (`http://127.0.0.1:8000/api`)**:
   - Managed via `src/services/backendService.ts`.
   - Fetches live `UserProfile`, global rankings (`/leaderboard`), and algorithmic course recommendations (`/users/1/recommendation`).
   - Receives scan findings (`/scanner/log`) and quiz submissions (`/quizzes/submit`) to calculate user readiness and update skill gap priorities.
