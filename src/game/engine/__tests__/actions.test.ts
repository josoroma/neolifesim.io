// src/game/engine/__tests__/actions.test.ts — Tests for hunting and eating.

import { describe, it, expect } from 'vitest';
import {
  attemptHunt,
  eat,
  distance,
  huntSuccessProbability,
} from '../actions';
import {
  type Needs,
  type Prey,
  PreySpecies,
  PREY_NUTRITION,
  HUNT_DETECTION_RANGE,
  HUNT_MIN_ENERGY,
  HUNT_ENERGY_COST,
  createNeeds,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers — Prey factories
// ---------------------------------------------------------------------------

function createPrey(overrides: Partial<Prey> = {}): Prey {
  return {
    kind: 'prey',
    species: PreySpecies.Mouse,
    position: { x: 2, y: 0 },
    state: 'idle',
    alertness: 3,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// distance()
// ---------------------------------------------------------------------------

describe('distance', () => {
  it('returns 0 for identical positions', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('computes correct Euclidean distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// huntSuccessProbability()
// ---------------------------------------------------------------------------

describe('huntSuccessProbability', () => {
  it('returns 0 when distance >= HUNT_DETECTION_RANGE', () => {
    expect(huntSuccessProbability(HUNT_DETECTION_RANGE, 100, 50, 'idle', 3)).toBe(0);
    expect(huntSuccessProbability(HUNT_DETECTION_RANGE + 1, 100, 50, 'idle', 3)).toBe(0);
  });

  it('returns highest probability at distance 0, full energy, high stealth, idle prey', () => {
    const p = huntSuccessProbability(0, 100, 100, 'idle', 0);
    expect(p).toBeGreaterThan(0.8);
    expect(p).toBeLessThanOrEqual(1);
  });

  it('probability decreases as distance increases', () => {
    const close = huntSuccessProbability(1, 80, 50, 'idle', 3);
    const far = huntSuccessProbability(4, 80, 50, 'idle', 3);
    expect(close).toBeGreaterThan(far);
  });

  it('probability decreases when prey is fleeing', () => {
    const idle = huntSuccessProbability(2, 80, 50, 'idle', 3);
    const flee = huntSuccessProbability(2, 80, 50, 'flee', 3);
    expect(idle).toBeGreaterThan(flee);
  });

  it('probability decreases with lower energy', () => {
    const highEnergy = huntSuccessProbability(2, 100, 50, 'idle', 3);
    const lowEnergy = huntSuccessProbability(2, 20, 50, 'idle', 3);
    expect(highEnergy).toBeGreaterThan(lowEnergy);
  });

  it('probability increases with higher stealth', () => {
    const lowStealth = huntSuccessProbability(2, 80, 10, 'idle', 3);
    const highStealth = huntSuccessProbability(2, 80, 90, 'idle', 3);
    expect(highStealth).toBeGreaterThan(lowStealth);
  });

  it('probability decreases with higher prey alertness', () => {
    const lowAlert = huntSuccessProbability(2, 80, 50, 'idle', 1);
    const highAlert = huntSuccessProbability(2, 80, 50, 'idle', 4);
    expect(lowAlert).toBeGreaterThan(highAlert);
  });
});

// ---------------------------------------------------------------------------
// attemptHunt()
// ---------------------------------------------------------------------------

describe('attemptHunt', () => {
  const playerPos = { x: 0, y: 0 };

  describe('Scenario: Successful hunt', () => {
    it('catches idle prey within range with a low roll', () => {
      const prey = createPrey({ position: { x: 2, y: 0 } });
      const result = attemptHunt(playerPos, 80, 50, prey, 0.0);

      expect(result.success).toBe(true);
      expect(result.prey.state).toBe('caught');
      expect(result.message).toContain('Caught');
      expect(result.energyCost).toBe(HUNT_ENERGY_COST);
    });
  });

  describe('Scenario: Failed hunt — prey escapes', () => {
    it('prey flees when roll exceeds probability', () => {
      const prey = createPrey({ position: { x: 4, y: 0 } });
      // At distance 4 / range 5, probability is low; roll near 1 guarantees failure
      const result = attemptHunt(playerPos, 50, 30, prey, 0.99);

      expect(result.success).toBe(false);
      expect(result.prey.state).toBe('flee');
      expect(result.message).toContain('escaped');
      expect(result.energyCost).toBe(HUNT_ENERGY_COST);
    });
  });

  describe('Scenario: Out of range', () => {
    it('fails when prey is beyond detection range', () => {
      const prey = createPrey({ position: { x: 10, y: 10 } });
      const result = attemptHunt(playerPos, 100, 50, prey, 0.0);

      expect(result.success).toBe(false);
      expect(result.message).toContain('out of range');
      expect(result.energyCost).toBe(0);
    });
  });

  describe('Scenario: Too exhausted', () => {
    it('fails when energy is below HUNT_MIN_ENERGY', () => {
      const prey = createPrey({ position: { x: 1, y: 0 } });
      const result = attemptHunt(playerPos, HUNT_MIN_ENERGY - 1, 50, prey, 0.0);

      expect(result.success).toBe(false);
      expect(result.message).toContain('exhausted');
      expect(result.energyCost).toBe(0);
    });

    it('allows hunt when energy equals HUNT_MIN_ENERGY', () => {
      const prey = createPrey({ position: { x: 1, y: 0 } });
      const result = attemptHunt(playerPos, HUNT_MIN_ENERGY, 50, prey, 0.0);

      expect(result.success).toBe(true);
      expect(result.energyCost).toBe(HUNT_ENERGY_COST);
    });
  });

  describe('Scenario: Prey not huntable', () => {
    it('fails when prey is already caught', () => {
      const prey = createPrey({ state: 'caught' });
      const result = attemptHunt(playerPos, 80, 50, prey, 0.0);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not huntable');
      expect(result.energyCost).toBe(0);
    });

    it('fails when prey is dead', () => {
      const prey = createPrey({ state: 'dead' });
      const result = attemptHunt(playerPos, 80, 50, prey, 0.0);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not huntable');
      expect(result.energyCost).toBe(0);
    });
  });

  describe('Scenario: Hunting fleeing prey is harder', () => {
    it('identical conditions but fleeing prey has lower success rate', () => {
      const idlePrey = createPrey({ state: 'idle', position: { x: 2, y: 0 } });
      const fleeingPrey = createPrey({ state: 'flee', position: { x: 2, y: 0 } });

      // Use a roll that succeeds on idle but fails on flee
      // (alertness default=3 lowers idle probability to ~0.27, flee to ~0.08)
      const midRoll = 0.15;
      const idleResult = attemptHunt(playerPos, 80, 50, idlePrey, midRoll);
      const fleeResult = attemptHunt(playerPos, 80, 50, fleeingPrey, midRoll);

      expect(idleResult.success).toBe(true);
      expect(fleeResult.success).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// eat()
// ---------------------------------------------------------------------------

describe('eat', () => {
  describe('Scenario: Eat caught prey restores hunger', () => {
    it('restores hunger by mouse nutritional value (30)', () => {
      const needs: Needs = { ...createNeeds(), hunger: 50 };
      const prey = createPrey({ state: 'caught', species: PreySpecies.Mouse });

      const result = eat(needs, prey);

      expect(result.success).toBe(true);
      expect(result.needs.hunger).toBe(80);
      expect(result.nutritionGained).toBe(30);
      expect(result.prey.state).toBe('dead');
    });

    it('restores hunger by frog nutritional value (20)', () => {
      const needs: Needs = { ...createNeeds(), hunger: 60 };
      const prey = createPrey({ state: 'caught', species: PreySpecies.Frog });

      const result = eat(needs, prey);

      expect(result.needs.hunger).toBe(80);
      expect(result.nutritionGained).toBe(20);
    });

    it('restores hunger by fish nutritional value (25)', () => {
      const needs: Needs = { ...createNeeds(), hunger: 40 };
      const prey = createPrey({ state: 'caught', species: PreySpecies.Fish });

      const result = eat(needs, prey);

      expect(result.needs.hunger).toBe(65);
      expect(result.nutritionGained).toBe(25);
    });
  });

  describe('Scenario: Hunger clamps to 100', () => {
    it('does not exceed 100 when eating near full hunger', () => {
      const needs: Needs = { ...createNeeds(), hunger: 90 };
      const prey = createPrey({ state: 'caught', species: PreySpecies.Mouse });

      const result = eat(needs, prey);

      expect(result.needs.hunger).toBe(100);
      expect(result.nutritionGained).toBe(10);
    });

    it('returns 0 nutrition gained when already at 100', () => {
      const needs: Needs = createNeeds(); // hunger = 100
      const prey = createPrey({ state: 'caught' });

      const result = eat(needs, prey);

      expect(result.needs.hunger).toBe(100);
      expect(result.nutritionGained).toBe(0);
    });
  });

  describe('Scenario: Cannot eat prey not in caught state', () => {
    it('returns failure when prey is idle', () => {
      const needs = createNeeds();
      const prey = createPrey({ state: 'idle' });

      const result = eat(needs, prey);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot eat prey in "idle" state');
      expect(result.nutritionGained).toBe(0);
      expect(result.needs).toEqual(needs);
      expect(result.prey).toEqual(prey);
    });

    it('returns failure when prey is dead', () => {
      const needs = createNeeds();
      const prey = createPrey({ state: 'dead' });

      const result = eat(needs, prey);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot eat prey in "dead" state');
      expect(result.nutritionGained).toBe(0);
    });

    it('returns failure when prey is fleeing', () => {
      const needs = createNeeds();
      const prey = createPrey({ state: 'flee' });

      const result = eat(needs, prey);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot eat prey in "flee" state');
      expect(result.nutritionGained).toBe(0);
    });
  });

  describe('Scenario: Eating does not affect other needs', () => {
    it('preserves thirst, energy, and health', () => {
      const needs: Needs = { hunger: 30, thirst: 40, energy: 50, health: 60 };
      const prey = createPrey({ state: 'caught' });

      const result = eat(needs, prey);

      expect(result.needs.thirst).toBe(40);
      expect(result.needs.energy).toBe(50);
      expect(result.needs.health).toBe(60);
    });
  });

  describe('Scenario Outline: Prey nutritional values match spec', () => {
    const cases: Array<{ species: PreySpecies; nutrition: number }> = [
      { species: PreySpecies.Mouse, nutrition: 30 },
      { species: PreySpecies.Frog, nutrition: 20 },
      { species: PreySpecies.Fish, nutrition: 25 },
    ];

    it.each(cases)(
      'eating a $species restores $nutrition hunger points',
      ({ species, nutrition }) => {
        expect(PREY_NUTRITION[species]).toBe(nutrition);

        const needs: Needs = { ...createNeeds(), hunger: 0 };
        const prey = createPrey({ state: 'caught', species });
        const result = eat(needs, prey);

        expect(result.success).toBe(true);
        expect(result.nutritionGained).toBe(nutrition);
        expect(result.needs.hunger).toBe(nutrition);
      },
    );
  });
});
