# Session Prompts — NeoLifeSim

> Refined prompt engineering sequence for bootstrapping a game project with Claude Code.
> Each prompt builds on outputs from previous steps — follow in order.

---

## Prompt 1 — Research CLAUDE.md Best Practices

**Output:** `README-CLAUDE.md`

```
Role: Senior technical researcher.

Task: Conduct exhaustive research on Anthropic's official documentation for CLAUDE.md files.

Sources — fetch and analyze these pages:
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/best-practices

Deliverable: Create README-CLAUDE.md covering:
1. What CLAUDE.md is and its purpose
2. File discovery hierarchy (project → user → organization)
3. Content best practices (what to include, what to avoid)
4. Formatting guidelines and recommended structure
5. Common anti-patterns and pitfalls
6. Real-world examples and templates

Constraints:
- Cite only verified official sources — no speculation
- Include direct quotes where relevant
- Write in English
- Use Markdown with clear section hierarchy
```

---

## Prompt 2 — Research SPECS.md with Gherkin Integration

**Output:** `README-CLAUDE-SPECS.md`

```
Role: Senior technical researcher specializing in project specifications and BDD.

Task: Research and design a comprehensive SPECS.md format that combines structured
task tracking with Gherkin acceptance criteria for use with Claude Code.

Context: Anthropic has no official SPECS.md standard. Design a convention that
integrates naturally with CLAUDE.md and Claude Code workflows.

Deliverable: Create README-CLAUDE-SPECS.md covering:
1. Purpose and rationale for SPECS.md
2. Document structure: Epics → User Stories → Tasks hierarchy
3. Task status markers: [ ] Todo, [~] In Progress, [x] Done, [!] Blocked
4. Gherkin integration pattern (Given/When/Then per task)
5. Progress summary table format
6. Versioning and change tracking conventions
7. Template with concrete examples
8. Best practices for maintainability at scale

Constraints:
- Design for machine-readability (Claude can parse and update statuses)
- Ensure compatibility with CLAUDE.md cross-references
- Write in English
```

---

## Prompt 3 — Generate Project CLAUDE.md

**Output:** `CLAUDE.md`

**Input files:** `README-GDD.md`, `README-CLAUDE.md`

```
Role: Senior software architect.

Task: Generate the project's CLAUDE.md file using README-GDD.md (Game Design Document)
and README-CLAUDE.md (CLAUDE.md best practices guide) as inputs.

Rules:
- Follow all best practices documented in README-CLAUDE.md
- Extract technical decisions, architecture, and conventions from README-GDD.md
- Keep it concise — CLAUDE.md is injected into every session's context window
- Prefer bullet points and short rules over prose
- Reference @README-GDD.md for extended details instead of duplicating content

Required sections:
1. Stack (with purpose of each technology)
2. Architecture (engine/render/state/save separation with directory map)
3. Game loop rates (simulation tick, render fps, save interval)
4. Code style rules (TypeScript strict, ES modules, indentation, components)
5. Phaser-in-Next.js integration rules (useEffect, cleanup, "use client")
6. State management (Jotai atoms, localStorage, what to persist vs not)
7. Day/night cycle engine rules (spawn rates, aggression, detection)
8. Entity list and state machine states
9. Progression system (Level 1 → Level 2+)
10. Testing commands and workflow
11. Git conventions

Constraints:
- Target ≤120 lines — every line must earn its place
- No explanatory prose — only actionable rules and references
- Use code blocks for patterns Claude should follow
```

---

## Prompt 4 — Generate SPECS.md

**Output:** `SPECS.md`

**Input files:** `CLAUDE.md`, `README-CLAUDE-SPECS.md`

```
Role: Senior product engineer and BDD specialist.

Task: Generate a complete SPECS.md for the NeoLifeSim project using CLAUDE.md
(project rules) and README-CLAUDE-SPECS.md (SPECS.md conventions) as inputs.

Structure requirements:
- Version header with date
- Status legend ([ ] Todo, [~] In Progress, [x] Done, [!] Blocked)
- Progress summary table (Epic | Stories | Tasks | Done | Progress %)
- 10 Epics covering the full game scope

Required Epics:
- E1: Project Setup & Tooling
- E2: Character Creation & Species Selection
- E3: Survival Engine (Needs System)
- E4: World Generation & Day/Night Cycle
- E5: Entity & Ecosystem
- E6: Phaser 3 Rendering Pipeline
- E7: HUD, State Management & Menus
- E8: Progression & Level System
- E9: Reproduction & Egg Mechanics
- E10: Save/Load System

For each Epic:
- 2-4 User Stories with clear "As a player..." format
- 3-6 Tasks per story with unique IDs (T-x.y.z)
- Gherkin acceptance criteria (Given/When/Then) per task
- All tasks start as [ ] Todo

Constraints:
- Task IDs must be sequential and unique across the document
- Gherkin scenarios must be testable and specific (concrete values)
- Respect architecture separation: engine tasks vs render tasks vs state tasks
- Cross-reference CLAUDE.md rules where applicable
- Target ~25-30 user stories, ~120-140 tasks total
```

---

## Prompt 5 — Research .claude/agents/ and .claude/skills/

**Output:** `README-CLAUDE-AGENTS-SKILLS.md`

```
Role: Senior technical researcher specializing in AI agent systems.

Task: Conduct rigorous research on Anthropic's official documentation for
.claude/skills/ and .claude/agents/ directories in Claude Code.

Sources — fetch and analyze these pages:
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/plugins-reference
- https://code.claude.com/docs/en/agent-teams

Deliverable: Create README-CLAUDE-AGENTS-SKILLS.md covering:
1. Executive summary of both systems
2. Agent format: file location, YAML frontmatter fields, Markdown body as system prompt
3. Skill format: directory structure, SKILL.md, frontmatter fields
4. Key differences between agents and skills (isolation, tools, context)
5. Frontmatter reference (name, description, tools, model, user-invocable, etc.)
6. Scoping and priority rules
7. Built-in subagents and how custom agents extend them
8. Interaction patterns: skills ↔ agents, slash commands, background knowledge
9. Best practices for organizing agents and skills in a project

Constraints:
- Cite only verified official Anthropic sources
- Distinguish clearly between agents (isolated subprocesses) and skills (inline knowledge)
- Include concrete YAML frontmatter examples for both
- Write in English
```

---

## Prompt 6 — Create All Agents and Skills

**Output:** `.claude/agents/*.md` + `.claude/skills/*/SKILL.md`

**Input files:** `CLAUDE.md`, `SPECS.md`, `README-CLAUDE-AGENTS-SKILLS.md`

```
Role: Senior AI tooling architect.

Task: Using CLAUDE.md (project rules), SPECS.md (all specifications), and
README-CLAUDE-AGENTS-SKILLS.md (official format reference), create all agents
and skills needed for this project inside the .claude/ directory.

Agents to create (.claude/agents/<name>.md):

1. code-reviewer — Reviews code against project conventions
   - Tools: Read, Grep, Glob, Bash
   - Model: sonnet
   - Checks: TypeScript strict, engine/render separation, Phaser-in-Next.js rules,
     state management, day/night cycle rules
   - Output: Categorized findings (Critical / Warning / Suggestion)

2. engine-tester — Runs and validates engine tests
   - Tools: Read, Grep, Glob, Bash, Edit, Write
   - Model: sonnet
   - Verifies engine isolation (no Phaser imports in src/game/engine/)
   - Tests all core systems: needs, actions, progression, reproduction, spawning

3. debugger — Diagnoses runtime bugs across all layers
   - Tools: Read, Edit, Bash, Grep, Glob
   - Model: sonnet
   - Common patterns: window undefined, duplicate Phaser, state desync, save corruption
   - Output: Root cause → Evidence → Fix → Verification

4. spec-planner — Plans implementation order from SPECS.md
   - Tools: Read, Grep, Glob
   - Model: sonnet
   - Permission mode: plan (read-only)
   - Includes full dependency map across 6 implementation phases

Skills to create (.claude/skills/<name>/SKILL.md):

1. game-conventions — Background knowledge (user-invocable: false)
   - Architecture rules, code style, Phaser patterns from CLAUDE.md
   - Auto-loaded by Claude as context when modifying game code

2. implement-story — Slash command: /implement-story US-X.Y
   - Reads story from SPECS.md → verifies dependencies → implements all tasks
   - Runs tests → updates SPECS.md statuses → suggests commit message

3. run-tests — Slash command: /run-tests [filter]
   - Runs npm test, analyzes failures, checks engine isolation
   - Reports: pass/fail counts, root causes, suggested fixes

4. update-specs — Slash command: /update-specs T-x.y.z done
   - Updates task markers in SPECS.md
   - Cascades status to story level, recalculates progress table

5. add-entity — Slash command: /add-entity <type> <name>
   - Scaffolds entity with state machine in src/game/engine/entities/
   - Creates tests, registers in spawning system, optional render sprite

6. phaser-component — Slash command: /phaser-component <type> <name>
   - Creates Phaser scene/sprite/system/hud in src/game/render/
   - Follows Next.js integration rules (useEffect, destroy cleanup, "use client")

Constraints:
- Follow exact YAML frontmatter format from README-CLAUDE-AGENTS-SKILLS.md
- Agents must have: name, description, tools, model in frontmatter
- Skills with slash commands must set: disable-model-invocation: true
- Background skills must set: user-invocable: false
- All system prompts must reference CLAUDE.md conventions
- Include code templates and verification steps in each skill
```

---

## Prompt 7 — Save Session Prompts

**Output:** `README-PROMPTS.md`

```
Role: Senior prompt engineer.

Task: Save all prompts from this session into README-PROMPTS.md.
Before saving, refine each prompt for clarity, specificity, and reusability.

Refinement criteria:
- Assign explicit roles to set context
- Define clear inputs, outputs, and deliverables
- Add constraints that prevent common failure modes
- Structure with numbered requirements for verifiability
- Remove ambiguity — every instruction should have one interpretation
- Ensure prompts are self-contained and reproducible in a new session

Format: Sequential numbered prompts with input/output metadata and fenced code blocks.
```

---

## Phase 2 — Implementation Prompts

> Prompts for validating, implementing, and verifying user stories.
> Start after Phase 1 completes (Prompts 1–7). Follow in order per story.

---

## Prompt 8 — Dependency & Readiness Analysis

**Output:** Confirmation that a story is safe to implement, with full task list, Gherkin criteria, and risk assessment.

**Input files:** `SPECS.md`, `CLAUDE.md`

```
Role: Senior project analyst.

Task: Read SPECS.md and CLAUDE.md. Confirm that E1: US-1.1 has no unmet dependencies
and is the correct next story to implement. List all the tasks, their Gherkin acceptance
criteria, and any risks specific to this story.

Deliverable:
1. Dependency verification — confirm no prerequisite stories are incomplete
2. Task inventory — list every T-x.y.z with its description
3. Gherkin acceptance criteria — full Given/When/Then scenarios
4. Risk assessment — table with severity and mitigation for each identified risk
5. Verdict — clear go/no-go recommendation

Constraints:
- Cross-check the progress summary table (all stories at [ ] Todo = US-1.1 is root)
- Verify the workspace has no existing package.json or source files (greenfield)
- Identify risks specific to scaffolding into an existing git repo
- Flag any CLAUDE.md rules that apply to this story's tasks
```

---

## Prompt 9 — Implement Story via Skill

**Output:** Implemented source files + updated `SPECS.md`

**Input files:** `SPECS.md`, `CLAUDE.md`, `.claude/skills/implement-story/SKILL.md`

```
/implement-story US-1.1
```

The `/implement-story` skill executes the following workflow automatically:

1. Reads US-1.1 from SPECS.md — locates all tasks (T-1.1.1 through T-1.1.4)
2. Verifies dependencies — confirms no prerequisite stories are incomplete
3. Plans implementation — identifies files to create/modify respecting architecture separation
4. Implements each task:
   - T-1.1.1: Scaffold Next.js project (App Router, TypeScript) — manual scaffold
     to preserve existing `.git/` and Markdown files
   - T-1.1.2: Configure `tsconfig.json` with `strict: true`, `noUncheckedIndexedAccess: true`,
     path alias `@/*` → `./src/*`
   - T-1.1.3: Set up ESLint 9 flat config + `eslint-config-prettier` + `.prettierrc`
     (2-space indent, semicolons, double quotes)
   - T-1.1.4: Create `app/page.tsx` (main menu placeholder) and `app/game/page.tsx`
     (game screen placeholder with `"use client"` per CLAUDE.md)
5. Verifies Gherkin scenarios:
   - `npm run dev` → dev server starts, HTTP 200 on `/` and `/game`
   - `npm run lint` → zero errors
   - `npx tsc --noEmit` → zero type errors
6. Updates SPECS.md — marks T-1.1.1 through T-1.1.4 as `[x]`, updates story header
   and progress summary table
7. Suggests conventional commit message

---

## Prompt 10 — Run Tests via Skill

**Output:** Test results report with pass/fail counts and engine isolation check.

**Input files:** `.claude/skills/run-tests/SKILL.md`

```
/run-tests
```

The `/run-tests` skill executes the following workflow:

1. Checks for a configured test runner (`npm test` script in `package.json`)
2. Runs the test suite (or reports if no test runner exists yet)
3. Analyzes results — for each failure: file, expected vs actual, root cause, suggested fix
4. Checks engine isolation:
   - No `from 'phaser'` imports in `src/game/engine/`
   - No `window.` or `document.` references in `src/game/engine/`
5. Reports summary: passed / failed / skipped counts

**Note:** For US-1.1, this correctly reports that no test runner is configured yet —
US-1.3 (Testing Infrastructure) is the story that adds Vitest/Jest. This validates
that the skill gracefully handles the pre-test-infrastructure state.

---

### US-1.2: Install Core Dependencies

> Session date: 2026-03-01
> Prerequisite: US-1.1 `[x]` complete

---

## Prompt 11 — Dependency & Readiness Analysis (US-1.2)

**Output:** Confirmation that US-1.2 is safe to implement, with full task list, Gherkin criteria, and risk assessment.

**Input files:** `SPECS.md`, `CLAUDE.md`

```
Role: Senior project analyst.

Task: Read SPECS.md and CLAUDE.md. Confirm that E1: US-1.2 has no unmet dependencies
and is the correct next story to implement. List all the tasks, their Gherkin acceptance
criteria, and any risks specific to this story.

Deliverable:
1. Dependency verification — confirm US-1.1 is complete (Next.js + TypeScript + ESLint)
2. Task inventory — list T-1.2.1, T-1.2.2, T-1.2.3 with descriptions
3. Gherkin acceptance criteria — full Given/When/Then scenarios
4. Risk assessment — table with severity and mitigation for each identified risk
5. Verdict — clear go/no-go recommendation

Constraints:
- Cross-check the progress summary table (US-1.1 at [x] = US-1.2 is unblocked)
- Verify the workspace has package.json with Next.js, TypeScript, ESLint configured
- Identify risks specific to Phaser SSR, Howler types, and bundle size
- Flag CLAUDE.md rules that apply: Phaser-in-Next.js integration, architecture separation
```

**Results:**

| Verification | Status |
| --- | --- |
| US-1.1 dependency | `[x]` — Next.js 16.1.6, TS strict, ESLint + Prettier, app/page.tsx + app/game/page.tsx |
| No blockers | Confirmed — no external dependencies or blocked stories |
| Verdict | **GO** — US-1.2 is the correct next story |

**Risks identified:**

| # | Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| 1 | Phaser SSR crash — accesses `window`/`document` at import time | High | Blocks build | Dynamic `import("phaser")` inside `useEffect` only; never top-level in server components |
| 2 | Phaser type conflicts — ships own types, may conflict | Medium | Type errors | Pin version, verify `tsc --noEmit` passes after install |
| 3 | Howler.js types — `@types/howler` is community-maintained | Low | Missing types | Install `@types/howler`, verify compilation |
| 4 | Bundle size — Phaser is ~1 MB minified | Low | Performance | Dynamic import ensures Phaser only loads on game page |
| 5 | Empty git directories — `src/game/` dirs ignored by git | Low | Missing dirs | Add barrel `index.ts` files in each subdirectory |

---

## Prompt 12 — Implement Story via Skill (US-1.2)

**Output:** Installed dependencies + `app/game/page.tsx` updated + `src/game/` folder structure + updated `SPECS.md`

**Input files:** `SPECS.md`, `CLAUDE.md`, `.claude/skills/implement-story/SKILL.md`

```
/implement-story US-1.2
```

The `/implement-story` skill executed the following workflow:

1. Reads US-1.2 from SPECS.md — locates all tasks (T-1.2.1 through T-1.2.3)
2. Verifies dependencies — confirms US-1.1 `[x]` complete
3. Plans implementation — 3 tasks, respecting CLAUDE.md architecture separation
4. Implements each task:
   - T-1.2.1: `npm install phaser jotai howler` + `npm install -D @types/howler`
     - phaser@^3.90.0, jotai@^2.18.0, howler@^2.2.4, @types/howler@^2.2.12
   - T-1.2.2: Updated `app/game/page.tsx` with:
     - Dynamic `import("phaser")` inside `useEffect` (SSR-safe per CLAUDE.md)
     - `useRef<Phaser.Game | null>` for instance tracking
     - Cleanup `destroy(true)` in useEffect return + cancelled flag for race conditions
     - Minimal placeholder scene with "Phaser Loaded ✓" text to verify initialization
   - T-1.2.3: Created `src/game/` folder structure with barrel `index.ts` files:
     - `src/game/engine/index.ts` — "NO Phaser imports allowed" comment
     - `src/game/render/index.ts` — "NO game logic" comment
     - `src/game/state/index.ts` — Jotai atoms + persistence
     - `src/game/save/index.ts` — Serialize/deserialize + schema versioning
5. Verifies Gherkin scenarios:
   - `npx tsc --noEmit` → zero type errors (all packages importable)
   - `npm run lint` → zero lint errors
   - `npm run build` → `next build` succeeds, all 3 routes static, no SSR crash
6. Updates SPECS.md:
   - T-1.2.1, T-1.2.2, T-1.2.3 → `[x]`
   - US-1.2 header → `[x]`
   - E1 progress row → `| E1: Project Setup | 3 | 1 | 0 | 2 | 0 |`
7. Suggested commit:
   ```
   feat(setup): install core dependencies (Phaser, Jotai, Howler)

   Implements US-1.2: Install Core Dependencies
   Tasks: T-1.2.1, T-1.2.2, T-1.2.3

   - Add phaser@3.90, jotai@2.18, howler@2.2 + @types/howler
   - Dynamic Phaser import in app/game/page.tsx (SSR-safe)
   - Create src/game/{engine,render,state,save}/ folder structure
   ```

**Note:** No `/run-tests` prompt was executed for US-1.2 because the test runner
is not configured yet — that is US-1.3 (Testing Infrastructure). Build verification
(`next build`) served as the primary validation for this story's Gherkin scenarios.

---

### US-1.3: Testing Infrastructure

> Session date: 2026-03-01
> Prerequisite: US-1.1 `[x]` complete, US-1.2 `[x]` complete

---

## Prompt 13 — Dependency & Readiness Analysis (US-1.3)

**Output:** Confirmation that US-1.3 is safe to implement, with full task list, Gherkin criteria, and risk assessment.

**Input files:** `SPECS.md`, `CLAUDE.md`

```
Role: Senior project analyst.

Task: Read SPECS.md and CLAUDE.md. Confirm that E1: US-1.3 has no unmet dependencies
and is the correct next story to implement. List all the tasks, their Gherkin acceptance
criteria, and any risks specific to this story.
```

**Results:**

| Verification | Status |
| --- | --- |
| US-1.1 dependency | `[x]` — Next.js project with TypeScript strict mode |
| US-1.2 dependency | `[x]` — Phaser, Jotai, Howler installed; `src/game/` folder structure created |
| No blockers | Confirmed — US-1.3 is the last story in E1, all prerequisites met |
| Verdict | **GO** — US-1.3 is the correct next story |

**Task inventory:**

| Task | Description |
| --- | --- |
| T-1.3.1 | Configure test runner (Vitest or Jest) with TypeScript support |
| T-1.3.2 | Add `npm test` and `npm test -- --grep` scripts to `package.json` |
| T-1.3.3 | Create a sample engine test to validate the setup |

**Gherkin acceptance criteria:**

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

**Risks identified:**

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| 1 | Vitest vs Jest choice — CLAUDE.md mentions both; Vitest natively supports ESM + TS, Jest requires transforms | Medium | Use Vitest — aligns with ESM-only mandate, zero-config TypeScript |
| 2 | Phaser leaking into engine tests — any accidental import causes `ReferenceError: window is not defined` | Low | Architecture enforces separation; sample test validates Node-only environment |
| 3 | Next.js / React interference — component imports would need jsdom env | Low | US-1.3 scopes tests to `src/game/engine/` only (pure logic) |
| 4 | `npm test -- --grep` compatibility — Vitest uses `-t` for name filtering, not `--grep` | Low | Vitest accepts `-t "name"` for filtering; `npm test -- -t "name"` works |

---

## Prompt 14 — Implement Story via Skill (US-1.3)

**Output:** Vitest configured + test scripts + sample engine test + updated `SPECS.md`

**Input files:** `SPECS.md`, `CLAUDE.md`, `.claude/skills/implement-story/SKILL.md`

```
/implement-story US-1.3
```

The `/implement-story` skill executed the following workflow:

1. Reads US-1.3 from SPECS.md — locates all tasks (T-1.3.1 through T-1.3.3)
2. Verifies dependencies — confirms US-1.1 `[x]` and US-1.2 `[x]` complete
3. Plans implementation — 3 tasks, 3 files to create/modify
4. Implements each task:
   - T-1.3.1: Installed `vitest@^4.0.18` as devDependency; created `vitest.config.ts` with:
     - `environment: 'node'` — engine tests must not depend on DOM/canvas
     - `include: ['src/**/__tests__/**/*.test.ts']` — test file glob pattern
     - `alias: { '@': './src' }` — path alias matching `tsconfig.json`
   - T-1.3.2: Added scripts to `package.json`:
     - `"test": "vitest run"` — single run for CI
     - `"test:watch": "vitest"` — watch mode for development
     - Filtering: `npm test -- -t "name"` (Vitest equivalent of `--grep`)
   - T-1.3.3: Created `src/game/engine/__tests__/engine.test.ts` with 3 tests:
     - `loads without errors in a Node environment` — dynamic import of engine module
     - `does not depend on browser globals` — asserts `window` and `document` are undefined
     - `supports basic arithmetic (placeholder)` — validates TypeScript + test runner work
5. Verifies Gherkin scenarios:
   - `npm test` → exits 0, 3/3 tests pass (87ms total)
   - `npm test -- -t "arithmetic"` → 1 passed, 2 skipped (filtering works)
   - `npm run lint` → zero errors
   - `npx tsc --noEmit` → zero type errors
   - Engine isolation check → no Phaser imports, no `window`/`document` refs
6. Updates SPECS.md:
   - T-1.3.1, T-1.3.2, T-1.3.3 → `[x]`
   - US-1.3 header → `[x]`
   - E1 progress row → `| E1: Project Setup | 3 | 0 | 0 | 3 | 0 |`
7. Suggested commit:
   ```
   feat(test): configure Vitest testing infrastructure

   Implements US-1.3: Testing Infrastructure
   Tasks: T-1.3.1, T-1.3.2, T-1.3.3

   - Vitest v4 with TypeScript + path aliases
   - npm test (run) and npm run test:watch (watch mode)
   - Sample engine tests validating Node-only environment
   ```

**Files created/modified:**

| File | Action |
| --- | --- |
| `vitest.config.ts` | Created — Vitest config (Node env, path aliases, test glob) |
| `package.json` | Modified — added `vitest` devDependency + `test`/`test:watch` scripts |
| `src/game/engine/__tests__/engine.test.ts` | Created — 3 sample engine tests |
| `SPECS.md` | Modified — US-1.3 and all tasks marked `[x]`, E1 summary updated |

---

## Prompt 15 — Run Tests via Skill (US-1.3)

**Output:** Test results report with pass/fail counts and engine isolation check.

**Input files:** `.claude/skills/run-tests/SKILL.md`

```
/run-tests
```

The `/run-tests` skill executed the following workflow:

1. Runs `npm test -- --reporter=verbose` → Vitest v4.0.18
2. Analyzes results — all 3 tests pass:
   - `Engine module > loads without errors in a Node environment` (3ms)
   - `Engine module > does not depend on browser globals` (0ms)
   - `Engine module > supports basic arithmetic (placeholder)` (0ms)
3. Checks engine isolation:
   - No `from 'phaser'` imports in `src/game/engine/` ✓
   - No `from "phaser"` imports in `src/game/engine/` ✓
   - No `window.` references in `src/game/engine/` ✓
   - No `document.` references in `src/game/engine/` ✓
4. Reports summary: **3 passed** | **0 failed** | **0 skipped**

**Note:** This is the first `/run-tests` invocation with a working test runner.
US-1.3 completes E1 (Project Setup) — all 3 stories are now `[x]`. The project
is ready for E2 (Character Creation) and E3 (Survival Engine) implementation.

---

## Usage Notes

**Sequential dependency chain:**

### Phase 1 — Project Bootstrap

```
Prompt 1 → README-CLAUDE.md
Prompt 2 → README-CLAUDE-SPECS.md
Prompt 3 → CLAUDE.md           (uses: README-GDD.md + output of Prompt 1)
Prompt 4 → SPECS.md            (uses: output of Prompt 3 + output of Prompt 2)
Prompt 5 → README-CLAUDE-AGENTS-SKILLS.md
Prompt 6 → .claude/agents/ + .claude/skills/  (uses: outputs of Prompts 3, 4, 5)
Prompt 7 → README-PROMPTS.md   (meta: documents the full chain)
```

### Phase 2 — Story Implementation (repeat per story)

```
Template per story:
  Prompt N   → Dependency & readiness analysis   (uses: SPECS.md + CLAUDE.md)
  Prompt N+1 → /implement-story US-X.Y           (uses: SPECS.md + CLAUDE.md + skill)
  Prompt N+2 → /run-tests                        (uses: skill + test runner)
```

### Phase 2 — Execution Log

| Prompts | Story | Date | Status |
| --- | --- | --- | --- |
| 8–10 | US-1.1: Initialize Next.js Project | 2026-03-01 | `[x]` Complete |
| 11–12 | US-1.2: Install Core Dependencies | 2026-03-01 | `[x]` Complete |
| 13–15 | US-1.3: Testing Infrastructure | 2026-03-01 | `[x]` Complete |
| 16–19 | US-2.1: Species, Gender and Name Selection | 2026-03-01 | `[x]` Complete |

---

### E2: US-2.1 — Species, Gender and Name Selection

> Session date: 2026-03-01
> Prerequisite: E1 complete — US-1.1 `[x]`, US-1.2 `[x]`, US-1.3 `[x]`

---

## Prompt 16 — Dependency & Readiness Analysis (US-2.1)

**Output:** Confirmation that US-2.1 is safe to implement, with full task list, Gherkin criteria, and risk assessment.

**Input files:** `SPECS.md`, `CLAUDE.md`

```
Read @SPECS.md and @CLAUDE.md. Confirm that E2: US-2.1 has no unmet dependencies
and is the correct next story to implement.
List all the tasks, their Gherkin acceptance criteria, and any risks specific to this story.
```

**Results:**

| Verification | Status |
| --- | --- |
| E1 dependency (all 3 stories) | `[x]` — Next.js + TypeScript + Phaser/Jotai/Howler + Vitest |
| No blockers | Confirmed — US-2.1 is pure engine logic with no coupling to unfinished epics |
| Verdict | **GO** — US-2.1 is the correct next story |

**Task inventory:**

| Task | Description |
| --- | --- |
| T-2.1.1 | Define `PlayerCharacter` type in `src/game/engine/types.ts` (species, gender, name, level, xp) |
| T-2.1.2 | Define `SnakeSpecies` enum with Bocaracá amarilla, Terciopelo, Serpiente lora |
| T-2.1.3 | Implement `createCharacter(species, gender, name)` in `src/game/engine/character.ts` |
| T-2.1.4 | Add name validation (non-empty, max 20 chars) |
| T-2.1.5 | Write unit tests for character creation and validation |

**Gherkin acceptance criteria:**

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
      | Serpiente lora     |
```

**Risks identified:**

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| 1 | "Species-specific stats are loaded" — Gherkin expects stats but GDD/SPECS don't define them | Medium | Define sensible defaults (speed, stealth, venom, maxHealth) per species; flag for balance pass |
| 2 | Max name length not in Gherkin — T-2.1.4 specifies max 20 chars but no scenario covers it | Low | Add test for names exceeding 20 characters beyond Gherkin coverage |
| 3 | Gender type scope — only Male/Female implied, gameplay impact only at Level 2+ | Low | Keep `Gender` enum simple and extensible |
| 4 | Unicode in species names — "Bocaracá amarilla" contains accented `á` | Low | Ensure enum values and string comparisons handle unicode correctly |

---

## Prompt 17 — Implement Story via Skill (US-2.1)

**Output:** Engine types + character factory + validation + tests + updated `SPECS.md`

**Input files:** `SPECS.md`, `CLAUDE.md`, `.claude/skills/implement-story/SKILL.md`

```
/implement-story US-2.1
```

The `/implement-story` skill executed the following workflow:

1. Reads US-2.1 from SPECS.md — locates all tasks (T-2.1.1 through T-2.1.5)
2. Verifies dependencies — confirms E1 fully `[x]` complete
3. Plans implementation — 5 tasks producing 3 new files + 1 modification
4. Implements each task:
   - T-2.1.1: Created `src/game/engine/types.ts` with:
     - `PlayerCharacter` interface (name, species, gender, level, xp, stats)
     - All fields marked `readonly` for immutability
   - T-2.1.2: Defined `SnakeSpecies` enum + `Gender` enum + `SpeciesStats` interface:
     - `SnakeSpecies.BocaracaAmarilla = 'Bocaracá amarilla'`
     - `SnakeSpecies.Terciopelo = 'Terciopelo'`
     - `SnakeSpecies.SerpienteLora = 'Serpiente lora'`
     - `SPECIES_STATS` config with per-species speed, stealth, venom, maxHealth
   - T-2.1.3: Created `src/game/engine/character.ts` with:
     - `createCharacter(species, gender, name)` — returns `PlayerCharacter` at level 1, xp 0
     - Loads species-specific stats from `SPECIES_STATS`
     - Trims whitespace from name before assignment
   - T-2.1.4: Added validation in `character.ts`:
     - `validateName(name)` — returns `{ valid, error? }` result object
     - Rules: non-empty after trim, max 20 characters
     - `createCharacter` throws on invalid name
     - Exported `MAX_NAME_LENGTH = 20` constant
   - T-2.1.5: Created `src/game/engine/__tests__/character.test.ts` — 20 tests:
     - `validateName` (6 tests): valid name, empty, whitespace-only, too long, exact max, unicode
     - `createCharacter` (8 tests): defaults, whitespace trim, stats per species (×3), throw empty, throw whitespace, throw too long
     - `SnakeSpecies enum` (3 tests): count, display names via `it.each`
     - `SPECIES_STATS` (3 tests): completeness, all positive values, distinct per species
5. Updated barrel exports in `src/game/engine/index.ts` — re-exports all types, enums, functions
6. Verifies Gherkin scenarios:
   - `npx vitest run --reporter=verbose` → 23/23 tests pass (117ms)
   - `npm run lint` → zero errors
   - `npx tsc --noEmit` → zero type errors
7. Updates SPECS.md:
   - T-2.1.1 through T-2.1.5 → `[x]`
   - US-2.1 header → `[x]`
   - E2 progress row → `| E2: Character Creation | 2 | 1 | 0 | 1 | 0 |`
8. Suggested commit:
   ```
   feat(engine): implement character creation system

   Implements US-2.1: Species, Gender and Name Selection
   Tasks: T-2.1.1, T-2.1.2, T-2.1.3, T-2.1.4, T-2.1.5

   - SnakeSpecies enum (3 species) + Gender enum
   - SPECIES_STATS config with per-species speed/stealth/venom/maxHealth
   - createCharacter() factory with name validation
   - 20 unit tests covering all Gherkin scenarios
   ```

**Files created/modified:**

| File | Action |
| --- | --- |
| `src/game/engine/types.ts` | Created — `SnakeSpecies`, `Gender`, `SpeciesStats`, `SPECIES_STATS`, `PlayerCharacter` |
| `src/game/engine/character.ts` | Created — `validateName()`, `createCharacter()`, `MAX_NAME_LENGTH` |
| `src/game/engine/index.ts` | Modified — barrel exports for all new types and functions |
| `src/game/engine/__tests__/character.test.ts` | Created — 20 test cases |
| `SPECS.md` | Modified — US-2.1 tasks `[x]`, story header `[x]`, progress table updated |

**Species stats introduced (not in GDD — design decision):**

| Species | Speed | Stealth | Venom | Max Health |
| --- | --- | --- | --- | --- |
| Bocaracá amarilla | 50 | 50 | 50 | 100 |
| Terciopelo | 35 | 40 | 75 | 120 |
| Serpiente lora | 70 | 65 | 30 | 80 |

---

## Prompt 18 — Run Tests via Skill (US-2.1)

**Output:** Test results report with pass/fail counts and engine isolation check.

**Input files:** `.claude/skills/run-tests/SKILL.md`

```
/run-tests
```

The `/run-tests` skill executed the following workflow:

1. Runs `npx vitest run --reporter=verbose` → Vitest v4.0.18
2. Analyzes results — 23/23 tests pass across 2 test files:
   - `engine.test.ts` (3 tests): engine module loading, no browser globals, arithmetic placeholder
   - `character.test.ts` (20 tests): validateName (6), createCharacter (8), SnakeSpecies enum (3), SPECIES_STATS (3)
3. Checks engine isolation:
   - No `from 'phaser'` imports in `src/game/engine/` ✓
   - No `from "phaser"` imports in `src/game/engine/` ✓
   - No `window.` references in `src/game/engine/` ✓
   - No `document.` references in `src/game/engine/` ✓
4. Reports summary: **23 passed** | **0 failed** | **0 skipped**

---

## Prompt 19 — Structured Code Review (US-2.1)

**Output:** Review report against CLAUDE.md guidelines, coding standards, and Gherkin acceptance criteria.

```
Perform a structured review of the current User Story implementation against the
guidelines in CLAUDE.md, established coding standards, and the acceptance criteria
specified in SPECS.md, identifying any gaps, deviations, or inconsistencies.
```

**Gherkin coverage:**

| Scenario | Status | Evidence |
| --- | --- | --- |
| Select species — set to "Terciopelo", stats loaded | **PASS** | `createCharacter` accepts `SnakeSpecies`, test asserts species + stats |
| Select gender — set to "Female" | **PASS** | `createCharacter` accepts `Gender`, test asserts `character.gender` |
| Enter valid name — "Naga" created with default stats | **PASS** | Test asserts name, level=1, xp=0 |
| Reject empty name — error "Name is required" | **PASS** | `validateName('')` returns error; `createCharacter` throws |
| Available species — all 3 selectable | **PASS** | Enum count test + `it.each` verifies display names |

**CLAUDE.md compliance:**

| Guideline | Status |
| --- | --- |
| TypeScript strict, no `any` | PASS — all types explicit, `readonly` throughout |
| ES modules only | PASS — `import`/`export` only |
| 2-space indentation | PASS |
| Engine has no Phaser imports | PASS — grep verified |
| Engine has no browser APIs | PASS — no `window`/`document` |
| Persist: species, gender, name, level, xp | PASS — all in `PlayerCharacter` |

**Minor findings (non-blocking):**

| # | Finding | Severity |
| --- | --- | --- |
| 1 | `SpeciesStats` type annotation in `character.ts` is redundant (TS infers from record lookup) | Info |
| 2 | Species stats values not defined in GDD/SPECS — introduced as design decision | Low |
| 3 | No test for 1-character name edge case | Info |

**Verdict:** Implementation fully aligned with SPECS.md acceptance criteria and CLAUDE.md architecture rules. No gaps, no deviations, no blocking issues.

---

**Reusability:** These prompts can be adapted for any game project by replacing:
- `README-GDD.md` content (game design)
- Entity lists and game mechanics in Prompts 3-4
- Agent/skill definitions in Prompt 6 to match project needs
- Story IDs in Phase 2 prompts to target any story in SPECS.md
