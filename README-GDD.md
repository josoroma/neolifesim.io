# Game Design Document — NeoLifeSim

> Snake survival game set in a tropical coastal forest ecosystem with dynamic day/night cycle.

---

## 1. Core Concept

The player controls a snake in a living ecosystem populated by prey, predators, and dynamic environmental conditions. The goal is to **survive, grow, and reproduce** while interacting with the environment and other creatures.

### Main Characters

- **Snakes** — playable characters
- **Eggs** — reproduction and caretaking phase

### Playable Snake Species (initial selection)

| Species | Common Name |
|---------|-------------|
| Bocaracá amarilla | Yellow Bocaracá |
| Terciopelo | Fer-de-lance |
| Serpiente lora | Parrot Snake |

### Character Creation

At the start, the player must:
1. Choose a snake species
2. Choose gender
3. Enter a custom name

---

## 2. Ecosystem & Fauna

### Prey

- **Mice** — ground-based, fast, flee on detection
- **Frogs** — near water sources, moderate speed
- **Fish** — aquatic, available near rivers/coast

### Predators

- **Eagles** — diurnal aerial hunters
- **Owls** — nocturnal aerial hunters
- **Felines** — ground-based stalkers, high aggression

---

## 3. Core Mechanics

### 3.1 Survival Needs

| Need | Description |
|------|-------------|
| **Hunger** | Must hunt to eat |
| **Thirst** | Must drink water |
| **Energy** | Must sleep to recover |
| **Health** | Depleted by attacks or resource deprivation |

### 3.2 Actions (with animations)

- Hunt
- Attack
- Eat
- Drink
- Sleep
- Reproduce
- Defend eggs (unlocked at Level 2+)

### 3.3 Dynamic Behavior System

- Prey can flee or hide
- Other predators may steal food
- Random events: weather changes, encounters, stalking

---

## 4. Progression & Levels

### Level 1 — Hatchling

- Basic survival state (learning phase)
- Learn to hunt, drink, and avoid predators

**Advancement conditions:**
- Successfully hunt prey
- Eat and drink
- Sleep without dying
- Survive one full day/night cycle

### Level 2+ — Adult

- Unlock reproduction mechanics
- Egg-laying ability
- Egg caretaking and defense against predators
- Territory expansion
- Progressive difficulty increase

---

## 5. Win & Lose Conditions

### Victory

- Survive and stay healthy
- Successfully reproduce
- Protect eggs until hatching (hatchlings accompany their parent)
- Advance through evolutionary levels

### Defeat

- Killed by predators
- Extreme hunger (starvation)
- Dehydration
- Failure to meet basic survival needs

---

## 6. Day/Night Cycle

The cycle dynamically affects gameplay:

- **Spawn rates** change (more prey at dawn/dusk)
- **Predator aggression** increases at night
- **Detection radius** shrinks at night
- **Nocturnal predators** (owls) active only at night
- **Diurnal predators** (eagles) active only during day

---

## 7. Visual & Audio Design

- **Art style**: semi-realistic or stylized
- **Animations**: fluid, context-sensitive per action
- **Environment**: tropical humid forest with immersive ambient sounds
- **HUD**: clear indicators for hunger, thirst, energy, and health

---

## 8. Technical Architecture

### Stack

| Technology | Role |
|-----------|------|
| **Next.js** (App Router) | Menus, HUD, settings |
| **Phaser 3** | Rendering, input, camera, animations, tilemap |
| **Jotai** | UI/HUD state + progress snapshots |
| **localStorage** | Save system (with throttle/debounce) |
| **Howler.js** | Audio |

### Architecture — Simulation vs Render Separation

| Layer | Responsibility |
|-------|---------------|
| **Engine** (simulation) | Pure JS logic — ticks, stats, events |
| **Render** (Phaser) | Draw entities, animations, camera, particles |
| **Bridge** | Engine publishes minimal snapshot each tick for HUD and save |

### Game Loop

| System | Rate |
|--------|------|
| Simulation | 20 ticks/sec (stable, fixed timestep) |
| Render | 60 fps (Phaser, variable) |
| Save | Every 5–10s or on key events (level up, sleep, egg laid, death) |

### Directory Structure

```
app/
  page.tsx              — Main menu
  game/page.tsx         — Game screen (Phaser host)

src/game/
  engine/               — Simulation, rules
  render/               — Phaser scenes, assets
  state/                — Jotai atoms + persistence
  save/                 — Serialize/deserialize + versioning
```

### State Management (Jotai + localStorage)

**Persist:**
- `player` — species, gender, name, level, xp
- `needs` — hunger, thirst, energy, health
- `inventory` — carried food/water
- `world` — time of day, random seed, progress flags (level 1/2)
- `quests/tutorial` — completed steps

**Do NOT persist:**
- Phaser objects, sprites, scene references
- Full live entities (regenerate from seed + critical state)

**Save key:** `snake-sim-save-v1` (versioned JSON with timestamp)

**Save triggers:** sleep cycle complete, level up, reproduction start, egg laid, death

### Phaser in Next.js — Rules

- Game screen must be a Client Component (`"use client"`)
- Create Phaser instance only inside `useEffect`
- Destroy game in cleanup to prevent duplicates on navigation

### Entity

Entities use state machines: `idle`, `hunt`, `flee`, `eat`, `drink`, `sleep`, `fight`

### World Design

- Tilemap-based tropical coastal forest
- Camera follows the player
- Day/night affects: spawn rates, aggression, visibility (detection radius), nocturnal predators (owls)
