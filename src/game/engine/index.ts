// src/game/engine — Pure simulation logic (ticks, stats, events).
// NO Phaser imports allowed in this module.

export {
  SnakeSpecies,
  Gender,
  SPECIES_STATS,
  NEEDS_DECAY_RATES,
  NEEDS_HEALTH_DAMAGE,
  NEEDS_WARNING_THRESHOLD,
  LOW_ENERGY_SPEED_MULTIPLIER,
  createNeeds,
  type SpeciesStats,
  type PlayerCharacter,
  type Needs,
  type NeedsTickResult,
  type DeathCause,
} from './types';

export {
  createCharacter,
  validateName,
  MAX_NAME_LENGTH,
  type ValidationResult,
} from './character';

export { tickNeeds } from './needs';
