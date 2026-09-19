import React from 'react';
import { Sidebar } from './Sidebar';
import { X } from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface shadow-2xl z-50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-primary z-50"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <Sidebar isMobile onCloseMobile={onClose} />
      </div>
    </div>
  );
};
