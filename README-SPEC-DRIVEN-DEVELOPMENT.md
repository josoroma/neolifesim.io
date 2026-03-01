# Spec-Driven Development

Engineering a Game from Structured Specifications.

> How we use layered Markdown artifacts, Gherkin acceptance criteria, and Claude Code's agent architecture to turn a game design into a traceable, AI-assisted development pipeline.

---

## The Problem with "Vibe Coding"

Most developers who adopt AI coding assistants fall into a pattern: open a chat, describe a feature in natural language, paste the output into their codebase, and hope it fits. This works for throwaway scripts. It does not work for a project with ten interconnected systems, strict architectural boundaries, and acceptance criteria that compound over time.

The gap is not the AI's capability — it is the absence of a structured contract between the developer and the agent. Without one, every session starts from zero. The AI has no memory of what was built, what remains, or what constraints apply. The developer becomes a human clipboard, manually re-injecting context that should already be encoded in the project.

Spec-driven development eliminates this gap. Instead of treating the AI as a conversational partner, we treat it as an execution engine that operates against a formal specification.

---

## The Cognitive Cost of Speed: Why I Chose Spec-Driven Development with AI

There is an uncomfortable truth about working with AI coding assistants: they can make you feel like you are moving fast while your brain is standing still. The code appears, the tests pass, features materialize — and somewhere in the process, the part where you *understood* what you built got skipped. The dopamine of output replaces the satisfaction of comprehension. Over enough sessions, this becomes a hyper-consumption spiral where you are generating more than you are learning, and shipping more than you are designing.

This is the cognitive cost of speed. And it is why I chose spec-driven development — not as a process overhead, but as a deliberate counterweight.

### The Spec Is the Real Artifact

In a "prompt and go" workflow, the code is the artifact. You describe what you want, the AI produces it, and the conversation is disposable. The problem is that the *thinking* was also disposable. You never wrote down why this architecture, why these boundaries, why this sequence of work. The next session — or the next developer — inherits code without rationale.

In spec-driven development, the specification is the primary artifact. `SPECS.md` is not a byproduct of implementation; it is the *precondition*. Writing the spec forces a mode of thinking that prompting does not: you must decompose a feature into epics and stories, define acceptance criteria precise enough to be machine-verifiable, sequence tasks by dependency, and draw boundaries between systems before a single line of code exists.

This is where creativity lives. Not in the act of writing `tickNeeds(needs, deltaTime)` — which is mechanical — but in the act of deciding that needs decay at different rates, that cross-stat effects create emergent gameplay, and that the engine must be pure simulation with no rendering dependencies. Those decisions require a human brain. The AI cannot make them because they are not derivable from the codebase — they are upstream of it.

### AI as Accelerant, Not Substitute

Once the spec is written, the relationship with the AI changes fundamentally. Instead of asking it to *design and build*, you are asking it to *execute a plan*. The `/implement-story US-3.1` command does not require the AI to invent an architecture for the needs system. The architecture is already defined in `CLAUDE.md`. The acceptance criteria are already written in Gherkin. The task sequence is already ordered in `SPECS.md`. The AI's job is translation: from specification to TypeScript, from Gherkin scenario to test assertion, from task list to conventional commit.

This keeps the developer's brain in the loop where it matters — at the level of system design, constraint definition, and tradeoff resolution — while delegating the parts that are not the creative core: boilerplate, test scaffolding, status tracking, linting, pattern application.

The result is a workflow where speed and understanding are not in tension. You move fast *because* you thought deeply, not *instead of* thinking deeply. The spec is the proof that the thinking happened, and it persists across every session that follows.

---

## The Approach: Layered Markdown as Source of Truth

Our project — NeoLifeSim, a snake survival game built with Next.js and Phaser 3 — uses a system of interconnected Markdown files that serve as both human documentation and machine-readable instructions. Each file has a distinct role in the pipeline:

| File | Role | Audience |
|------|------|----------|
| `README-GDD.md` | Game Design Document — mechanics, entities, progression, visual design | Product, design, engineering |
| `CLAUDE.md` | Persistent session instructions — architecture rules, code style, stack constraints | Claude Code (loaded every session) |
| `SPECS.md` | Epics, user stories, tasks with Gherkin acceptance criteria and status tracking | Claude Code + engineering |
| `.claude/skills/` | Reusable skill definitions — implement story, run tests, add entity, update specs | Claude Code |
| `.claude/agents/` | Specialized subagents — code reviewer, debugger, engine tester, spec planner | Claude Code |

The critical insight is that these files are not documentation bolted on after the fact. They are *infrastructure* — as essential to the development process as the `tsconfig.json` or the `package.json`. Each one participates in a feedback loop where specifications drive implementation, implementation updates specifications, and the AI agent operates within defined boundaries at every step.

### How the Files Relate

```
README-GDD.md  (game design decisions)
      │
      ▼
  CLAUDE.md  (architecture rules, extracted from GDD)
      │
      ├──▶ SPECS.md  (epics → stories → tasks, with Gherkin)
      │        │
      │        ▼
      │    .claude/skills/implement-story  (reads SPECS, implements, updates status)
      │    .claude/skills/update-specs     (cascades task → story → epic status)
      │    .claude/skills/run-tests        (validates against Gherkin)
      │
      └──▶ .claude/agents/spec-planner    (analyzes progress, recommends next work)
           .claude/agents/engine-tester   (runs tests, verifies engine isolation)
           .claude/agents/code-reviewer   (reviews against CLAUDE.md conventions)
           .claude/agents/debugger        (isolates failures to the correct layer)
```

This is a directed pipeline: design feeds rules, rules feed specifications, specifications feed automation, and automation feeds back into specifications.

---

## CLAUDE.md: Persistent Rules That Actually Persist

`CLAUDE.md` is loaded automatically at the start of every Claude Code session. This makes it the highest-leverage file in the repository. Every rule written there applies to every interaction without the developer needing to repeat it.

Our `CLAUDE.md` is deliberately terse — under 120 lines. Each line encodes a constraint that, if removed, would cause Claude to make mistakes:

- **Architecture separation**: Engine (`src/game/engine/`) must have zero Phaser imports. Render (`src/game/render/`) must have zero game logic. This is enforced in code review, tested in the engine-tester agent, and verified with grep-based assertions.
- **Phaser-in-Next.js rules**: Create Phaser instances only inside `useEffect`, always destroy on cleanup, never import at module top level in server components. These are the kind of constraints an AI will violate unless explicitly told not to.
- **Game loop rates**: Simulation at 20 ticks/sec, render at 60 fps, save every 5–10 seconds. Concrete numbers that prevent the AI from inventing its own timing.
- **State persistence boundaries**: What goes into `localStorage` (player, needs, world) and what does not (Phaser objects, live entities). This prevents serialization errors that are painful to debug.

The design principle is borrowed from Anthropic's own guidance: *"For each line, ask yourself 'If I remove this, would Claude make mistakes?' If not, remove it."* Every rule in our `CLAUDE.md` has failed that test at least once.

---

## SPECS.md: Where Specifications Become Executable

`SPECS.md` is where the methodology departs from conventional documentation. It is not a backlog in Jira or a wiki page someone wrote once and forgot. It is a living, machine-parseable specification with four integrated systems:

### 1. Hierarchical Structure: Epics → Stories → Tasks

The project is decomposed into 10 epics, 28 user stories, and approximately 130 tasks. Each level carries semantic meaning:

- **Epics** define system boundaries (E1: Project Setup, E3: Survival Engine, E6: Phaser Rendering).
- **User stories** use the standard "As a [role], I want [action], so that [benefit]" format, anchored to a specific user or system need.
- **Tasks** are atomic units of work with unique IDs (`T-3.1.2`) that map directly to implementation steps.

This hierarchy is not for human consumption alone. The `spec-planner` agent reads these structures to analyze dependencies, recommend implementation order, and estimate effort across phases.

### 2. Gherkin Acceptance Criteria

Every user story includes Gherkin scenarios — Given/When/Then — that define exactly what "done" means:

```gherkin
Feature: Needs System
  Scenario: Hunger decreases over time
    Given a character with hunger at 80
    When 20 simulation ticks elapse without eating
    Then the character's hunger decreases below 80

  Scenario: Death by starvation
    Given a character with health at 0
    And hunger has been at 0 for multiple ticks
    When a simulation tick occurs
    Then the character dies
    And the death cause is "starvation"
```

These are not aspirational. They are constraints that the `implement-story` skill reads before writing any code, and that the `engine-tester` agent validates after implementation. The Gherkin format was chosen for three reasons:

1. **Unambiguous** — it structures preconditions, actions, and results with no room for interpretation.
2. **AI-parseable** — Claude can generate test cases directly from scenarios, because the format maps cleanly to assertion patterns.
3. **Industry-standard** — teams already familiar with Cucumber, SpecFlow, or Behave will recognize the format immediately.

### 3. Status Tracking

Every task carries a status marker:

| Marker | Meaning |
|--------|---------|
| `[ ]` | Todo — not started |
| `[~]` | In progress — active work |
| `[x]` | Completed — passes acceptance criteria |
| `[!]` | Blocked — external dependency |

These are not decorative checkboxes. The operational rule is strict: *an AI agent must complete an `[~]` task before taking another*. This prevents the kind of scattered, half-implemented changes that are the primary failure mode of AI-assisted development. The `update-specs` skill automatically cascades status changes from tasks up to stories and recalculates the progress summary table at the top of the file.

### 4. Progress Summary

The top of `SPECS.md` contains a dashboard-style table:

| Epic | Stories | Todo | In Progress | Completed | Blocked |
|------|---------|------|-------------|-----------|---------|
| E3: Survival Engine | 4 | 4 | 0 | 0 | 0 |
| E6: Phaser Rendering | 4 | 4 | 0 | 0 | 0 |

This is both a human overview and a machine-readable state snapshot. When the `spec-planner` agent is invoked, it reads this table to determine project velocity and recommend the next work unit.

---

## Skills and Agents: Codified Workflows, Not Ad-Hoc Prompts

The `.claude/` directory contains two classes of extensions that transform Claude Code from a general-purpose assistant into a project-specific development system.

### Skills: Repeatable Workflows

Skills are packaged instructions that Claude can invoke automatically or that the developer triggers manually. Each lives in its own directory with a `SKILL.md` file. Our project defines six:

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `implement-story` | `/implement-story US-3.1` | Reads the story from `SPECS.md`, verifies dependencies, plans implementation, writes code and tests, updates task statuses |
| `update-specs` | `/update-specs T-3.1.1 done` | Updates task markers, cascades to story/epic status, recalculates progress table |
| `run-tests` | `/run-tests needs` | Runs the test suite, analyzes failures, verifies engine isolation |
| `add-entity` | `/add-entity prey gecko` | Scaffolds a new entity with state machine pattern across engine and render layers |
| `phaser-component` | `/phaser-component scene WorldScene` | Creates a Phaser scene or component following Next.js integration rules |
| `game-conventions` | (automatic) | Background knowledge loaded whenever game code is modified — architecture rules, patterns, code snippets |

The `implement-story` skill is the backbone of the development loop. Its workflow is explicit and sequential:

1. Read the story and all its tasks from `SPECS.md`.
2. Read the Gherkin acceptance criteria.
3. Verify that prerequisite stories are completed.
4. Plan the implementation (listing files to create or modify).
5. Write code following all conventions from `CLAUDE.md`.
6. Write or update tests.
7. Run `npm test` and `npm run lint`.
8. Mark tasks as completed in `SPECS.md`.
9. Suggest a conventional commit message.

This is not a prompt template the developer pastes each time. It is a codified, version-controlled workflow that executes the same way every session.

### Agents: Isolated Specialists

Agents (subagents) run in their own context window with a custom system prompt and restricted tool access. They handle tasks where isolation is valuable:

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| `spec-planner` | Sonnet | Read, Grep, Glob | Analyzes `SPECS.md` dependencies, recommends implementation order across six phased milestones |
| `engine-tester` | Sonnet | Read, Grep, Glob, Bash, Edit, Write | Runs tests, verifies engine isolation (no Phaser imports), checks coverage across all core systems |
| `code-reviewer` | Sonnet | Read, Grep, Glob, Bash | Reviews against TypeScript strict mode, architecture boundaries, Phaser-in-Next.js rules, state persistence rules |
| `debugger` | Sonnet | Read, Edit, Bash, Grep, Glob | Isolates failures to engine/render/state/save layer, applies minimal fixes, verifies solution |

The `spec-planner` agent encodes a six-phase dependency map that reflects the actual build order of the project:

- **Phase 1** — Foundation (E1: Project Setup)
- **Phase 2** — Core engine (E2: Character, E3: Survival, E4: World)
- **Phase 3** — Ecosystem (E5: Entities, depends on E3 + E4)
- **Phase 4** — Rendering (E6, depends on E2–E5 engine work)
- **Phase 5** — Systems (E7: HUD, E8: Progression, E10: Save)
- **Phase 6** — Advanced (E9: Reproduction, depends on E8)

This is not a suggestion — it is an encoded constraint that prevents the agent from recommending work on rendering before the engine it renders is implemented.

---

## The Session Bootstrapping Pipeline

Before any code is written, the project goes through a structured prompt sequence that generates each layer of the system. This is documented in `README-PROMPTS.md` and follows a strict dependency order:

1. **Research** `CLAUDE.md` best practices → produces `README-CLAUDE.md`
2. **Research** SPECS.md conventions with Gherkin → produces `README-CLAUDE-SPECS.md`
3. **Generate** project `CLAUDE.md` using GDD + best practices research
4. **Generate** `SPECS.md` using `CLAUDE.md` + specs conventions
5. **Research** agents and skills systems → produces `README-CLAUDE-AGENTS-SKILLS.md`

Each prompt is explicitly designed with role, task, inputs, deliverable, and constraints. The output of step N becomes the input of step N+1. This means the `CLAUDE.md` that governs every future session was itself generated from researched best practices applied to the game design document — not improvised in a chat window.

---

## Why This Works: The Engineering Rationale

### Eliminates Context Loss Between Sessions

Claude Code sessions are stateless. Without `CLAUDE.md` and `SPECS.md`, every session requires the developer to re-explain the architecture, the current state of work, and the constraints. With spec-driven development, the developer's only prompt is: *"Read SPECS.md and implement the next Todo task."* The system supplies the rest.

### Prevents Architectural Drift

When an AI writes code without constraints, it invents its own architecture. Our engine/render separation — where simulation logic must never import Phaser and rendering must never compute game state — is the kind of boundary that erodes under ad-hoc prompting. By encoding it in `CLAUDE.md`, enforcing it in the `code-reviewer` agent, and testing it in the `engine-tester` agent, the boundary is maintained across hundreds of sessions.

### Makes "Done" Verifiable

The most common failure in AI-assisted development is the "it looks right" problem: code that compiles and appears correct but does not satisfy the actual requirement. Gherkin scenarios make acceptance criteria machine-checkable. A task is `[x]` only when the concrete Given/When/Then scenarios pass. There is no ambiguity about whether a feature is complete.

### Scales to Complex Projects

NeoLifeSim has 10 epics, 28 stories, and ~130 tasks spanning engine simulation, Phaser rendering, state management, save systems, and UI. Without structured tracking, an AI agent working across these systems will lose track of what is done, what depends on what, and what to do next. The `SPECS.md` progress table and the `spec-planner` agent's dependency map provide the coordination layer that keeps the project moving in the right direction.

### Separates Product Decisions from Implementation Decisions

The GDD defines *what* the game does. `CLAUDE.md` defines *how* the code is structured. `SPECS.md` defines *when* each piece gets built and *how to verify* it is correct. This separation means a product manager can modify the GDD without understanding Phaser scene lifecycle, and an engineer can modify the architecture rules without touching the acceptance criteria. The AI operates at the intersection, consuming all three.

---

## From User Story to Production: Planning, Execution, and Validation

The methodology described above raises a practical question: when you sit down to implement a story, what is the actual sequence of steps? The answer is not "write all the tests first" and it is not "write the code and test later." It is a calibrated order that balances rigor with momentum.

### The Recommended Order

```
0. Pick the slice
1. Clarify the spec
2. Plan the implementation
3. Write tests first (at least the contract)
4. Implement the smallest vertical slice
5. Expand to full coverage
6. Code review + refactor
7. Update specs and task state
```

Each step has specific rules depending on the nature of the work.

### Step 0: Pick the Slice

From `SPECS.md`, select an epic and user story — for example, E3 → US-3.1 (Needs System). Before starting, confirm three things:

- **Scope** — what this story covers and what it explicitly does not.
- **Dependencies** — are prerequisite stories marked `[x]`? The `spec-planner` agent's dependency map prevents out-of-order work, but verify manually.
- **Out-of-scope** — what adjacent concerns (rendering, save, UI) belong to other stories.

### Step 1: Clarify the Spec

Read the user story, its Gherkin scenarios, and its task list. Verify that the acceptance criteria are *specific enough to test*. A story with vague criteria is a story that will produce vague implementations. If the criteria are weak, fix them before touching any code — this is the real "tests-first."

A well-specified story has:

- A clear **goal** (the "So that" clause).
- Concrete **constraints** (value ranges, timing, boundary conditions).
- **Acceptance criteria** with specific Given/When/Then scenarios and concrete values.
- At least one **edge case** scenario (empty input, zero values, boundary overflow).

### Step 2: Plan the Implementation

Ask the AI to produce an implementation plan — not code. The plan should include:

- **File changes list** — which files will be created or modified, and in which layer (engine, render, state, save).
- **Step sequence** — the order of implementation, respecting architecture separation.
- **Risk points** — areas where the implementation might violate constraints (e.g., engine code that might need browser APIs).
- **Test plan** — which test files will be created, and what they will cover.

Review the plan before proceeding. This is where the `code-reviewer` agent's checklist applies *proactively* — catch architecture violations in the plan phase, not in code review.

### Step 3: Write Tests First (At Least the Contract)

This is the step where pragmatism matters. The rule is not "write all tests before all code." The rule is: **acceptance criteria first, then tests as early as practical.**

**Write tests first when:**

- The behavior is pure logic, state transitions, or data transformations — anything in `src/game/engine/`.
- Regressions would be costly — needs system decay, death conditions, save/load serialization.
- The Given/When/Then maps directly to an assertion pattern.

**"Tests first" can mean:**

- Full test implementations for happy-path and critical edge cases.
- Test file skeletons with `describe`/`it` blocks and placeholder assertions.
- Mocks and stubs wired up to the interfaces the implementation will satisfy.

**For UI-heavy or animation work:**

- Implementation first (thin slice) is acceptable.
- But still define acceptance criteria in Gherkin *before* writing code.
- Add integration or end-to-end tests immediately after the thin slice works.

**A simple heuristic:** if you can write a clear Given/When/Then, you can probably write the test before the code. If you cannot, the spec is still fuzzy — fix the spec, not the code.

### Step 4: Implement the Smallest Vertical Slice

Write just enough code to pass the initial tests. In a needs system, that might mean `tickNeeds()` with linear decay — no cross-stat effects, no death conditions. The goal is a passing test suite on the core behavior before expanding to edge cases.

Keep the scope narrow. A single PR should cover a single story or a coherent subset of tasks. The `implement-story` skill enforces this by operating on one `US-x.y` at a time.

### Step 5: Expand to Full Coverage

With the core behavior passing, add the remaining tests:

- Remaining edge cases from the Gherkin scenarios (boundary values, zero/max transitions).
- Negative tests (invalid inputs, impossible states).
- Cross-system integration tests if the story touches multiple layers.
- Every `Scenario Outline` with its full `Examples` table.

The `engine-tester` agent is designed for this phase — it runs the full suite, checks coverage, and verifies that no Phaser imports leaked into engine code.

### Step 6: Code Review and Refactor

Review the implementation at three severity levels:

| Severity | What to Check |
|----------|--------------|
| **Major** | Security, data loss, correctness, architecture violations (engine/render separation) |
| **Medium** | Performance, maintainability, error handling gaps, missing type annotations |
| **Low** | Naming, formatting, minor duplication |

The `code-reviewer` agent runs this against a checklist derived from `CLAUDE.md`: TypeScript strict mode, no `any` types, ES modules only, functional components, state machine patterns, Phaser-in-Next.js rules.

Refactor after review, not during implementation. Mixing refactoring with feature work is one of the most common causes of scope creep in AI-assisted sessions.

### Step 7: Update Specs and Task State

After all tests pass and review is complete:

1. Mark completed tasks `[x]` in `SPECS.md` using the `update-specs` skill.
2. If all tasks in the story are complete, the skill cascades the status to the story header.
3. The progress summary table recalculates automatically.
4. Add any follow-up tasks discovered during implementation as new `[ ]` items under the appropriate story or a new story.
5. Commit with a conventional message:

```
feat(engine): implement needs system decay and death conditions

Implements US-3.1: Needs System (Hunger, Thirst, Energy, Health)
Tasks: T-3.1.1, T-3.1.2, T-3.1.3, T-3.1.4, T-3.1.5
```

### The Full Cycle, Visualized

```
SPECS.md (pick US-3.1)
    │
    ▼
Clarify acceptance criteria (fix Gherkin if needed)
    │
    ▼
Plan: files, steps, risks, test plan
    │
    ▼
Write tests (contract + critical paths)
    │
    ▼
Implement thin slice → tests pass
    │
    ▼
Expand coverage → all Gherkin scenarios covered
    │
    ▼
Code review (major → medium → low)
    │
    ▼
Update SPECS.md → commit → next story
```

This cycle repeats for every user story. The spec drives the plan, the plan drives the tests, the tests drive the implementation, and the implementation feeds back into the spec. The AI accelerates each step, but the developer owns the sequence.

---

## Putting It Into Practice: E1 — Project Setup

Theory is useful. Seeing the theory applied to a real story is better. Here is the exact prompt sequence used to plan and implement E1 → US-1.1 (Initialize Next.js Project with TypeScript) using the skills and agents configured in `.claude/`.

### Step 1: Validate Readiness with the Spec-Planner

Before writing code, invoke the `spec-planner` agent to confirm the story is the correct next unit of work:

```
Read @SPECS.md and @CLAUDE.md. Confirm that E1: US-1.1 has no unmet dependencies and is the correct next story to implement.
List all the tasks, their Gherkin acceptance criteria, and any risks specific to this story.
```

This activates the `spec-planner` agent in read-only plan mode. It reads the dependency map, confirms that US-1.1 sits in Phase 1 (Foundation) with zero prerequisites, and surfaces the Gherkin scenarios the implementation must satisfy:

- *Project runs in dev mode* — `npm run dev` starts without errors, main menu loads at `/`.
- *Lint passes on fresh project* — `npm run lint` reports no errors.

For E1 the dependency check is trivial — nothing comes before it. But establishing this habit pays off when you reach E5 (Entity & Ecosystem), which depends on both E3 and E4 being complete. The planner catches out-of-order work before it starts.

### Step 2: Implement the Story End-to-End

With readiness confirmed, a single command triggers the full development cycle:

```
/implement-story US-1.1
```

The `implement-story` skill executes its codified workflow:

1. **Reads** US-1.1 from `SPECS.md` — locates all 4 tasks (T-1.1.1 through T-1.1.4).
2. **Reads** the Gherkin acceptance criteria — dev server starts, lint passes.
3. **Verifies** no dependencies are unmet (Phase 1, no predecessors).
4. **Plans** the implementation:
   - T-1.1.1: Initialize with `create-next-app` (App Router, TypeScript).
   - T-1.1.2: Configure `tsconfig.json` — strict mode, no `any`, path aliases.
   - T-1.1.3: Set up ESLint + Prettier — 2-space indentation.
   - T-1.1.4: Create `app/page.tsx` (main menu placeholder) and `app/game/page.tsx` (game screen placeholder).
5. **Implements** each task following all conventions from `CLAUDE.md` — notably, `app/game/page.tsx` is created as a Client Component with `"use client"`, because the Phaser-in-Next.js rules require it.
6. **Validates** by running `npm run dev` and `npm run lint` — the two Gherkin scenarios.
7. **Marks** T-1.1.1 through T-1.1.4 as `[x]` in `SPECS.md`.
8. **Suggests** a conventional commit message.

The `game-conventions` skill loads automatically during this process, injecting the architecture rules and code patterns as background context. The developer does not need to reference `CLAUDE.md` manually — it is already in the conversation.

### Step 3: Verify Independently

After the skill completes, run an independent validation:

```
/run-tests
```

The `run-tests` skill executes the test suite, analyzes any failures, and verifies engine isolation. For US-1.1 there is no engine code yet, but the skill also checks that the project structure is correct and that no lint errors exist.

### Step 4: Review Against Conventions

Finally, trigger the `code-reviewer` agent for a post-implementation audit:

```
Perform a structured review of the current User Story implementation against the guidelines in CLAUDE.md, established coding standards, and the acceptance criteria specified in SPECS.md, identifying any gaps, deviations, or inconsistencies.
```

The `code-reviewer` agent runs in its own context with read-only tools (Read, Grep, Glob, Bash). It checks the diff against its review checklist — TypeScript strict mode, engine/render separation, Phaser-in-Next.js rules, code style — and reports any violations. For a setup story, the critical checks are:

- `tsconfig.json` has `"strict": true` and `"noImplicitAny": true`.
- `app/game/page.tsx` starts with `"use client"`.
- `src/game/` contains all four subdirectories: `engine/`, `render/`, `state/`, `save/`.
- No `require()` statements anywhere — ES modules only.

### Why This Four-Step Sequence

| Step | What It Activates | Purpose |
|------|-------------------|---------|
| Spec-planner prompt | `spec-planner` agent | Confirms scope and surfaces risks *before* code |
| `/implement-story US-1.1` | `implement-story` skill + `game-conventions` (auto) | Full plan → implement → test → update-specs cycle |
| `/run-tests` | `run-tests` skill | Independent validation, decoupled from implementation |
| Review prompt | `code-reviewer` agent | Post-implementation audit against `CLAUDE.md` |

The key insight: **`/implement-story US-1.1` is the primary prompt.** It encapsulates the entire spec-driven loop in a single invocation. The pre-planning and post-review steps are guardrails — they add rigor without adding friction because they are also single commands, not multi-paragraph prompts.

For US-1.1, the pre-planning and post-review steps are arguably optional — it is a setup story with no dependencies and minimal risk. But for US-3.1 (Needs System), where the implementation touches state machines, cross-stat effects, death conditions, and five Gherkin scenarios with concrete values, the four-step sequence is not optional. It is the difference between a clean implementation and a session spent debugging architectural violations that could have been caught in the plan phase.

The discipline of running all four steps on a simple story means the workflow is already muscle memory when the complex stories arrive.

---

## What This Is Not

This approach is not a replacement for human judgment. The developer still reviews every implementation, makes architectural decisions the AI cannot anticipate, and resolves ambiguities that no specification can fully capture.

It is also not a waterfall process. Specifications are updated continuously — the `update-specs` skill modifies `SPECS.md` after every completed task, and the progress summary recalculates in real time. Stories can be added, reordered, or blocked mid-sprint.

And it is not specific to Claude. The Gherkin format, the epic/story/task hierarchy, and the status tracking system are all industry standards. The Claude-specific pieces — `CLAUDE.md`, skills, and agents — are the delivery mechanism, not the methodology itself. The methodology is: *write specifications precise enough that any competent executor — human or AI — can implement them without ambiguity, and track state changes at every level.*

---

## Closing Thoughts

The shift from conversational AI coding to spec-driven AI coding is a shift in posture. Instead of asking the AI "can you build this feature?" and reviewing the output, you define the feature with enough precision that the AI's task is execution, not interpretation. The developer's role moves from writing code to writing constraints — and the constraints compose into a system that is auditable, traceable, and reproducible across sessions.

For teams evaluating AI-assisted development at scale, the investment in specification infrastructure pays for itself in the first week. Not because the AI writes better code — but because the *entire system* knows what to build, what is built, and what remains.

---

*This post describes the development methodology used in [NeoLifeSim](README.md), a snake survival simulation built with Next.js and Phaser 3. All referenced artifacts — `CLAUDE.md`, `SPECS.md`, skills, and agents — are committed to the repository and available for inspection.*
