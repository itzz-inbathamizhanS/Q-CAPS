# Course Pages Design Reference

Visual reference for the course experience: curriculum map, module overview, full-page section lessons, quiz, and the admin authoring tools.

**Status:** design mockups only. They use sample data and none of this is implemented yet unless the table below says so.

## How to use this folder

- Treat each `.dc.html` file as a **visual reference**, not code to copy. Rebuild each page as React components in `frontend/`.
- Reuse the existing design tokens in the frontend CSS (`--color-primary`, `--color-surface`, `--font-sans`, and so on) instead of the hex values in the mockups. The mockups use the same values inline.
- Sample titles, section summaries, durations and statuses are placeholders. Real content comes from the course data, never from the mockup.
- The video player is a placeholder box. The TLS handshake visual is a `SIMULATION` and must stay labelled as one.

## Artboards and where they map

| Artboard file | Page | Maps to | Status |
|---|---|---|---|
| `Main.dc.html` | Curriculum Map | `frontend/src/pages/CurriculumMap.tsx` | Exists, restyle |
| `Module.dc.html` | Module Reader (current design) | `frontend/src/pages/CourseModule.tsx` | Superseded; no longer routed, file kept until removed |
| `Overview.dc.html` | Module Overview (section cards) | `frontend/src/pages/ModuleOverview.tsx` at `/learning/:moduleId` | Implemented (reads `/api/content`) |
| `Section.dc.html` | Full-page Section Lesson | `frontend/src/pages/SectionLesson.tsx` at `/learning/:moduleId/:sectionId` | Implemented; TLS handshake pilot on A3 section 3.7 |
| `Quiz.dc.html` | Quiz | `frontend/src/pages/QuizPage.tsx` | Exists, restyle |
| `Admin.dc.html` | Admin Course Manager | `frontend/src/pages/AdminCourses.tsx` at `/admin` | Implemented (tracks, modules, sections; reorder; publish/unpublish) |
| `Editor.dc.html` | Admin Section Editor | `frontend/src/pages/AdminSectionEditor.tsx` at `/admin/modules/:moduleId/sections/:sectionId` | Implemented (block editor, publish checklist) |

## Design decisions

- **Sections are pages.** Each section opens as its own full page with previous/next navigation, a section list, and a progress bar.
- **Section content is a list of blocks:** text, video, visual, code, callout, checkpoint. The admin editor edits this same list.
- **Video:** short clips (2-5 min), always with captions and a transcript link. Completion is based on the checkpoint, not on watch time sent from the browser.
- **Checkpoint answers are checked by the backend.** The mockup reveals the answer immediately; the real page must not ship answer keys to the client.

## Implementation notes

These follow the project engineering rules.

1. **Admin role.** The backend has no roles today. Add a `role` field on `User` and enforce it in the API. Never trust a role sent by the frontend. Create the first admin from a setup command or environment setting, not through signup.
2. **Content in the database.** Course content is currently bundled in `frontend/src/data/curriculumData.ts`. Move tracks, modules, sections and blocks into tables with `status` (draft or published) and an order column. Learners only see published content. Write an import script for the existing 36 modules.
3. **Backend is the source of truth** for section progress, quiz scoring and XP. Do not add new client-only progress state.
4. **Admin API.** Admin-only create, update, delete and reorder endpoints, with an audit log entry per change. Public read endpoints return published content only.
5. **Sanitise content.** Clean text and callout markup before display and allow video URLs only from approved hosts, so an admin account cannot inject scripts.
6. **Performance.** Load module content from the API per module rather than bundling it all.

## Implemented so far (slices 1 and 3)

- **Backend:** `backend/main_api/course_content/` (tables `tracks`, `modules`, `sections`, `content_audit_log`; `User.role`). Public read API `GET /api/content/tracks`, `GET /api/content/modules/{slug}`; checkpoint grading `POST /api/content/sections/{id}/checkpoints/{block}/check`; admin CRUD/reorder under `/api/admin/content/*`.
- **Setup:** `python -m course_content.import_curriculum` (idempotent) and `python -m course_content.cli create-admin NAME`, both run from `backend/main_api`. Env vars are listed in `backend/.env.example`.
- **Unbuilt visuals:** imported callouts that only describe an interactive (`planned-interactive`, or a described `simulation`) are hidden from learners, because their text is a note for authors. The admin Preview shows them as HIDDEN FROM LEARNERS. Only kinds in `features/lesson/blocks/visualRegistry.ts` render (currently `tls-handshake`, which follows the TLS 1.3 flow in RFC 9846).
- **Progress (server-authoritative):** a section completes when every checkpoint in it has been answered correctly (recorded by the grader in `checkpoint_passes`), or, for sections without a checkpoint, when the learner presses "Complete and continue" (`section_completions`). Sections with a checkpoint cannot be self-completed (409). Endpoints: `GET /api/content/modules/{slug}/progress`, `POST /api/content/sections/{id}/complete`. Checkpoint attempts are rate limited (`QCAPS_CHECKPOINT_RATE_LIMIT`, in-memory per process). No XP is attached to sections.
- **Admin UI:** `/admin` (course manager), `/admin/modules/:moduleId/sections/:sectionId` (editor), `/admin/audit` (audit log). The sidebar link is hidden from non-admins (role from `GET /api/auth/me`) and `AdminRoute` shows an access-denied page, but the backend enforces access. The publish checklist is computed on the backend (`course_content/checklist.py`), shown live while editing through a dry-run endpoint, and a section cannot be published while an item fails. Status is draft or published only.
- **Deliberately not built:** an "In review" status or reviewer role (workflow still undecided, see below), a "prerequisite section" setting (needs section gating), drag-and-drop reordering (up/down buttons are used and are keyboard-accessible), and the mockup's separate dark admin shell (admin pages use the normal app shell).
- **Not yet built:** video hosting decisions (the renderer supports `https` embeds and `.mp4`/`.webm` with captions from allowlisted hosts), user and role management UI (use the CLI), Quizzes and Badges admin pages.

## Suggested build order

1. Role and database tables, plus the import script for the 36 modules.
2. Admin API.
3. Learner Section Lesson page, reading from the API.
4. Module Overview page.
5. Admin Course Manager and Section Editor.
6. Restyle Curriculum Map and Quiz to match.

Build one slice at a time and check each one in the browser against its artboard.

## Not yet decided

- Where videos are hosted (an unlisted YouTube link is the simplest first version).
- Whether the visual components (TLS handshake, packet journey, chain of trust) are built in code or authored in the admin editor.
- Draft, review and publish workflow: one admin, or a separate reviewer role.
