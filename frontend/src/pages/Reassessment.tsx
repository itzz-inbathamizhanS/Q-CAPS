import React from 'react';
import { Card } from '@/components/ui/Card';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { useAuthStore } from '@/features/auth/authStore';
import { curriculumModules } from '@/data/curriculumData';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Target, Activity, Zap, BookOpen } from 'lucide-react';

export const Reassessment: React.FC = () => {
  const { quizScores, completedModules, totalXp } = useCurriculumStore();
  const { userId } = useAuthStore();

  // Aggregate quiz scores by domain using the canonical module metadata
  const domainScoresMap: Record<string, number[]> = {};
  for (const [moduleId, score] of Object.entries(quizScores)) {
    const mod = curriculumModules.find(m => m.id === moduleId);
    const domain = mod?.domain ?? 'Unknown';
    if (!domainScoresMap[domain]) domainScoresMap[domain] = [];
    domainScoresMap[domain].push(score);
  }

  const domainAvg = (domain: string): number => {
    const scores = domainScoresMap[domain];
    if (!scores || scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Build radar chart data from the 4 assessment domains
  const domainLabels: Record<string, string> = {
    'Cybersecurity Fundamentals': 'Cybersecurity',
    'Cryptography Fundamentals': 'Cryptography',
    'PQC Fundamentals': 'PQC',
    'Applied PQC': 'Applied PQC',
  };

  const radarData = Object.entries(domainLabels).map(([domain, label]) => ({
    subject: label,
    score: domainAvg(domain),
    fullMark: 100
  }));

  // Bar chart: show per-module quiz scores (real data, no fake baselines)
  const barData = Object.entries(quizScores)
    .map(([moduleId, score]) => {
      const mod = curriculumModules.find(m => m.id === moduleId);
      return {
        name: mod?.code ?? moduleId.slice(-6),
        Score: score,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const quizCount = Object.keys(quizScores).length;
  const avgScore = quizCount > 0
    ? Math.round(Object.values(quizScores).reduce((a, b) => a + b, 0) / quizCount)
    : 0;

  if (!userId) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Please log in to view your progress reassessment.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Target className="text-primary-500" />
          Progress & Reassessment
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Empirical capability tracking. Visualizing your acquisition of quantum-safe cryptographic skills.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card variant="glass" padding="normal" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
            <Activity size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>AVERAGE PROFICIENCY</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {avgScore}%
          </div>
        </Card>
        
        <Card variant="glass" padding="normal" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
            <Zap size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>QUIZZES PASSED</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {quizCount}
          </div>
        </Card>

        <Card variant="glass" padding="normal" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
            <BookOpen size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>MODULES COMPLETED</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {completedModules.length}
          </div>
        </Card>

        <Card variant="glass" padding="normal" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
            <Zap size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>TOTAL XP</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {totalXp.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Radar Chart */}
        <Card variant="glass" padding="large">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Domain Capability (Radar)
          </h2>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Proficiency"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.4}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Per-Module Bar Chart */}
        <Card variant="glass" padding="large">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Quiz Scores by Module
          </h2>
          <div style={{ width: '100%', height: '300px' }}>
            {barData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                Complete quizzes to see your scores here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};
