// Tests for the pure helpers behind the hash-avalanche lesson visual (Node 22.12+ can load .ts directly).
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { toHex, differingBits, countTrue } = require('../src/features/lesson/blocks/visuals/avalanche.ts');

const sha256 = (s) => new Uint8Array(createHash('sha256').update(s).digest());

test('toHex pads single digits and matches Node\'s digest', () => {
  assert.equal(toHex(new Uint8Array([0, 15, 255])), '000fff');
  assert.equal(toHex(sha256('abc')), createHash('sha256').update('abc').digest('hex'));
});

test('identical digests have no differing bits', () => {
  const d = sha256('same');
  const bits = differingBits(d, d);
  assert.equal(bits.length, 256);
  assert.equal(countTrue(bits), 0);
});

test('bit positions are reported most significant bit first', () => {
  const bits = differingBits(new Uint8Array([0b10000000, 0b00000001]), new Uint8Array([0, 0]));
  assert.equal(bits[0], true);
  assert.equal(bits[15], true);
  assert.equal(countTrue(bits), 2);
});

test('changing one input character changes about half of the 256 output bits', () => {
  const n = countTrue(differingBits(sha256("Transfer $10 into Oscar's account"), sha256("Transfer $11 into Oscar's account")));
  assert.ok(n > 96 && n < 160, `expected roughly 128, got ${n}`);
  assert.equal(n, 130); // the value quoted in the lesson text
});

test('digests of different length are rejected', () => {
  assert.throws(() => differingBits(new Uint8Array(32), new Uint8Array(16)), /same length/);
});
