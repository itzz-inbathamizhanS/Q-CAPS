export type AssessmentDomain =
  | 'Cybersecurity Fundamentals'
  | 'Cryptography Fundamentals'
  | 'PQC Fundamentals'
  | 'Applied PQC';

export interface AssessmentOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  number: number;
  domain: AssessmentDomain;
  domainCode: string; // e.g. 'SEC-01', 'CRYPTO-02'
  question: string;
  options: AssessmentOption[];
  correctOptionId: string;
  explanation: string;
}

export interface DomainScore {
  domain: AssessmentDomain;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  status: 'Aligned' | 'Moderate Gap' | 'Critical Gap';
}

export interface AssessmentSubmissionResult {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  overallScore: number;
  domainScores: DomainScore[];
  completedAt: string;
}
