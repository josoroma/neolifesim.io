---
description: "Create a Phaser scene or component following Next.js integration rules. Usage: /phaser-component <type> <name>"
disable-model-invocation: true
---

# Phaser Component

Scaffold a Phaser scene or component with proper Next.js integration.

## Usage

```
/phaser-component scene WorldScene
/phaser-component sprite PlayerSprite
/phaser-component system ParticleSystem
/phaser-component hud HealthBar
```

## Component types

| Type    | Location                          | Purpose                     |
|---------|----------------------------------|-----------------------------|
| scene   | `src/game/render/scenes/`         | Phaser scene (boot, world)  |
| sprite  | `src/game/render/sprites/`        | Entity visual representation|
| system  | `src/game/render/systems/`        | Particle, lighting, camera  |
| hud     | `src/game/render/hud/`            | In-game UI overlays         |

## Critical rules (from CLAUDE.md)

1. **Client Component only** — Any file that imports Phaser must be in a `"use client"` component or inside `src/game/render/`
2. **Dynamic import** — Import Phaser dynamically inside `useEffect`, never at module top level in page components
3. **Cleanup** — Always destroy Phaser game/objects in useEffect cleanup
4. **No game logic** — Render layer reads engine snapshots only. Never compute game state here.

## Templates

### Scene

```typescript
// src/game/render/scenes/<Name>Scene.ts
import Phaser from 'phaser';

export class <Name>Scene extends Phaser.Scene {
  constructor() {
    super({ key: '<Name>Scene' });
  }

  preload(): void {
    // Load assets
  }

  create(): void {
    // Initialize scene objects
    // Subscribe to engine snapshot events
  }

  update(time: number, delta: number): void {
    // Read latest engine snapshot
    // Update visual positions/animations
    // NO game logic here
  }
}
```

### Sprite wrapper

```typescript
// src/game/render/sprites/<Name>Sprite.ts
import Phaser from 'phaser';

export interface <Name>RenderState {
  x: number;
  y: number;
  state: string;
  facing: 'left' | 'right';
}

export class <Name>Sprite {
  private sprite: Phaser.GameObjects.Sprite;
  private currentAnim: string = '';

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    this.sprite = scene.add.sprite(x, y, texture);
  }

  update(state: <Name>RenderState): void {
    this.sprite.setPosition(state.x, state.y);
    this.sprite.setFlipX(state.facing === 'left');

    const nextAnim = `${state.state}`;
    if (nextAnim !== this.currentAnim) {
      this.sprite.play(nextAnim, true);
      this.currentAnim = nextAnim;
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
```

### System (e.g., particles, camera)

```typescript
// src/game/render/systems/<Name>System.ts
import Phaser from 'phaser';

export class <Name>System {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(): void {
    // Set up the system
  }

  update(delta: number): void {
    // Update visuals based on engine snapshot
  }

  destroy(): void {
    // Clean up resources
  }
}
```

### HUD overlay

```typescript
// src/game/render/hud/<Name>HUD.ts
import Phaser from 'phaser';

export class <Name>HUD {
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x, y);
    // Set scroll factor to 0 so HUD stays fixed on screen
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);
  }

  update(data: Record<string, number>): void {
    // Update HUD elements from engine snapshot data
  }

  destroy(): void {
    this.container.destroy();
  }
}
```

### Next.js page host (reference)

```tsx
// app/game/page.tsx — REFERENCE ONLY
"use client";
import { useEffect, useRef } from "react";

export default function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let mounted = true;

    import("phaser").then((Phaser) => {
      if (!mounted || !containerRef.current) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 800,
        height: 600,
        scene: [], // Import scenes here
        physics: { default: "arcade" },
      });
    });

    return () => {
      mounted = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} id="game-container" />;
}
```

## Verification

After creating the component:

```bash
npm run lint
# Ensure no engine logic leaked into render:
grep -rn "updateNeeds\|updateAI\|tickSimulation" src/game/render/ && echo "❌ Game logic in render!" || echo "✅ Clean separation"
```
