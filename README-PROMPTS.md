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

## Usage Notes

**Sequential dependency chain:**

```
Prompt 1 → README-CLAUDE.md
Prompt 2 → README-CLAUDE-SPECS.md
Prompt 3 → CLAUDE.md           (uses: README-GDD.md + output of Prompt 1)
Prompt 4 → SPECS.md            (uses: output of Prompt 3 + output of Prompt 2)
Prompt 5 → README-CLAUDE-AGENTS-SKILLS.md
Prompt 6 → .claude/agents/ + .claude/skills/  (uses: outputs of Prompts 3, 4, 5)
Prompt 7 → README-PROMPTS.md   (meta: documents the full chain)
```

**Reusability:** These prompts can be adapted for any game project by replacing:
- `README-GDD.md` content (game design)
- Entity lists and game mechanics in Prompts 3-4
- Agent/skill definitions in Prompt 6 to match project needs
