// src/pages/MissionHub.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { missionsData } from '@/data/missionsData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { Button } from '@/components/ui/Button';

export const MissionHub: React.FC = () => {
  const navigate = useNavigate();
  const { completedMissions } = useCurriculumStore();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
            <Rocket size={22} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Mission Control
          </h1>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '780px' }}>
          High-stakes operational simulations where theoretical quantum cybersecurity meets real-world constraints, live photon telemetry, and executive risk governance.
        </p>
      </div>

      {/* Grid of Missions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {missionsData.map((mission) => {
          const isDone = completedMissions.includes(mission.mission_id);
          const isSimulation = mission.type === 'simulation';

          return (
            <div
              key={mission.mission_id}
              style={{
                backgroundColor: 'var(--color-surface, #ffffff)',
                border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.4)' : 'var(--color-border, #e2e8f0)'}`,
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ flex: 1, minWidth: '320px' }}>
                {/* Meta Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: isSimulation ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: isSimulation ? '#0284c7' : '#b45309',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {isSimulation ? 'Interactive Simulation' : 'Executive Decision Scenario'}
                  </span>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {mission.linked_module_id}
                  </span>

                  {isDone && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#065f46',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Completed</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  {mission.title}
                </h2>

                {/* Role & Objective */}
                <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500, marginBottom: '6px' }}>
                  <strong>Role:</strong> {mission.role}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {mission.objective}
                </p>

                {/* Environment Brief snippet */}
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: 1.5,
                    borderLeft: '3px solid #64748b'
                  }}
                >
                  <strong>Operational Context:</strong> {mission.environment}
                </div>
              </div>

              {/* Action Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '20px',
                  minWidth: '200px'
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', color: '#f59e0b', fontWeight: 600, fontSize: '14px' }}>
                    <Zap size={16} />
                    <span>+{((mission.rewards?.mission_xp_awarded as number) || 150)} XP</span>
                  </div>
                  {Boolean(mission.rewards?.badge_awarded) && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Unlocks {(mission.rewards?.badge_awarded as string)} Badge
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  onClick={() => navigate(`/missions/${mission.mission_id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  <span>{isDone ? 'Replay Mission' : 'Enter Mission →'}</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
