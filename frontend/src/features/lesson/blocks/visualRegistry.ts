import type React from 'react';
import type { VisualBlockData } from '../lessonTypes';
import { HashAvalanche } from './visuals/HashAvalanche';
import { TlsHandshake } from './visuals/TlsHandshake';

/** Visual components that exist, keyed by the block's `kind`. */
export const VISUALS: Record<string, React.FC<{ block: VisualBlockData }>> = {
  'hash-avalanche': HashAvalanche,
  'tls-handshake': TlsHandshake,
};

/** True when a visual component exists for this kind. */
export const isBuiltVisual = (kind: string): boolean => kind in VISUALS;
