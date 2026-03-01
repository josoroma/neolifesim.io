---
description: "Add a new game entity with state machine. Usage: /add-entity <type> <name>"
disable-model-invocation: true
---

# Add Entity

Scaffold a new entity with proper state machine pattern in the engine and render layers.

## Usage

```
/add-entity prey gecko
/add-entity predator hawk
/add-entity snake coral-snake
```

## Entity categories

| Category  | States                                          | Layer         |
|-----------|------------------------------------------------|---------------|
| snake     | idle, hunt, flee, eat, drink, sleep, fight      | engine + render |
| prey      | idle, wander, flee, eat, drink                  | engine + render |
| predator  | idle, patrol, hunt, eat, drink, sleep            | engine + render |

## Workflow

### 1. Create engine logic

Create `src/game/engine/entities/<name>.ts`:

```typescript
import { EntityState, Entity } from '../types';

export type <Name>State = 'idle' | 'wander' | 'flee' | 'eat' | 'drink';

export interface <Name> extends Entity {
  kind: '<name>';
  state: <Name>State;
  position: { x: number; y: number };
  stats: {
    health: number;
    speed: number;
    detectionRadius: number;
  };
}

export function create<Name>(x: number, y: number): <Name> {
  return {
    kind: '<name>',
    state: 'idle',
    position: { x, y },
    stats: { health: 100, speed: 1, detectionRadius: 5 },
  };
}

export function update<Name>(entity: <Name>, world: WorldState): <Name> {
  switch (entity.state) {
    case 'idle':
      return handleIdle(entity, world);
    case 'wander':
      return handleWander(entity, world);
    // ... other states
    default:
      return entity;
  }
}
```

**Rules:**
- NO Phaser imports in this file
- NO `window` or `document` references
- NO `any` types
- Pure functions, return new state (immutable)

### 2. Create engine tests

Create `src/game/engine/entities/<name>.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { create<Name>, update<Name> } from './<name>';

describe('<Name>', () => {
  it('should create with default stats', () => {
    const entity = create<Name>(10, 20);
    expect(entity.kind).toBe('<name>');
    expect(entity.state).toBe('idle');
    expect(entity.position).toEqual({ x: 10, y: 20 });
  });

  it('should transition states based on threats', () => {
    // Test state machine transitions
  });
});
```

### 3. Register in spawning system

- Add the entity to `src/game/engine/spawning.ts` (or equivalent)
- Configure spawn rates per biome/time of day
- Respect day/night rules:
  - Nocturnal entities: spawn only at night
  - Diurnal entities: spawn only during day
  - Dawn/dusk: increased prey spawns

### 4. Create render sprite (if requested)

Create `src/game/render/sprites/<name>Sprite.ts`:

```typescript
export class <Name>Sprite {
  private sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, '<name>');
  }

  update(state: <Name>): void {
    this.sprite.setPosition(state.position.x, state.position.y);
    // Update animation based on state
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
```

### 5. Run verification

```bash
npm test -- --grep "<name>"
npm run lint
grep -r "from 'phaser'" src/game/engine/entities/<name>.ts && echo "❌ VIOLATION" || echo "✅ Clean"
```

### 6. Output summary

```
## Entity Created: <name>

### Files created
- src/game/engine/entities/<name>.ts — State machine + logic
- src/game/engine/entities/<name>.test.ts — Unit tests
- src/game/render/sprites/<name>Sprite.ts — Phaser sprite (if requested)

### State machine
idle → wander → flee (on threat) → idle
     → eat (on food) → idle
     → drink (on water) → idle

### Registered in spawning system
- Biome: <biome>
- Time: <diurnal|nocturnal|always>
- Base rate: <rate>/tick
```
