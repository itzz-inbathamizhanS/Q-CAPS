// Run: node --test scripts/
const test = require('node:test');
const assert = require('node:assert');
const { validate } = require('./curriculum-validation.cjs');

const mod = (id, prerequisites = []) => ({ id, prerequisites, learningObjectives: ['x'], sections: [{}] });
function fixture(over = {}) {
  const modules = [mod('track_a_a1_x'), mod('track_a_a2_x', ['track_a_a1_x']), mod('track_b_b1_x', ['track_a_a2_x'])];
  return {
    modules,
    tracks: [{ id: 'track-a', moduleIds: ['track_a_a1_x', 'track_a_a2_x'] }, { id: 'track-b', moduleIds: ['track_b_b1_x'] }],
    manifest: { modules: Object.fromEntries(modules.map((m) => [m.id, {}])) },
    badges: [{ name: 'One', unlockTrigger: 'Pass track_a_a1_x quiz' }, { name: 'Lab', unlockTrigger: 'Solve lab' }],
    escapeRooms: [{ id: 'e1', module_id: 'track_a_a1_x', badge_awarded: 'Lab' }],
    missions: [{ mission_id: 'm1', linked_module_id: 'track_b_b1_x' }],
    quizModuleIds: modules.map((m) => m.id),
    ...over,
  };
}
const has = (errors, text) => assert.ok(errors.some((e) => e.includes(text)), `expected "${text}" in ${JSON.stringify(errors)}`);

test('valid fixture has no errors', () => assert.deepStrictEqual(validate(fixture()), []));
test('unknown prerequisite', () => {
  const f = fixture(); f.modules[2].prerequisites = ['nope'];
  has(validate(f), 'unknown prerequisite nope');
});
test('prerequisite later in track order', () => {
  const f = fixture(); f.modules[0].prerequisites = ['track_a_a2_x'];
  has(validate(f), 'comes later in track order');
});
test('cycle detected', () => {
  const f = fixture(); f.modules[0].prerequisites = ['track_b_b1_x'];
  has(validate(f), 'prerequisite cycle');
});
test('self prerequisite', () => {
  const f = fixture(); f.modules[1].prerequisites = ['track_a_a2_x'];
  has(validate(f), 'lists itself');
});
test('stale escape-room module id (the A8 bug)', () => {
  const f = fixture(); f.escapeRooms[0].module_id = 'module_3_pqc_mitigation';
  has(validate(f), 'unknown module module_3_pqc_mitigation');
});
test('manifest and course files out of sync', () => {
  const f = fixture(); delete f.manifest.modules['track_b_b1_x']; f.manifest.modules['ghost'] = {};
  const e = validate(f); has(e, 'missing from curriculum_manifest.json'); has(e, 'manifest lists ghost');
});
test('missing quiz and orphan quiz', () => {
  const f = fixture({ quizModuleIds: ['track_a_a1_x', 'track_a_a2_x', 'stray'] });
  const e = validate(f); has(e, 'track_b_b1_x has no quiz file'); has(e, 'unknown module stray');
});
test('duplicate badge name and undefined escape badge', () => {
  const f = fixture(); f.badges.push({ name: 'One', unlockTrigger: 'x' }); f.escapeRooms[0].badge_awarded = 'Ghost Badge';
  const e = validate(f); has(e, 'used 2 times'); has(e, 'not defined in badges');
});
test('badge trigger references unknown module', () => {
  const f = fixture(); f.badges[0].unlockTrigger = 'Pass track_a_a9_gone quiz';
  has(validate(f), 'unknown module track_a_a9_gone');
});
test('module in two tracks', () => {
  const f = fixture(); f.tracks[1].moduleIds.push('track_a_a1_x');
  has(validate(f), 'appears in 2 tracks');
});
