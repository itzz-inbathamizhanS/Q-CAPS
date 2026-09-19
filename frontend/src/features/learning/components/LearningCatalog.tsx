import React, { useState, useMemo } from 'react';
import { Layers, Search } from 'lucide-react';
import { LearningModule } from '../learningTypes';
import { LearningModuleCard } from './LearningModuleCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { curriculumTracks } from '@/data/curriculumData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { AssessmentDomain } from '@/features/assessment/assessmentTypes';

interface LearningCatalogProps {
  allModules: LearningModule[];
}

const filterTabs: Array<{ id: string; label: string; domain?: AssessmentDomain }> = [
  { id: 'all', label: 'All Modules' },
  { id: 'sec', label: 'Foundations', domain: 'Cybersecurity Fundamentals' },
  { id: 'crypto', label: 'Cryptography', domain: 'Cryptography Fundamentals' },
  { id: 'pqc', label: 'PQC', domain: 'PQC Fundamentals' },
  { id: 'app', label: 'Applied PQC', domain: 'Applied PQC' },
];

// Track accent color map
const trackAccentColors: Record<string, string> = {
  'track-a': '#38bdf8',
  'track-b': '#818cf8',
  'track-c': '#c084fc',
  'track-d': '#f59e0b',
};

// Track badge styles
const trackBadgeStyles: Record<string, React.CSSProperties> = {
  'track-a': { background: 'rgba(56,189,248,0.12)', color: '#0284c7' },
  'track-b': { background: 'rgba(129,140,248,0.12)', color: '#4f46e5' },
  'track-c': { background: 'rgba(192,132,252,0.12)', color: '#9333ea' },
  'track-d': { background: 'rgba(245,158,11,0.12)', color: '#b45309' },
};

export const LearningCatalog: React.FC<LearningCatalogProps> = ({ allModules }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { completedModules } = useCurriculumStore();

  // Filter by domain tab
  const tabFilteredModules = useMemo(() => {
    return allModules.filter((module) => {
      if (activeTab === 'all') return true;
      const tab = filterTabs.find((t) => t.id === activeTab);
      return tab?.domain ? module.domain === tab.domain : true;
    });
  }, [allModules, activeTab]);

  // Filter by search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredModules;
    const q = searchQuery.toLowerCase();
    return tabFilteredModules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.subtitle?.toLowerCase().includes(q) ||
        m.domain?.toLowerCase().includes(q)
    );
  }, [tabFilteredModules, searchQuery]);

  // Group by track (only show tracks that have visible modules)
  const trackGroups = useMemo(() => {
    return curriculumTracks
      .map((track) => {
        const trackModules = filteredModules.filter((m) => m.trackId === track.id);
        if (trackModules.length === 0) return null;
        const completedCount = trackModules.filter((m) => completedModules.includes(m.id)).length;
        const progressPct = trackModules.length > 0 ? Math.round((completedCount / trackModules.length) * 100) : 0;
        return { track, modules: trackModules, completedCount, progressPct };
      })
      .filter(Boolean) as Array<{
        track: (typeof curriculumTracks)[0];
        modules: LearningModule[];
        completedCount: number;
        progressPct: number;
      }>;
  }, [filteredModules, completedModules]);

  const totalVisible = filteredModules.length;

  return (
    <section className="catalog-section">
      {/* Header */}
      <div className="catalog-header">
        <div>
          <div className="section-eyebrow">
            <Layers size={12} />
            <span>Full Catalog</span>
          </div>
          <h2 className="section-title">All Learning Modules</h2>
          <p className="section-subtitle" style={{ marginTop: '2px' }}>
            Follow the structured Q-CAPS progression from foundations to enterprise quantum security.
            {totalVisible !== allModules.length && (
              <span style={{ marginLeft: '6px', color: 'var(--color-primary)', fontWeight: 600 }}>
                {totalVisible} match
              </span>
            )}
          </p>
        </div>

        <div className="catalog-search-filters">
          {/* Search */}
          <div className="catalog-search">
            <Search size={14} className="catalog-search-icon" />
            <input
              type="text"
              className="catalog-search-input"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`filter-tab${activeTab === tab.id ? ' active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Track Groups */}
      {trackGroups.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          color: 'var(--color-text-secondary)',
          fontSize: '15px',
        }}>
          No modules match your search. <button
            onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
            style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}
          >Clear filters</button>
        </div>
      ) : (
        trackGroups.map(({ track, modules, completedCount, progressPct }) => (
          <div key={track.id} className="track-group">
            {/* Track header */}
            <div className="track-header">
              <div className="track-header-left">
                <span
                  className="track-code-badge"
                  style={trackBadgeStyles[track.id]}
                >
                  {track.code}
                </span>
                <div className="track-header-titles">
                  <div className="track-name">{track.title}</div>
                  <div className="track-cert">
                    {track.certificateCode} · {track.certificateName}
                  </div>
                </div>
              </div>

              <div className="track-header-right">
                <div className="track-progress-bar-wrapper">
                  <div className="track-progress-label">
                    <span>Progress</span>
                    <span>{completedCount} / {modules.length}</span>
                  </div>
                  <ProgressBar
                    progress={progressPct}
                    height={5}
                    color={trackAccentColors[track.id] || 'var(--color-primary)'}
                  />
                </div>
                <span className="track-module-count">
                  {modules.length} module{modules.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Module grid */}
            <div className="module-grid">
              {modules.map((module) => (
                <LearningModuleCard
                  key={module.id}
                  module={module}
                  trackAccentColor={trackAccentColors[track.id]}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
};
