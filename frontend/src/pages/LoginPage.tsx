import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Fingerprint, Activity, ChevronRight, Lock } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { loginUser, registerUser, fetchUserProfile } from '@/services/backendService';
import { Button } from '@/components/ui/Button';

import { useCurriculumStore } from '@/features/curriculum/curriculumStore';

export const LoginPage: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setError('Name and Password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isRegisterMode) {
        await registerUser(name.trim(), password.trim());
      }
      
      const authData = await loginUser(name.trim(), password.trim());
      if (authData && authData.access_token) {
        login(authData.user_id, authData.user_name, authData.access_token);
        
        // Fetch profile to get progress data
        const profile = await fetchUserProfile(authData.user_id);
        if (profile) {
            useCurriculumStore.getState().rehydrate(profile.progress_data);
        }
        navigate('/dashboard');
      } else {
        setError('Authentication failed. Invalid response.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-background, #f8fafc)',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--color-surface, #ffffff)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid rgba(84, 39, 230, 0.1)',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Cyber aesthetics decorations */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(84, 39, 230, 0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'rgba(84, 39, 230, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--color-primary, #5427e6)'
          }}>
            <Shield size={32} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--color-text-primary, #0f172a)',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            Q-CAPS Terminal
          </h1>
          <p style={{
            color: 'var(--color-text-secondary, #64748b)',
            fontSize: '15px'
          }}>
            Authenticate to access the Post-Quantum Cryptography Simulator.
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '8px'
            }}>
              <Fingerprint size={16} color="var(--color-text-secondary)" />
              OPERATOR ID (NAME)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name (e.g. Alice)"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid var(--color-border, #e2e8f0)',
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                fontSize: '15px',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '8px'
            }}>
              <Lock size={16} color="var(--color-text-secondary)" />
              ACCESS KEY (PASSWORD)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid var(--color-border, #e2e8f0)',
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                fontSize: '15px',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Activity size={16} />
              {error}
            </div>
          )}

          <Button
            variant="primary"
            type="submit"
            disabled={!name.trim() || !password.trim() || isLoading}
            style={{
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? 'Authenticating...' : (isRegisterMode ? 'Register Account' : 'Initialize Session')}
            {!isLoading && <ChevronRight size={18} />}
          </Button>
          
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '8px'
            }}
          >
            {isRegisterMode ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </form>
      </div>
    </div>
  );
};
