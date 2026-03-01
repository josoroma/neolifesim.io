// src/game/engine/types.ts — Core type definitions for the simulation engine.
// NO Phaser imports allowed in this module.

// ---------------------------------------------------------------------------
// Species
// ---------------------------------------------------------------------------

/** Playable snake species available at character creation. */
export enum SnakeSpecies {
  BocaracaAmarilla = 'Bocaracá amarilla',
  Terciopelo = 'Terciopelo',
  SerpienteLora = 'Serpiente lora',
}

// ---------------------------------------------------------------------------
// Gender
// ---------------------------------------------------------------------------

/** Character gender — affects reproduction mechanics at Level 2+. */
export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

// ---------------------------------------------------------------------------
// Species Stats
// ---------------------------------------------------------------------------

/** Base stats that vary per snake species. All values are 0–100 scales. */
export interface SpeciesStats {
  /** Movement speed modifier (higher = faster). */
  readonly speed: number;
  /** Ability to avoid detection by predators (higher = stealthier). */
  readonly stealth: number;
  /** Attack / venom power modifier (higher = stronger). */
  readonly venom: number;
  /** Base maximum health points. */
  readonly maxHealth: number;
}

/**
 * Species-specific base stats.
 *
 * Bocaracá amarilla — balanced, moderate stats across the board.
 * Terciopelo         — powerful venom and high health, but slower.
 * Serpiente lora     — fast and stealthy, but fragile with weaker venom.
 *
 * NOTE: `maxHealth` values above 100 are currently clamped to 100 by
 * {@link createNeeds}. Terciopelo's 120 signals "tankiest species" and may
 * be used as a scaling factor or the cap may be lifted in future stories.
 */
export const SPECIES_STATS: Readonly<Record<SnakeSpecies, SpeciesStats>> = {
  [SnakeSpecies.BocaracaAmarilla]: {
    speed: 50,
    stealth: 50,
    venom: 50,
    maxHealth: 100,
  },
  [SnakeSpecies.Terciopelo]: {
    speed: 35,
    stealth: 40,
    venom: 75,
    maxHealth: 120,
  },
  [SnakeSpecies.SerpienteLora]: {
    speed: 70,
    stealth: 65,
    venom: 30,
    maxHealth: 80,
  },
} as const;

// ---------------------------------------------------------------------------
// Player Character
// ---------------------------------------------------------------------------

/** The player's character state — persisted across saves. */
export interface PlayerCharacter {
  /** Display name chosen by the player. */
  readonly name: string;
  /** Selected snake species. */
  readonly species: SnakeSpecies;
  /** Selected gender. */
  readonly gender: Gender;
  /** Current character level (starts at 1). */
  readonly level: number;
  /** Current experience points within the current level. */
  readonly xp: number;
  /** Species-specific base stats snapshot (immutable after creation). */
  readonly stats: SpeciesStats;
}

// ---------------------------------------------------------------------------
// Needs
// ---------------------------------------------------------------------------

/**
 * Vital stats that decay over time, driving the core survival loop.
 * All values are clamped to the 0–100 range.
 */
export interface Needs {
  /** 0 = starving, 100 = full. Decays every tick; restored by eating. */
  readonly hunger: number;
  /** 0 = dehydrated, 100 = fully hydrated. Decays every tick; restored by drinking. */
  readonly thirst: number;
  /** 0 = exhausted, 100 = fully rested. Decays every tick; restored by sleeping. */
  readonly energy: number;
  /** 0 = dead, 100 = full health. Damaged by cross-stat effects or predators. */
  readonly health: number;
}

// ---------------------------------------------------------------------------
// Needs — Decay Rates (per tick at 20 ticks/sec)
// ---------------------------------------------------------------------------

/**
 * Tunable constants that control how fast each need drains.
 * Defined here so the engine, tests, and future balancing all share one source.
 */
export const NEEDS_DECAY_RATES = {
  /** Hunger loss per tick (≈ 2.5 min from 100 → 0). */
  hunger: 0.033,
  /** Thirst loss per tick (≈ 2 min from 100 → 0). */
  thirst: 0.042,
  /** Energy loss per tick (≈ 4 min from 100 → 0). */
  energy: 0.02,
} as const;

/**
 * Health damage per tick when a cross-stat is at 0.
 * Stacks if multiple stats are depleted simultaneously.
 */
export const NEEDS_HEALTH_DAMAGE = {
  /** Health lost per tick while hunger is 0. */
  starvation: 0.15,
  /** Health lost per tick while thirst is 0. */
  dehydration: 0.2,
} as const;

/** Threshold below which a stat triggers a low-stat warning. */
export const NEEDS_WARNING_THRESHOLD = 20;

/** Speed multiplier applied when energy is 0 (low energy → slow movement). */
export const LOW_ENERGY_SPEED_MULTIPLIER = 0.5;

// ---------------------------------------------------------------------------
// Needs — Tick Result
// ---------------------------------------------------------------------------

/**
 * Possible causes of death returned by the needs system.
 * - `'starvation'`  — hunger was 0 and health drained to 0.
 * - `'dehydration'` — thirst was 0 and health drained to 0.
 * - `'unknown'`     — health reached 0 without an identifiable depleted stat
 *                     (defensive; should not occur during normal gameplay).
 */
export type DeathCause = 'starvation' | 'dehydration' | 'unknown';

/** Outcome of a single needs tick, consumed by HUD, save, and render layers. */
export interface NeedsTickResult {
  /** Updated needs after this tick. */
  readonly needs: Needs;
  /** Whether the character died this tick (health reached 0). */
  readonly died: boolean;
  /** Cause of death, if applicable. */
  readonly deathCause?: DeathCause;
  /** Human-readable warnings emitted this tick (e.g. "Starving!"). */
  readonly warnings: readonly string[];
  /** Movement speed multiplier (1.0 = normal, < 1.0 = slowed). */
  readonly speedMultiplier: number;
}

// ---------------------------------------------------------------------------
// Needs — Factory
// ---------------------------------------------------------------------------

/**
 * Create a fresh Needs object.
 *
 * @param maxHealth  Optional species-specific max health (from
 *                   {@link SpeciesStats.maxHealth}). When provided, health
 *                   is clamped to min(maxHealth, 100) so species caps are
 *                   respected. Defaults to 100.
 */
export function createNeeds(maxHealth = 100): Needs {
  const health = Math.min(Math.max(0, maxHealth), 100);
  return { hunger: 100, thirst: 100, energy: 100, health };
}
