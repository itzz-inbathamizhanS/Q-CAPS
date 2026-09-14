import { SkillGapProfile } from '@/features/skills/skillsTypes';
import { LearningModule } from './learningTypes';
import { learningModules } from '@/data/learningData';

export interface PersonalizedLearningResult {
  hasAssessmentEvidence: boolean;
  recommendedModules: LearningModule[];
  allModules: LearningModule[];
  topPriorityDomainName?: string;
  topPriorityReason?: string;
}

export const getPersonalizedLearning = (
  profile: SkillGapProfile | null
): PersonalizedLearningResult => {
  if (!profile) {
    return {
      hasAssessmentEvidence: false,
      recommendedModules: [],
      allModules: learningModules.map((m) => ({
        ...m,
        isRecommended: false,
        priorityLevel: 'Low Priority',
      })),
    };
  }

  // Map domain priority map
  const domainAnalysisMap = new Map(profile.domains.map((d) => [d.domain, d]));

  // Sort domains by priority severity (lowest score first)
  const sortedDomains = [...profile.domains].sort((a, b) => {
    // 1. High priority before Medium before Low
    const priorityWeight = { 'High Priority': 3, 'Medium Priority': 2, 'Low Priority': 1 };
    const weightDiff = priorityWeight[b.priorityLevel] - priorityWeight[a.priorityLevel];
    if (weightDiff !== 0) return weightDiff;
    // 2. Lower score first
    return a.score - b.score;
  });

  // Enrich all modules with learner's priority
  const enrichedModules: LearningModule[] = learningModules.map((module) => {
    const analysis = domainAnalysisMap.get(module.domain);
    const priorityLevel = analysis ? analysis.priorityLevel : 'Medium Priority';
    const score = analysis ? analysis.score : 0;

    let recommendationReason = '';
    if (priorityLevel === 'High Priority') {
      recommendationReason = `Priority #1: Recommended to close your critical ${score}% capability gap in ${module.domain}.`;
    } else if (priorityLevel === 'Medium Priority') {
      recommendationReason = `Priority #2: Recommended to strengthen your developing ${score}% capability in ${module.domain}.`;
    } else {
      recommendationReason = `Capability verified (${score}%). Available for continuous refresher and advanced mastery.`;
    }

    return {
      ...module,
      priorityLevel,
      recommendationReason,
      isRecommended: priorityLevel === 'High Priority' || (priorityLevel === 'Medium Priority' && module.order <= 4),
    };
  });

  // Get top recommended modules based on highest-priority domains
  const recommendedModules: LearningModule[] = [];
  for (const domainAnalysis of sortedDomains) {
    const domainMods = enrichedModules
      .filter((m) => m.domain === domainAnalysis.domain)
      .sort((a, b) => a.order - b.order);

    for (const mod of domainMods) {
      if (recommendedModules.length < 3) {
        recommendedModules.push(mod);
      }
    }
  }

  const topGap = profile.topPriorityGap;
  const topPriorityReason = `Targeted curriculum prioritized for your primary skill gap in ${topGap.domain} (${topGap.score}% score).`;

  return {
    hasAssessmentEvidence: true,
    recommendedModules,
    allModules: enrichedModules,
    topPriorityDomainName: topGap.domain,
    topPriorityReason,
  };
};
