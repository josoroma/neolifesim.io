// src/game/engine/actions.ts — Player actions: hunting, eating, drinking.
// NO Phaser imports allowed in this module.

import {
  type Needs,
  type Position,
  type Prey,
  type WorldMap,
  type HuntResult,
  type EatResult,
  type DrinkResult,
  PREY_NUTRITION,
  HUNT_DETECTION_RANGE,
  HUNT_BASE_SUCCESS_RATE,
  HUNT_MIN_ENERGY,
  HUNT_ENERGY_COST,
  DRINK_DETECTION_RANGE,
  DRINK_THIRST_RESTORE,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a value to the [0, 100] range. */
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Euclidean distance between two positions. */
export function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ---------------------------------------------------------------------------
// Hunt
// ---------------------------------------------------------------------------

/**
 * Compute the probability that a hunt succeeds.
 *
 * Formula:
 *   P = BASE × distanceFactor × energyFactor × stealthFactor × fleeingPenalty × alertnessFactor
 *
 * - **distanceFactor**: linear falloff from 1.0 at distance 0 to 0.0 at
 *   {@link HUNT_DETECTION_RANGE}.
 * - **energyFactor**: scales from 0.5 at energy 10 to 1.0 at energy 100.
 * - **stealthFactor**: scales from 0.7 at stealth 0 to 1.0 at stealth 100.
 * - **fleeingPenalty**: 1.0 when prey is idle, 0.3 when prey is fleeing
 *   (fleeing prey is very hard to catch).
 * - **alertnessFactor**: higher prey alertness lowers success. Scales from 1.0
 *   (alertness 0) down to a minimum of 0.3.
 */
export function huntSuccessProbability(
  dist: number,
  energy: number,
  stealth: number,
  preyState: 'idle' | 'flee',
  alertness: number,
): number {
  if (dist >= HUNT_DETECTION_RANGE) return 0;

  const distanceFactor = 1 - dist / HUNT_DETECTION_RANGE;
  const energyFactor = 0.5 + 0.5 * (energy / 100);
  const stealthFactor = 0.7 + 0.3 * (stealth / 100);
  const fleeingPenalty = preyState === 'flee' ? 0.3 : 1.0;
  const alertnessFactor = Math.max(0.3, 1 - 0.5 * (alertness / HUNT_DETECTION_RANGE));

  return HUNT_BASE_SUCCESS_RATE * distanceFactor * energyFactor * stealthFactor * fleeingPenalty * alertnessFactor;
}

/**
 * Attempt to hunt a prey entity.
 *
 * Preconditions checked:
 * 1. Player energy must be ≥ {@link HUNT_MIN_ENERGY}.
 * 2. Prey must be `idle` or `flee` (not already `caught` or `dead`).
 * 3. Distance must be < {@link HUNT_DETECTION_RANGE}.
 *
 * If all pass, a random roll (provided via `roll`) is compared against
 * {@link huntSuccessProbability} to determine success. The hunt costs
 * {@link HUNT_ENERGY_COST} energy when the strike is attempted (i.e.
 * when all preconditions pass). Precondition failures cost 0 energy.
 *
 * @param playerPosition  Current player position in the world.
 * @param playerEnergy    Current player energy stat (0–100).
 * @param playerStealth   Player's species stealth stat (0–100).
 * @param prey            Target prey entity.
 * @param roll            Random value in [0, 1) — injected for testability.
 *                        Defaults to `Math.random()`.
 */
export function attemptHunt(
  playerPosition: Position,
  playerEnergy: number,
  playerStealth: number,
  prey: Prey,
  roll: number = Math.random(),
): HuntResult {
  // --- Pre-condition: energy check ----------------------------------------
  if (playerEnergy < HUNT_MIN_ENERGY) {
    return {
      success: false,
      prey,
      message: 'Too exhausted to hunt',
      energyCost: 0,
    };
  }

  // --- Pre-condition: prey must be huntable -------------------------------
  if (prey.state === 'caught' || prey.state === 'dead') {
    return {
      success: false,
      prey,
      message: 'Prey is not huntable',
      energyCost: 0,
    };
  }

  // --- Pre-condition: distance check --------------------------------------
  const dist = distance(playerPosition, prey.position);
  if (dist >= HUNT_DETECTION_RANGE) {
    return {
      success: false,
      prey,
      message: 'Prey is out of range',
      energyCost: 0,
    };
  }

  // --- Roll against success probability -----------------------------------
  const probability = huntSuccessProbability(
    dist,
    playerEnergy,
    playerStealth,
    prey.state,
    prey.alertness,
  );

  if (roll < probability) {
    return {
      success: true,
      prey: { ...prey, state: 'caught' },
      message: `Caught the ${prey.species}!`,
      energyCost: HUNT_ENERGY_COST,
    };
  }

  // Failed — prey flees
  return {
    success: false,
    prey: { ...prey, state: 'flee' },
    message: 'Prey escaped!',
    energyCost: HUNT_ENERGY_COST,
  };
}

// ---------------------------------------------------------------------------
// Eat
// ---------------------------------------------------------------------------

/**
 * Eat a caught prey to restore hunger.
 *
 * Returns a result object indicating success or failure. If the prey is not
 * in the `caught` state the call returns `{ success: false }` with unchanged
 * needs/prey — no exception is thrown.
 *
 * @param needs  Current player needs snapshot.
 * @param prey   The prey to consume — must be in `caught` state.
 */
export function eat(needs: Needs, prey: Prey): EatResult {
  if (prey.state !== 'caught') {
    return {
      success: false,
      needs,
      prey,
      nutritionGained: 0,
      message: `Cannot eat prey in "${prey.state}" state — must be "caught"`,
    };
  }

  const nutrition = PREY_NUTRITION[prey.species];
  const newHunger = clamp(needs.hunger + nutrition);
  const nutritionGained = newHunger - needs.hunger;

  return {
    success: true,
    needs: { ...needs, hunger: newHunger },
    prey: { ...prey, state: 'dead' },
    nutritionGained,
    message: `Ate the ${prey.species} — restored ${nutritionGained} hunger`,
  };
}

// ---------------------------------------------------------------------------
// Drink
// ---------------------------------------------------------------------------

/**
 * Find the nearest water source within {@link DRINK_DETECTION_RANGE}.
 *
 * @returns The distance to the nearest source, or `Infinity` if none are
 *          within range.
 */
function nearestWaterDistance(playerPosition: Position, worldMap: WorldMap): number {
  let minDist = Infinity;
  for (const source of worldMap.waterSources) {
    const d = distance(playerPosition, source.position);
    if (d < minDist) {
      minDist = d;
    }
  }
  return minDist;
}

/**
 * Attempt to drink from a nearby water source.
 *
 * Preconditions checked:
 * 1. At least one water source must be within {@link DRINK_DETECTION_RANGE}
 *    of the player position.
 *
 * On success thirst is restored by {@link DRINK_THIRST_RESTORE} (clamped to
 * 100). Other needs are left unchanged.
 *
 * @param playerPosition  Current player position in the world.
 * @param needs           Current player needs snapshot.
 * @param worldMap        World map containing water source positions.
 */
export function attemptDrink(
  playerPosition: Position,
  needs: Needs,
  worldMap: WorldMap,
): DrinkResult {
  const dist = nearestWaterDistance(playerPosition, worldMap);

  if (dist >= DRINK_DETECTION_RANGE) {
    return {
      success: false,
      needs,
      thirstRestored: 0,
      message: 'No water nearby',
    };
  }

  const newThirst = clamp(needs.thirst + DRINK_THIRST_RESTORE);
  const thirstRestored = newThirst - needs.thirst;

  return {
    success: true,
    needs: { ...needs, thirst: newThirst },
    thirstRestored,
    message: `Drank water — restored ${thirstRestored} thirst`,
  };
}
