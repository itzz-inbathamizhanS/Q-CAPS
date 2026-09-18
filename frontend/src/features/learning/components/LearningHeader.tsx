import { BookOpen, Sparkles, Target, Zap } from 'lucide-react';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';

interface LearningHeaderProps {
  hasAssessmentEvidence: boolean;
}

export const LearningHeader: React.FC<LearningHeaderProps> = ({
  hasAssessmentEvidence,
}) => {
  const { streakDays, xp } = useCurriculumStore();
  const currentLevel = Math.floor(xp / 500) + 1;

  return (
    <section className="relative overflow-hidden bg-white/80 border-b border-slate-200/60 backdrop-blur-md px-8 md:px-12 py-16 lg:py-24 shadow-sm mb-12">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        <div className="max-w-2xl space-y-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm ${
              hasAssessmentEvidence
                ? 'bg-indigo-50 border-indigo-200 text-primary'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {hasAssessmentEvidence ? (
              <>
                <Sparkles size={16} />
                <span>Skill-Gap Adaptive Path Active</span>
              </>
            ) : (
              <>
                <BookOpen size={16} />
                <span>Full Curriculum Catalog</span>
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Curriculum Hub
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
            {hasAssessmentEvidence
              ? 'Your personalized post-quantum cybersecurity curriculum is targeted to resolve your verified diagnostic skill gaps.'
              : 'Explore the complete foundational and applied quantum-safe cybersecurity curriculum catalog.'}
          </p>
        </div>

        {/* Global Stats Mini-Widget */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-lg min-w-[280px] space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center border border-indigo-100 shadow-inner">
              <Target size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Operator Level</p>
              <p className="text-3xl font-extrabold text-slate-900">Lv. {currentLevel}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total XP</p>
              <p className="text-lg font-bold text-primary flex items-center gap-1.5"><Zap size={16} /> {xp}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Streak</p>
              <p className="text-lg font-bold text-amber-500 flex items-center gap-1.5"><Sparkles size={16} /> {streakDays} Days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
