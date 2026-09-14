import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { fetchLeaderboard, LeaderboardEntry } from '@/services/backendService';
import { useAuthStore } from '@/features/auth/authStore';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';

export const Organization: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchLeaderboard()
      .then((data) => {
        if (isMounted) {
          // Sort by XP descending (backend might already do this)
          const sorted = [...data].sort((a, b) => b.xp - a.xp);
          // Assign rank dynamically just in case
          const ranked = sorted.map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));
          setLeaderboard(ranked);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching leaderboard:', error);
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#f59e0b" />;
      case 2:
        return <Medal size={24} color="#94a3b8" />;
      case 3:
        return <Medal size={24} color="#b45309" />;
      default:
        return <Star size={18} color="var(--color-text-secondary)" />;
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy className="text-emerald-500" />
          Global Workforce Leaderboard
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Real-time enterprise capability matrix. Ranks are determined by cumulative XP and challenge completion.
        </p>
      </div>

      <Card variant="glass" padding="none">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} />
            Top Operators
          </h2>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Syncing matrix data...
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No operators found on the network.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>RANK</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>OPERATOR</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>EXPERIENCE (XP)</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const isMe = entry.id === userId;
                  return (
                    <tr
                      key={entry.id}
                      style={{
                        borderBottom: '1px solid var(--color-border, #e2e8f0)',
                        backgroundColor: isMe ? 'rgba(84, 39, 230, 0.04)' : 'transparent',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {getRankIcon(entry.rank)}
                          <span style={{ fontSize: '16px', fontWeight: entry.rank <= 3 ? 700 : 500, color: entry.rank <= 3 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: isMe ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                              color: isMe ? '#fff' : 'var(--color-text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            {entry.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '15px', fontWeight: isMe ? 700 : 500, color: 'var(--color-text-primary)' }}>
                            {entry.name} {isMe && <span style={{ fontSize: '12px', color: 'var(--color-primary)', marginLeft: '8px' }}>(You)</span>}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {entry.xp.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
