import React from 'react';
import { Sparkles, Target } from 'lucide-react';
import { LearningModule } from '../learningTypes';
import { LearningModuleCard } from './LearningModuleCard';

interface RecommendedLearningProps {
  recommendedModules: LearningModule[];
  topPriorityReason?: string;
}

export const RecommendedLearning: React.FC<RecommendedLearningProps> = ({
  recommendedModules,
  topPriorityReason,
}) => {
  if (recommendedModules.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-8 md:px-12 mb-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold uppercase tracking-widest shadow-sm">
              <Sparkles size={14} /> Priority Mission
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
            <Target className="text-primary" size={32} />
            Recommended For You
          </h2>
          {topPriorityReason && (
            <p className="text-lg text-slate-600 font-medium">
              {topPriorityReason}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {recommendedModules.map((module) => (
          <div key={module.id} className="relative group">
            {/* Glow effect behind featured cards */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative h-full transform transition duration-500 group-hover:scale-[1.01]">
              <LearningModuleCard module={module} featured />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
