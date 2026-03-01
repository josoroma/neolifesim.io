// src/game/engine/needs.ts — Needs decay, cross-stat effects, and death logic.
// NO Phaser imports allowed in this module.

import {
  type Needs,
  type NeedsTickResult,
  type DeathCause,
  NEEDS_DECAY_RATES,
  NEEDS_HEALTH_DAMAGE,
  NEEDS_WARNING_THRESHOLD,
  LOW_ENERGY_SPEED_MULTIPLIER,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a value to the [0, 100] range. */
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

// ---------------------------------------------------------------------------
// Tick
// ---------------------------------------------------------------------------

/**
 * Advance the needs system by one or more ticks.
 *
 * 1. Decay hunger, thirst, and energy by their per-tick rates × deltaTime.
 * 2. Apply cross-stat damage: starvation (hunger=0) and dehydration (thirst=0)
 *    reduce health.
 * 3. Emit warnings when any stat drops below {@link NEEDS_WARNING_THRESHOLD}.
 * 4. Check death condition (health ≤ 0).
 * 5. Return the full {@link NeedsTickResult} so callers can react to warnings,
 *    death, and speed changes without reaching back into the needs object.
 *
 * @param needs  Current needs snapshot (immutable — a new object is returned).
 * @param deltaTime  Number of ticks to simulate (typically 1 for a single
 *                   fixed-timestep tick).
 */
export function tickNeeds(needs: Needs, deltaTime: number): NeedsTickResult {
  // Guard: negative deltaTime would increase stats instead of decaying them.
  const dt = Math.max(0, deltaTime);

  // --- 1. Decay ----------------------------------------------------------
  const hunger = clamp(needs.hunger - NEEDS_DECAY_RATES.hunger * dt);
  const thirst = clamp(needs.thirst - NEEDS_DECAY_RATES.thirst * dt);
  const energy = clamp(needs.energy - NEEDS_DECAY_RATES.energy * dt);
  let health = needs.health;

  // --- 2. Cross-stat effects ---------------------------------------------
  const warnings: string[] = [];

  if (hunger === 0) {
    health -= NEEDS_HEALTH_DAMAGE.starvation * dt;
    warnings.push('Starving!');
  }

  if (thirst === 0) {
    health -= NEEDS_HEALTH_DAMAGE.dehydration * dt;
    warnings.push('Dehydrated!');
  }

  health = clamp(health);

  // --- 3. Low-stat warnings (below threshold but > 0) --------------------
  if (hunger > 0 && hunger < NEEDS_WARNING_THRESHOLD) {
    warnings.push('Hungry!');
  }
  if (thirst > 0 && thirst < NEEDS_WARNING_THRESHOLD) {
    warnings.push('Thirsty!');
  }
  if (energy > 0 && energy < NEEDS_WARNING_THRESHOLD) {
    warnings.push('Tired!');
  }
  if (health > 0 && health < NEEDS_WARNING_THRESHOLD) {
    warnings.push('Injured!');
  }

  // --- 4. Speed multiplier (low energy → slow movement) ------------------
  const speedMultiplier = energy === 0 ? LOW_ENERGY_SPEED_MULTIPLIER : 1.0;

  // --- 5. Death ----------------------------------------------------------
  const died = health === 0;
  const deathCause = died ? determineDeathCause(needs, hunger, thirst) : undefined;

  // --- Result ------------------------------------------------------------
  const updatedNeeds: Needs = { hunger, thirst, energy, health };

  return {
    needs: updatedNeeds,
    died,
    deathCause,
    warnings,
    speedMultiplier,
  };
}

// ---------------------------------------------------------------------------
// Death cause attribution
// ---------------------------------------------------------------------------

/**
 * Determine the primary cause of death by comparing which depleted stat
 * contributed more health damage. When both starvation and dehydration are
 * active, the cause with the higher damage rate wins. If equal or neither
 * is depleted, falls back to a descriptive label.
 */
function determineDeathCause(
  previous: Needs,
  hunger: number,
  thirst: number,
): DeathCause {
  const starving = previous.hunger === 0 || hunger === 0;
  const dehydrated = previous.thirst === 0 || thirst === 0;

  if (starving && dehydrated) {
    // Attribute to whichever deals more damage per tick.
    return NEEDS_HEALTH_DAMAGE.dehydration >= NEEDS_HEALTH_DAMAGE.starvation
      ? 'dehydration'
      : 'starvation';
  }
  if (starving) return 'starvation';
  if (dehydrated) return 'dehydration';
  return 'unknown';
}
