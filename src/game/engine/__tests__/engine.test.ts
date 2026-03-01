import { describe, it, expect } from 'vitest';

describe('Engine module', () => {
  it('loads without errors in a Node environment', async () => {
    // Dynamically import the engine module to verify it has no DOM/Phaser dependencies
    const engineModule = await import('../index');
    expect(engineModule).toBeDefined();
  });

  it('does not depend on browser globals', () => {
    // Verify that no browser-only globals leak into the engine's Node environment
    // In a pure Node env, 'window' and 'document' should not be defined
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('supports basic arithmetic (placeholder for future simulation tests)', () => {
    // Placeholder test demonstrating that the test runner works with TypeScript
    const hunger = 100;
    const decayRate = 0.5;
    const ticksElapsed = 10;
    const remaining: number = hunger - decayRate * ticksElapsed;
    expect(remaining).toBe(95);
  });
});
