// Validation for the competency model, Track A lesson structure and tagged quiz items.
// Pure function: no file access. Kept separate from curriculum-validation.cjs, which covers
// the module/prerequisite graph.

function validateCompetencyModel({ model, lessonDoc, manifestModuleIds, quizItems }) {
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
  const lessonById = new Map((lessonDoc.lessons || []).map((l) => [l.lesson_id, l]));
  const itemIds = new Set();
  for (const q of quizItems || []) {
    if (itemIds.has(q.id)) err(`duplicate quiz item id ${q.id}`);
    itemIds.add(q.id);
    const tagged = [q.competency_id, q.depth, q.lesson_id].filter((v) => v != null).length;
    if (tagged === 0) continue; // untagged seed item: allowed, reported by the tagging report
    if (tagged !== 3) { err(`${q.id}: competency_id, depth and lesson_id must be set together`); continue; }
    checkTag(q.id, q.competency_id, q.depth);
    const lesson = lessonById.get(q.lesson_id);
    if (!lesson) { err(`${q.id}: unknown lesson ${q.lesson_id}`); continue; }
    if (!lesson.competencies.some((c) => c.id === q.competency_id)) {
      err(`${q.id}: competency ${q.competency_id} is not an objective of ${q.lesson_id}`);
    }
  }
  return errors;
}

module.exports = { validateCompetencyModel };
