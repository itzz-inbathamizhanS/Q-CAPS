import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { X } from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 'var(--header-height)', right: 0, bottom: 0, left: 0, zIndex: 50, display: 'flex' }}>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 'var(--header-height)',
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'var(--color-overlay)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transition: 'opacity 0.2s',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div style={{
        position: 'relative',
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '320px',
        width: '100%',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-raised)',
        zIndex: 50,
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            zIndex: 50,
          }}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <Sidebar variant="drawer" onNavigate={onClose} />
      </div>
    </div>
  );
};

