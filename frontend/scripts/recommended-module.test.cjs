// Tests for resolveRecommendedModule (Node 22.12+ can load .ts directly).
const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveRecommendedModule } = require('../src/features/curriculum/recommendedModule.ts');

const modules = [
  { id: 'a1', prerequisites: [] },
  { id: 'a2', prerequisites: ['a1'] },
  { id: 'b8', prerequisites: ['a2'] },
  { id: 'b9', prerequisites: ['b8'] },
  { id: 'e4', prerequisites: ['b9', 'a2'] },
];

test('an open target is returned as is', () => {
  assert.deepEqual(resolveRecommendedModule(modules, 'a2', ['a1']), { moduleId: 'a2', targetId: 'a2', redirected: false });
});

test('a locked target resolves to the first open module on its prerequisite chain', () => {
  assert.deepEqual(resolveRecommendedModule(modules, 'b9', []), { moduleId: 'a1', targetId: 'b9', redirected: true });
  assert.deepEqual(resolveRecommendedModule(modules, 'b9', ['a1']), { moduleId: 'a2', targetId: 'b9', redirected: true });
  assert.deepEqual(resolveRecommendedModule(modules, 'b9', ['a1', 'a2']), { moduleId: 'b8', targetId: 'b9', redirected: true });
  assert.deepEqual(resolveRecommendedModule(modules, 'b9', ['a1', 'a2', 'b8']), { moduleId: 'b9', targetId: 'b9', redirected: false });
});

test('with several unmet prerequisites the earliest listed open one wins', () => {
  assert.equal(resolveRecommendedModule(modules, 'e4', ['a1']).moduleId, 'a2');
});

test('a completed target is recommended for revisiting, not redirected', () => {
  assert.deepEqual(resolveRecommendedModule(modules, 'b9', ['a1', 'a2', 'b8', 'b9']), { moduleId: 'b9', targetId: 'b9', redirected: false });
});

test('unknown targets and unresolvable chains return null instead of a locked module', () => {
  assert.equal(resolveRecommendedModule(modules, 'nope', []), null);
  assert.equal(resolveRecommendedModule([{ id: 'x', prerequisites: ['missing'] }], 'x', []), null);
  const cycle = [{ id: 'p', prerequisites: ['q'] }, { id: 'q', prerequisites: ['p'] }];
  assert.equal(resolveRecommendedModule(cycle, 'p', []), null);
});
