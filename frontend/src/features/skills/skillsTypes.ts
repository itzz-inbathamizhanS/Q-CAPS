import { AssessmentDomain, DomainScore } from '@/features/assessment/assessmentTypes';

export type CapabilityLevel = 'Strong Capability' | 'Developing Capability' | 'Needs Improvement';

export type PriorityLevel = 'High Priority' | 'Medium Priority' | 'Low Priority';

export interface SkillDomainAnalysis {
  domain: AssessmentDomain;
  score: number;
  capabilityLevel: CapabilityLevel;
  priorityLevel: PriorityLevel;
  explanation: string;
  suggestedFocusTopics: string[];
  color: string;
  totalQuestions: number;
  correctCount: number;
}

export interface SkillGapProfile {
  overallScore: number;
  overallCapability: CapabilityLevel;
  overallInterpretation: string;
  domains: SkillDomainAnalysis[];
  topPriorityGap: SkillDomainAnalysis;
  evaluatedAt: string;
}

export const getCapabilityLevel = (percentage: number): CapabilityLevel => {
  if (percentage >= 75) return 'Strong Capability';
  if (percentage >= 50) return 'Developing Capability';
  return 'Needs Improvement';
};

export const getPriorityLevel = (percentage: number): PriorityLevel => {
  if (percentage >= 75) return 'Low Priority';
  if (percentage >= 50) return 'Medium Priority';
  return 'High Priority';
};

export const getDomainColor = (percentage: number): string => {
  if (percentage >= 75) return 'var(--color-emerald)';
  if (percentage >= 50) return 'var(--color-primary)';
  return 'var(--color-error)';
};

export const getDomainAnalysis = (ds: DomainScore): SkillDomainAnalysis => {
  const capabilityLevel = getCapabilityLevel(ds.percentage);
  const priorityLevel = getPriorityLevel(ds.percentage);
  const color = getDomainColor(ds.percentage);

  let explanation = '';
  let suggestedFocusTopics: string[] = [];

  switch (ds.domain) {
    case 'Cybersecurity Fundamentals':
      if (ds.percentage >= 75) {
        explanation = 'Your foundational understanding of CIA triad, security policies, and data integrity hashing is strong. Maintain this baseline.';
      } else if (ds.percentage >= 50) {
        explanation = 'You understand baseline security concepts, but need to strengthen cryptographic hashing and data integrity verification mechanisms.';
      } else {
        explanation = 'Core cybersecurity concepts require foundational review before progressing to advanced cryptographic security workflows.';
      }
      suggestedFocusTopics = ['CIA Triad & Access Control', 'Cryptographic Hash Functions (SHA-256/3)', 'Data Integrity Verification'];
      break;

    case 'Cryptography Fundamentals':
      if (ds.percentage >= 75) {
        explanation = 'Strong comprehension of asymmetric key pairs, Diffie-Hellman key exchanges, and digital signature mechanics.';
      } else if (ds.percentage >= 50) {
        explanation = 'Developing grasp of classical public-key cryptography. Strengthen understanding of mathematical key exchange and signing principles.';
      } else {
        explanation = 'Public-key cryptography basics require dedicated focus. Understanding key exchange is vital for post-quantum transitions.';
      }
      suggestedFocusTopics = ['Public vs Private Key Mechanics', 'Diffie-Hellman Key Exchange Protocols', 'Digital Signatures & Authentication'];
      break;

    case 'PQC Fundamentals':
      if (ds.percentage >= 75) {
        explanation = 'Excellent grasp of Shor’s quantum algorithm threat, Harvest Now Decrypt Later risks, and lattice-based hardness problems.';
      } else if (ds.percentage >= 50) {
        explanation = 'Good initial awareness of quantum threats, but lattice-based cryptographic principles and risk horizons need reinforcement.';
      } else {
        explanation = 'Current understanding of quantum risks and PQC concepts is weak. Prioritize learning the quantum vulnerability landscape.';
      }
      suggestedFocusTopics = ["Shor's Algorithm & RSA Vulnerability", 'Harvest Now, Decrypt Later (HNDL)', 'Lattice-Based Cryptography (LWE/MLWE)'];
      break;

    case 'Applied PQC':
      if (ds.percentage >= 75) {
        explanation = 'Demonstrated ability to identify NIST PQC standards (ML-KEM / ML-DSA) and hybrid protocol migration strategies.';
      } else if (ds.percentage >= 50) {
        explanation = 'Developing familiarity with NIST standards. Further practice with hybrid TLS configuration and migration steps is recommended.';
      } else {
        explanation = 'Practical implementation and NIST standardization knowledge needs immediate development to execute quantum-safe migrations.';
      }
      suggestedFocusTopics = ['NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)', 'Hybrid Key Exchange in TLS 1.3', 'Cryptographic Agility & Migration'];
      break;
  }

  return {
    domain: ds.domain,
    score: ds.percentage,
    capabilityLevel,
    priorityLevel,
    explanation,
    suggestedFocusTopics,
    color,
    totalQuestions: ds.totalQuestions,
    correctCount: ds.correctCount,
  };
};

export const generateSkillGapProfile = (
  domainScores: DomainScore[],
  overallScore: number,
  evaluatedAt: string
): SkillGapProfile => {
  const domains = domainScores.map(getDomainAnalysis);

  // Weakest domain is the highest priority gap (lowest score)
  const sortedByScore = [...domains].sort((a, b) => a.score - b.score);
  const topPriorityGap = sortedByScore[0] || domains[0];

  const overallCapability = getCapabilityLevel(overallScore);

  let overallInterpretation = '';
  if (overallScore >= 75) {
    overallInterpretation =
      'Your diagnostic baseline demonstrates a strong overall capability across core cybersecurity and post-quantum foundations. Focus on maintaining readiness and mastering applied migration patterns.';
  } else if (overallScore >= 50) {
    overallInterpretation =
      'Your baseline shows a developing capability foundation. Strengthening your specific PQC fundamentals and applied migration skills should be your immediate next focus.';
  } else {
    overallInterpretation =
      'Your diagnostic evidence reveals critical capability gaps across key quantum preparedness domains. A structured foundational learning path is strongly recommended before attempting practical configuration labs.';
  }

  return {
    overallScore,
    overallCapability,
    overallInterpretation,
    domains,
    topPriorityGap,
    evaluatedAt,
  };
};
