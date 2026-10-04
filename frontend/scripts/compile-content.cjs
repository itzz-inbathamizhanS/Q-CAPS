// compile-content.cjs
const fs = require('fs');
const path = require('path');

const { validate } = require('./curriculum-validation.cjs');
const { validateCompetencyModel } = require('./competency-validation.cjs');

// Usage: node scripts/compile-content.cjs [--check]
//   --check  compile and validate in memory; write nothing.
// Env: QCAPS_CONTENT_ROOT (default ../../content), QCAPS_OUT_DIR (default ../src/data)
const CHECK_ONLY = process.argv.includes('--check');
const CS_ROOT = path.resolve(process.env.QCAPS_CONTENT_ROOT || path.join(__dirname, '../../content'));
const FRONTEND_DATA = path.resolve(process.env.QCAPS_OUT_DIR || path.join(__dirname, '../src/data'));

// Nothing is written until the whole curriculum has validated.
const pending = [];
const writeOut = (file, text) => pending.push([file, text]);

// Structural metadata (prerequisites, domain, topic) lives in one manifest, not in this script.
const manifest = JSON.parse(fs.readFileSync(path.join(CS_ROOT, 'curriculum_manifest.json'), 'utf8'));

// -------------------------------------------------------------
// 1. QUIZ INVENTORY (validation only)
// Quizzes are NOT compiled into the frontend. Answer keys live server-side and are
// loaded by backend/main_api/seed_quizzes.py; here we only check that every module has one.
// -------------------------------------------------------------
const quizDirs = [
  'Track-A-Foundations',
  'Track-B-Intermediate',
  'Track-C-Advanced',
  'Track-D-Enterprise'
];

const quizModuleIds = [];
const quizItems = []; // id + curriculum tags only; answer keys are never read into compiled output
for (const qDir of quizDirs) {
  const dirPath = path.join(CS_ROOT, 'Quizzes', qDir);
  if (!fs.existsSync(dirPath)) continue;
  for (const file of fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'))) {
    try {
      const quiz = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf8'));
      quizModuleIds.push(quiz.module_id);
      for (const q of quiz.questions || []) {
        quizItems.push({ id: q.id, competency_id: q.competency_id ?? null, depth: q.depth ?? null, lesson_id: q.lesson_id ?? null });
      }
    } catch (err) {
      console.error(`Error parsing quiz ${file}:`, err);
      process.exitCode = 1;
    }
  }
}

// -------------------------------------------------------------
// 2. COMPILE COURSE MODULES
// -------------------------------------------------------------
const trackConfigs = [
  {
    folder: 'Track-A-Foundations',
    trackId: 'track-a',
    code: 'Track A',
    title: 'Foundations',
    subtitle: 'Computing, Networking, Cryptography & Quantum Basics',
    description: 'Foundational on-ramp for cybersecurity and quantum computing, with zero prerequisites required.',
    entryProfile: 'Little or no prior exposure to quantum computing, cybersecurity, networking, cryptography, or advanced mathematics.',
    certificateName: 'Certificate in Quantum Foundations',
    certificateCode: 'CQF',
    capstoneTitle: 'Beginner Capstone',
    capstoneDescription: 'Build a secure small network plus a basic cryptographic application and an introductory quantum circuit.',
    accentColor: '#38bdf8'
  },
  {
    folder: 'Track-B-Intermediate',
    trackId: 'track-b',
    code: 'Track B',
    title: 'Intermediate / Engineering',
    subtitle: 'Quantum Algorithms, Circuits, Advanced Cryptography & PQC Fundamentals',
    description: 'Deep dive into quantum information, algorithm mechanics, hardware realities, and lattice-based PQC standards.',
    entryProfile: 'Completed Track A or possesses university-level STEM background in linear algebra, basic cryptography, and Python.',
    certificateName: 'Certificate in Quantum Security Engineering',
    certificateCode: 'CQSE',
    capstoneTitle: 'Intermediate Capstone',
    capstoneDescription: 'Design and simulate an enterprise cryptographic migration plan with hybrid key exchange.',
    accentColor: '#818cf8'
  },
  {
    folder: 'Track-C-Advanced',
    trackId: 'track-c',
    code: 'Track C',
    title: 'Advanced / Specialist',
    subtitle: 'Quantum Error Correction, QKD, Implementation Attacks & Defense Engineering',
    description: 'Specialist engineering in quantum key distribution, fault tolerance, side-channel attacks, and constant-time PQC defense.',
    entryProfile: 'Completed Track B or holds substantial hands-on cryptography or quantum physics engineering experience.',
    certificateName: 'Quantum & PQC Specialist Certification',
    certificateCode: 'QCE / PQC-E / QNE',
    capstoneTitle: 'Advanced Specialist Capstone',
    capstoneDescription: 'Select from Implementation Security, Quantum Network Architecture, or Secure Communications capstone.',
    accentColor: '#c084fc'
  },
  {
    folder: 'Track-D-Enterprise',
    trackId: 'track-d',
    code: 'Track D',
    title: 'Enterprise Architect',
    subtitle: 'Crypto Discovery, CBOM, Agility, Migration Governance & Board Strategy',
    description: 'Executive and architectural governance for executing enterprise-wide post-quantum migrations and risk management.',
    entryProfile: 'CISOs, Lead Security Architects, Risk Officers, and Senior Engineers managing enterprise cryptographic assets.',
    certificateName: 'Quantum Security Architect Certificate',
    certificateCode: 'QSA',
    capstoneTitle: 'Architect Capstone',
    capstoneDescription: 'Produce an end-to-end enterprise quantum readiness assessment, CBOM strategy, and executive migration roadmap.',
    accentColor: '#f59e0b'
  }
];

const allModules = [];
const tracks = [];

for (const tConfig of trackConfigs) {
  const trackFolder = path.join(CS_ROOT, 'Course', tConfig.folder);
  if (!fs.existsSync(trackFolder)) continue;

  const files = fs.readdirSync(trackFolder)
    .filter(f => f.endsWith('.md') && !f.startsWith('00_'))
    .sort((a, b) => {
      // Natural sort by code e.g. A1, A2... B1, B2... B10, B11
      const codeA = a.split('_')[0];
      const codeB = b.split('_')[0];
      const prefixA = codeA.replace(/[0-9]/g, '');
      const prefixB = codeB.replace(/[0-9]/g, '');
      const numA = parseInt(codeA.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(codeB.replace(/[^0-9]/g, ''), 10) || 0;
      if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
      return numA - numB;
    });

  const moduleIdsInTrack = [];

  for (const file of files) {
    // Normalise line endings: checkouts on Windows have CRLF, which would leave a stray CR in the text.
    const content = fs.readFileSync(path.join(trackFolder, file), 'utf8').replace(/\r\n/g, '\n');
    const lines = content.split('\n');

    // Parse header
    let title = file.replace(/\.md$/, '').replace(/^[A-Z0-9]+_/, '').replace(/_/g, ' ');
    let code = file.split('_')[0];
    let moduleId = `track_${tConfig.trackId.replace('track-', '')}_${file.replace(/\.md$/, '').toLowerCase()}`;
    let level = 'Beginner';
    let estimatedMinutes = 90;

    // Lines inside a code fence (for example a Python comment starting with "# ") are not headings.
    let headerFence = false;
    for (const l of lines) {
      if (l.startsWith('```')) {
        headerFence = !headerFence;
        continue;
      }
      if (headerFence) continue;
      if (l.startsWith('# ')) {
        const parts = l.replace('# ', '').split('—');
        if (parts.length > 1) {
          title = parts[1].trim();
          code = parts[0].trim();
        } else {
          title = parts[0].trim();
        }
      }
      if (l.includes('**module_id:**')) {
        const match = l.match(/`([^`]+)`/);
        if (match) moduleId = match[1];
      }
      if (l.includes('**Level:**')) {
        const lvlMatch = l.match(/\*\*Level:\*\*\s*([^|]+)/);
        if (lvlMatch) level = lvlMatch[1].trim();
        const timeMatch = l.match(/\*\*Estimated Time:\*\*\s*([0-9]+)\s*minutes/i);
        if (timeMatch) estimatedMinutes = parseInt(timeMatch[1], 10);
      }
    }

    // Parse Learning Objectives
    const learningObjectives = [];
    let inObjectives = false;
    let inWrapUp = false;
    const wrapUpLines = [];

    // Parse sections
    const sections = [];
    let currentSection = null;

    let sectionFence = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('```')) sectionFence = !sectionFence;
      // A "## " line inside a code fence is code, not a section heading; keep it as content.
      if (sectionFence || line.startsWith('```')) {
        if (currentSection) currentSection.content += line + '\n';
        continue;
      }

      if (line.startsWith('## Learning Objectives')) {
        inObjectives = true;
        inWrapUp = false;
        continue;
      }

      if (line.startsWith('## Module Wrap-Up') || line.startsWith('## Wrap-Up')) {
        inObjectives = false;
        inWrapUp = true;
        continue;
      }

      if (line.startsWith('## ') && !line.startsWith('## Learning Objectives') && !line.startsWith('## Module Wrap-Up')) {
        inObjectives = false;
        inWrapUp = false;
        if (currentSection) {
          currentSection.content = currentSection.content.trim();
          sections.push(currentSection);
        }
        currentSection = {
          id: `sec-${sections.length + 1}`,
          title: line.replace('## ', '').trim(),
          content: '',
          interactiveCallout: undefined
        };
        continue;
      }

      if (inObjectives) {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          learningObjectives.push(line.trim().replace(/^[-*]\s*/, ''));
        }
      } else if (inWrapUp) {
        wrapUpLines.push(line);
      } else if (currentSection) {
        if (line.includes('🎨 Interactive/Visual') || line.includes('🎨')) {
          // Look ahead for callout block
          let calloutText = line;
          if (lines[i + 1] && lines[i + 1].startsWith('>')) {
            calloutText += ' ' + lines[i + 1].replace(/^>\s*/, '');
            i++;
          }
          currentSection.interactiveCallout = calloutText;
        } else {
          currentSection.content += line + '\n';
        }
      }
    }

    if (currentSection) {
      currentSection.content = currentSection.content.trim();
      sections.push(currentSection);
    }

    // Prerequisites, domain and topic come from content/curriculum_manifest.json.
    const entry = manifest.modules[moduleId];
    const prerequisites = entry ? entry.prerequisites : [];

    // XP allocation
    const xpByLevel = { Novice: 100, Beginner: 120, Intermediate: 160, Advanced: 200, Enterprise: 250 };
    const xp = xpByLevel[level] || 150;

    moduleIdsInTrack.push(moduleId);

    allModules.push({
      id: moduleId,
      trackId: tConfig.trackId,
      code,
      domain: entry?.domain,
      recommendationTopic: entry?.recommendationTopic,
      title,
      level,
      estimatedMinutes,
      xp,
      prerequisites,
      unlocks: '',
      learningObjectives,
      sections,
      wrapUp: {
        summary: wrapUpLines.join('\n').trim()
      }
    });
  }

  tracks.push({
    id: tConfig.trackId,
    code: tConfig.code,
    title: tConfig.title,
    subtitle: tConfig.subtitle,
    description: tConfig.description,
    entryProfile: tConfig.entryProfile,
    certificateName: tConfig.certificateName,
    certificateCode: tConfig.certificateCode,
    capstoneTitle: tConfig.capstoneTitle,
    capstoneDescription: tConfig.capstoneDescription,
    accentColor: tConfig.accentColor,
    moduleIds: moduleIdsInTrack
  });
}

// Link next unlocks
for (let i = 0; i < allModules.length; i++) {
  if (i < allModules.length - 1) {
    allModules[i].unlocks = allModules[i + 1].id;
  } else {
    allModules[i].unlocks = 'PQCTP Program Completion';
  }
}

writeOut(
  path.join(FRONTEND_DATA, 'curriculumData.ts'),
  `// Generated from content/Course\nimport { CurriculumModule, CurriculumTrack } from '@/features/curriculum/curriculumTypes';\n\nexport const curriculumTracks: CurriculumTrack[] = ${JSON.stringify(tracks, null, 2)};\n\nexport const curriculumModules: CurriculumModule[] = ${JSON.stringify(allModules, null, 2)};\n`
);
console.log(`Saved ${allModules.length} curriculum modules across ${tracks.length} tracks.`);

// -------------------------------------------------------------
// 3. COMPILE BADGES & CERTIFICATES
// -------------------------------------------------------------
const badges = [
  // Track A
  { id: 'b_a1', name: 'Computing Foundations', trackId: 'track-a', category: 'module', unlockTrigger: 'Pass track_a_a1_computing_foundations quiz (>=70%)', iconName: 'Cpu', xpAward: 50, isUnlocked: true },
  { id: 'b_a2', name: 'Mathematics Foundations', trackId: 'track-a', category: 'module', unlockTrigger: 'Pass track_a_a2_mathematics_foundations quiz', iconName: 'Binary', xpAward: 50, isUnlocked: true },
  { id: 'b_a3', name: 'Networking Foundations', trackId: 'track-a', category: 'module', unlockTrigger: 'Pass track_a_a3_networking_foundations quiz', iconName: 'Network', xpAward: 50, isUnlocked: false },
  { id: 'b_a4', name: 'Cybersecurity Foundations', trackId: 'track-a', category: 'module', unlockTrigger: 'Pass track_a_a4_cybersecurity_foundations quiz', iconName: 'Shield', xpAward: 50, isUnlocked: false },
  { id: 'b_a5', name: 'Cryptography Foundations', trackId: 'track-a', category: 'module', unlockTrigger: 'Pass track_a_a5_cryptography_foundations quiz', iconName: 'Key', xpAward: 50, isUnlocked: false },
  { id: 'b_a6', name: 'Quantum Foundations', trackId: 'track-a', category: 'module', unlockTrigger: 'Pass track_a_a6_quantum_foundations quiz', iconName: 'Atom', xpAward: 50, isUnlocked: false },
  { id: 'b_a7', name: 'First Quantum Circuit', trackId: 'track-a', category: 'module', unlockTrigger: 'Pass track_a_a7_first_quantum_programming quiz + submit circuit', iconName: 'Code2', xpAward: 75, isUnlocked: false },
  { id: 'b_a8', name: 'PQC Mitigation Aware', trackId: 'track-a', category: 'module', unlockTrigger: 'Pass track_a_a8_pqc_mitigation quiz', iconName: 'Lock', xpAward: 75, isUnlocked: false },
  { id: 'b_a_cap', name: 'Beginner Capstone Complete', trackId: 'track-a', category: 'capstone', unlockTrigger: 'Submit combined networking + crypto + quantum capstone', iconName: 'Award', xpAward: 150, isUnlocked: false },

  // Track B
  { id: 'b_b1', name: 'Quantum Math Adept', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b1_advanced_math_for_quantum quiz', iconName: 'Sigma', xpAward: 60, isUnlocked: false },
  { id: 'b_b2', name: 'Quantum Information Scholar', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b2_quantum_information quiz', iconName: 'Sparkles', xpAward: 60, isUnlocked: false },
  { id: 'b_b3', name: 'Algorithm Architect', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b3_quantum_algorithms quiz', iconName: 'Cpu', xpAward: 70, isUnlocked: false },
  { id: 'b_b4', name: 'Circuit Engineer', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b4_quantum_programming quiz', iconName: 'Terminal', xpAward: 70, isUnlocked: false },
  { id: 'b_b5', name: 'Hardware Analyst', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b5_quantum_hardware quiz', iconName: 'Server', xpAward: 70, isUnlocked: false },
  { id: 'b_b6', name: 'Network Defender', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b6_network_security_engineering quiz', iconName: 'ShieldAlert', xpAward: 70, isUnlocked: false },
  { id: 'b_b7', name: 'Cipher Specialist', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b7_advanced_cryptography quiz', iconName: 'KeyRound', xpAward: 75, isUnlocked: false },
  { id: 'b_b8', name: 'Threat Modeler', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b8_quantum_threats quiz', iconName: 'AlertTriangle', xpAward: 75, isUnlocked: false },
  { id: 'b_b9', name: 'PQC Apprentice', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b9_pqc_fundamentals quiz', iconName: 'Boxes', xpAward: 75, isUnlocked: false },
  { id: 'b_b10', name: 'Standards Scholar', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b10_pqc_standards quiz', iconName: 'BookOpen', xpAward: 75, isUnlocked: false },
  { id: 'b_b11', name: 'Lab Bench Veteran', trackId: 'track-b', category: 'module', unlockTrigger: 'Pass track_b_b11_intermediate_pqc_labs quiz + labs', iconName: 'FlaskConical', xpAward: 100, isUnlocked: false },
  { id: 'b_b_cap', name: 'Intermediate Capstone Complete', trackId: 'track-b', category: 'capstone', unlockTrigger: 'Submit quantum-safe migration design project', iconName: 'Award', xpAward: 200, isUnlocked: false },

  // Track C
  { id: 'b_c1', name: 'Hilbert Space Theorist', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c1_advanced_quantum_information quiz', iconName: 'Orbit', xpAward: 80, isUnlocked: false },
  { id: 'b_c2', name: 'Quantum Algorithm Master', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c2_advanced_quantum_algorithms quiz', iconName: 'Zap', xpAward: 80, isUnlocked: false },
  { id: 'b_c3', name: 'Error Correction Engineer', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c3_quantum_error_correction quiz', iconName: 'ShieldCheck', xpAward: 80, isUnlocked: false },
  { id: 'b_c4', name: 'Quantum Network Architect', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c4_quantum_networking quiz', iconName: 'Radio', xpAward: 85, isUnlocked: false },
  { id: 'b_c5', name: 'Communications Specialist', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c5_quantum_communications quiz', iconName: 'Share2', xpAward: 85, isUnlocked: false },
  { id: 'b_c6', name: 'QKD Expert', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c6_quantum_key_distribution quiz', iconName: 'Key', xpAward: 100, isUnlocked: false },
  { id: 'b_c7', name: 'Cryptography Theorist', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c7_advanced_cryptography quiz', iconName: 'Binary', xpAward: 90, isUnlocked: false },
  { id: 'b_c8', name: 'Lattice Mathematician', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c8_pqc_mathematics quiz', iconName: 'Grid', xpAward: 90, isUnlocked: false },
  { id: 'b_c9', name: 'PQC Implementer', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c9_pqc_implementation_engineering quiz', iconName: 'FileCode', xpAward: 95, isUnlocked: false },
  { id: 'b_c10', name: 'Attack Surface Hunter', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c10_pqc_attack_surface quiz', iconName: 'Crosshair', xpAward: 95, isUnlocked: false },
  { id: 'b_c11', name: 'Defense Engineer', trackId: 'track-c', category: 'module', unlockTrigger: 'Pass track_c_c11_pqc_defense_engineering quiz', iconName: 'Shield', xpAward: 100, isUnlocked: false },
  { id: 'b_c_cap', name: 'Advanced Capstone Complete', trackId: 'track-c', category: 'capstone', unlockTrigger: 'Submit chosen capstone (Security / Network / Comms)', iconName: 'Award', xpAward: 250, isUnlocked: false },

  // Track D
  { id: 'b_d1', name: 'Risk Strategist', trackId: 'track-d', category: 'module', unlockTrigger: 'Pass track_d_e1_quantum_risk_management quiz', iconName: 'Target', xpAward: 90, isUnlocked: false },
  { id: 'b_d2', name: 'Crypto Discovery Lead', trackId: 'track-d', category: 'module', unlockTrigger: 'Pass track_d_e2_cryptographic_discovery quiz', iconName: 'Search', xpAward: 90, isUnlocked: false },
  { id: 'b_d3', name: 'Readiness Assessor', trackId: 'track-d', category: 'module', unlockTrigger: 'Pass track_d_e3_quantum_readiness_assessment quiz', iconName: 'CheckCircle2', xpAward: 90, isUnlocked: false },
  { id: 'b_d4', name: 'Agility Architect', trackId: 'track-d', category: 'module', unlockTrigger: 'Pass track_d_e4_crypto_agility quiz', iconName: 'RefreshCw', xpAward: 100, isUnlocked: false },
  { id: 'b_d5', name: 'Migration Commander', trackId: 'track-d', category: 'module', unlockTrigger: 'Pass track_d_e5_enterprise_pqc_migration quiz', iconName: 'Compass', xpAward: 100, isUnlocked: false },
  { id: 'b_d6', name: 'Governance Lead', trackId: 'track-d', category: 'module', unlockTrigger: 'Pass track_d_e6_governance quiz', iconName: 'Building2', xpAward: 100, isUnlocked: false },
  { id: 'b_d_cap', name: 'Architect Capstone Complete', trackId: 'track-d', category: 'capstone', unlockTrigger: 'Submit enterprise readiness assessment + migration strategy', iconName: 'Trophy', xpAward: 300, isUnlocked: false },

  // Labs & Escape Room Badges
  { id: 'b_lab_1', name: 'HNDL Responder', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve Patient Records Leak Escape Room Scenario', iconName: 'ShieldAlert', xpAward: 50, isUnlocked: true },
  { id: 'b_lab_2', name: 'Crypto-Agility Architect', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve Cracked Chain of Trust Scenario', iconName: 'RefreshCw', xpAward: 75, isUnlocked: false },
  { id: 'b_lab_3', name: 'Symmetric Defender', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve Overlooked AES Key Scenario', iconName: 'Key', xpAward: 40, isUnlocked: false },
  { id: 'b_lab_4', name: 'Hybrid Deployer', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete Enterprise PQC Migration Stage 3', iconName: 'Boxes', xpAward: 80, isUnlocked: false },
  { id: 'b_lab_5', name: 'QKD Channel Verifier', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete BB84 Diplomatic Channel Mission without compromise', iconName: 'Radio', xpAward: 100, isUnlocked: false },
  { id: 'b_lab_6', name: 'Quantum Beginner', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve Superposition Panic Scenario', iconName: 'Atom', xpAward: 30, isUnlocked: false },
  { id: 'b_lab_7', name: 'Risk Prioritizer', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve Grover vs Shor Budget Scenario', iconName: 'AlertTriangle', xpAward: 70, isUnlocked: false },
  { id: 'b_lab_8', name: 'Hybrid Mode Auditor', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve Hybrid Mode Flaw Scenario', iconName: 'ShieldCheck', xpAward: 90, isUnlocked: false },
  { id: 'b_lab_9', name: 'Executive Communicator', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve Executive Buy-in Scenario', iconName: 'Target', xpAward: 70, isUnlocked: false },
  { id: 'b_lab_9', name: 'Performance Detective', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The 40-Minute Report Scenario', iconName: 'Cpu', xpAward: 30, isUnlocked: false },
  { id: 'b_lab_10', name: 'Modulus Mechanic', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Lopsided Buckets Scenario', iconName: 'Binary', xpAward: 40, isUnlocked: false },
  { id: 'b_lab_11', name: 'Packet Pathfinder', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The One-Way Door Scenario', iconName: 'Network', xpAward: 40, isUnlocked: false },
  { id: 'b_lab_12', name: 'Credential Guardian', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Leaked Password Table Scenario', iconName: 'Shield', xpAward: 50, isUnlocked: false },
  { id: 'b_lab_13', name: 'Nonce Keeper', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Constant Nonce Scenario', iconName: 'Key', xpAward: 50, isUnlocked: false },
  { id: 'b_lab_14', name: 'Circuit Debugger', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Empty Histogram Scenario', iconName: 'Code2', xpAward: 40, isUnlocked: false },
  { id: 'b_lab_15', name: 'Unitary Inspector', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Almost-Gate Scenario', iconName: 'Sigma', xpAward: 55, isUnlocked: false },
  { id: 'b_lab_16', name: 'No-Cloning Skeptic', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Backup Qubit Scenario', iconName: 'Sparkles', xpAward: 60, isUnlocked: false },
  { id: 'b_lab_17', name: 'Speedup Auditor', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The One-Millisecond Search Scenario', iconName: 'Cpu', xpAward: 60, isUnlocked: false },
  { id: 'b_lab_18', name: 'Noise Reader', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Stray Counts Scenario', iconName: 'Terminal', xpAward: 60, isUnlocked: false },
  { id: 'b_lab_19', name: 'Platform Strategist', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Platform Pick Scenario', iconName: 'Server', xpAward: 65, isUnlocked: false },
  { id: 'b_lab_20', name: 'Segmentation Lead', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Flat Network Scenario', iconName: 'ShieldAlert', xpAward: 65, isUnlocked: false },
  { id: 'b_lab_21', name: 'Signature Auditor', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Repeated k Scenario', iconName: 'KeyRound', xpAward: 75, isUnlocked: false },
  { id: 'b_lab_22', name: 'Algorithm Matchmaker', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Wrong Family Scenario', iconName: 'Boxes', xpAward: 70, isUnlocked: false },
  { id: 'b_lab_23', name: 'Standards Scholar II', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Pre-Standard Claim Scenario', iconName: 'BookOpen', xpAward: 70, isUnlocked: false },
  { id: 'b_lab_24', name: 'Lab Debugger', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Silent Decapsulation Scenario', iconName: 'FlaskConical', xpAward: 100, isUnlocked: false },
  { id: 'b_lab_25', name: 'Density Theorist', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Indistinguishable Ensembles Scenario', iconName: 'Orbit', xpAward: 80, isUnlocked: false },
  { id: 'b_lab_26', name: 'Resource Estimator', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Hundred-Qubit Claim Scenario', iconName: 'Zap', xpAward: 85, isUnlocked: false },
  { id: 'b_lab_27', name: 'Threshold Keeper', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Distance Gamble Scenario', iconName: 'Atom', xpAward: 85, isUnlocked: false },
  { id: 'b_lab_28', name: 'Repeater Planner', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Twelve-Link Chain Scenario', iconName: 'Radio', xpAward: 85, isUnlocked: false },
  { id: 'b_lab_29', name: 'Capacity Analyst', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Distillation Choice Scenario', iconName: 'Radio', xpAward: 85, isUnlocked: false },
  { id: 'b_lab_30', name: 'QKD Realist', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The QKD Sales Pitch Scenario', iconName: 'Radio', xpAward: 90, isUnlocked: false },
  { id: 'b_lab_31', name: 'Hash Internals Expert', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Naive MAC Scenario', iconName: 'Sigma', xpAward: 90, isUnlocked: false },
  { id: 'b_lab_32', name: 'Parameter Skeptic', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Smaller Lattice Scenario', iconName: 'Sigma', xpAward: 90, isUnlocked: false },
  { id: 'b_lab_33', name: 'Interop Engineer', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Mismatched Encoding Scenario', iconName: 'ShieldCheck', xpAward: 90, isUnlocked: false },
  { id: 'b_lab_34', name: 'Timing Defender', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Early Exit Scenario', iconName: 'ShieldCheck', xpAward: 95, isUnlocked: false },
  { id: 'b_lab_35', name: 'Shadow Hunter', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Unlisted Endpoint Scenario', iconName: 'Compass', xpAward: 70, isUnlocked: false },
  { id: 'b_lab_36', name: 'Evidence Assessor', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Blank Score Scenario', iconName: 'CheckCircle2', xpAward: 75, isUnlocked: false },
  { id: 'b_lab_37', name: 'Agility Engineer', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Compiled-In Algorithm Scenario', iconName: 'RefreshCw', xpAward: 80, isUnlocked: false },
  { id: 'b_lab_38', name: 'Rollout Gatekeeper', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Big-Bang Weekend Scenario', iconName: 'Compass', xpAward: 85, isUnlocked: false },
  { id: 'b_lab_39', name: 'Accountability Lead', trackId: 'lab', category: 'lab', unlockTrigger: 'Solve The Ownerless Risk Scenario', iconName: 'Building2', xpAward: 85, isUnlocked: false },
  { id: 'b_msn_1', name: 'Retrofit Engineer', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete The Agility Retrofit Mission', iconName: 'Rocket', xpAward: 90, isUnlocked: false },
  { id: 'b_msn_2', name: 'QKD Defender', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete Secure the Diplomatic Channel Mission', iconName: 'Rocket', xpAward: 85, isUnlocked: false },
  { id: 'b_msn_3', name: 'Incident Commander', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete The Cryptographic Incident Mission', iconName: 'Rocket', xpAward: 100, isUnlocked: false },
  { id: 'b_msn_4', name: 'Sprint Scout', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete The Discovery Sprint Mission', iconName: 'Rocket', xpAward: 80, isUnlocked: false },
  { id: 'b_msn_5', name: 'Segmentation Architect', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete Breach in the Flat Network Mission', iconName: 'Rocket', xpAward: 80, isUnlocked: false },
  { id: 'b_msn_6', name: 'Hybrid Pilot Lead', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete The Hybrid Pilot Mission', iconName: 'Rocket', xpAward: 90, isUnlocked: false },
  { id: 'b_msn_7', name: 'Incident Handler', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete Ransomware Monday Mission', iconName: 'Rocket', xpAward: 60, isUnlocked: false },
  { id: 'b_msn_8', name: 'Key Custodian', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete The Leaked Signing Key Mission', iconName: 'Rocket', xpAward: 60, isUnlocked: false },
  { id: 'b_msn_9', name: 'Briefing Officer', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete The Quantum Threat Briefing Mission', iconName: 'Rocket', xpAward: 70, isUnlocked: false },
  { id: 'b_msn_10', name: 'Side-Channel Responder', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete The Side-Channel Report Mission', iconName: 'Rocket', xpAward: 100, isUnlocked: false },
];

const certificates = [
  {
    id: 'cert_cqf',
    code: 'CQF',
    title: 'Certificate in Quantum Foundations',
    trackId: 'track-a',
    description: 'Validates foundational competence across computing, cybersecurity, networking, classical cryptography, and basic quantum circuits.',
    requirement: 'Pass all 8 Track A module quizzes (>=70%) and submit the Beginner Capstone project.',
    isUnlocked: false
  },
  {
    id: 'cert_cqse',
    code: 'CQSE',
    title: 'Certificate in Quantum Security Engineering',
    trackId: 'track-b',
    description: 'Demonstrates engineering proficiency in quantum algorithms, hardware analysis, advanced cryptography, and lattice-based PQC standards.',
    requirement: 'Complete all 11 Track B modules + Intermediate Capstone.',
    isUnlocked: false
  },
  {
    id: 'cert_qce',
    code: 'QCE / PQC-E / QNE',
    title: 'Quantum & PQC Specialist Certification',
    trackId: 'track-c',
    description: 'Recognizes mastery in quantum key distribution, quantum error correction, side-channel attack surfaces, and defense engineering.',
    requirement: 'Complete all 11 Track C modules + Advanced Specialist Capstone.',
    isUnlocked: false
  },
  {
    id: 'cert_qsa',
    code: 'QSA',
    title: 'Quantum Security Architect Certificate',
    trackId: 'track-d',
    description: 'Certifies ability to lead enterprise cryptographic discovery, CBOM creation, crypto-agility governance, and post-quantum migration.',
    requirement: 'Complete all 6 Track D modules + Architect Capstone.',
    isUnlocked: false
  },
  {
    id: 'cert_pqctp',
    code: 'PQCTP',
    title: 'Post-Quantum Cryptography Technical Professional',
    trackId: 'all',
    description: 'The highest program credential awarded by Q-CAPS. End-to-end certification across all 36 curriculum modules and capstones.',
    requirement: 'Full program graduation: Track A, B, C, and D completed.',
    isUnlocked: false
  }
];

writeOut(
  path.join(FRONTEND_DATA, 'badgesData.ts'),
  `// Generated from content/Badges/master_badges_and_certificates.md\nimport { BadgeItem, CertificateItem } from '@/features/curriculum/curriculumTypes';\n\nexport const badgesData: BadgeItem[] = ${JSON.stringify(badges, null, 2)};\n\nexport const certificatesData: CertificateItem[] = ${JSON.stringify(certificates, null, 2)};\n`
);
console.log(`Saved ${badges.length} badges and ${certificates.length} certificates.`);

// The browser never receives answer keys, feedback or consequences: the server grades labs and missions.
function publicScenario(sc) {
  return { ...sc, choices: sc.choices.map(({ id, text }) => ({ id, text })) };
}
function publicMission(m) {
  return { ...m, stages: m.stages.map((st) => (st.choices ? { ...st, choices: st.choices.map(({ id, text }) => ({ id, text })) } : st)) };
}

// -------------------------------------------------------------
// 4. COMPILE MISSIONS
// -------------------------------------------------------------
const missionFiles = fs.readdirSync(path.join(CS_ROOT, 'Mission')).filter((f) => /^mission_.*\.json$/.test(f)).sort();
const missions = [];

for (const mFile of missionFiles) {
  const mPath = path.join(CS_ROOT, 'Mission', mFile);
  if (fs.existsSync(mPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(mPath, 'utf8'));
      missions.push(data);
    } catch (err) {
      console.error(`Error parsing mission ${mFile}:`, err);
    }
  }
}

writeOut(
  path.join(FRONTEND_DATA, 'missionsData.ts'),
  `// Generated from content/Mission\nexport interface MissionHud {
  key: string;
  label: string;
  start: number;
  suffix?: string;
  max?: number;
  warn_below?: number;
  warn_above?: number;
}

export interface MissionBand {
  id: string;
  title: string;
  text: string;
  requires: Record<string, { min?: number; max?: number }>;
}

export interface MissionOutcome {
  final_title: string;
  bands: MissionBand[];
}

export interface MissionData {\n  mission_id: string;\n  title: string;\n  type: 'simulation' | 'decision_scenario';\n  linked_module_id: string;
  section_id?: string;
  hud?: MissionHud[];
  outcome?: MissionOutcome;\n  role: string;\n  objective: string;\n  environment: string;\n  state_variables: Record<string, unknown>;\n  stages: Record<string, unknown>[];\n  resolution?: Record<string, unknown>;\n  replayability_note?: string;\n  rewards?: Record<string, unknown>;\n  [key: string]: unknown;\n}\n\nexport const missionsData: MissionData[] = ${JSON.stringify(missions.map(publicMission), null, 2)};\n`
);
console.log(`Saved ${missions.length} missions.`);

// -------------------------------------------------------------
// 5. COMPILE ESCAPE ROOM LABS
// -------------------------------------------------------------
const labPath = path.join(CS_ROOT, 'Labs', 'escape_room_scenarios.json');
let escapeRooms = [];
if (fs.existsSync(labPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(labPath, 'utf8'));
    escapeRooms = data.scenarios || [];
  } catch (err) {
    console.error('Error parsing escape room labs:', err);
  }
}

writeOut(
  path.join(FRONTEND_DATA, 'escapeRoomData.ts'),
  `// Generated from content/Labs/escape_room_scenarios.json\nexport interface EscapeScenarioChoice {\n  id: string;\n  text: string;\n}\n\nexport interface EscapeRoomScenario {\n  id: string;\n  title: string;\n  module_id: string;
  section_id: string;\n  difficulty: 'novice' | 'intermediate' | 'professional' | 'expert' | 'quantum_expert';\n  setup: string;\n  prompt: string;\n  choices: EscapeScenarioChoice[];\n  badge_awarded: string;\n  mission_xp_awarded: number;\n}\n\nexport const escapeRoomScenarios: EscapeRoomScenario[] = ${JSON.stringify(escapeRooms.map(publicScenario), null, 2)};\n`
);
console.log(`Saved ${escapeRooms.length} escape room scenarios.`);

const problems = validate({ modules: allModules, tracks, manifest, badges, escapeRooms, missions, quizModuleIds });

// Competency model, Track A lesson structure and item tags (content/curriculum/). Optional until
// the files exist, but once present they must be consistent with the manifest and the quizzes.
const curriculumDir = path.join(CS_ROOT, 'curriculum');
const modelPath = path.join(curriculumDir, 'competency_model.json');
const lessonsPath = path.join(curriculumDir, 'track_a_lessons.json');
if (fs.existsSync(modelPath) && fs.existsSync(lessonsPath)) {
  problems.push(...validateCompetencyModel({
    model: JSON.parse(fs.readFileSync(modelPath, 'utf8')),
    lessonDoc: JSON.parse(fs.readFileSync(lessonsPath, 'utf8')),
    manifestModuleIds: Object.keys(manifest.modules),
    quizItems,
  }));
} else if (fs.existsSync(modelPath) !== fs.existsSync(lessonsPath)) {
  problems.push('content/curriculum needs both competency_model.json and track_a_lessons.json');
}
if (problems.length) {
  console.error(`\nCurriculum validation failed (${problems.length} problem${problems.length === 1 ? '' : 's'}); nothing was written:`);
  problems.forEach((x) => console.error(`  - ${x}`));
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log('Check passed: curriculum data is consistent (nothing written).');
} else {
  fs.mkdirSync(FRONTEND_DATA, { recursive: true });
  for (const [file, text] of pending) fs.writeFileSync(file, text);
  console.log(`Wrote ${pending.length} data files to ${FRONTEND_DATA}.`);
}
