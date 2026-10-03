// Structural validation for compiled curriculum data. Pure function: no file access.
const MODULE_ID = /track_[a-e]_[a-z0-9_]+/g;

function validate({ modules, tracks, manifest, badges, escapeRooms, missions, quizModuleIds }) {
  const errors = [];
  const err = (msg) => errors.push(msg);
  const ids = modules.map((m) => m.id);
  const idSet = new Set(ids);
  const order = new Map(ids.map((id, i) => [id, i]));

  // Manifest and modules must describe the same set.
  for (const id of ids) if (!manifest.modules[id]) err(`module ${id} is missing from curriculum_manifest.json`);
  for (const id of Object.keys(manifest.modules)) if (!idSet.has(id)) err(`manifest lists ${id}, but no course file defines that module_id`);

  if (new Set(ids).size !== ids.length) err('duplicate module ids in course files');

  // Prerequisite graph.
  for (const m of modules) {
    for (const p of m.prerequisites) {
      if (p === m.id) err(`${m.id} lists itself as a prerequisite`);
      else if (!idSet.has(p)) err(`${m.id} has unknown prerequisite ${p}`);
      else if (order.get(p) > order.get(m.id)) {
        err(`${m.id} requires ${p}, which comes later in track order (learners following the recommended order would be locked out)`);
      }
    }
  }
  const state = new Map();
  const byId = new Map(modules.map((m) => [m.id, m]));
  const visit = (id, trail) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) { err(`prerequisite cycle: ${[...trail, id].join(' -> ')}`); return; }
    state.set(id, 1);
    for (const p of byId.get(id)?.prerequisites ?? []) if (idSet.has(p)) visit(p, [...trail, id]);
    state.set(id, 2);
  };
  for (const id of ids) visit(id, []);

  // Content completeness.
  for (const m of modules) {
    if (!m.learningObjectives.length) err(`${m.id} has no learning objectives`);
    if (!m.sections.length) err(`${m.id} has no sections`);
  }

  // Quizzes.
  const quizSet = new Set(quizModuleIds);
  for (const id of ids) if (!quizSet.has(id)) err(`${id} has no quiz file`);
  for (const q of quizModuleIds) if (!idSet.has(q)) err(`quiz file references unknown module ${q}`);

  // Tracks cover each module exactly once.
  const seen = new Map();
  for (const t of tracks) for (const id of t.moduleIds) {
    if (!idSet.has(id)) err(`track ${t.id} lists unknown module ${id}`);
    seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  for (const id of ids) if (seen.get(id) !== 1) err(`${id} appears in ${seen.get(id) ?? 0} tracks (expected 1)`);

  // Cross-references from labs, missions and badges.
  for (const s of escapeRooms) if (!idSet.has(s.module_id)) err(`escape room ${s.id} links to unknown module ${s.module_id}`);
  for (const m of missions) if (!idSet.has(m.linked_module_id)) err(`mission ${m.mission_id} links to unknown module ${m.linked_module_id}`);

  const names = new Map();
  for (const b of badges) names.set(b.name, (names.get(b.name) ?? 0) + 1);
  for (const [n, c] of names) if (c > 1) err(`badge name "${n}" is used ${c} times`);
  for (const b of badges) for (const ref of b.unlockTrigger.match(MODULE_ID) ?? []) {
    if (!idSet.has(ref)) err(`badge "${b.name}" trigger references unknown module ${ref}`);
  }
  for (const s of escapeRooms) if (!names.has(s.badge_awarded)) err(`escape room ${s.id} awards "${s.badge_awarded}", which is not defined in badges`);

  return errors;
}

module.exports = { validate };
