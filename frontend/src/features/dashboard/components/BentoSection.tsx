import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Clock, Play, Radar, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { UserRecommendation } from '@/services/backendService';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { curriculumModules } from '@/data/curriculumData';

interface BentoSectionProps {
  liveRecommendation?: UserRecommendation | null;
}

export const BentoSection: React.FC<BentoSectionProps> = ({ liveRecommendation }) => {
  const navigate = useNavigate();
  const { getRecommendedNextModule, completedModules } = useCurriculumStore();
  const recommendedId = liveRecommendation?.course_id || getRecommendedNextModule();
  const recommendedMod = curriculumModules.find(m => m.id === recommendedId);

  const displayTitle = liveRecommendation?.title || recommendedMod?.title || 'Shor\'s Algorithm & RSA';
  const displayDesc = liveRecommendation?.reason || 'Critical for understanding the upcoming PQC migration.';
  const displayBadge = liveRecommendation?.priority ? `Priority: ${liveRecommendation.priority}` : 'Recommended';

  const totalModules = curriculumModules.length;
  const progressPercent = Math.round((completedModules.length / totalModules) * 100);

  const recommendedLearning = {
    level: recommendedMod?.level || 'Intermediate',
    duration: recommendedMod ? `${recommendedMod.estimatedMinutes} mins` : '45 mins',
    progress: progressPercent,
    ctaText: 'Start Module',
    ctaLink: `/learning/${recommendedId}`,
  };

  const practicalChallenge = {
    title: 'OSINT Asset Discovery',
    description: 'Use the interactive scanner to identify exposed endpoints and analyze their cryptographic posture.',
    ctaText: 'Launch Scanner',
    ctaLink: '/scanner',
  };
  return (
    <section className="bento-grid">
      {/* Main Feature: Recommended Learning (Spans 8 cols) */}
      <Card
        variant="glass"
        padding="none"
        className="bento-main-col"
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative subtle purple radial tint */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '256px',
            height: '256px',
            background: 'radial-gradient(circle, rgba(84, 39, 230, 0.08) 0%, transparent 70%)',
            borderBottomLeftRadius: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header Section */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Badge variant="neutral">{displayBadge}</Badge>
          </div>
          <h3
            style={{
              fontSize: '24px',
              fontWeight: 600,
              lineHeight: '32px',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
              marginBottom: '8px',
            }}
          >
            {displayTitle}
          </h3>
          <p
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              color: 'var(--color-text-on-surface-variant)',
              maxWidth: '640px',
            }}
          >
            {displayDesc}
          </p>
        </div>

        {/* Bottom Details & Action */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'var(--color-outline)',
                  letterSpacing: '0.04em',
                }}
              >
                Level
              </span>
              <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {recommendedLearning.level}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'var(--color-outline)',
                  letterSpacing: '0.04em',
                }}
              >
                Duration
              </span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Clock size={15} color="var(--color-text-secondary)" /> {recommendedLearning.duration}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: '180px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'var(--color-outline)',
                  marginBottom: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                Progress ({recommendedLearning.progress}%)
              </span>
              <ProgressBar progress={recommendedLearning.progress} height={8} />
            </div>
          </div>

          <div>
            <Button
              variant="primary"
              size="md"
              rightIcon={<Play size={16} fill="currentColor" />}
              onClick={() => navigate(recommendedLearning.ctaLink)}
            >
              {recommendedLearning.ctaText}
            </Button>
          </div>
        </div>
      </Card>

      {/* Practical Challenge (Spans 4 cols) - Dark Technical Surface */}
      <div
        className="bento-side-col"
        style={{
          backgroundColor: 'var(--cyber-card)',
          border: '1px solid var(--cyber-border)',
          borderRadius: 'var(--radius-card)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Subtle cyan dot grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(#3CB7E8 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'rgba(60, 183, 232, 0.15)',
                color: 'var(--color-technical-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(60, 183, 232, 0.3)',
                marginBottom: '20px',
              }}
            >
              <Radar size={24} />
            </div>

            <h3
              style={{
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: '32px',
                letterSpacing: '-0.01em',
                marginBottom: '10px',
              }}
            >
              {practicalChallenge.title}
            </h3>

            <p
              style={{
                fontSize: '14px',
                lineHeight: '22px',
                color: '#D1D5DB',
                marginBottom: '24px',
              }}
            >
              {practicalChallenge.description}
            </p>
          </div>

          <Button
            variant="cyan"
            size="md"
            fullWidth
            leftIcon={<Rocket size={16} />}
            onClick={() => navigate(practicalChallenge.ctaLink)}
          >
            {practicalChallenge.ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
};
