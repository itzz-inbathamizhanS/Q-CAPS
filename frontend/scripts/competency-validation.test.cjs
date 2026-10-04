// Run: node --test scripts/
const test = require('node:test');
const assert = require('node:assert');
const { validateCompetencyModel } = require('./competency-validation.cjs');

function fixture() {
  return {
    model: {
      depths: ['Aware', 'Explain', 'Apply', 'Analyse'].map((id) => ({ id })),
      capability_levels: { levels: ['Unknown', 'Beginner', 'Developing', 'Proficient', 'Advanced'].map((id) => ({ id })) },
      domains: [{ id: 'NET', competencies: [{ id: 'NET.1', name: 'a' }, { id: 'NET.2', name: 'b' }] }],
    },
    lessonDoc: {
      modules: [{ code: 'A3', module_id: 'track_a_a3_x', planned: false, lesson_count: 2 }],
      lessons: [
        { lesson_id: 'A3.L1', module_id: 'track_a_a3_x', objective: 'o', competencies: [{ id: 'NET.1', depth: 'Explain' }], minutes: 20 },
        { lesson_id: 'A3.L2', module_id: 'track_a_a3_x', objective: 'o', competencies: [{ id: 'NET.2', depth: 'Apply' }], minutes: 20 },
      ],
    },
    manifestModuleIds: ['track_a_a3_x'],
    quizItems: [{ id: 'a3-q1', competency_id: 'NET.1', depth: 'Aware', lesson_id: 'A3.L1' }, { id: 'a3-q2' }],
  };
}
const has = (errors, text) => assert.ok(errors.some((e) => e.includes(text)), `expected "${text}" in ${JSON.stringify(errors)}`);

test('valid fixture has no errors (untagged items allowed)', () => assert.deepStrictEqual(validateCompetencyModel(fixture()), []));
test('unknown competency on a lesson', () => {
  const f = fixture(); f.lessonDoc.lessons[0].competencies[0].id = 'NET.9';
  has(validateCompetencyModel(f), 'unknown competency NET.9');
});
test('unknown depth', () => {
  const f = fixture(); f.lessonDoc.lessons[0].competencies[0].depth = 'Master';
  has(validateCompetencyModel(f), 'unknown depth Master');
});
test('competency under the wrong domain', () => {
  const f = fixture(); f.model.domains[0].competencies[0].id = 'SEC.1';
  has(validateCompetencyModel(f), 'is not under domain NET');
});
test('lowest capability level must be Unknown', () => {
  const f = fixture(); f.model.capability_levels.levels[0].id = 'Beginner';
  has(validateCompetencyModel(f), 'must be Unknown');
});
test('duplicate lesson id', () => {
  const f = fixture(); f.lessonDoc.lessons[1].lesson_id = 'A3.L1';
  has(validateCompetencyModel(f), 'duplicate lesson id A3.L1');
});
test('lesson count mismatch', () => {
  const f = fixture(); f.lessonDoc.modules[0].lesson_count = 3;
  has(validateCompetencyModel(f), 'A3: declares 3 lessons but 2 are defined');
});
test('module missing from manifest unless planned', () => {
  const f = fixture(); f.manifestModuleIds = [];
  has(validateCompetencyModel(f), 'is not in curriculum_manifest.json');
  f.lessonDoc.modules[0].planned = true;
  assert.deepStrictEqual(validateCompetencyModel(f), []);
});
test('planned module that already exists in the manifest', () => {
  const f = fixture(); f.lessonDoc.modules[0].planned = true;
  has(validateCompetencyModel(f), 'marked planned but already exists');
});
test('partially tagged quiz item', () => {
  const f = fixture(); delete f.quizItems[0].depth;
  has(validateCompetencyModel(f), 'must be set together');
});
test('quiz item competency not an objective of its lesson', () => {
  const f = fixture(); f.quizItems[0].competency_id = 'NET.2';
  has(validateCompetencyModel(f), 'is not an objective of A3.L1');
});
test('quiz item pointing at an unknown lesson', () => {
  const f = fixture(); f.quizItems[0].lesson_id = 'A9.L9';
  has(validateCompetencyModel(f), 'unknown lesson A9.L9');
});

// --- drafted tags (T1.2) ---
test('item of a module without a lesson design may be tagged without a lesson', () => {
  const f = fixture();
  f.quizItems.push({ id: 'b9-q1', module_id: 'track_b_b9', competency_id: 'NET.2', depth: 'Explain', tag_status: 'proposed-unreviewed' });
  assert.deepStrictEqual(validateCompetencyModel(f), []);
});
test('item of a module with a lesson design needs a lesson', () => {
  const f = fixture();
  f.quizItems.push({ id: 'a3-q9', module_id: 'track_a_a3_x', competency_id: 'NET.1', depth: 'Aware' });
  has(validateCompetencyModel(f), 'need a lesson_id');
});
test('lesson without competency and depth', () => {
  const f = fixture(); f.quizItems[1].lesson_id = 'A3.L1';
  has(validateCompetencyModel(f), 'lesson_id without competency_id and depth');
});
test('unknown tag status', () => {
  const f = fixture(); f.quizItems[0].tag_status = 'approved-by-me';
  has(validateCompetencyModel(f), 'unknown tag_status approved-by-me');
});
test('a no-competency item must not carry tags', () => {
  const f = fixture(); f.quizItems[0].tag_status = 'no-competency';
  has(validateCompetencyModel(f), 'must not carry tags');
  f.quizItems[1].tag_status = 'no-competency';
  assert.ok(!validateCompetencyModel(f).some((e) => e.startsWith('a3-q2')));
});
test('tag status on an untagged item', () => {
  const f = fixture(); f.quizItems[1].tag_status = 'proposed-unreviewed';
  has(validateCompetencyModel(f), 'on an untagged item');
});
test('practicals: tags are checked, untagged practicals are allowed', () => {
  const f = fixture();
  f.practicals = [
    { kind: 'lab', id: 'lab-1', competencies: [{ id: 'NET.1', depth: 'Apply' }], tag_status: 'proposed-unreviewed' },
    { kind: 'mission', id: 'm-1' },
  ];
  assert.deepStrictEqual(validateCompetencyModel(f), []);
  f.practicals[0].competencies[0].id = 'NET.9';
  has(validateCompetencyModel(f), 'lab lab-1: unknown competency NET.9');
});
test('practicals: duplicate ids', () => {
  const f = fixture();
  f.practicals = [{ kind: 'lab', id: 'x' }, { kind: 'lab', id: 'x' }];
  has(validateCompetencyModel(f), 'duplicate lab x');
});
