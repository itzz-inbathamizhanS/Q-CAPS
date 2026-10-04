# Q-CAPS

**Quantum Cybersecurity Capability and Preparedness System**

An academic and research-driven system designed to assess individual and organizational cryptographic capabilities, identify Post-Quantum Cryptography (PQC) skill gaps, and guide targeted transition pathways.

---

## 1. Core Concept & Workflow

The core Q-CAPS capability lifecycle operates on a 5-stage loop:

```
ASSESS → IDENTIFY SKILL GAP → LEARN → PRACTICE → REASSESS
```

### Student Pathway
1. **Assessment**: Baseline evaluation of classical cryptography and quantum security concepts.
2. **Skill Profile**: Multi-dimensional radar visualization of strengths and gaps.
3. **Skill Gap**: Pinpoint focus areas (e.g. NIST FIPS 203 ML-KEM, FIPS 204 ML-DSA).
4. **Learning**: Structured, tiered modules from fundamentals to advanced PQC.
5. **Practical Challenge**: Interactive simulated labs and cryptographic inspection scenarios.
6. **Reassessment**: Empirical before-and-after score delta benchmarking.

### Organization Pathway
1. **Required Capabilities**: Enterprise cryptographic standard inventory.
2. **Workforce Capability**: Team-wide competency distribution heatmaps.
3. **Capability Gaps**: Critical department-level PQC deficiency identification.
4. **Training Priorities**: Targeted allocation of learning paths.
5. **Practical Validation**: Real-world migration verification.
6. **Capability Improvement**: Measurable workforce quantum readiness progression.

---

## 2. Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS tokens matching the interface concept design system (`docs/design/interface-concept`)
- **State & Data**: Zustand + @tanstack/react-query
- **Visualization**: Recharts (Radar, Bar, Pie charts)
- **Icons**: Lucide React + Material Symbols
- **Animations**: Framer Motion

---

## 3. UI/UX Source of Truth

The folder `docs/design/interface-concept/` serves as the primary visual design reference:
- Color palette: Core Light Mode (`#F5F5FA`, `#FFFFFF`, `#5427e6`, `#6D4AFF`, `#3CB7E8`)
- Typography: Inter & JetBrains Mono
- Layout: 250px fixed sidebar, 64px header, Bento Grid dashboard

---

## 4. Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript typecheck and build
npm run build

# Run linter
npm run lint
```

## 5. Tests

| Command | What it runs |
|---|---|
| `npm test` | Component and flow tests (Vitest, React Testing Library, jsdom). The network is mocked with MSW, so the tests go through the real services in `src/services`. Any request a test did not declare fails the test. |
| `npm run test:watch` | The same, in watch mode. |
| `npm run test:e2e` | Playwright end-to-end tests in `e2e/` against a real, isolated local stack. |
| `npm run test:content` | Curriculum and competency content validation. |

**Component tests** sit next to the page they test (`src/pages/*.test.tsx`). Helpers are in `src/test/`:
`renderRoutes` (memory router plus a location probe), `signIn`, and `apiUrl` for MSW handlers.

**End-to-end tests** need Python with the backend requirements installed, and the browser downloaded once with
`npx playwright install chromium`. `npm run test:e2e` then starts, on ports that do not clash with a normal dev
setup:

- the API on `8011`, using a **fresh throwaway database** in `e2e/.tmp/`. It is seeded by
  `backend/main_api/deploy_bootstrap.py` with the curriculum, the question banks, an admin and the DEMO learner
  `demo-learner`. The real `backend/main_api/qcaps.db` is never touched.
- Vite on `5181`, pointed at that API.

Passwords and the JWT secret are random for every run. You can override the ports with `E2E_API_PORT` and
`E2E_WEB_PORT`, and the Python executable with `E2E_PYTHON`.

The suites are:

- `smoke.spec.ts`: sign in, open the dashboard, take a module quiz and check that the page shows exactly the
  result the server graded.
- `a11y.spec.ts`: axe (WCAG 2.1 A/AA) on the main pages. It fails on any serious or critical violation beyond
  `e2e/axe-baseline.json`, which records the violations that existed when the check was added. Only ever lower
  the counts in that file.

Reports and traces go to `e2e/.results/`, which git ignores.
