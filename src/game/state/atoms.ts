// src/game/state/atoms.ts — Jotai atoms for shared UI/HUD state.
// These atoms bridge engine snapshots into React for the HUD and menus.

import { atom } from 'jotai';
import type { PlayerCharacter } from '../engine/types';

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------

/**
 * Holds the current player character (set during character creation,
 * restored from save on "Continue").  `null` when no character exists yet.
 */
export const playerAtom = atom<PlayerCharacter | null>(null);
