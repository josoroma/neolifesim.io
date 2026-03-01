# Life Simulator — Snake Survival Game

> A snake survival simulation set in a tropical coastal forest ecosystem with a dynamic day/night cycle, built with Next.js and Phaser 3.

---

## Table of Contents

- [Overview](#overview)
- [Gameplay](#gameplay)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Game Design](#game-design)
- [Project Status](#project-status)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

Life Simulator is an ecological survival game where the player controls a snake navigating a living ecosystem. Hunt prey, avoid predators, manage vital needs, and reproduce — all within a dynamic world that shifts between day and night.

### Key Features

- **3 playable snake species** — Bocaracá amarilla, Terciopelo, Serpiente lora
- **Living ecosystem** — prey (mice, frogs, fish) and predators (eagles, owls, felines) with autonomous behavior
- **Survival mechanics** — hunger, thirst, energy, and health systems
- **Dynamic day/night cycle** — affects spawn rates, predator aggression, and detection radius
- **Progression system** — hatchling → adult with reproduction and egg defense
- **Persistent saves** — automatic save to localStorage with versioned schema

---

## Gameplay

### Character Creation

Choose your snake species, select a gender, and enter a custom name to begin.

### Survival Needs

| Need | How to Satisfy |
|------|---------------|
| **Hunger** | Hunt and eat prey |
| **Thirst** | Drink from water sources |
| **Energy** | Sleep to recover |
| **Health** | Keep needs fulfilled; avoid predator attacks |

### Actions

Hunt · Attack · Eat · Drink · Sleep · Reproduce · Defend Eggs

### Progression

| Level | Phase | Unlocks |
|-------|-------|---------|
| **1** | Hatchling | Basic survival — hunt, drink, sleep, avoid predators |
| **2+** | Adult | Reproduction, egg-laying, egg defense, territory expansion |

**Advance to Level 2** by surviving a full day/night cycle while keeping all needs met.

### Win & Lose

- **Victory** — reproduce, protect eggs until hatching, advance through levels
- **Defeat** — death by predators, starvation, dehydration, or health depletion

---

## Tech Stack

| Technology | Role |
|-----------|------|
| [Next.js](https://nextjs.org/) (App Router) | Menus, HUD, settings, routing |
| [Phaser 3](https://phaser.io/) | 2D rendering, input, camera, animations, tilemap |
| [Jotai](https://jotai.org/) | UI/HUD state management + progress snapshots |
| [Howler.js](https://howlerjs.com/) | Audio (ambient sounds, SFX) |
| localStorage | Save system with throttled persistence |
| TypeScript | Strict mode, no `any` types |

---

## Architecture

Simulation and rendering are **strictly separated**:

```
┌─────────────────────────────────────────────────┐
│                   Next.js App                   │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ Main Menu│  │  Game HUD │  │  Settings    │  │
│  │ (React)  │  │  (Jotai)  │  │  (React)     │  │
│  └──────────┘  └─────┬─────┘  └──────────────┘  │
│                      │ snapshot                 │
│  ┌───────────────────┼───────────────────────┐  │
│  │            Game Bridge Layer              │  │
│  └──────┬────────────┴─────────────┬─────────┘  │
│         │                          │            │
│  ┌──────▼──────┐           ┌───────▼────────┐   │
│  │   Engine    │           │    Renderer    │   │
│  │ (Pure TS)   │           │   (Phaser 3)   │   │
│  │ 20 ticks/s  │           │    60 fps      │   │
│  └─────────────┘           └────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │        Save System (localStorage)        │   │
│  │        snake-sim-save-v1                 │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

| Layer | Responsibility | Imports |
|-------|---------------|---------|
| **Engine** (`src/game/engine/`) | Pure simulation — ticks, stats, events | No Phaser |
| **Renderer** (`src/game/render/`) | Phaser scenes, sprites, animations, camera | No game logic |
| **State** (`src/game/state/`) | Jotai atoms + persistence layer | — |
| **Save** (`src/game/save/`) | Serialize/deserialize + schema versioning | — |

### Game Loop

| System | Rate |
|--------|------|
| Simulation | 20 ticks/sec (fixed timestep) |
| Render | 60 fps (Phaser, variable) |
| Save | Every 5–10s or on key events |

---

## Project Structure

```
life-simulator/
├── app/
│   ├── page.tsx                 # Main menu
│   └── game/
│       ├── page.tsx             # Game screen (Phaser host)
│       └── new/page.tsx         # Character creation
├── src/game/
│   ├── engine/                  # Simulation, rules (pure TS)
│   ├── render/                  # Phaser scenes, assets, animations
│   ├── state/                   # Jotai atoms + persistence
│   └── save/                    # Serialize/deserialize + versioning
├── .claude/
│   ├── agents/                  # AI sub-agents (code reviewer, debugger, etc.)
│   └── skills/                  # AI skills (implement story, run tests, etc.)
├── CLAUDE.md                    # AI assistant project rules
├── SPECS.md                     # Epics, user stories, tasks (with Gherkin)
├── README-GDD.md                # Full Game Design Document
└── README.md                    # This file
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm 9+

### Installation

```bash
git clone https://github.com/<your-username>/life-simulator.git
cd life-simulator
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

---

## Development

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run all tests |
| `npm test -- --grep "name"` | Run a specific test |
| `npm run lint` | Lint check |

### Code Style

- TypeScript strict mode — no `any` types
- ES modules only (`import`/`export`), never CommonJS
- 2-space indentation
- Functional React components with hooks — no class components
- Entity uses state machines: `idle`, `hunt`, `flee`, `eat`, `drink`, `sleep`, `fight`

### Git Workflow

- Branch naming: `feat/`, `fix/`, `chore/` prefixes
- [Conventional commits](https://www.conventionalcommits.org/) format
- Run `npm test && npm run lint` before committing

### Phaser in Next.js

> Game screen **must** be a Client Component (`"use client"`). Create the Phaser instance only inside `useEffect` and **always** destroy it in the cleanup return to prevent duplicates on navigation. Never import Phaser at module top level in server components.

---

## Game Design

### Ecosystem

| Category | Entities |
|----------|---------|
| **Playable Snakes** | Bocaracá amarilla, Terciopelo, Serpiente lora |
| **Prey** | Mice (ground), Frogs (water), Fish (aquatic) |
| **Predators** | Eagles (diurnal), Owls (nocturnal), Felines (ground) |

### Day/Night Cycle Effects

| Mechanic | Day | Night |
|----------|-----|-------|
| Prey spawn rates | Normal | Higher at dawn/dusk |
| Predator aggression | Normal | Increased |
| Detection radius | Full | Reduced |
| Eagles | Active | Inactive |
| Owls | Inactive | Active |

### State Persistence

**Saved to localStorage** (`snake-sim-save-v1`):
- Player stats (species, gender, name, level, XP)
- Needs (hunger, thirst, energy, health)
- Inventory, world state, tutorial progress

**Not persisted** (regenerated at runtime):
- Phaser objects, sprites, scene references
- Live entity instances (regenerated from seed + critical state)

For the complete game design, see [README-GDD.md](README-GDD.md).

---

## Project Status

The project is in early development. See [SPECS.md](SPECS.md) for the full breakdown of epics, user stories, and tasks with Gherkin acceptance criteria.

| Epic | Status |
|------|--------|
| E1: Project Setup & Tooling | Not started |
| E2: Character Creation & Species Selection | Not started |
| E3: Survival Engine (Needs System) | Not started |
| E4: World Generation & Day/Night Cycle | Not started |
| E5: Entity & Ecosystem | Not started |
| E6: Phaser 3 Rendering Pipeline | Not started |
| E7: HUD, State Management & Menus | Not started |
| E8: Progression & Level System | Not started |
| E9: Reproduction & Egg Mechanics | Not started |
| E10: Save/Load System | Not started |

---

## Documentation

| File | Description |
|------|-------------|
| [CLAUDE.md](CLAUDE.md) | AI assistant project rules and conventions |
| [SPECS.md](SPECS.md) | Epics, user stories, tasks with Gherkin acceptance criteria |
| [README-GDD.md](README-GDD.md) | Full Game Design Document |
| [README-CLAUDE.md](README-CLAUDE.md) | CLAUDE.md best practices guide |
| [README-CLAUDE-SPECS.md](README-CLAUDE-SPECS.md) | SPECS.md design conventions |
| [README-CLAUDE-AGENTS-SKILLS.md](README-CLAUDE-AGENTS-SKILLS.md) | Claude Code agents & skills guide |
| [README-PROMPTS.md](README-PROMPTS.md) | Session prompt engineering sequence |

---

## License

This project is for educational and personal use.