import React from 'react';
import { Link } from 'react-router-dom';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import type { MissionData } from '@/data/missionsData';

/** Entry point of a mission, shown inside the lesson section it belongs to. */
export const MissionCard: React.FC<{ mission: MissionData }> = ({ mission }) => {
  const { completedMissions } = useCurriculumStore();
  const done = completedMissions.includes(mission.mission_id);
  const badge = mission.rewards?.badge_awarded as string | undefined;
  const xp = mission.rewards?.mission_xp_awarded as number | undefined;
  return (
    <section className="ls-lab ls-lab--mission" aria-labelledby={`mission-${mission.mission_id}`}>
      <div className="ls-lab-head">
        <span className="ls-eyebrow">{mission.type === 'simulation' ? 'INTERACTIVE SIMULATION' : 'MISSION'} · {mission.stages.length} STAGES</span>
        {done && <span className="ls-chip ls-chip--done">Completed</span>}
      </div>
      <h2 id={`mission-${mission.mission_id}`} className="ls-card-title">
        {mission.title}
      </h2>
      <p className="ls-lab-setup">{mission.role}</p>
      <p className="ls-lab-prompt">{mission.objective}</p>
      <div className="ls-lab-head">
        <span className="ls-fineprint">{badge ? `Badge: ${badge}` : ''}{xp ? ` · +${xp} XP` : ''}</span>
        <Link to={`/missions/${mission.mission_id}`} className="ls-btn ls-btn--primary">
          {done ? 'Replay mission' : 'Start mission'}
        </Link>
      </div>
    </section>
  );
};
