# Q-CAPS

**Quantum Cybersecurity Assessment, Preparedness & Skills Platform**: an adaptive learning and assessment platform for
quantum-safe (post-quantum) cryptography, with server-graded quizzes, book-sourced lessons, scenario labs, decision
missions, and a cryptographic reconnaissance scanner that detects hybrid post-quantum key exchange.

**Live demo:** [qcaps.vercel.app](https://qcaps.vercel.app) (the API runs on a free tier and can take about a minute to wake
after being idle; the hosted database is rebuilt on each restart, and the scanner is not deployed publicly).

## Why

Quantum computers are expected to break RSA and elliptic-curve cryptography, and attackers can record encrypted traffic
today to decrypt it later ("harvest now, decrypt later"). Migrating takes years and needs people with the right skills.
Q-CAPS teaches those skills, measures them on the server, and lets learners observe real TLS posture.

## At a glance

| | |
|---|---|
| Curriculum | 4 tracks, 36 modules, 360 sections with executed code listings, checkpoints and sources |
| Assessment | 599 quiz items graded on the server; answer keys are never sent to the browser |
| Practice | 38 scenario labs and 11 decision missions, shown inside the lesson section they belong to |
| Gamification | XP, 90 badges, 5 certificates, leaderboard (all computed by the server) |
| Scanner | DNS, WHOIS, TLS, certificate, headers, TLS 1.3 key-exchange probe; SSRF-protected; ownership-gated active checks |
| Stack | React, TypeScript, Vite, Zustand · FastAPI, SQLAlchemy, SQLite · Flask scanner |

Track A Foundations (8 modules) · Track B Intermediate (11) · Track C Advanced (11) · Track D Enterprise (6).

## Documentation

- **[Full project overview](docs/PROJECT_OVERVIEW.md)**: everything about the project in one place
- [System understanding](docs/architecture/SYSTEM_UNDERSTANDING.md): how it actually works, findings, open items
- [Scanner](docs/architecture/SCANNER.md) · [Frontend structure](docs/architecture/FRONTEND_STRUCTURE.md)
- [Book to course map](docs/content-authoring/BOOK_COURSE_MAP.md): sources and lesson status per module

Simulated content is always labelled `SIMULATION` or `DEMO DATA`. There has been no user study yet, so no learning-outcome
claims are made.

## Repository layout

```
backend/
  main_api/        FastAPI app: auth, quizzes, course content API, progress, recommendations
  scanner_api/     Flask scanner service (TLS, certificates, PQC detection)
  tests/           pytest suite for the main API (in-memory database)
  scripts/         standalone checks: smoke_api.py, check_recommendation.py
  run_dev.py       starts a service with backend/.env loaded
  .env.example     all environment variables, documented
frontend/          React + TypeScript + Vite + Zustand single-page app
  src/             app code (features/, pages/, components/, data/)
  scripts/         content compiler and curriculum/competency validators (with tests)
content/           course source material
  Course/          module markdown (tracks A to D)
  Quizzes/         quiz question banks (JSON), the source of truth for quiz items
  curriculum/      competency model and Track A lesson plan
  packs/           book-sourced lesson packs imported with course_content.import_pack
  Labs/ Mission/ Badges/ ui-specs/   escape rooms, missions, badges and UI specs
docs/
  architecture/    system understanding report, frontend structure
  curriculum/      curriculum architecture, gap analysis, lesson design
  content-authoring/   how lesson packs are written, validated and imported; book-to-module map
  design/          UI mockups and the original interface concepts
  archive/         superseded planning documents
```

## Setup

A recent Python 3 and a current Node.js LTS are expected (the project was last verified with Python 3.14 and Node 24).

```bash
# Backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\Activate.ps1
pip install -r backend/main_api/requirements.txt -r backend/scanner_api/requirements.txt -r backend/requirements-dev.txt
cp backend/.env.example backend/.env                  # then set QCAPS_JWT_SECRET (see the file)
python backend/run_dev.py main                        # API on http://localhost:8000
python backend/run_dev.py scanner                     # scanner on http://localhost:5000 (optional)

# Frontend
cd frontend && npm install && npm run dev             # http://localhost:5173
```

Load course content into a fresh database, then create the first admin (run from `backend/main_api`):

```bash
python -m course_content.import_curriculum
python seed_quizzes.py
python -m course_content.cli create-admin <name>
```

Import a lesson pack (validates first, writes nothing if anything is invalid; add `--dry-run` to preview):

```bash
python -m course_content.import_pack ../../content/packs/pack_A5_cryptography.json --actor <admin name>
```

## Tests and checks

```bash
cd backend && pytest                                  # API tests, isolated in-memory database
python backend/scripts/smoke_api.py                   # end-to-end API checks (in-memory database)
python backend/scripts/check_recommendation.py        # recommendation engine checks

cd frontend
npm run build                                         # typecheck + production build
npm run lint
npm run test:content                                  # curriculum, competency and visual tests
npm run content:check                                 # compiled curriculum data is consistent
```

## Security notes

- The backend is authoritative for identity, quiz scoring, XP and checkpoint grading. Quiz and checkpoint
  answer keys are never sent to the browser.
- Secrets come from the environment. Production refuses to start without `QCAPS_JWT_SECRET`.
- The scanner is for authorised assessment only. See `docs/architecture/SCANNER.md` for what it checks, how targets are
  validated (every connection is pinned to addresses validated once), and the domain-ownership gate for active checks.
- Do not report simulated data as findings. Anything simulated must be labelled `SIMULATION` or `DEMO DATA`.

## Documentation

Start with `docs/architecture/SYSTEM_UNDERSTANDING.md` (how the system actually works and what is still open)
and `docs/content-authoring/BOOK_COURSE_MAP.md` (sources, lesson packs and status).
