import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
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
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <BookOpen size={18} color="var(--color-secondary)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>
              Full Curriculum
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            All Learning Modules
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Structured, progressive learning path from classical cryptography to applied post-quantum migration.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px', backgroundColor: 'var(--color-surface-dim)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredModules.map((module) => (
          <LearningModuleCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  );
};
