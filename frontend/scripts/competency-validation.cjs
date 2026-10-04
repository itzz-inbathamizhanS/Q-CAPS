// Validation for the competency model, Track A lesson structure, tagged quiz items and tagged practicals.
// Pure function: no file access. Kept separate from curriculum-validation.cjs, which covers
// the module/prerequisite graph.

const TAG_STATUSES = new Set(['proposed-unreviewed', 'reviewed', 'no-competency']);

function validateCompetencyModel({ model, lessonDoc, manifestModuleIds, quizItems, practicals }) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  // --- model ---
  const depthIds = new Set((model.depths || []).map((d) => d.id));
  for (const d of ['Aware', 'Explain', 'Apply', 'Analyse']) if (!depthIds.has(d)) err(`model is missing depth ${d}`);

  const competencyIds = new Set();
  const domainIds = new Set();
  for (const dom of model.domains || []) {
    if (domainIds.has(dom.id)) err(`duplicate domain ${dom.id}`);
    domainIds.add(dom.id);
    if (!dom.competencies?.length) err(`domain ${dom.id} has no competencies`);
    for (const c of dom.competencies || []) {
      if (!c.id.startsWith(`${dom.id}.`)) err(`competency ${c.id} is not under domain ${dom.id}`);
      if (competencyIds.has(c.id)) err(`duplicate competency ${c.id}`);
      competencyIds.add(c.id);
      if (!c.name) err(`competency ${c.id} has no name`);
    }
  }
  const levels = model.capability_levels?.levels || [];
  if (levels.length !== 5) err(`expected 5 capability levels, found ${levels.length}`);
  if (levels[0]?.id !== 'Unknown') err('lowest capability level must be Unknown (no evidence is not a low score)');

  const checkTag = (where, competency, depth) => {
    if (!competencyIds.has(competency)) err(`${where}: unknown competency ${competency}`);
    if (!depthIds.has(depth)) err(`${where}: unknown depth ${depth}`);
  };

  // --- lessons ---
  const manifestIds = new Set(manifestModuleIds);
  const plannedModules = new Set((lessonDoc.modules || []).filter((m) => m.planned).map((m) => m.module_id));
  const moduleIds = new Set();
  for (const m of lessonDoc.modules || []) {
    moduleIds.add(m.module_id);
    if (!m.planned && !manifestIds.has(m.module_id)) err(`lesson module ${m.module_id} is not in curriculum_manifest.json (mark it planned or add it)`);
    if (m.planned && manifestIds.has(m.module_id)) err(`lesson module ${m.module_id} is marked planned but already exists in the manifest`);
  }

  const lessonIds = new Set();
  const perModule = new Map();
  for (const l of lessonDoc.lessons || []) {
    if (lessonIds.has(l.lesson_id)) err(`duplicate lesson id ${l.lesson_id}`);
    lessonIds.add(l.lesson_id);
    if (!moduleIds.has(l.module_id)) err(`${l.lesson_id}: unknown module ${l.module_id}`);
    if (!l.objective) err(`${l.lesson_id}: no objective`);
    if (!l.competencies?.length) err(`${l.lesson_id}: no competency tag`);
    for (const c of l.competencies || []) checkTag(l.lesson_id, c.id, c.depth);
    if (!Number.isInteger(l.minutes) || l.minutes <= 0) err(`${l.lesson_id}: minutes must be a positive integer`);
    perModule.set(l.module_id, (perModule.get(l.module_id) || 0) + 1);
  }
  for (const m of lessonDoc.modules || []) {
    if ((perModule.get(m.module_id) || 0) !== m.lesson_count) {
      err(`${m.code}: declares ${m.lesson_count} lessons but ${perModule.get(m.module_id) || 0} are defined`);
    }
  }

  // --- tagged quiz items ---
  // competency_id and depth go together. lesson_id is required for items of modules that have a lesson design
  // (Track A) and optional elsewhere. Drafted tags carry tag_status "proposed-unreviewed" until a reviewer
  // marks them "reviewed"; "no-competency" marks an item that tests course structure rather than a skill.
  const lessonById = new Map((lessonDoc.lessons || []).map((l) => [l.lesson_id, l]));
  const itemIds = new Set();
  for (const q of quizItems || []) {
    if (itemIds.has(q.id)) err(`duplicate quiz item id ${q.id}`);
    itemIds.add(q.id);
    if (q.tag_status != null && !TAG_STATUSES.has(q.tag_status)) err(`${q.id}: unknown tag_status ${q.tag_status}`);
    if (q.tag_status === 'no-competency') {
      if (q.competency_id != null || q.depth != null || q.lesson_id != null) err(`${q.id}: a no-competency item must not carry tags`);
      continue;
    }
    const tagged = [q.competency_id, q.depth].filter((v) => v != null).length;
    if (tagged === 0) {
      if (q.lesson_id != null) err(`${q.id}: lesson_id without competency_id and depth`);
      if (q.tag_status != null) err(`${q.id}: tag_status ${q.tag_status} on an untagged item`);
      continue; // untagged item: allowed, listed by the coverage report
    }
    if (tagged !== 2) { err(`${q.id}: competency_id and depth must be set together`); continue; }
    checkTag(q.id, q.competency_id, q.depth);
    if (q.lesson_id == null) {
      if (q.module_id != null && moduleIds.has(q.module_id)) err(`${q.id}: items of ${q.module_id} need a lesson_id (the module has a lesson design)`);
      continue;
    }
    const lesson = lessonById.get(q.lesson_id);
    if (!lesson) { err(`${q.id}: unknown lesson ${q.lesson_id}`); continue; }
    if (!lesson.competencies.some((c) => c.id === q.competency_id)) {
      err(`${q.id}: competency ${q.competency_id} is not an objective of ${q.lesson_id}`);
    }
  }

  // --- tagged practicals (labs and missions) ---
  // The Proficient level needs a passed practical, so practicals carry competency tags too.
  const practicalIds = new Set();
  for (const p of practicals || []) {
    const where = `${p.kind} ${p.id}`;
    if (practicalIds.has(where)) err(`duplicate ${where}`);
    practicalIds.add(where);
    if (!Array.isArray(p.competencies) || p.competencies.length === 0) continue; // untagged: listed by the report
    if (p.tag_status != null && !TAG_STATUSES.has(p.tag_status)) err(`${where}: unknown tag_status ${p.tag_status}`);
    for (const c of p.competencies) checkTag(where, c.id, c.depth);
  }
  return errors;
}

module.exports = { validateCompetencyModel };
