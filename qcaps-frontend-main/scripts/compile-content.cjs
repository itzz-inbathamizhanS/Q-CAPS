// compile-content.cjs
const fs = require('fs');
const path = require('path');

const CS_ROOT = path.resolve(__dirname, '../../Content-Security');
const FRONTEND_DATA = path.resolve(__dirname, '../src/data');

if (!fs.existsSync(FRONTEND_DATA)) {
  fs.mkdirSync(FRONTEND_DATA, { recursive: true });
}

// -------------------------------------------------------------
// 1. COMPILE QUIZZES
// -------------------------------------------------------------
const quizDirs = [
  'Track-A-Foundations',
  'Track-B-Intermediate',
  'Track-C-Advanced',
  'Track-D-Enterprise'
];

const quizzes = {};

for (const qDir of quizDirs) {
  const dirPath = path.join(CS_ROOT, 'Quizzes', qDir);
  if (!fs.existsSync(dirPath)) continue;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const moduleId = data.module_id;
      quizzes[moduleId] = {
        moduleId: data.module_id,
        title: data.title,
        difficulty: data.difficulty || 'intermediate',
        passingScorePercent: data.passing_score_percent || 70,
        questions: (data.questions || []).map(q => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options || [],
          correctIndex: q.correct_index,
          explanation: q.explanation || ''
        }))
      };
    } catch (err) {
      console.error(`Error parsing quiz ${file}:`, err);
    }
  }
}

fs.writeFileSync(
  path.join(FRONTEND_DATA, 'quizzesData.ts'),
  `// Generated from Content-Security/Quizzes\nimport { ModuleQuiz } from '@/features/curriculum/curriculumTypes';\n\nexport const quizzesData: Record<string, ModuleQuiz> = ${JSON.stringify(quizzes, null, 2)};\n`
);
console.log(`Saved ${Object.keys(quizzes).length} quizzes.`);

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
    const content = fs.readFileSync(path.join(trackFolder, file), 'utf8');
    const lines = content.split('\n');

    // Parse header
    let title = file.replace(/\.md$/, '').replace(/^[A-Z0-9]+_/, '').replace(/_/g, ' ');
    let code = file.split('_')[0];
    let moduleId = `track_${tConfig.trackId.replace('track-', '')}_${file.replace(/\.md$/, '').toLowerCase()}`;
    let level = 'Beginner';
    let estimatedMinutes = 90;

    for (const l of lines) {
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

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

    // Determine prerequisites and unlocks based on track progression
    let prerequisites = [];
    const prevInTrack = moduleIdsInTrack[moduleIdsInTrack.length - 1];
    if (prevInTrack) {
      prerequisites = [prevInTrack];
    } else if (tConfig.trackId === 'track-b') {
      prerequisites = ['track_a_a8_pqc_mitigation'];
    } else if (tConfig.trackId === 'track-c') {
      prerequisites = ['track_b_b11_intermediate_pqc_labs'];
    } else if (tConfig.trackId === 'track-d') {
      prerequisites = ['track_c_c11_pqc_defense_engineering'];
    }

    // XP allocation
    const xpByLevel = { Novice: 100, Beginner: 120, Intermediate: 160, Advanced: 200, Enterprise: 250 };
    const xp = xpByLevel[level] || 150;

    moduleIdsInTrack.push(moduleId);

    allModules.push({
      id: moduleId,
      trackId: tConfig.trackId,
      code,
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

fs.writeFileSync(
  path.join(FRONTEND_DATA, 'curriculumData.ts'),
  `// Generated from Content-Security/Course\nimport { CurriculumModule, CurriculumTrack } from '@/features/curriculum/curriculumTypes';\n\nexport const curriculumTracks: CurriculumTrack[] = ${JSON.stringify(tracks, null, 2)};\n\nexport const curriculumModules: CurriculumModule[] = ${JSON.stringify(allModules, null, 2)};\n`
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
  { id: 'b_lab_5', name: 'QKD Channel Verifier', trackId: 'lab', category: 'lab', unlockTrigger: 'Complete BB84 Diplomatic Channel Mission without compromise', iconName: 'Radio', xpAward: 100, isUnlocked: false }
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

fs.writeFileSync(
  path.join(FRONTEND_DATA, 'badgesData.ts'),
  `// Generated from Content-Security/Badges/master_badges_and_certificates.md\nimport { BadgeItem, CertificateItem } from '@/features/curriculum/curriculumTypes';\n\nexport const badgesData: BadgeItem[] = ${JSON.stringify(badges, null, 2)};\n\nexport const certificatesData: CertificateItem[] = ${JSON.stringify(certificates, null, 2)};\n`
);
console.log(`Saved ${badges.length} badges and ${certificates.length} certificates.`);

// -------------------------------------------------------------
// 4. COMPILE MISSIONS
// -------------------------------------------------------------
const missionFiles = ['mission_bb84_diplomatic_channel.json', 'mission_pqc_migration_enterprise.json'];
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

fs.writeFileSync(
  path.join(FRONTEND_DATA, 'missionsData.ts'),
  `// Generated from Content-Security/Mission\nexport interface MissionData {\n  mission_id: string;\n  title: string;\n  type: 'simulation' | 'decision_scenario';\n  linked_module_id: string;\n  role: string;\n  objective: string;\n  environment: string;\n  state_variables: Record<string, any>;\n  stages: any[];\n  resolution?: any;\n  replayability_note?: string;\n  rewards?: any;\n  [key: string]: any;\n}\n\nexport const missionsData: MissionData[] = ${JSON.stringify(missions, null, 2)};\n`
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

fs.writeFileSync(
  path.join(FRONTEND_DATA, 'escapeRoomData.ts'),
  `// Generated from Content-Security/Labs/escape_room_scenarios.json\nexport interface EscapeScenarioChoice {\n  id: string;\n  text: string;\n  correct: boolean;\n  feedback: string;\n}\n\nexport interface EscapeRoomScenario {\n  id: string;\n  title: string;\n  module_id: string;\n  difficulty: 'novice' | 'intermediate' | 'professional' | 'expert' | 'quantum_expert';\n  setup: string;\n  prompt: string;\n  choices: EscapeScenarioChoice[];\n  badge_awarded: string;\n  mission_xp_awarded: number;\n}\n\nexport const escapeRoomScenarios: EscapeRoomScenario[] = ${JSON.stringify(escapeRooms, null, 2)};\n`
);
console.log(`Saved ${escapeRooms.length} escape room scenarios.`);
console.log('All Content Security data compiled successfully!');
