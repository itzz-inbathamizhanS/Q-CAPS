import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const ErrorPage: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'System Failure';
  let message = 'An unexpected error occurred in the quantum matrix.';
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = '404 - Sector Not Found';
      message = 'The requested resource could not be located on the platform. It may have been classified or redacted.';
    } else if (error.status === 401) {
      title = '401 - Unauthorized Access';
      message = 'You lack the necessary clearance to access this sector.';
    } else if (error.status === 503) {
      title = '503 - Mainframe Offline';
      message = 'The analytics backend is currently unreachable. Please verify system status.';
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-background, #0a0a0f)',
      backgroundImage: 'radial-gradient(circle at center, rgba(84, 39, 230, 0.05) 0%, transparent 60%)',
      padding: '24px'
    }}>
      <Card variant="glass" padding="large" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={32} color="#ef4444" />
          </div>
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          {title}
        </h1>
        
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} />
            Reboot
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Home size={16} />
            Return to HQ
          </Button>
        </div>
        
        {import.meta.env.DEV && statusCode !== 404 && (
          <div style={{ marginTop: '32px', textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', margin: 0, whiteSpace: 'pre-wrap' }}>
              {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
