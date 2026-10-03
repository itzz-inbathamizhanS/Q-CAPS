# NotebookLM prompts: turn your 10 books into Q-CAPS course content

Use this with a NotebookLM notebook that has your 10 books as sources. It works in stages, so
you can check each result before the next one. At the end you give me JSON files and I import them.

## Before you start

1. Add these as sources in the notebook, besides the 10 books:
   - `docs/content-authoring/CURRENT_STRUCTURE.md` (the course as it exists today; regenerate it with
     `python -m course_content.export_structure` whenever the course changes)
   - `docs/content-authoring/example_pack.json` (the exact output format)
2. Give each book an ID (`B01` to `B10`) and keep that list. Every section you get back must cite these IDs.
3. Paste **Standing instructions** below once at the start of the chat, then run Stage 1 to Stage 4.
   If NotebookLM forgets the rules, paste them again.
4. Save each JSON answer to a file, e.g. `pack_B9.json`, then check it (see **Check before sending me anything**).

## Standing instructions (paste first)

```
You are helping build a university-level course called Q-CAPS: Quantum Cybersecurity Assessment,
Preparedness and Skills. Learners go from beginner to enterprise level across four tracks
(A Foundations, B Intermediate/Engineering, C Advanced/Specialist, D Enterprise Architect).
The sources in this notebook are the ten books plus CURRENT_STRUCTURE.md and example_pack.json.
CURRENT_STRUCTURE.md describes the course as it exists today. The books are the ONLY source of facts.

RULES. Follow all of them in every answer.

1. Ground every claim in the books. Do not use outside knowledge. If the books do not cover something
   the course needs, write exactly: NOT COVERED IN THE BOOKS. Never fill the gap yourself.
2. Write in your own words. Do not copy sentences from the books. A quotation may be at most 15 words,
   in quotation marks, and at most one per section. Paraphrase everything else.
3. Cite. Every section and every quiz question needs a source: book ID (B01 to B10) and a locator
   (chapter, section and page numbers). Every number, date, key size, version, standard name and
   security claim must be traceable to a locator you give.
4. Currency. Books age. If a book describes a standard, algorithm, protocol version or deadline that
   may have changed since the book was published, keep what the book says, cite it, and add
   "needs_verification" with a reason. Never state that something is current or final unless a book says so.
5. If two books disagree, say so and say which locators disagree. Do not pick a side silently.
6. No invented security intelligence. Do not invent breaches, vulnerabilities, CVEs, threat actors,
   incidents, statistics, tool outputs or findings. If you give an example scenario, label it
   "Illustrative example" and make clear it is fictional.
7. Code only if it comes from a book or is a direct, correct simplification of a book's example. Say which
   book and locator. Keep code short and runnable. Never include exploit code.
8. Write for the learner level of the module. Define a term the first time it is used. Short sentences.
   American spelling. No marketing language. No emojis. No raw HTML. Markdown only (bold, lists,
   tables, inline code).
9. Do not mention people who work on this project, "your teammates", or internal tooling.
   Refer to the platform's scanner as "the Q-CAPS scanner" only where it is genuinely relevant.
10. Output exactly what each prompt asks for. When it asks for JSON, answer with ONE JSON code block and
    nothing else: no comments inside the JSON, no trailing commas, straight quotes only.
```

## Stage 1: Understand the books

```
STAGE 1: ANALYZE THE BOOKS. Do not write course content yet.

Part A. For each book B01 to B10, give a table row:
  ID | title | authors | edition and year | level (beginner / intermediate / advanced) |
  main topics (max 8) | what it covers best | what it is weak or silent on |
  parts that may be out of date and why.

Part B. A coverage matrix. Rows are the 36 modules in CURRENT_STRUCTURE.md (code and title).
  Columns are B01 to B10. In each cell write the chapters that support the module, or "-" if none.
  Add a final column "coverage": strong, partial, weak or none.

Part C. Topics the books cover that the current course has NO module or section for. For each, give
  the books and chapters, and say in one line why a learner would need it.

Part D. Conflicts: places where two books disagree, or where a book disagrees with the current
  sections. Give both locators.

Use tables. Do not propose changes yet.
```

Check the answer yourself. If a row is wrong (wrong chapter, a book that is not there), fix it by asking again
before Stage 2.

## Stage 2: Propose the structure

```
STAGE 2: PROPOSE THE COURSE STRUCTURE. Use only what Stage 1 found. Do not write section content yet.

Goal: keep the existing course where the books support it, change what they improve, and add what
is missing. Do not remove an existing module just because the books are silent: mark it "keep".

Output four tables.

1. MODULES. One row per existing module and per proposed new module:
   code | slug | action (keep / modify / new) | track | level | category | books and chapters used |
   what changes (one line) | prerequisites (module codes).
   - Existing modules keep their slug from CURRENT_STRUCTURE.md. A new module needs a new slug in the
     form track_<a|b|c|d>_<code>_<short_name>, lowercase, with underscores.
   - "category" is one short label. Use these where they fit: Foundations, Cryptography, Quantum
     Computing, PQC, Quantum Cybersecurity, Enterprise. Suggest others only if a book needs them.

2. SECTIONS. For each module whose action is modify or new: the full ordered list of section titles.
   For an existing section that should be rewritten, show its slug (sec-N) and the word REPLACE.
   For a section that should be added, give a new slug (lowercase words with hyphens) and the word NEW,
   and the slug of the section it follows. Aim for 6 to 12 sections per module.

3. QUIZZES, LABS AND MISSIONS. For each module: does the books' material support a quiz of 5 to 10
   questions (yes / no)? List any lab, mission or case-study idea that the books clearly support, with
   the chapter. Do not invent ones the books do not support.

4. REFERENCES. The books and the specific papers, standards or RFCs the books cite repeatedly, as a
   list: ID or short name | full citation as given in the book | which module it supports.
   Only list items that appear in the books.

Finish with 5 questions I should decide before you write content.
```

Read the tables. Tell NotebookLM which changes to drop or alter ("do not add module X", "merge Y and Z").
When you are happy, say: `APPROVED PLAN` and paste the tables you accept. Stage 3 uses that plan.

## Stage 3: Write one module at a time (JSON)

Run this once per module that is `modify` or `new`. Replace the two values in angle brackets.

```
STAGE 3: WRITE THE CONTENT FOR ONE MODULE.
Module: <code and title>, slug <slug>. Follow the APPROVED PLAN rows for this module exactly.

Return ONE JSON code block, nothing else, in the same shape as example_pack.json:

{
  "pack_version": 1,
  "books": [ ...every book you cite, with id, title, authors, edition, year, publisher, isbn if known... ],
  "modules": [ {
    "slug": "<slug>",
    "action": "modify" or "new",
    // only for action "new": "track", "code", "title", "level", "estimated_minutes",
    // "learning_objectives" (3 to 8), "prerequisites" (module slugs), "category"
    "sections": [ {
      "slug": "sec-N for REPLACE; new lowercase-hyphen slug for NEW",
      "action": "replace" or "new",
      "after": "slug of the section it follows (NEW only)",
      "title": "...",
      "summary": "one sentence, 300 characters at most",
      "estimated_minutes": whole number,
      "blocks": [ ... ],
      "sources": [ {"book": "B03", "locator": "Ch. 5, pp. 101-108", "note": "optional"} ],
      "needs_verification": {"reason": "..."}   // only when rule 4 applies
    } ],
    "quiz": [ ...5 to 10 questions, see below... ]   // only if the plan says yes
  } ]
}

BLOCKS. Use only these types.
- {"type":"text","markdown":"..."}   150 to 400 words in a section in total. Short paragraphs and lists.
- {"type":"callout","variant":"info|tip|warning|danger","title":"...","text":"..."}   a pitfall, a rule of thumb, a warning.
- {"type":"code","language":"python","code":"...","caption":"..."}   only under rule 7.
- {"type":"checkpoint","question":"...","options":["..","..",".."],"correct_index":1,"explanation":"..."}
  2 to 6 options, correct_index counts from 0, explanation always required (1 to 3 sentences).
Do NOT use video or visual blocks.

SECTION SHAPE. Open with why this matters, explain the idea step by step, give one worked example,
then a callout with the most common mistake, then one checkpoint that tests understanding (not recall of a
number). Put a tip or warning callout only where a book supports it.

QUIZ QUESTIONS. Each: {"prompt","options" (3 to 5),"correct_index","explanation","source":{"book","locator"}}.
Mix recall, application and one scenario question. Make wrong options plausible, not silly. No
"all of the above". Each question must be answerable from the cited locator.

LIMITS. If the answer would be too long, return only the first sections, end the JSON, and write
CONTINUE after the code block. When I reply CONTINUE, return a second JSON block with the same module slug,
"action":"modify", and only the remaining sections (and the quiz).
If the books lack material for a planned section, leave it out and list its title after the code block under
"NOT COVERED IN THE BOOKS".
```

## Stage 4 (optional): References and research papers

```
STAGE 4: REFERENCES. Return ONE JSON code block:
{ "references": [ {
    "id": "R01",
    "kind": "book" | "paper" | "standard" | "rfc" | "report",
    "title": "...", "authors": "...", "year": 2020, "publisher_or_venue": "...",
    "identifier": "DOI, ISBN, RFC number or standard number if the book gives it",
    "url": "only if a book prints it",
    "cited_in": ["B03 Ch. 5", "B07 Ch. 2"],
    "supports_modules": ["track_b_b9_pqc_fundamentals"]
} ] }
Only include items that appear in the books' own reference lists or text. Do not add anything else.
```

I will build the References and Research Papers store when you send this.

## Currency notes you can give NotebookLM when a book looks old

I checked these on the official NIST and IETF sites on 2026-10-03. Books published before these dates will
not mention them. Do not let NotebookLM "update" the books itself: ask it to add `needs_verification`, and
send me the section. I will check it against the source.

| If a book says | What the official pages say now |
|---|---|
| CRYSTALS-Kyber, CRYSTALS-Dilithium, SPHINCS+ are NIST finalists or candidates | NIST published them as FIPS 203 (ML-KEM), FIPS 204 (ML-DSA) and FIPS 205 (SLH-DSA) on August 13, 2024 |
| Falcon or HQC are under evaluation | NIST selected both for ongoing standardization; that process is under way |
| NIST will announce a PQC transition timeline | NIST IR 8547 (draft, published November 12, 2024) describes the planned transition; NIST says quantum-vulnerable algorithms are to be removed from its standards by 2035 |
| TLS 1.3 is RFC 8446 | RFC 9846 now specifies TLS 1.3 and obsoletes RFC 8446 |
| Hybrid key exchange for TLS is an Internet-Draft | RFC 10024 (August 2026, Proposed Standard) defines X25519MLKEM768, SecP256r1MLKEM768 and SecP384r1MLKEM1024 |

## Check before sending me anything

Put your JSON files in one folder and run, from `backend/main_api`:

```bash
python -m course_content.validate_pack path/to/pack_B9.json path/to/pack_B10.json
```

It prints every problem with its location, for example a missing locator, an unknown book ID, a checkpoint
without an explanation, a section slug that does not exist, or a long quotation. It changes nothing.
Fix errors by pasting the message back to NotebookLM and asking it to correct only that item.

Then send me the files and the approved Stage 2 tables. A warning does not block an import, but read it.

## What I will do with it

- Check every number, date and standard against its book locator, and the currency notes above.
- Import the sections as drafts, so nothing reaches learners until you publish it in the admin pages.
- Add the sources to each section, and the quizzes and references once their stores exist.
- Keep a report of what changed, and of anything marked `needs_verification`.

## If NotebookLM struggles

- Ask for one module, or even one section, at a time.
- If it invents a source, ask: "Quote the locator and the sentence you relied on." If it cannot, delete the claim.
- If JSON breaks, ask: "Return the same JSON again, valid, with no comments."
- If the books do not cover a module, leave the module as `keep`. An existing short section is better than a section built on nothing.
