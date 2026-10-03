/** Pure helpers for the hash-avalanche visual. No DOM or crypto here, so they can be tested directly. */

export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

/** For each bit position of two equal-length digests: true when the bit differs. */
export function differingBits(a: Uint8Array, b: Uint8Array): boolean[] {
  if (a.length !== b.length) throw new Error('digests must have the same length');
  const out: boolean[] = [];
  for (let i = 0; i < a.length; i++) {
    const x = a[i] ^ b[i];
    for (let bit = 7; bit >= 0; bit--) out.push(((x >> bit) & 1) === 1);
  }
  return out;
}

export const countTrue = (flags: boolean[]): number => flags.reduce((n, f) => (f ? n + 1 : n), 0);
