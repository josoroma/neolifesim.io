// src/game/engine/character.ts — Character creation and name validation.
// NO Phaser imports allowed in this module.

import {
  type PlayerCharacter,
  type SpeciesStats,
  Gender,
  SnakeSpecies,
  SPECIES_STATS,
} from './types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Maximum allowed length for a character name. */
export const MAX_NAME_LENGTH = 20;

export interface ValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

/**
 * Validate a candidate character name.
 *
 * Rules:
 * - Must not be empty (after trimming whitespace).
 * - Must not exceed {@link MAX_NAME_LENGTH} characters.
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name must be ${MAX_NAME_LENGTH} characters or less`,
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Character Factory
// ---------------------------------------------------------------------------

/**
 * Create a new {@link PlayerCharacter} with the given species, gender, and
 * name.  The character starts at level 1 with 0 XP and species-specific base
 * stats loaded from {@link SPECIES_STATS}.
 *
 * @throws {Error} if the name fails validation.
 */
export function createCharacter(
  species: SnakeSpecies,
  gender: Gender,
  name: string,
): PlayerCharacter {
  const validation = validateName(name);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const stats: SpeciesStats = SPECIES_STATS[species];

  return {
    name: name.trim(),
    species,
    gender,
    level: 1,
    xp: 0,
    stats,
  };
}
