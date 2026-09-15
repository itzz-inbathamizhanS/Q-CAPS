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
- **Styling**: Vanilla CSS tokens matching `interface_concept` design system
- **State & Data**: Zustand + @tanstack/react-query
- **Visualization**: Recharts (Radar, Bar, Pie charts)
- **Icons**: Lucide React + Material Symbols
- **Animations**: Framer Motion

---

## 3. UI/UX Source of Truth

The folder `interface_concept/` serves as the primary visual design reference:
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
