# NeoLifeSim — Snake Survival Game

See @README-GDD.md for full game design, mechanics, and visual style.

## Stack

- **Next.js** (App Router) — menus, HUD, settings
- **Phaser 3** — rendering, input, camera, animations, tilemap
- **Jotai** — UI/HUD state + progress snapshots
- **localStorage** — save system (throttled)
- **Howler.js** — audio

## Architecture

Simulation and Render are strictly separated:

- `src/game/engine/` — Pure JS simulation logic (ticks, stats, events). No Phaser imports.
- `src/game/render/` — Phaser scenes, assets, animations, camera, particles. No game logic.
- `src/game/state/` — Jotai atoms + persistence layer
- `src/game/save/` — Serialize/deserialize + schema versioning
- `app/page.js` — Main menu
- `app/game/page.js` — Game screen (Phaser host)

## Game Loop

- Simulation: 20 ticks/sec (stable, fixed timestep)
- Render: 60 fps (Phaser, variable)
- Save: every 5–10s or on key events (level up, sleep, egg laid, death)
- Bridge: engine publishes minimal snapshot each tick for HUD and save

## Code Style

- TypeScript strict mode, no `any` types
- ES modules only (import/export), never CommonJS (require)
- 2-space indentation
- Functional components with hooks, no class components
- Entity uses state machines: idle, hunt, flee, eat, drink, sleep, fight

## Phaser in Next.js — IMPORTANT

- Game screen (`app/game/page.js`) MUST be a Client Component (`"use client"`)
- Create Phaser instance ONLY inside `useEffect`
- ALWAYS destroy the Phaser game in the cleanup return to prevent duplicates on navigation
- Never import Phaser at module top level in server components

## State Management (Jotai + localStorage)

Save key: `snake-sim-save-v1`

### What to persist

- `player`: species, gender, name, level, xp
- `needs`: hunger, thirst, energy, health
- `inventory`: carried food/water
- `world`: time of day, random seed, progress flags (level 1/2)
- `quests/tutorial`: completed steps

### What NOT to persist

- Phaser objects, sprites, scene references
- Full live entities (regenerate from seed + critical state)

## Day/Night Cycle

The cycle affects gameplay — enforce these rules in the engine:

- Spawn rates change (more prey at dawn/dusk)
- Predator aggression increases at night
- Detection radius shrinks at night
- Nocturnal predators (owls) active only at night
- Diurnal predators (eagles) active only during day

## Entities

- **Playable snakes**: Bocaracá amarilla, Terciopelo, Serpiente lora
- **Prey**: mice, frogs, fish
- **Predators**: eagles, owls, felines
- **Eggs**: spawned at level 2+, must be defended

## Progression

- **Level 1**: Hatchling. Learn to hunt, drink, sleep, avoid predators. Pass one full cycle to advance.
- **Level 2+**: Unlock reproduction, egg-laying, egg defense. Territory expansion, increasing difficulty.

## Testing

- `npm test` — run all tests
- `npm test -- --grep "test name"` — run single test
- `npm run lint` — lint check
- Always run tests after modifying engine logic

## Git Workflow

- Branch naming: `feat/`, `fix/`, `chore/` prefixes
- Conventional commits format
- Run `npm test && npm run lint` before committing

## Build & Run

- `npm install` — install dependencies
- `npm run dev` — dev server
- `npm run build` — production build
