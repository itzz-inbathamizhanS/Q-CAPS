import { SkillGapProfile } from '@/features/skills/skillsTypes';
import { LearningModule } from './learningTypes';
import { curriculumModules } from '@/data/curriculumData';

export interface PersonalizedLearningResult {
  hasAssessmentEvidence: boolean;
  recommendedModules: LearningModule[];
  allModules: LearningModule[];
  topPriorityDomainName?: string;
  topPriorityReason?: string;
}

/**
 * Generate personalized learning data by combining assessment skill-gap analysis
 * with actual curriculum progress from the curriculum store.
 *
 * @param profile - Skill gap profile from the assessment, or null if no assessment taken
 * @param completedModules - Array of completed module IDs from the curriculum store
 */
export const getPersonalizedLearning = (
  profile: SkillGapProfile | null,
  completedModules: string[] = []
): PersonalizedLearningResult => {

  // Helper: derive progress from completion state
  const getProgress = (moduleId: string): number => {
    return completedModules.includes(moduleId) ? 100 : 0;
  };

  if (!profile) {
    return {
      hasAssessmentEvidence: false,
      recommendedModules: [],
      allModules: curriculumModules.map((m) => ({
        ...m,
        progressPercentage: getProgress(m.id),
        isRecommended: false,
        priorityLevel: 'Low Priority',
      }) as LearningModule),
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

  // Enrich all modules with learner's priority AND actual progress
  const enrichedModules: LearningModule[] = curriculumModules.map((module) => {
    const analysis = module.domain ? domainAnalysisMap.get(module.domain) : undefined;
    const priorityLevel = analysis ? analysis.priorityLevel : 'Medium Priority';
    const score = analysis ? analysis.score : 0;
    const isCompleted = completedModules.includes(module.id);

    let recommendationReason = '';
    if (isCompleted) {
      recommendationReason = `Completed. Module mastery verified.`;
    } else if (priorityLevel === 'High Priority') {
      recommendationReason = `Priority #1: Recommended to close your critical ${score}% capability gap in ${module.domain}.`;
    } else if (priorityLevel === 'Medium Priority') {
      recommendationReason = `Priority #2: Recommended to strengthen your developing ${score}% capability in ${module.domain}.`;
    } else {
      recommendationReason = `Capability verified (${score}%). Available for continuous refresher and advanced mastery.`;
    }

    // Determine ordering priority based on trackId (A before B, etc) and code
    const isRecommended = !isCompleted && (priorityLevel === 'High Priority' || priorityLevel === 'Medium Priority');

    return {
      ...module,
      progressPercentage: getProgress(module.id),
      priorityLevel,
      recommendationReason,
      isRecommended,
    } as LearningModule;
  });

  // Get top recommended modules based on highest-priority domains — exclude completed modules
  const recommendedModules: LearningModule[] = [];
  for (const domainAnalysis of sortedDomains) {
    const domainMods = enrichedModules
      .filter((m) => m.domain === domainAnalysis.domain && !completedModules.includes(m.id))
      .sort((a, b) => a.id.localeCompare(b.id)); // Fallback to id-based alphabetical sort (which inherently groups track_a before track_b)

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
