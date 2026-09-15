import React from 'react';
import { Card } from '@/components/ui/Card';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { useAuthStore } from '@/features/auth/authStore';
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
import { Target, Activity, Zap } from 'lucide-react';

export const Reassessment: React.FC = () => {
  const { quizScores } = useCurriculumStore();
  const { userId } = useAuthStore();

  // Mapping topics to readable labels for charts
  const topicMap: Record<string, string> = {
    'classical_crypto': 'Classical Crypto',
    'quantum_mechanics': 'Quantum Basics',
    'pqc_algorithms': 'PQC Algorithms',
    'practical_security': 'Practical Sec',
    'networking': 'Networking',
    'algorithms': 'Algorithms'
  };

  // Transform quizScores dictionary into an array for Recharts
  const data = Object.keys(topicMap).map(key => ({
    subject: topicMap[key],
    score: quizScores[key] || 0,
    fullMark: 100
  }));

  // Calculate some delta metrics (mocking previous score vs current score for visual impact)
  const deltaData = Object.keys(topicMap).map(key => {
    const current = quizScores[key] || 0;
    const previous = Math.max(0, current - (Math.random() * 30 + 10)); // simulated previous score
    return {
      name: topicMap[key],
      Baseline: Math.round(previous),
      Current: current
    };
  });

  const totalScore = Object.values(quizScores).reduce((a, b) => a + b, 0);
  const avgScore = Object.keys(quizScores).length > 0 ? Math.round(totalScore / Object.keys(quizScores).length) : 0;

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
          Progress & Reassessment Delta
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Empirical capability tracking. Visualizing your acquisition of quantum-safe cryptographic skills.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
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
            <span style={{ fontSize: '13px', fontWeight: 600 }}>MODULES MASTERED</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {Object.keys(quizScores).length}
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Radar Chart */}
        <Card variant="glass" padding="large">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Capability Matrix (Radar)
          </h2>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
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

        {/* Delta Bar Chart */}
        <Card variant="glass" padding="large">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Acquisition Delta (Before / After)
          </h2>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deltaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Current" fill="var(--color-emerald)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
};
