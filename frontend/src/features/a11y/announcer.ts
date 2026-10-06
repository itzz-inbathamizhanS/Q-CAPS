import { create } from 'zustand';

const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

interface AnnouncerState {
  message: string;
  announce: (message: string) => void;
}

/**
 * One polite live region for the whole app (rendered by AppShell). Pages call announce() when something
 * important happens out of view: a graded result, a scan finishing, mission feedback. The region exists before
 * its text changes, so screen readers reliably read the update.
 */
export const useAnnouncer = create<AnnouncerState>((set) => ({
  message: '',
  // A trailing zero-width space toggles so that repeating the same sentence is announced again.
  announce: (message) => set((s) => ({ message: s.message === message ? message + ZERO_WIDTH_SPACE : message })),
}));

export const announce = (message: string) => useAnnouncer.getState().announce(message);
