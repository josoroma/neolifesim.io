# SPECS.md — Designing a Specifications File with Task Tracking and Gherkin

---

## 1. Purpose of SPECS.md

`SPECS.md` is a project Markdown file that centralizes:

- **Functional specifications** structured into epics, user stories, and tasks.
- **Task state management** (Todo → In Progress → Completed).
- **Acceptance criteria** expressed in Gherkin format (Given/When/Then).

Its goal is to serve as a **human- and AI-readable source of truth**, providing enough context for a development agent (such as Claude Code) to plan, implement, and verify features without ambiguity.

---

## 2. Relationship with Official Claude Code Documentation

### What officially exists

The official Claude Code documentation ([Best Practices](https://code.claude.com/docs/en/best-practices)) mentions `SPEC.md` **only once**, within the "Let Claude interview you" pattern:

```text
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.

Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs.
Don't ask obvious questions, dig into the hard parts I might not have considered.

Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```

**The official workflow is:**

1. Claude interviews the user about a feature.
2. Claude generates a `SPEC.md` with the complete specification.
3. A **new session** with clean context is started to implement from the spec.

### What does NOT officially exist

| Aspect | Status |
| --- | --- |
| Standard schema or format for `SPEC.md` / `SPECS.md` | **Not defined** |
| Integrated state system (Todo/In Progress/Completed) | **Not documented** |
| Use of Gherkin within specs for AI agents | **Not mentioned** |
| `SPECS.md` naming convention (plural) | **Not standardized** |
| Automatic loading of `SPECS.md` by Claude Code | **Does not happen** — only `CLAUDE.md` and `MEMORY.md` are loaded automatically |

### How to integrate SPECS.md with Claude Code

Since `SPECS.md` is **not loaded automatically**, it is recommended to:

- Reference it from `CLAUDE.md` with an `@` import:

```markdown
# Project Specs
- See @SPECS.md for functional specifications and task tracking
```

- Or indicate it explicitly in the prompt:

```text
Read @SPECS.md and implement the next Todo task.
```

---

## 3. Recommended File Structure

The following structure combines software engineering conventions (epics/stories/tasks, Gherkin) with optimization for AI agent consumption.

```text
SPECS.md
├── Project header (name, version, date)
├── Status legend
├── Progress summary
├── Epic 1
│   ├── User Story 1.1
│   │   ├── Acceptance criteria (Gherkin)
│   │   └── Tasks [with status]
│   └── User Story 1.2
│       ├── Acceptance criteria (Gherkin)
│       └── Tasks [with status]
├── Epic 2
│   └── ...
└── Changelog / Decision history
```

---

## 4. Status System

### Semantic definition

| Status | Symbol | Meaning | When to use |
| --- | --- | --- | --- |
| **Todo** | `[ ]` | Planned task, not started | Prioritized backlog |
| **In Progress** | `[~]` | Active work in progress | Maximum 1-3 per work session |
| **Completed** | `[x]` | Implemented and verified | Passes acceptance criteria |
| **Blocked** | `[!]` | External dependency or pending decision | Requires action outside the agent's scope |

### Operational rules

1. **An AI agent must complete an `[~]` task before taking another.** This prevents partial implementations.
2. **Mark `[x]` only when acceptance criteria (Gherkin) are verifiable.** Ideally with passing tests.
3. **`[!]` requires an explanatory note** indicating what blocks the task.

---

## 5. Using Gherkin for Functional Specifications

### Why Gherkin?

- **Unambiguous**: structures preconditions, actions, and results.
- **Parseable by AI agents**: Claude can generate tests directly from scenarios.
- **Readable by non-technical users**: the format is pseudo-natural language.
- **Industry standard**: adopted by Cucumber, Behave, SpecFlow, etc.

### Base syntax

```gherkin
Feature: <Feature name / User Story>
  As a <role>
  I want <action>
  So that <benefit>

  Scenario: <Specific scenario>
    Given <precondition>
    And <additional precondition>
    When <user action>
    And <additional action>
    Then <expected result>
    And <additional result>

  Scenario Outline: <Parameterized scenario>
    Given <precondition with <variable>>
    When <action with <variable>>
    Then <result with <variable>>

    Examples:
      | variable | expected_value |
      | case_1   | result_1       |
      | case_2   | result_2       |
```

### Conventions for SPECS.md

- Use `Feature:` aligned with each User Story.
- Use `Scenario:` for each acceptance criterion.
- Use `Scenario Outline:` + `Examples:` for parameterized behaviors.
- Scenarios must be **self-contained**: they should not depend on the state of other scenarios.

---

## 6. Complete Example

```md
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
| E1: Character System | 3 | 1 | 1 | 1 | 0 |
| E2: Economy System | 2 | 2 | 0 | 0 | 0 |

---

## E1: Character System

### US-1.1: Character Creation [x]

**As a** player
**I want** to create a character with basic attributes
**So that** I can start a new simulation

#### Acceptance Criteria

```gherkin
Feature: Character Creation
  As a player
  I want to create a character with basic attributes
  So that I can start a new simulation

  Scenario: Create character with valid name
    Given the player is on the character creation screen
    When the player enters "Alex" as the character name
    And the player confirms creation
    Then a new character named "Alex" is created
    And the character has default attributes (health: 100, energy: 100, mood: 50)

  Scenario: Reject empty character name
    Given the player is on the character creation screen
    When the player leaves the name field empty
    And the player attempts to confirm creation
    Then an error message "Character name is required" is displayed
    And no character is created

  Scenario Outline: Validate attribute ranges
    Given a new character is being created
    When the system initializes the <attribute> attribute
    Then the value must be between <min> and <max>

    Examples:
      | attribute | min | max |
      | health    | 0   | 100 |
      | energy    | 0   | 100 |
      | mood      | 0   | 100 |
```

#### Tasks

- [x] T-1.1.1: Define `Character` interface in `src/types/character.ts`
- [x] T-1.1.2: Implement `createCharacter()` in `src/core/character.ts`
- [x] T-1.1.3: Add validation for character name (non-empty, max 30 chars)
- [x] T-1.1.4: Write unit tests for character creation

---

### US-1.2: Character Aging [~]

**As a** player
**I want** my character to age over time
**So that** the simulation progresses through life stages

#### Acceptance Criteria

```gherkin
Feature: Character Aging
  As a player
  I want my character to age over time
  So that the simulation progresses through life stages

  Scenario: Character ages each simulation cycle
    Given a character with age 25
    When one simulation cycle completes
    Then the character's age increases to 26

  Scenario: Life stage transitions
    Given a character with age 17
    When the character's age increases to 18
    Then the character's life stage changes from "teenager" to "adult"
    And a life event "Reached adulthood" is generated

  Scenario: Character reaches maximum age
    Given a character with age 99
    And the character's health is below 20
    When one simulation cycle completes
    Then the simulation ends with status "natural_death"
```

#### Tasks

- [x] T-1.2.1: Add `age` and `lifeStage` fields to `Character`
- [~] T-1.2.2: Implement `ageCharacter()` with life stage transitions
- [ ] T-1.2.3: Implement death condition logic
- [ ] T-1.2.4: Write unit tests for aging and life stage transitions

---

### US-1.3: Character Stats Decay [ ]

**As a** player
**I want** character stats to decay over time without actions
**So that** I need to actively manage my character's wellbeing

#### Acceptance Criteria

```gherkin
Feature: Character Stats Decay
  As a player
  I want character stats to decay over time
  So that I need to actively manage my character's wellbeing

  Scenario: Energy decays each cycle
    Given a character with energy 80
    When one simulation cycle completes without rest action
    Then the character's energy decreases by 10

  Scenario: Low energy affects mood
    Given a character with energy 15
    When one simulation cycle completes
    Then the character's mood decreases by an additional 5
    And a warning "Character is exhausted" is shown
```

#### Tasks

- [ ] T-1.3.1: Implement stat decay engine in `src/core/decay.ts`
- [ ] T-1.3.2: Add cross-stat impact rules (low energy → mood penalty)
- [ ] T-1.3.3: Write unit tests for decay mechanics

---

## E2: Economy System

### US-2.1: Basic Income [ ]

**As a** character
**I want** to earn money from a job
**So that** I can afford living expenses

#### Acceptance Criteria

```gherkin
Feature: Basic Income
  As a character with a job
  I want to earn money each work cycle
  So that I can afford living expenses

  Scenario: Earn salary from job
    Given a character with job "developer" and salary 5000
    When a work cycle completes
    Then the character's balance increases by 5000

  Scenario: No income without job
    Given a character without a job
    When a work cycle completes
    Then the character's balance remains unchanged
    And a notification "No income this cycle" is displayed
```

#### Tasks

- [ ] T-2.1.1: Define `Job` interface and salary structure
- [ ] T-2.1.2: Implement income calculation per work cycle
- [ ] T-2.1.3: Write tests for income scenarios

---

## Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-02-28 | Initial spec: E1 (Character System), E2 (Economy System) | @dev |
| 2026-02-28 | Completed US-1.1: Character Creation | Claude Code |
```

---

## 7. Maintenance Best Practices

### Versioning

| Practice | Detail |
| --- | --- |
| **Commit to git** | `SPECS.md` should be under version control. Status changes are traceable. |
| **Header with version and date** | Include `Version: x.y.z` and `Last updated: YYYY-MM-DD` at the top. |
| **Changelog at the end** | Record key decisions, not every minor status change. |
| **Branching** | Update `SPECS.md` on the same branch as the implementation. Merge together with the code. |

### Maintenance

| Practice | Detail |
| --- | --- |
| **Review at the start of each session** | Before starting work with Claude Code, verify that statuses reflect reality. |
| **One file per milestone/release** | For large projects, consider `specs/v0.1.md`, `specs/v0.2.md`, etc. |
| **Move completed items to a history file** | When an entire epic is `[x]`, move it to `SPECS-DONE.md` to keep `SPECS.md` focused. |
| **Do not exceed 500 lines** | If `SPECS.md` grows too large, split by epic into separate files under `specs/`. |
| **ID consistency** | Use stable IDs (`E1`, `US-1.1`, `T-1.1.1`) so the AI agent can reference them unambiguously. |

### Integration with Claude Code

| Technique | Implementation |
| --- | --- |
| **Import from CLAUDE.md** | `@SPECS.md` in your `CLAUDE.md` so Claude loads it automatically. |
| **Instruction in CLAUDE.md** | `"Before implementing any feature, read @SPECS.md and identify the next Todo task."` |
| **Session prompt** | `"Read @SPECS.md. Pick the next [ ] task in the current [~] story. Implement it, run tests, and mark it [x]."` |
| **Dedicated skill** | Create `.claude/skills/implement-spec/SKILL.md` to automate the read-spec → implement → test → update-status cycle. |

---

## 8. Limitations and Considerations

### Absence of an official standard

> **Anthropic does not define a formal standard for `SPECS.md`.** The only official reference is the "interview → write spec to `SPEC.md`" pattern in the Claude Code Best Practices. Everything else in this document is a **proposed convention** based on established software engineering practices.

### Technical limitations

| Limitation | Impact | Mitigation |
| --- | --- | --- |
| `SPECS.md` is not loaded automatically | Claude does not read it unless instructed | Import with `@SPECS.md` from `CLAUDE.md` |
| Context consumption | A long spec consumes valuable tokens | Keep under 500 lines; split into files if necessary |
| Gherkin is not executed automatically | Scenarios are documentation, not executable tests | Use the scenarios as a basis for generating real tests with Claude |
| No format validation | There is no built-in linter that validates the structure of `SPECS.md` | Create a hook or skill that validates the structure on save |
| Statuses are convention, not enforcement | Claude may ignore statuses if not instructed | Include explicit instructions in CLAUDE.md: `"Always check task status before working"` |

### Difference between sources

| Element | Source |
| --- | --- |
| `SPEC.md` as interview output | **Official documentation** from Claude Code (Best Practices) |
| Status system `[ ]` / `[~]` / `[x]` | **Industry convention** (Markdown task lists, GitHub) |
| Gherkin format (Given/When/Then) | **Industry standard** (Cucumber, BDD) |
| Epics/stories/tasks structure | **Industry convention** (Agile/Scrum) |
| `SPECS.md` naming (plural, with task management) | **Proposed by this document** |
| `@SPECS.md` integration in `CLAUDE.md` | **Official mechanism** of CLAUDE.md imports applied to a custom file |

---

## 9. References

- [Claude Code — Best Practices: Let Claude interview you](https://code.claude.com/docs/en/best-practices) — Only official reference to `SPEC.md`
- [Claude Code — Memory: CLAUDE.md files](https://code.claude.com/docs/en/memory) — Import with `@path` syntax
- [Claude Code — Skills](https://code.claude.com/docs/en/skills) — How to create skills to automate workflows
- [Cucumber — Gherkin Reference](https://cucumber.io/docs/gherkin/reference/) — Formal Gherkin specification
- [Agile Alliance — User Stories](https://www.agilealliance.org/glossary/user-stories/) — Standard user story format
