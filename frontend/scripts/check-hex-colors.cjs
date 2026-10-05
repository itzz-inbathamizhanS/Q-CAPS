// Report hard-coded hex colours in .tsx files and fail when a file gains any (design tokens only; see TF.2).
//
//   node scripts/check-hex-colors.cjs            # check against scripts/hex-baseline.json
//   node scripts/check-hex-colors.cjs --update   # rewrite the baseline (only to LOWER counts after a clean-up)
//
// Hex colours ignore the dark theme. Existing ones are recorded per file in the baseline; a file may go down but
// never up, and a file not in the baseline may have none. Use the tokens in src/styles/index.css instead.
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../src');
const BASELINE = path.resolve(__dirname, 'hex-baseline.json');
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

function scan(dir, out = {}) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full, out);
    else if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) {
      const n = (fs.readFileSync(full, 'utf8').match(HEX) || []).length;
      if (n > 0) out[path.relative(SRC, full).split(path.sep).join('/')] = n;
    }
  }
  return out;
}

const counts = scan(SRC);
const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (process.argv.includes('--update')) {
  const old = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')).files : {};
  const raised = Object.entries(counts).filter(([f, n]) => n > (old[f] ?? 0));
  if (raised.length && !process.argv.includes('--allow-increase')) {
    console.error('Refusing to raise the baseline for:', raised.map(([f, n]) => `${f} (${old[f] ?? 0} -> ${n})`).join(', '));
    process.exit(1);
  }
  fs.writeFileSync(BASELINE, `${JSON.stringify({ note: 'Hex colour literals per .tsx file. Counts may only go down.', total, files: counts }, null, 2)}\n`);
  console.log(`Baseline written: ${total} hex colours in ${Object.keys(counts).length} files.`);
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).files;
const problems = Object.entries(counts)
  .filter(([f, n]) => n > (baseline[f] ?? 0))
  .map(([f, n]) => `${f}: ${n} hex colours (baseline ${baseline[f] ?? 0})`);
const improved = Object.entries(baseline).filter(([f, n]) => (counts[f] ?? 0) < n);

console.log(`${total} hex colours in ${Object.keys(counts).length} .tsx files.`);
if (improved.length) console.log(`Lower than baseline in ${improved.length} file(s); run with --update to lock in the improvement.`);
if (problems.length) {
  console.error('New hard-coded colours (use the tokens in src/styles/index.css):');
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
