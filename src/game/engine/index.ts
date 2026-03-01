// src/game/engine — Pure simulation logic (ticks, stats, events).
// NO Phaser imports allowed in this module.

export {
  SnakeSpecies,
  Gender,
  SPECIES_STATS,
  type SpeciesStats,
  type PlayerCharacter,
} from './types';

export {
  createCharacter,
  validateName,
  MAX_NAME_LENGTH,
  type ValidationResult,
} from './character';
