// src/game/engine — Pure simulation logic (ticks, stats, events).
// NO Phaser imports allowed in this module.

export {
  SnakeSpecies,
  Gender,
  PreySpecies,
  SPECIES_STATS,
  PREY_NUTRITION,
  NEEDS_DECAY_RATES,
  NEEDS_HEALTH_DAMAGE,
  NEEDS_WARNING_THRESHOLD,
  LOW_ENERGY_SPEED_MULTIPLIER,
  HUNT_DETECTION_RANGE,
  HUNT_BASE_SUCCESS_RATE,
  HUNT_MIN_ENERGY,
  HUNT_ENERGY_COST,
  DRINK_DETECTION_RANGE,
  DRINK_THIRST_RESTORE,
  createNeeds,
  type SpeciesStats,
  type PlayerCharacter,
  type Needs,
  type NeedsTickResult,
  type DeathCause,
  type Position,
  type Prey,
  type PreyState,
  type HuntResult,
  type EatResult,
  type WaterSource,
  type WorldMap,
  type DrinkResult,
} from './types';

export {
  createCharacter,
  validateName,
  MAX_NAME_LENGTH,
  type ValidationResult,
} from './character';

export { tickNeeds } from './needs';

export {
  attemptHunt,
  eat,
  attemptDrink,
  distance,
  huntSuccessProbability,
} from './actions';
