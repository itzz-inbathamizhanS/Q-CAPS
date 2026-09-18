import React, { useState } from 'react';
import { BookOpen, Compass } from 'lucide-react';
import { AssessmentDomain } from '@/features/assessment/assessmentTypes';
import { LearningModule } from '../learningTypes';
import { LearningModuleCard } from './LearningModuleCard';

interface LearningCatalogProps {
  allModules: LearningModule[];
}

const filterTabs: Array<{ id: string; label: string; domain?: AssessmentDomain }> = [
  { id: 'all', label: 'All Modules' },
  { id: 'sec', label: 'Cybersecurity', domain: 'Cybersecurity Fundamentals' },
  { id: 'crypto', label: 'Cryptography', domain: 'Cryptography Fundamentals' },
  { id: 'pqc', label: 'PQC Fundamentals', domain: 'PQC Fundamentals' },
  { id: 'app', label: 'Applied PQC', domain: 'Applied PQC' },
];

export const LearningCatalog: React.FC<LearningCatalogProps> = ({ allModules }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredModules = allModules.filter((module) => {
    if (activeTab === 'all') return true;
    const tab = filterTabs.find((t) => t.id === activeTab);
    return tab?.domain ? module.domain === tab.domain : true;
  });

  return (
    <section className="max-w-7xl mx-auto px-8 md:px-12 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold uppercase tracking-widest shadow-sm">
              <Compass size={14} /> Full Catalog
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
            <BookOpen className="text-primary" size={32} />
            All Learning Modules
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Structured, progressive learning path from classical cryptography to applied post-quantum migration.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-slate-200/50' 
                    : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid container with spacious gap-10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredModules.map((module) => (
          <div key={module.id} className="transform transition-all duration-300 hover:-translate-y-1">
            <LearningModuleCard module={module} />
          </div>
        ))}
      </div>
    </section>
  );
};
