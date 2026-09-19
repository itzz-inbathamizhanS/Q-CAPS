import React from 'react';
import { Card } from '@/components/ui/Card';
import { MessageSquare, Users, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MOCK_THREADS = [
  {
    id: 1,
    title: 'Migrating legacy RSA infrastructure to CRYSTALS-Kyber: Best Practices',
    author: 'Alice_QKD',
    replies: 42,
    views: 1205,
    category: 'PQC Algorithms',
    time: '2h ago',
    avatarColor: 'var(--color-primary)'
  },
  {
    id: 2,
    title: 'How to bypass classical WAFs using quantum-inspired tunneling?',
    author: 'ZeroDayBob',
    replies: 15,
    views: 840,
    category: 'Offensive Security',
    time: '5h ago',
    avatarColor: 'var(--color-emerald)'
  },
  {
    id: 3,
    title: 'Does anyone have a good primer on Lattice-based cryptography math?',
    author: 'CryptoNewbie',
    replies: 8,
    views: 310,
    category: 'Mathematics',
    time: '1d ago',
    avatarColor: '#f59e0b'
  },
  {
    id: 4,
    title: 'QKD Hardware implementation discussion - Toshiba vs IDQ',
    author: 'HardwareHacker',
    replies: 27,
    views: 950,
    category: 'Hardware',
    time: '2d ago',
    avatarColor: '#ec4899'
  }
];

export const Community: React.FC = () => {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users className="text-primary-500" />
            Global Mentorship Hub
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
            Collaborative intelligence network for quantum-resilient operators.
          </p>
        </div>
        <Button variant="primary">New Intel Thread</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        
        {/* Main Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'rgba(0,0,0,0.2)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '8px',
              padding: '0 16px'
            }}>
              <Search size={18} color="var(--color-text-secondary)" />
              <input 
                type="text" 
                placeholder="Search classified discussions..." 
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-primary)',
                  padding: '12px',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {MOCK_THREADS.map(thread => (
            <Card key={thread.id} variant="glass" padding="normal" className="hover:border-primary-500/50 transition-colors cursor-pointer">
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: thread.avatarColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  {thread.author.substring(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      {thread.title}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {thread.time}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-primary)' }}>@{thread.author}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                      <MessageSquare size={14} />
                      {thread.replies} replies
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                      <TrendingUp size={14} />
                      {thread.views} views
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      color: 'var(--color-text-secondary)'
                    }}>
                      {thread.category}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card variant="glass" padding="normal">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              Active Mentors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Dr. Shor (Quantum Math)', 'CipherPunk99 (Offensive)', 'Alice (QKD Architecture)'].map((mentor, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-emerald)' }}></div>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{mentor}</span>
                </div>
              ))}
            </div>
          </Card>
          
          <Card variant="glass" padding="normal">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              Trending Tags
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['#Kyber', '#Lattice', '#QKD', '#ZeroTrust', '#ShorAlgorithm'].map((tag, i) => (
                <span key={i} style={{ fontSize: '12px', color: 'var(--color-primary)', backgroundColor: 'rgba(84, 39, 230, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
