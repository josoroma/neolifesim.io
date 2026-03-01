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
