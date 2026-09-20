// src/pages/BadgesAndCerts.tsx
import React, { useState } from 'react';
import {
  Award,
  Lock,
  Download,
  X,
  FileCheck2
} from 'lucide-react';
import { badgesData, certificatesData } from '@/data/badgesData';
import { curriculumModules } from '@/data/curriculumData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { BadgeItem } from '@/features/curriculum/curriculumTypes';

export const BadgesAndCerts: React.FC = () => {
  const { unlockedBadges, completedModules } = useCurriculumStore();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [activeModalBadge, setActiveModalBadge] = useState<BadgeItem | null>(null);

  // Computed certificate progress
  const trackACompleted = curriculumModules
    .filter((m) => m.trackId === 'track-a')
    .every((m) => completedModules.includes(m.id));

  const trackBCompleted = curriculumModules
    .filter((m) => m.trackId === 'track-b')
    .every((m) => completedModules.includes(m.id));

  const trackCCompleted = curriculumModules
    .filter((m) => m.trackId === 'track-c')
    .every((m) => completedModules.includes(m.id));

  const trackDCompleted = curriculumModules
    .filter((m) => m.trackId === 'track-d')
    .every((m) => completedModules.includes(m.id));

  const isCertEarned = (certId: string) => {
    if (certId === 'cert_cqf') return trackACompleted;
    if (certId === 'cert_cqse') return trackACompleted && trackBCompleted;
    if (certId === 'cert_qce') return trackBCompleted && trackCCompleted;
    if (certId === 'cert_qsa') return trackCCompleted && trackDCompleted;
    if (certId === 'cert_pqctp') return trackACompleted && trackBCompleted && trackCCompleted && trackDCompleted;
    return false;
  };

  const earnedCertsCount = certificatesData.filter((c) => isCertEarned(c.id)).length;
  const totalBadgesCount = badgesData.length;
  const earnedBadgesCount = badgesData.filter((b) => unlockedBadges.includes(b.name)).length;

  const filteredBadges = badgesData.filter((b) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unlocked') return unlockedBadges.includes(b.name);
    return b.trackId === selectedTab;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Region A: Summary Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '32px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(84, 39, 230, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary, #5427e6)'
              }}
            >
              <Award size={22} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Badges & Verified Credentials
            </h1>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
            Verifiable milestone achievements across the 4-track curriculum, capstone submissions, and PQC escape room labs.
          </p>
        </div>

        {/* Counter Pill */}
        <div style={{ display: 'flex', gap: '14px' }}>
          <div
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border, #e2e8f0)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Badges Earned
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
              {earnedBadgesCount} / {totalBadgesCount}
            </div>
          </div>

          <div
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border, #e2e8f0)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Certificates
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary, #5427e6)', marginTop: '2px' }}>
              {earnedCertsCount} / {certificatesData.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '24px'
        }}
      >
        {[
          { id: 'all', label: 'All Badges' },
          { id: 'unlocked', label: `Unlocked (${earnedBadgesCount})` },
          { id: 'track-a', label: 'Track A (Foundations)' },
          { id: 'track-b', label: 'Track B (Intermediate)' },
          { id: 'track-c', label: 'Track C (Specialist)' },
          { id: 'track-d', label: 'Track D (Enterprise)' },
          { id: 'lab', label: 'Labs & Scenarios' }
        ].map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${isActive ? 'var(--color-primary, #5427e6)' : 'var(--color-border, #e2e8f0)'}`,
                backgroundColor: isActive ? 'var(--color-primary, #5427e6)' : 'var(--color-surface, #ffffff)',
                color: isActive ? '#ffffff' : 'var(--color-text-secondary, #64748b)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Region B: Badge Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '48px'
        }}
      >
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.name);

          return (
            <div
              key={badge.id}
              onClick={() => setActiveModalBadge(badge)}
              style={{
                backgroundColor: 'var(--color-surface, #ffffff)',
                border: `1px solid ${isUnlocked ? 'rgba(16, 185, 129, 0.4)' : 'var(--color-border, #e2e8f0)'}`,
                borderRadius: '14px',
                padding: '20px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isUnlocked
                  ? '0 4px 16px rgba(16, 185, 129, 0.12)'
                  : '0 2px 6px rgba(0,0,0,0.02)',
                position: 'relative'
              }}
            >
              {/* Badge Icon */}
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isUnlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.04)',
                  color: isUnlocked ? '#10b981' : '#94a3b8',
                  border: isUnlocked ? '2px solid #10b981' : '2px dashed #cbd5e1',
                  boxShadow: isUnlocked ? '0 0 14px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <Award size={26} strokeWidth={isUnlocked ? 2.2 : 1.5} />
              </div>

              {/* Badge Name */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isUnlocked ? 'var(--color-text-primary)' : '#94a3b8',
                  lineHeight: 1.3
                }}
              >
                {badge.name}
              </div>

              {/* XP Award */}
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: isUnlocked ? '#059669' : '#cbd5e1',
                  marginTop: '6px'
                }}
              >
                +{badge.xpAward} XP
              </div>
            </div>
          );
        })}
      </div>

      {/* Region C: Certificate Tiers */}
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Official Certificate Tiers
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Earned upon passing all track modules and submitting verified capstone projects.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {certificatesData.map((cert) => {
            const isEarned = isCertEarned(cert.id);

            return (
              <div
                key={cert.id}
                style={{
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: `1px solid ${isEarned ? 'rgba(84, 39, 230, 0.4)' : 'var(--color-border, #e2e8f0)'}`,
                  borderRadius: '16px',
                  padding: '24px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  boxShadow: isEarned
                    ? '0 6px 24px rgba(84, 39, 230, 0.1)'
                    : '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', maxWidth: '650px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      backgroundColor: isEarned ? 'rgba(84, 39, 230, 0.15)' : 'rgba(0,0,0,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isEarned ? 'var(--color-primary, #5427e6)' : '#94a3b8'
                    }}
                  >
                    <FileCheck2 size={28} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: isEarned ? 'rgba(84, 39, 230, 0.1)' : 'rgba(0,0,0,0.05)',
                          color: isEarned ? 'var(--color-primary, #5427e6)' : '#64748b',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        {cert.code}
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {cert.title}
                      </h3>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {cert.description}
                    </p>

                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                      <strong>Requirements:</strong> {cert.requirement}
                    </div>
                  </div>
                </div>

                {/* Certificate Action */}
                <div>
                  {isEarned ? (
                    <button
                      onClick={() => alert('Certificate PDF generation is scheduled for automated release.')}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-primary, #5427e6)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Download size={16} />
                      <span>Download Credential</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        color: '#94a3b8',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Lock size={14} />
                      <span>In Progress</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal / Popover */}
      {activeModalBadge && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setActiveModalBadge(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalBadge(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  margin: '0 auto 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: unlockedBadges.includes(activeModalBadge.name)
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(0,0,0,0.04)',
                  color: unlockedBadges.includes(activeModalBadge.name) ? '#10b981' : '#94a3b8',
                  border: unlockedBadges.includes(activeModalBadge.name)
                    ? '2px solid #10b981'
                    : '2px dashed #cbd5e1'
                }}
              >
                <Award size={32} />
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                {activeModalBadge.name}
              </h3>

              <span
                style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: unlockedBadges.includes(activeModalBadge.name)
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(0,0,0,0.05)',
                  color: unlockedBadges.includes(activeModalBadge.name) ? '#065f46' : '#64748b'
                }}
              >
                {unlockedBadges.includes(activeModalBadge.name) ? '✓ Unlocked' : 'Locked'}
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '13px',
                color: '#334155',
                lineHeight: 1.5
              }}
            >
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                Unlock Requirement:
              </div>
              {activeModalBadge.unlockTrigger}
            </div>

            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#64748b'
              }}
            >
              <span>Reward Value:</span>
              <strong style={{ color: '#059669' }}>+{activeModalBadge.xpAward} XP</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
