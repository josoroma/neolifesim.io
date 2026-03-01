'use client';

// src/game/state/provider.tsx — Jotai Provider wrapper for the React tree.
// Ensures all client components share the same Jotai store instance.

import type { JSX } from 'react';
import { Provider } from 'jotai';
import type { ReactNode } from 'react';

interface GameStateProviderProps {
  readonly children: ReactNode;
}

/**
 * Wrap the application tree with Jotai's Provider so that atoms are
 * shared across client component boundaries in the Next.js App Router.
 */
export function GameStateProvider({ children }: GameStateProviderProps): JSX.Element {
  return <Provider>{children}</Provider>;
}
