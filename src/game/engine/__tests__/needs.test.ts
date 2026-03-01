// src/game/engine/__tests__/needs.test.ts — Tests for US-3.1: Needs System

import { describe, it, expect } from 'vitest';
import { tickNeeds } from '../needs';
import {
  createNeeds,
  type Needs,
  NEEDS_DECAY_RATES,
  NEEDS_HEALTH_DAMAGE,
  NEEDS_WARNING_THRESHOLD,
  LOW_ENERGY_SPEED_MULTIPLIER,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Run N ticks sequentially, feeding each result into the next.
 *  Short-circuits if the character dies mid-run. */
function runTicks(initial: Needs, ticks: number): ReturnType<typeof tickNeeds> {
  let result = tickNeeds(initial, 1);
  for (let i = 1; i < ticks; i++) {
    if (result.died) break;
    result = tickNeeds(result.needs, 1);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Gherkin Scenario: Hunger decreases over time
// ---------------------------------------------------------------------------
describe('Hunger decreases over time', () => {
  it('should decrease hunger after 20 ticks without eating', () => {
    const needs: Needs = { ...createNeeds(), hunger: 80 };
    const result = runTicks(needs, 20);
    expect(result.needs.hunger).toBeLessThan(80);
  });

  it('should decrease hunger proportionally to tick count', () => {
    const needs = createNeeds();
    const after10 = runTicks(needs, 10);
    const after20 = runTicks(needs, 20);
    expect(after20.needs.hunger).toBeLessThan(after10.needs.hunger);
  });
});

// ---------------------------------------------------------------------------
// Gherkin Scenario: Thirst decreases over time
// ---------------------------------------------------------------------------
describe('Thirst decreases over time', () => {
  it('should decrease thirst after 20 ticks without drinking', () => {
    const needs: Needs = { ...createNeeds(), thirst: 70 };
    const result = runTicks(needs, 20);
    expect(result.needs.thirst).toBeLessThan(70);
  });

  it('thirst drains faster than hunger', () => {
    const needs = createNeeds();
    const result = runTicks(needs, 100);
    const hungerLost = 100 - result.needs.hunger;
    const thirstLost = 100 - result.needs.thirst;
    expect(thirstLost).toBeGreaterThan(hungerLost);
  });
});

// ---------------------------------------------------------------------------
// Gherkin Scenario: Energy decreases over time
// ---------------------------------------------------------------------------
describe('Energy decreases over time', () => {
  it('should decrease energy after 40 ticks without sleeping', () => {
    const needs: Needs = { ...createNeeds(), energy: 90 };
    const result = runTicks(needs, 40);
    expect(result.needs.energy).toBeLessThan(90);
  });

  it('energy drains slower than hunger', () => {
    const needs = createNeeds();
    const result = runTicks(needs, 100);
    const hungerLost = 100 - result.needs.hunger;
    const energyLost = 100 - result.needs.energy;
    expect(energyLost).toBeLessThan(hungerLost);
  });
});

// ---------------------------------------------------------------------------
// Gherkin Scenario: Low hunger damages health
// ---------------------------------------------------------------------------
describe('Low hunger damages health', () => {
  it('should decrease health when hunger is 0', () => {
    const needs: Needs = { hunger: 0, thirst: 100, energy: 100, health: 80 };
    const result = tickNeeds(needs, 1);
    expect(result.needs.health).toBeLessThan(80);
  });

  it('should emit "Starving!" warning when hunger is 0', () => {
    const needs: Needs = { hunger: 0, thirst: 100, energy: 100, health: 80 };
    const result = tickNeeds(needs, 1);
    expect(result.warnings).toContain('Starving!');
  });

  it('should deal starvation damage at the configured rate', () => {
    const needs: Needs = { hunger: 0, thirst: 100, energy: 100, health: 50 };
    const result = tickNeeds(needs, 1);
    // Hunger was already 0 before tick, so health takes starvation damage.
    // Thirst still > 0 so no dehydration damage. Energy decay won't cause health damage.
    expect(result.needs.health).toBeCloseTo(50 - NEEDS_HEALTH_DAMAGE.starvation, 5);
  });

  it('should emit "Dehydrated!" warning when thirst is 0', () => {
    const needs: Needs = { hunger: 100, thirst: 0, energy: 100, health: 80 };
    const result = tickNeeds(needs, 1);
    expect(result.warnings).toContain('Dehydrated!');
  });

  it('starvation and dehydration damage stack', () => {
    const needs: Needs = { hunger: 0, thirst: 0, energy: 100, health: 50 };
    const result = tickNeeds(needs, 1);
    const expectedHealth = 50 - NEEDS_HEALTH_DAMAGE.starvation - NEEDS_HEALTH_DAMAGE.dehydration;
    expect(result.needs.health).toBeCloseTo(expectedHealth, 5);
    expect(result.warnings).toContain('Starving!');
    expect(result.warnings).toContain('Dehydrated!');
  });
});

// ---------------------------------------------------------------------------
// Gherkin Scenario: Death by starvation
// ---------------------------------------------------------------------------
describe('Death by starvation', () => {
  it('should die when health reaches 0 from starvation', () => {
    // Set health just above starvation damage so one tick kills.
    const needs: Needs = { hunger: 0, thirst: 100, energy: 100, health: NEEDS_HEALTH_DAMAGE.starvation / 2 };
    const result = tickNeeds(needs, 1);
    expect(result.needs.health).toBe(0);
    expect(result.died).toBe(true);
    expect(result.deathCause).toBe('starvation');
  });

  it('should die when health reaches 0 from dehydration', () => {
    const needs: Needs = { hunger: 100, thirst: 0, energy: 100, health: NEEDS_HEALTH_DAMAGE.dehydration / 2 };
    const result = tickNeeds(needs, 1);
    expect(result.needs.health).toBe(0);
    expect(result.died).toBe(true);
    expect(result.deathCause).toBe('dehydration');
  });

  it('should not die when health is above 0', () => {
    const needs: Needs = { hunger: 50, thirst: 50, energy: 50, health: 50 };
    const result = tickNeeds(needs, 1);
    expect(result.died).toBe(false);
    expect(result.deathCause).toBeUndefined();
  });

  it('should die after sustained starvation over many ticks', () => {
    // Start with hunger already at 0, moderate health.
    let current: Needs = { hunger: 0, thirst: 100, energy: 100, health: 10 };
    let died = false;
    let deathCause: string | undefined;
    for (let i = 0; i < 500; i++) {
      const result = tickNeeds(current, 1);
      current = result.needs;
      if (result.died) {
        died = true;
        deathCause = result.deathCause;
        break;
      }
    }
    expect(died).toBe(true);
    expect(deathCause).toBe('starvation');
  });

  it('should die immediately when health starts at 0', () => {
    const needs: Needs = { hunger: 0, thirst: 100, energy: 100, health: 0 };
    const result = tickNeeds(needs, 1);
    expect(result.died).toBe(true);
    expect(result.needs.health).toBe(0);
    expect(result.deathCause).toBe('starvation');
  });

  it('should attribute death to dehydration when both hunger and thirst are 0', () => {
    // Dehydration damage rate (0.2) > starvation damage rate (0.15),
    // so the primary cause should be dehydration.
    const needs: Needs = { hunger: 0, thirst: 0, energy: 100, health: 0.1 };
    const result = tickNeeds(needs, 1);
    expect(result.died).toBe(true);
    expect(result.deathCause).toBe('dehydration');
  });

  it('should attribute death to "unknown" when health is 0 but no stat is depleted', () => {
    // Defensive edge case: health already 0 while hunger & thirst are positive.
    const needs: Needs = { hunger: 100, thirst: 100, energy: 100, health: 0 };
    const result = tickNeeds(needs, 1);
    expect(result.died).toBe(true);
    expect(result.deathCause).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// Gherkin Scenario: Needs stay within bounds (0–100)
// ---------------------------------------------------------------------------
describe('Needs stay within bounds', () => {
  it('hunger never goes below 0', () => {
    const needs: Needs = { hunger: 0.01, thirst: 100, energy: 100, health: 100 };
    const result = tickNeeds(needs, 100);
    expect(result.needs.hunger).toBeGreaterThanOrEqual(0);
  });

  it('thirst never goes below 0', () => {
    const needs: Needs = { hunger: 100, thirst: 0.01, energy: 100, health: 100 };
    const result = tickNeeds(needs, 100);
    expect(result.needs.thirst).toBeGreaterThanOrEqual(0);
  });

  it('energy never goes below 0', () => {
    const needs: Needs = { hunger: 100, thirst: 100, energy: 0.01, health: 100 };
    const result = tickNeeds(needs, 100);
    expect(result.needs.energy).toBeGreaterThanOrEqual(0);
  });

  it('health never goes below 0', () => {
    const needs: Needs = { hunger: 0, thirst: 0, energy: 0, health: 0.01 };
    const result = tickNeeds(needs, 100);
    expect(result.needs.health).toBeGreaterThanOrEqual(0);
  });

  it('stats at exactly 0 stay at 0 (except health which may receive damage but stays clamped)', () => {
    const needs: Needs = { hunger: 0, thirst: 0, energy: 0, health: 100 };
    const result = tickNeeds(needs, 1);
    expect(result.needs.hunger).toBe(0);
    expect(result.needs.thirst).toBe(0);
    expect(result.needs.energy).toBe(0);
    // Health should be reduced but still ≥ 0
    expect(result.needs.health).toBeGreaterThanOrEqual(0);
    expect(result.needs.health).toBeLessThanOrEqual(100);
  });

  it('stats at exactly 100 do not exceed 100 after modifications', () => {
    const needs = createNeeds();
    const result = tickNeeds(needs, 1);
    expect(result.needs.hunger).toBeLessThanOrEqual(100);
    expect(result.needs.thirst).toBeLessThanOrEqual(100);
    expect(result.needs.energy).toBeLessThanOrEqual(100);
    expect(result.needs.health).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// Cross-stat: Low energy → slow movement
// ---------------------------------------------------------------------------
describe('Low energy → slow movement', () => {
  it('should return reduced speed multiplier when energy is 0', () => {
    const needs: Needs = { hunger: 100, thirst: 100, energy: 0, health: 100 };
    const result = tickNeeds(needs, 1);
    expect(result.speedMultiplier).toBe(LOW_ENERGY_SPEED_MULTIPLIER);
  });

  it('should return normal speed multiplier when energy is above 0', () => {
    const needs: Needs = { hunger: 100, thirst: 100, energy: 50, health: 100 };
    const result = tickNeeds(needs, 1);
    expect(result.speedMultiplier).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// Low-stat warnings
// ---------------------------------------------------------------------------
describe('Low-stat warnings', () => {
  it('emits "Hungry!" when hunger is below threshold but above 0', () => {
    const needs: Needs = { hunger: NEEDS_WARNING_THRESHOLD - 1, thirst: 100, energy: 100, health: 100 };
    const result = tickNeeds(needs, 1);
    expect(result.warnings).toContain('Hungry!');
  });

  it('emits "Thirsty!" when thirst is below threshold but above 0', () => {
    const needs: Needs = { hunger: 100, thirst: NEEDS_WARNING_THRESHOLD - 1, energy: 100, health: 100 };
    const result = tickNeeds(needs, 1);
    expect(result.warnings).toContain('Thirsty!');
  });

  it('emits "Tired!" when energy is below threshold but above 0', () => {
    const needs: Needs = { hunger: 100, thirst: 100, energy: NEEDS_WARNING_THRESHOLD - 1, health: 100 };
    const result = tickNeeds(needs, 1);
    expect(result.warnings).toContain('Tired!');
  });

  it('emits "Injured!" when health is below threshold but above 0', () => {
    const needs: Needs = { hunger: 100, thirst: 100, energy: 100, health: NEEDS_WARNING_THRESHOLD - 1 };
    const result = tickNeeds(needs, 1);
    expect(result.warnings).toContain('Injured!');
  });

  it('emits no low-stat warnings when all stats are above threshold', () => {
    const needs = createNeeds();
    const result = tickNeeds(needs, 1);
    expect(result.warnings).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Delta time scaling
// ---------------------------------------------------------------------------
describe('deltaTime scaling', () => {
  it('larger deltaTime causes proportionally greater decay', () => {
    const needs = createNeeds();
    const single = tickNeeds(needs, 1);
    const double = tickNeeds(needs, 2);
    const hungerLossSingle = 100 - single.needs.hunger;
    const hungerLossDouble = 100 - double.needs.hunger;
    expect(hungerLossDouble).toBeCloseTo(hungerLossSingle * 2, 5);
  });

  it('deltaTime of 0 causes no change', () => {
    const needs: Needs = { hunger: 50, thirst: 50, energy: 50, health: 50 };
    const result = tickNeeds(needs, 0);
    expect(result.needs).toEqual(needs);
    expect(result.died).toBe(false);
  });

  it('negative deltaTime is treated as 0 (no change)', () => {
    const needs: Needs = { hunger: 50, thirst: 50, energy: 50, health: 50 };
    const result = tickNeeds(needs, -5);
    expect(result.needs).toEqual(needs);
    expect(result.died).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createNeeds factory
// ---------------------------------------------------------------------------
describe('createNeeds', () => {
  it('returns all stats at 100', () => {
    const needs = createNeeds();
    expect(needs.hunger).toBe(100);
    expect(needs.thirst).toBe(100);
    expect(needs.energy).toBe(100);
    expect(needs.health).toBe(100);
  });

  it('accepts a maxHealth parameter to cap initial health', () => {
    const needs = createNeeds(80);
    expect(needs.health).toBe(80);
    expect(needs.hunger).toBe(100);
    expect(needs.thirst).toBe(100);
    expect(needs.energy).toBe(100);
  });

  it('clamps maxHealth to the 0–100 range', () => {
    expect(createNeeds(120).health).toBe(100);
    expect(createNeeds(-10).health).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Decay rate constants are positive
// ---------------------------------------------------------------------------
describe('Decay rate constants', () => {
  it('all decay rates are positive numbers', () => {
    expect(NEEDS_DECAY_RATES.hunger).toBeGreaterThan(0);
    expect(NEEDS_DECAY_RATES.thirst).toBeGreaterThan(0);
    expect(NEEDS_DECAY_RATES.energy).toBeGreaterThan(0);
  });

  it('health damage rates are positive numbers', () => {
    expect(NEEDS_HEALTH_DAMAGE.starvation).toBeGreaterThan(0);
    expect(NEEDS_HEALTH_DAMAGE.dehydration).toBeGreaterThan(0);
  });
});
