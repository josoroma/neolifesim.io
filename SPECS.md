# SPECS.md — NeoLifeSim

> Version: 0.1.0 | Last updated: 2026-02-28

---

## Legend

- `[ ]` Todo — Not started
- `[~]` In Progress — Actively being worked on
- `[x]` Completed — Implemented and verified
- `[!]` Blocked — Waiting on external dependency

## Progress Summary

| Epic | Stories | Todo | In Progress | Completed | Blocked |
| --- | --- | --- | --- | --- | --- |
| E1: Project Setup | 3 | 3 | 0 | 0 | 0 |
| E2: Character Creation | 2 | 2 | 0 | 0 | 0 |
| E3: Survival Engine | 4 | 4 | 0 | 0 | 0 |
| E4: World & Day/Night Cycle | 3 | 3 | 0 | 0 | 0 |
| E5: Entity & Ecosystem | 3 | 3 | 0 | 0 | 0 |
| E6: Phaser Rendering | 4 | 4 | 0 | 0 | 0 |
| E7: HUD & State Management | 3 | 3 | 0 | 0 | 0 |
| E8: Progression & Levels | 2 | 2 | 0 | 0 | 0 |
| E9: Reproduction & Eggs | 2 | 2 | 0 | 0 | 0 |
| E10: Save System | 2 | 2 | 0 | 0 | 0 |

---

## E1: Project Setup

### US-1.1: Initialize Next.js Project with TypeScript [ ]

**As a** developer
**I want** a Next.js App Router project with TypeScript strict mode
**So that** we have a typed, scalable foundation

```gherkin
Feature: Project Initialization
  As a developer
  I want a Next.js App Router project with TypeScript strict mode
  So that we have a typed, scalable foundation

  Scenario: Project runs in dev mode
    Given the project has been initialized with Next.js App Router
    And TypeScript strict mode is enabled in tsconfig.json
    When I run "npm run dev"
    Then the dev server starts without errors
    And the main menu page loads at "/"

  Scenario: Lint passes on fresh project
    Given the project has ESLint configured
    When I run "npm run lint"
    Then no lint errors are reported
```

#### Tasks

- [ ] T-1.1.1: Initialize Next.js project with `create-next-app` (App Router, TypeScript)
- [ ] T-1.1.2: Configure `tsconfig.json` with strict mode, no `any`, path aliases
- [ ] T-1.1.3: Set up ESLint + Prettier with 2-space indentation
- [ ] T-1.1.4: Create `app/page.tsx` (main menu placeholder) and `app/game/page.tsx` (game screen placeholder)

---

### US-1.2: Install Core Dependencies [ ]

**As a** developer
**I want** Phaser 3, Jotai, and Howler.js installed
**So that** the tech stack is ready for development

```gherkin
Feature: Core Dependencies
  As a developer
  I want Phaser 3, Jotai, and Howler.js installed
  So that the tech stack is ready for development

  Scenario: All dependencies are importable
    Given the project has phaser, jotai, and howler installed
    When I import each package in a TypeScript file
    Then no type errors or import errors occur

  Scenario: Phaser does not break SSR
    Given Phaser is installed
    When the Next.js server renders app/page.tsx
    Then no "window is not defined" error occurs
    Because Phaser is only imported in client components
```

#### Tasks

- [ ] T-1.2.1: Install `phaser`, `jotai`, `howler` and their type definitions
- [ ] T-1.2.2: Verify Phaser dynamic import works without SSR errors
- [ ] T-1.2.3: Create `src/game/` folder structure: `engine/`, `render/`, `state/`, `save/`

---

### US-1.3: Testing Infrastructure [ ]

**As a** developer
**I want** a test runner configured for the engine logic
**So that** simulation logic can be tested independently of Phaser

```gherkin
Feature: Testing Infrastructure
  As a developer
  I want a test runner configured for the engine
  So that simulation logic can be tested independently

  Scenario: Run tests successfully
    Given the test runner is configured
    And a sample test exists in src/game/engine/
    When I run "npm test"
    Then the test suite passes

  Scenario: Test engine logic without Phaser
    Given the engine module has no Phaser imports
    When I run engine tests
    Then no DOM or canvas errors occur
```

#### Tasks

- [ ] T-1.3.1: Configure test runner (Vitest or Jest) with TypeScript support
- [ ] T-1.3.2: Add `npm test` and `npm test -- --grep` scripts to `package.json`
- [ ] T-1.3.3: Create a sample engine test to validate the setup

---

## E2: Character Creation

### US-2.1: Species, Gender and Name Selection [ ]

**As a** player
**I want** to choose my snake's species, gender, and name
**So that** I can personalize my character before starting

```gherkin
Feature: Character Creation
  As a player
  I want to choose my snake's species, gender, and name
  So that I can personalize my character before starting

  Scenario: Select species
    Given the player is on the character creation screen
    When the player selects "Terciopelo" from the species list
    Then the selected species is set to "Terciopelo"
    And species-specific stats are loaded

  Scenario: Select gender
    Given the player has selected a species
    When the player selects "Female" as gender
    Then the character gender is set to "Female"

  Scenario: Enter valid name
    Given the player has selected species and gender
    When the player enters "Naga" as the character name
    And the player confirms creation
    Then a new character named "Naga" is created with default stats

  Scenario: Reject empty name
    Given the player is on the character creation screen
    When the player leaves the name field empty
    And the player attempts to confirm creation
    Then an error message "Name is required" is displayed
    And no character is created

  Scenario Outline: Available species
    Given the player is on the character creation screen
    When the species list is displayed
    Then "<species>" is available for selection

    Examples:
      | species            |
      | Bocaracá amarilla  |
      | Terciopelo         |
      | Serpiente lora      |
```

#### Tasks

- [ ] T-2.1.1: Define `PlayerCharacter` type in `src/game/engine/types.ts` (species, gender, name, level, xp)
- [ ] T-2.1.2: Define `SnakeSpecies` enum with Bocaracá amarilla, Terciopelo, Serpiente lora
- [ ] T-2.1.3: Implement `createCharacter(species, gender, name)` in `src/game/engine/character.ts`
- [ ] T-2.1.4: Add name validation (non-empty, max 20 chars)
- [ ] T-2.1.5: Write unit tests for character creation and validation

---

### US-2.2: Character Creation UI [ ]

**As a** player
**I want** a visual character creation screen
**So that** I can make my selections before entering the game

```gherkin
Feature: Character Creation UI
  As a player
  I want a visual character creation screen
  So that I can make my selections before entering the game

  Scenario: Navigate to character creation
    Given the player is on the main menu
    When the player clicks "New Game"
    Then the character creation screen is displayed

  Scenario: Start game after creation
    Given the player has selected species, gender, and entered a name
    When the player clicks "Start"
    Then the game screen loads with the created character
    And the character appears in the world
```

#### Tasks

- [ ] T-2.2.1: Create character creation page component in `app/game/new/page.tsx`
- [ ] T-2.2.2: Build species selector with visual cards for each snake type
- [ ] T-2.2.3: Build gender selector (Male / Female)
- [ ] T-2.2.4: Build name input with validation feedback
- [ ] T-2.2.5: Wire "Start" button to initialize game state and navigate to `app/game/page.tsx`

---

## E3: Survival Engine

### US-3.1: Needs System (Hunger, Thirst, Energy, Health) [ ]

**As a** player character
**I want** my vital stats to decrease over time
**So that** I must take actions to survive

```gherkin
Feature: Needs System
  As a player character
  I want my vital stats to decrease over time
  So that I must take actions to survive

  Scenario: Hunger decreases over time
    Given a character with hunger at 80
    When 20 simulation ticks elapse without eating
    Then the character's hunger decreases below 80

  Scenario: Thirst decreases over time
    Given a character with thirst at 70
    When 20 simulation ticks elapse without drinking
    Then the character's thirst decreases below 70

  Scenario: Energy decreases over time
    Given a character with energy at 90
    When 40 simulation ticks elapse without sleeping
    Then the character's energy decreases below 90

  Scenario: Low hunger damages health
    Given a character with hunger at 0
    When a simulation tick occurs
    Then the character's health decreases
    And a warning "Starving!" is emitted

  Scenario: Death by starvation
    Given a character with health at 0
    And hunger has been at 0 for multiple ticks
    When a simulation tick occurs
    Then the character dies
    And the death cause is "starvation"

  Scenario Outline: Needs stay within bounds
    Given a character exists
    When the <need> stat is modified
    Then the value is clamped between 0 and 100

    Examples:
      | need    |
      | hunger  |
      | thirst  |
      | energy  |
      | health  |
```

#### Tasks

- [ ] T-3.1.1: Define `Needs` interface in `src/game/engine/types.ts` (hunger, thirst, energy, health: 0–100)
- [ ] T-3.1.2: Implement `tickNeeds(needs, deltaTime)` in `src/game/engine/needs.ts` — decay per tick
- [ ] T-3.1.3: Implement cross-stat effects (low hunger → health damage, low energy → slow movement)
- [ ] T-3.1.4: Implement death conditions (health reaches 0)
- [ ] T-3.1.5: Write unit tests for all decay, cross-stat, and boundary scenarios

---

### US-3.2: Hunting Action [ ]

**As a** player
**I want** to hunt prey animals
**So that** I can eat and restore hunger

```gherkin
Feature: Hunting
  As a player
  I want to hunt prey animals
  So that I can eat and restore hunger

  Scenario: Successful hunt
    Given the player snake is within detection range of a mouse
    When the player initiates a hunt action
    And the strike connects
    Then the mouse is caught
    And the player can eat it to restore hunger

  Scenario: Failed hunt — prey escapes
    Given the player snake is at the edge of detection range
    When the player initiates a hunt action
    And the prey detects the snake first
    Then the prey flees
    And no food is gained

  Scenario: Hunt different prey types
    Given the player is near a frog
    When the player hunts the frog
    Then the frog is caught
    And hunger is restored by the frog's nutritional value

  Scenario Outline: Prey nutritional values
    Given the player eats a <prey>
    Then hunger is restored by <nutrition> points

    Examples:
      | prey  | nutrition |
      | mouse | 30        |
      | frog  | 20        |
      | fish  | 25        |
```

#### Tasks

- [ ] T-3.2.1: Define `Prey` entity type with position, species, nutritional value, state
- [ ] T-3.2.2: Implement `attemptHunt(player, prey)` in `src/game/engine/actions.ts`
- [ ] T-3.2.3: Add hunt success/failure logic based on distance, energy, and prey alertness
- [ ] T-3.2.4: Implement `eat(player, prey)` — restore hunger by nutritional value
- [ ] T-3.2.5: Write unit tests for hunt success, failure, and eating

---

### US-3.3: Drinking Action [ ]

**As a** player
**I want** to drink water from water sources
**So that** I can restore my thirst

```gherkin
Feature: Drinking
  As a player
  I want to drink water from water sources
  So that I can restore my thirst

  Scenario: Drink from water source
    Given the player is adjacent to a water tile
    When the player initiates a drink action
    Then the player's thirst increases by 40
    And the drink animation plays

  Scenario: Cannot drink away from water
    Given the player is not adjacent to any water tile
    When the player attempts to drink
    Then nothing happens
    And a message "No water nearby" is emitted
```

#### Tasks

- [ ] T-3.3.1: Define water tiles in the world map data
- [ ] T-3.3.2: Implement `attemptDrink(player, worldMap)` in `src/game/engine/actions.ts`
- [ ] T-3.3.3: Add proximity check to water source
- [ ] T-3.3.4: Write unit tests for drinking near and away from water

---

### US-3.4: Sleeping Action [ ]

**As a** player
**I want** to sleep to restore energy
**So that** I can continue hunting and moving

```gherkin
Feature: Sleeping
  As a player
  I want to sleep to restore energy
  So that I can continue hunting and moving

  Scenario: Sleep restores energy
    Given the player snake has energy at 20
    When the player initiates sleep
    And 60 simulation ticks elapse while sleeping
    Then the player's energy is restored to at least 80

  Scenario: Vulnerable while sleeping
    Given the player is sleeping
    When a predator enters detection range
    Then the player does NOT automatically wake up
    And the predator can attack the sleeping player

  Scenario: Wake up from sleep
    Given the player is sleeping
    When the player presses the wake action
    Then the player wakes up
    And energy is partially restored based on time slept
```

#### Tasks

- [ ] T-3.4.1: Implement `startSleep(player)` and `endSleep(player)` in `src/game/engine/actions.ts`
- [ ] T-3.4.2: Add energy recovery per tick while sleeping
- [ ] T-3.4.3: Mark player as vulnerable (cannot evade) during sleep
- [ ] T-3.4.4: Trigger save event when sleep cycle completes
- [ ] T-3.4.5: Write unit tests for sleep recovery, vulnerability, and interruption

---

## E4: World & Day/Night Cycle

### US-4.1: Tilemap World [ ]

**As a** player
**I want** a tropical coastal forest world with distinct terrain types
**So that** I can explore and find resources

```gherkin
Feature: Tilemap World
  As a player
  I want a tropical coastal forest world
  So that I can explore and find resources

  Scenario: World has required terrain types
    Given the world is generated
    Then the map contains forest tiles
    And the map contains water tiles
    And the map contains beach/coast tiles
    And the map contains underbrush/hiding tiles

  Scenario: Water tiles are interactable
    Given the world contains water tiles
    When the player moves adjacent to a water tile
    Then the drink action becomes available
```

#### Tasks

- [ ] T-4.1.1: Design tilemap data structure in `src/game/engine/world.ts`
- [ ] T-4.1.2: Define terrain types: forest, water, beach, underbrush, rock
- [ ] T-4.1.3: Implement procedural or static map generation with seed
- [ ] T-4.1.4: Add tile properties (walkable, water source, hiding spot)
- [ ] T-4.1.5: Write unit tests for map generation and tile properties

---

### US-4.2: Day/Night Cycle Engine [ ]

**As a** simulation system
**I want** a continuous day/night cycle
**So that** gameplay varies by time of day

```gherkin
Feature: Day/Night Cycle
  As a simulation system
  I want a continuous day/night cycle
  So that gameplay varies by time of day

  Scenario: Time advances each tick
    Given the world time is 06:00 (dawn)
    When 100 simulation ticks elapse
    Then the world time has advanced past 06:00

  Scenario: Full cycle completes
    Given the world time is 00:00
    When a full day of simulation ticks elapses
    Then the world time returns to approximately 00:00

  Scenario: Spawn rates change by time
    Given it is dawn (05:00–07:00)
    Then prey spawn rate is at its highest

  Scenario: Predator behavior changes at night
    Given it is nighttime (20:00–05:00)
    Then predator aggression is increased
    And owl entities are active
    And eagle entities are inactive

  Scenario: Detection radius changes at night
    Given it is nighttime
    Then all entity detection radii are reduced by 30%
```

#### Tasks

- [ ] T-4.2.1: Implement `WorldClock` in `src/game/engine/clock.ts` with tick-based time progression
- [ ] T-4.2.2: Define time periods: dawn, day, dusk, night with hour ranges
- [ ] T-4.2.3: Implement `getTimePeriod(worldTime)` helper
- [ ] T-4.2.4: Add spawn rate multipliers per time period
- [ ] T-4.2.5: Add detection radius modifier per time period
- [ ] T-4.2.6: Write unit tests for time progression and period transitions

---

### US-4.3: Day/Night Visual Effects [ ]

**As a** player
**I want** the world to visually change between day and night
**So that** I feel immersed in the environment

```gherkin
Feature: Day/Night Visuals
  As a player
  I want the world to visually change between day and night
  So that I feel immersed in the environment

  Scenario: Daytime lighting
    Given it is daytime (07:00–18:00)
    Then the world is rendered with full brightness
    And warm color tones are applied

  Scenario: Nighttime darkness
    Given it is nighttime (20:00–05:00)
    Then the world is rendered with reduced brightness
    And a dark blue overlay is applied
    And the player has a limited visibility circle

  Scenario: Dawn/dusk transition
    Given the time transitions from night to dawn
    Then the lighting smoothly interpolates over 30 seconds
```

#### Tasks

- [ ] T-4.3.1: Add lighting overlay layer in Phaser render scene
- [ ] T-4.3.2: Implement smooth color/brightness transitions based on `WorldClock`
- [ ] T-4.3.3: Add player visibility circle (vignette) at night
- [ ] T-4.3.4: Sync render lighting with engine time each frame

---

## E5: Entity & Ecosystem

### US-5.1: Prey (Mice, Frogs, Fish) [ ]

**As a** game system
**I want** prey animals to behave "autonomously"
**So that** the ecosystem feels alive

```gherkin
Feature: Prey
  As a game system
  I want prey animals to behave autonomously
  So that the ecosystem feels alive

  Scenario: Prey idles when no threats nearby
    Given a mouse entity with no predators in detection range
    When a simulation tick occurs
    Then the mouse remains in "idle" state
    And it wanders randomly within a small radius

  Scenario: Prey flees when predator detected
    Given a mouse entity detects a snake within its detection range
    When a simulation tick occurs
    Then the mouse transitions to "flee" state
    And it moves away from the snake

  Scenario: Prey hides in underbrush
    Given a frog in "flee" state near an underbrush tile
    When a simulation tick occurs
    Then the frog moves to the underbrush
    And it transitions to "hiding" state
    And its detection difficulty increases

  Scenario: Fish stays in water
    Given a fish entity
    When it attempts to move
    Then it only moves to adjacent water tiles
```

#### Tasks

- [ ] T-5.1.1: Define `Entity` base type with position, state, species in `src/game/engine/types.ts`
- [ ] T-5.1.2: Implement prey state machine: idle → flee → hiding → idle
- [ ] T-5.1.3: Implement `tickPrey(prey, nearbyEntities, worldMap)` in `src/game/engine/prey.ts`
- [ ] T-5.1.4: Add movement constraints (fish → water only)
- [ ] T-5.1.5: Write unit tests for each prey state transition

---

### US-5.2: Predator (Eagles, Owls, Felines) [ ]

**As a** game system
**I want** predator animals to hunt the player and prey
**So that** the player faces survival challenges

```gherkin
Feature: Predator
  As a game system
  I want predators to hunt the player
  So that the player faces survival challenges

  Scenario: Eagle hunts during daytime
    Given it is daytime
    And an eagle entity is spawned
    When the eagle detects the player within range
    Then the eagle transitions to "hunt" state
    And it moves toward the player

  Scenario: Owl hunts during nighttime
    Given it is nighttime
    And an owl entity is spawned
    When the owl detects the player within range
    Then the owl transitions to "hunt" state

  Scenario: Eagle inactive at night
    Given it is nighttime
    And an eagle entity exists
    Then the eagle is in "inactive" state
    And it does not detect or pursue any entity

  Scenario: Predator attacks player
    Given a feline in "hunt" state adjacent to the player
    When a simulation tick occurs
    Then the feline attacks the player
    And the player's health decreases

  Scenario: Predator steals food
    Given the player has caught prey but not eaten it
    And a feline is nearby
    When the feline detects the uneaten prey
    Then the feline may steal the food
```

#### Tasks

- [ ] T-5.2.1: Implement predator state machine: idle → patrol → hunt → attack → eat
- [ ] T-5.2.2: Implement `tickPredator(predator, nearbyEntities, clock)` in `src/game/engine/predator.ts`
- [ ] T-5.2.3: Add time-of-day activation rules (eagles=day, owls=night, felines=always)
- [ ] T-5.2.4: Implement attack logic with damage calculation
- [ ] T-5.2.5: Implement food-stealing behavior
- [ ] T-5.2.6: Write unit tests for predator states, time gating, and attack

---

### US-5.3: Entity Spawning System [ ]

**As a** game system
**I want** entities to spawn and despawn dynamically
**So that** the ecosystem maintains balance

```gherkin
Feature: Entity Spawning
  As a game system
  I want entities to spawn dynamically
  So that the ecosystem maintains balance

  Scenario: Prey spawns at appropriate rate
    Given the world has fewer than the maximum prey count
    When a spawn check occurs
    Then a new prey entity may spawn on a valid tile

  Scenario: Spawn rates vary by time of day
    Given it is dawn
    Then the prey spawn rate is higher than at noon

  Scenario: No spawn on occupied tiles
    Given all valid spawn tiles are occupied
    When a spawn check occurs
    Then no new entity is spawned

  Scenario: Predators spawn based on time of day
    Given it is nighttime
    When a predator spawn check occurs
    Then owls may spawn
    And eagles do not spawn
```

#### Tasks

- [ ] T-5.3.1: Implement `SpawnManager` in `src/game/engine/spawn.ts`
- [ ] T-5.3.2: Define max entity counts per species per map region
- [ ] T-5.3.3: Implement time-of-day spawn rate modifiers
- [ ] T-5.3.4: Add valid spawn tile selection (terrain-appropriate, unoccupied)
- [ ] T-5.3.5: Write unit tests for spawn logic and time-based rates

---

## E6: Phaser Rendering

### US-6.1: Game Scene Setup [ ]

**As a** developer
**I want** Phaser initialized correctly within Next.js
**So that** the game renders without SSR conflicts

```gherkin
Feature: Phaser Game Scene
  As a developer
  I want Phaser initialized correctly within Next.js
  So that the game renders without SSR conflicts

  Scenario: Phaser initializes in useEffect
    Given the game page component mounts
    When useEffect runs
    Then a Phaser.Game instance is created
    And it attaches to the DOM container

  Scenario: Phaser destroys on unmount
    Given the Phaser game is running
    When the player navigates away from the game page
    Then the Phaser.Game instance is destroyed
    And no duplicate canvas elements exist

  Scenario: No SSR errors
    Given the game page is server-rendered
    Then no "window is not defined" error occurs
    Because Phaser is only loaded on the client
```

#### Tasks

- [ ] T-6.1.1: Create `app/game/page.tsx` as Client Component with `"use client"`
- [ ] T-6.1.2: Initialize Phaser inside `useEffect` with cleanup destroy
- [ ] T-6.1.3: Create `BootScene` and `GameScene` in `src/game/render/scenes/`
- [ ] T-6.1.4: Configure Phaser with canvas renderer, proper dimensions

---

### US-6.2: Tilemap Rendering [ ]

**As a** player
**I want** the world rendered as a tilemap
**So that** I can see the tropical forest environment

```gherkin
Feature: Tilemap Rendering
  As a player
  I want the world rendered as a tilemap
  So that I can see the tropical forest environment

  Scenario: Map renders with distinct terrain
    Given the game scene is loaded
    When the tilemap renders
    Then forest tiles display forest graphics
    And water tiles display water graphics
    And beach tiles display coast graphics

  Scenario: Camera follows player
    Given the player is moving on the map
    When the player position changes
    Then the camera smoothly follows the player
    And the player stays centered on screen
```

#### Tasks

- [ ] T-6.2.1: Create or source tileset assets for tropical forest (forest, water, beach, underbrush, rock)
- [ ] T-6.2.2: Implement tilemap rendering in `GameScene` from engine world data
- [ ] T-6.2.3: Configure Phaser camera to follow the player sprite
- [ ] T-6.2.4: Add smooth camera lerp for natural movement feel

---

### US-6.3: Entity Sprites & Animations [ ]

**As a** player
**I want** to see animated snake, prey, and predator sprites
**So that** the game feels alive

```gherkin
Feature: Entity Sprites
  As a player
  I want animated entity sprites
  So that the game feels alive

  Scenario: Player snake renders at position
    Given the engine reports player at position (10, 15)
    When the render frame updates
    Then the snake sprite is displayed at the corresponding screen position

  Scenario: Action animations play
    Given the player initiates a hunt action
    When the engine emits a "hunt" action event
    Then the snake hunt animation plays

  Scenario Outline: Entity sprites match species
    Given a <entity> entity exists in the engine
    When it renders on screen
    Then the <sprite> sprite set is used

    Examples:
      | entity             | sprite          |
      | Bocaracá amarilla  | snake_bocaraca  |
      | mouse              | prey_mouse      |
      | eagle              | predator_eagle  |
```

#### Tasks

- [ ] T-6.3.1: Create or source sprite sheets for player snakes (3 species)
- [ ] T-6.3.2: Create or source sprite sheets for prey (mouse, frog, fish)
- [ ] T-6.3.3: Create or source sprite sheets for predators (eagle, owl, feline)
- [ ] T-6.3.4: Implement sprite sync from engine snapshot to Phaser sprites each frame
- [ ] T-6.3.5: Add animations: idle, move, hunt, eat, drink, sleep, attack, flee

---

### US-6.4: Audio System [ ]

**As a** player
**I want** ambient sounds and action sound effects
**So that** I feel immersed in the tropical environment

```gherkin
Feature: Audio System
  As a player
  I want ambient sounds and action SFX
  So that I feel immersed in the tropical environment

  Scenario: Ambient sounds play
    Given the game scene is running
    Then tropical forest ambient audio plays in a loop

  Scenario: Day/night ambient changes
    Given it transitions from day to night
    Then the ambient audio crossfades to nighttime sounds

  Scenario: Action SFX plays
    Given the player successfully hunts a prey
    Then a hunt success sound effect plays
```

#### Tasks

- [ ] T-6.4.1: Set up Howler.js audio manager in `src/game/render/audio.ts`
- [ ] T-6.4.2: Source or create ambient loops (day forest, night forest, water)
- [ ] T-6.4.3: Source or create SFX (hunt, eat, drink, attack, death)
- [ ] T-6.4.4: Implement ambient crossfade tied to engine day/night cycle
- [ ] T-6.4.5: Wire action events to SFX playback

---

## E7: HUD & State Management

### US-7.1: Jotai State Atoms [ ]

**As a** developer
**I want** Jotai atoms for player state, needs, and world
**So that** the HUD reacts to engine changes

```gherkin
Feature: Jotai State Atoms
  As a developer
  I want Jotai atoms for game state
  So that the HUD reacts to engine changes

  Scenario: Engine snapshot updates atoms
    Given the engine publishes a snapshot with hunger at 60
    When the bridge sync runs
    Then the hunger atom value is 60

  Scenario: HUD reads from atoms
    Given the hunger atom is 40
    When the HUD component renders
    Then it displays hunger at 40%
```

#### Tasks

- [ ] T-7.1.1: Define atoms in `src/game/state/atoms.ts`: playerAtom, needsAtom, worldAtom
- [ ] T-7.1.2: Implement engine-to-atom bridge that syncs snapshot each tick
- [ ] T-7.1.3: Write unit tests for atom updates from snapshot data

---

### US-7.2: HUD Display [ ]

**As a** player
**I want** a HUD showing hunger, thirst, energy, health, and time of day
**So that** I can make survival decisions

```gherkin
Feature: HUD Display
  As a player
  I want a HUD showing my vital stats and time
  So that I can make survival decisions

  Scenario: HUD shows all stats
    Given the game is running
    When the HUD renders
    Then hunger bar is visible with percentage
    And thirst bar is visible with percentage
    And energy bar is visible with percentage
    And health bar is visible with percentage
    And time of day is displayed

  Scenario: Low stat warning
    Given the player's hunger drops below 20
    Then the hunger bar flashes red
    And a warning icon appears
```

#### Tasks

- [ ] T-7.2.1: Create HUD component in `src/game/render/hud/` using React
- [ ] T-7.2.2: Implement stat bars (hunger, thirst, energy, health) with color coding
- [ ] T-7.2.3: Implement time-of-day indicator (sun/moon icon + clock)
- [ ] T-7.2.4: Add low-stat warning animations (flash red at <20%)
- [ ] T-7.2.5: Overlay HUD on Phaser canvas without interfering with game input

---

### US-7.3: Main Menu [ ]

**As a** player
**I want** a main menu with New Game, Continue, and Settings
**So that** I can start or resume playing

```gherkin
Feature: Main Menu
  As a player
  I want a main menu
  So that I can start or resume playing

  Scenario: New Game option
    Given the player is on the main menu
    When the player clicks "New Game"
    Then the character creation screen is displayed

  Scenario: Continue option with save
    Given a save exists in localStorage
    When the player clicks "Continue"
    Then the game loads from the saved state

  Scenario: Continue option without save
    Given no save exists in localStorage
    Then the "Continue" button is disabled or hidden
```

#### Tasks

- [ ] T-7.3.1: Build main menu in `app/page.tsx` with New Game, Continue, Settings buttons
- [ ] T-7.3.2: Check localStorage for existing save to enable/disable Continue
- [ ] T-7.3.3: Route New Game to character creation, Continue to game with loaded state
- [ ] T-7.3.4: Add basic settings screen (volume, controls placeholder)

---

## E8: Progression & Levels

### US-8.1: Level 1 — Hatchling Survival [ ]

**As a** player
**I want** to complete Level 1 by surviving a full day/night cycle
**So that** I can advance to the next stage

```gherkin
Feature: Level 1 Completion
  As a player
  I want to complete Level 1 by surviving a full cycle
  So that I can advance to the next stage

  Scenario: Complete Level 1
    Given the player is at Level 1
    And the player has hunted at least once
    And the player has drunk water at least once
    And the player has slept at least once
    And the player has survived one full day/night cycle
    When the cycle completes
    Then the player advances to Level 2
    And a "Level Up!" notification is displayed
    And the game saves automatically

  Scenario: Fail Level 1 by death
    Given the player is at Level 1
    And the player's health reaches 0
    Then the game displays "Game Over"
    And the death cause is shown
    And the player can return to the main menu
```

#### Tasks

- [ ] T-8.1.1: Implement `ProgressionTracker` in `src/game/engine/progression.ts`
- [ ] T-8.1.2: Track completion flags: hasHunted, hasDrunk, hasSlept, survivedFullCycle
- [ ] T-8.1.3: Implement level-up condition check after each cycle
- [ ] T-8.1.4: Emit level-up event and trigger save
- [ ] T-8.1.5: Implement Game Over screen with death cause and return to menu
- [ ] T-8.1.6: Write unit tests for progression tracking and level-up conditions

---

### US-8.2: Level 2+ — Territory & Difficulty [ ]

**As a** player at Level 2+
**I want** expanded territory and increasing difficulty
**So that** the game remains challenging

```gherkin
Feature: Level 2+ Difficulty
  As a player at Level 2+
  I want expanded territory and increasing difficulty
  So that the game remains challenging

  Scenario: Territory expands at Level 2
    Given the player advances to Level 2
    Then the accessible map area increases
    And new terrain regions become available

  Scenario: Predator difficulty increases
    Given the player is at Level 2
    Then predators spawn more frequently
    And predator detection range increases

  Scenario: XP system tracks progress
    Given the player performs actions (hunt, eat, drink, sleep)
    Then XP is awarded for each successful action
    And XP accumulates toward the next level
```

#### Tasks

- [ ] T-8.2.1: Implement territory expansion logic per level
- [ ] T-8.2.2: Scale predator spawn rates and stats by player level
- [ ] T-8.2.3: Implement XP award system for actions
- [ ] T-8.2.4: Write unit tests for scaling and XP mechanics

---

## E9: Reproduction & Eggs

### US-9.1: Egg Laying (Level 2+) [ ]

**As a** player at Level 2+
**I want** to lay eggs
**So that** I can reproduce and advance

```gherkin
Feature: Egg Laying
  As a player at Level 2+
  I want to lay eggs
  So that I can reproduce and advance

  Scenario: Lay eggs when conditions met
    Given the player is at Level 2 or higher
    And the player's hunger is above 50
    And the player's energy is above 50
    When the player initiates the reproduce action
    Then eggs are placed at the player's current position
    And the player's energy decreases by 30
    And a save event is triggered

  Scenario: Cannot lay eggs at Level 1
    Given the player is at Level 1
    When the player attempts to reproduce
    Then the action is blocked
    And a message "Reach Level 2 to reproduce" is emitted

  Scenario: Cannot lay eggs when exhausted
    Given the player is at Level 2
    And the player's energy is below 30
    When the player attempts to reproduce
    Then the action is blocked
    And a message "Too exhausted to reproduce" is emitted
```

#### Tasks

- [ ] T-9.1.1: Define `Egg` entity type with position, hatchTimer, health
- [ ] T-9.1.2: Implement `layEggs(player)` in `src/game/engine/reproduction.ts`
- [ ] T-9.1.3: Add precondition checks (level >= 2, hunger > 50, energy > 50)
- [ ] T-9.1.4: Trigger save on egg laying
- [ ] T-9.1.5: Write unit tests for egg laying conditions

---

### US-9.2: Egg Defense & Hatching [ ]

**As a** player
**I want** to defend my eggs from predators until they hatch
**So that** my offspring survive

```gherkin
Feature: Egg Defense & Hatching
  As a player
  I want to defend my eggs until they hatch
  So that my offspring survive

  Scenario: Eggs hatch after timer
    Given eggs have been laid
    When the hatch timer reaches zero (after N ticks)
    Then the eggs hatch into baby snakes
    And the babies follow the player

  Scenario: Predator attacks eggs
    Given eggs exist on the map
    And a predator moves adjacent to the eggs
    When a simulation tick occurs
    Then the predator attacks the eggs
    And egg health decreases

  Scenario: Defend eggs from predator
    Given a predator is attacking the player's eggs
    When the player attacks the predator
    Then the predator takes damage
    And if killed, the predator is removed
    And the eggs are saved

  Scenario: Eggs destroyed
    Given egg health reaches 0
    Then the eggs are destroyed
    And a "Eggs lost!" notification is displayed

  Scenario: Babies follow parent
    Given eggs have hatched into baby snakes
    Then the baby snakes follow the player
    And they appear as smaller snake sprites
```

#### Tasks

- [ ] T-9.2.1: Implement egg hatch timer in `src/game/engine/reproduction.ts`
- [ ] T-9.2.2: Add predator targeting logic for eggs (predators prioritize undefended eggs)
- [ ] T-9.2.3: Implement player defend action against predators near eggs
- [ ] T-9.2.4: Implement egg destruction when health reaches 0
- [ ] T-9.2.5: Implement baby snake entities that follow the player after hatching
- [ ] T-9.2.6: Write unit tests for hatching, defense, and destruction scenarios

---

## E10: Save System

### US-10.1: Auto-Save to localStorage [ ]

**As a** player
**I want** my progress saved automatically
**So that** I can resume later

```gherkin
Feature: Auto-Save
  As a player
  I want my progress saved automatically
  So that I can resume later

  Scenario: Periodic auto-save
    Given the game is running
    When 10 seconds elapse since the last save
    Then the game state is serialized to localStorage under "snake-sim-save-v1"

  Scenario: Event-triggered save
    Given the player completes a sleep cycle
    Then the game saves immediately

  Scenario Outline: Save-triggering events
    Given the game is running
    When <event> occurs
    Then the game saves immediately

    Examples:
      | event                  |
      | level up               |
      | sleep cycle completed  |
      | eggs laid              |
      | player death           |

  Scenario: Save data structure
    Given the game saves
    Then the save contains version, timestamp, player, needs, inventory, world, and quests
    And no Phaser objects or sprite references are included
```

#### Tasks

- [ ] T-10.1.1: Implement `serializeState(atoms)` in `src/game/save/serializer.ts`
- [ ] T-10.1.2: Implement `saveToLocalStorage(data)` with key `snake-sim-save-v1`
- [ ] T-10.1.3: Add throttled periodic save (every 10s)
- [ ] T-10.1.4: Add event-triggered save for level up, sleep, eggs, death
- [ ] T-10.1.5: Include version field for future migration support
- [ ] T-10.1.6: Write unit tests for serialization and save triggers

---

### US-10.2: Load Saved Game [ ]

**As a** player
**I want** to load my saved progress
**So that** I can continue from where I left off

```gherkin
Feature: Load Saved Game
  As a player
  I want to load my saved progress
  So that I can continue from where I left off

  Scenario: Load existing save
    Given a valid save exists in localStorage
    When the player clicks "Continue" on the main menu
    Then the save is deserialized
    And the player state, needs, world, and progress are restored
    And the game starts at the saved position

  Scenario: No save exists
    Given no save exists in localStorage
    When the main menu loads
    Then the "Continue" button is disabled

  Scenario: Corrupted save handling
    Given a corrupted save exists in localStorage
    When the player clicks "Continue"
    Then an error message "Save data corrupted" is displayed
    And the player is offered to start a new game

  Scenario: Save version migration
    Given a save with version "v1" exists
    And the current save schema is "v2"
    When the save is loaded
    Then the migration function converts v1 data to v2 format
    And the game loads successfully
```

#### Tasks

- [ ] T-10.2.1: Implement `loadFromLocalStorage()` in `src/game/save/loader.ts`
- [ ] T-10.2.2: Implement `deserializeState(data)` with validation
- [ ] T-10.2.3: Add error handling for corrupted or missing saves
- [ ] T-10.2.4: Implement schema versioning and migration (`v1` → `v2` pattern)
- [ ] T-10.2.5: Wire load to "Continue" button in main menu
- [ ] T-10.2.6: Write unit tests for load, validation, and migration

---

## Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-02-28 | Initial SPECS: 10 epics, 28 user stories, full Gherkin acceptance criteria | @dev |
