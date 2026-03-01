---
description: Core architecture rules and code conventions for the NeoLifeSim snake survival game. Loaded automatically when modifying game code.
user-invocable: false
---

# Game Conventions

## Stack

- **Next.js** (App Router) — menus, HUD, settings
- **Phaser 3** — rendering, input, camera, animations, tilemap
- **Jotai** — UI/HUD state + progress snapshots
- **localStorage** — save system (throttled)
- **Howler.js** — audio

## Architecture — STRICT separation

```
src/game/engine/   → Pure JS simulation logic (ticks, stats, events). NO Phaser imports.
src/game/render/   → Phaser scenes, assets, animations, camera, particles. NO game logic.
src/game/state/    → Jotai atoms + persistence layer
src/game/save/     → Serialize/deserialize + schema versioning
app/page.tsx       → Main menu
app/game/page.tsx  → Game screen (Phaser host)
```

**Engine** must never import from `phaser`, `src/game/render/`, or any browser API.
**Render** must never contain game logic — only read engine snapshots and render them.

## Game Loop Rates

- Simulation: **20 ticks/sec** (fixed timestep)
- Render: **60 fps** (Phaser, variable)
- Save: every **5–10s** or on key events (level up, sleep, egg laid, death)
- Bridge: engine publishes minimal snapshot each tick for HUD and save

## TypeScript Rules

- **Strict mode**, no `any` types
- ES modules only (`import`/`export`), never CommonJS (`require`)
- 2-space indentation
- Functional components with hooks, no class components

## Phaser in Next.js

- Game screen MUST be a Client Component (`"use client"`)
- Create Phaser instance ONLY inside `useEffect`
- ALWAYS destroy the Phaser game in cleanup return
- Never import Phaser at module top level in server components

```tsx
"use client";
import { useEffect, useRef } from "react";

export default function GamePage() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    import("phaser").then((Phaser) => {
      gameRef.current = new Phaser.Game({ /* config */ });
    });
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="game-container" />;
}
```

## State Management (Jotai + localStorage)

Save key: `snake-sim-save-v1`

### Persist

- `player`: species, gender, name, level, xp
- `needs`: hunger, thirst, energy, health
- `inventory`: carried food/water
- `world`: time of day, random seed, progress flags
- `quests/tutorial`: completed steps

### Do NOT persist

- Phaser objects, sprites, scene references
- Full live entities (regenerate from seed + critical state)

## Entity

All entities use state machines with these states:
`idle`, `hunt`, `flee`, `eat`, `drink`, `sleep`, `fight`

## Day/Night Cycle Engine Rules

- Spawn rates change (more prey at dawn/dusk)
- Predator aggression increases at night
- Detection radius shrinks at night
- Nocturnal predators (owls) active only at night
- Diurnal predators (eagles) active only during day

## Entities

- **Playable snakes**: Bocaracá amarilla, Terciopelo, Serpiente lora
- **Prey**: mice, frogs, fish
- **Predators**: eagles, owls, felines
- **Eggs**: spawned at level 2+

## Progression

- **Level 1**: Hatchling. Hunt, drink, sleep, avoid predators. Survive one full cycle.
- **Level 2+**: Reproduction, egg-laying, egg defense, territory expansion.
