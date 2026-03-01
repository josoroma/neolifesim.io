---
description: "Implement a user story from SPECS.md. Usage: /implement-story US-1.1"
disable-model-invocation: true
---

# Implement Story

Implement a specific user story from SPECS.md end-to-end.

## Usage

```
/implement-story <story-id>
```

Example: `/implement-story US-1.1`

## Workflow

### 1. Read the story

- Open `SPECS.md` and locate the user story by ID (e.g., `US-1.1`)
- Read all tasks (`T-x.y.z`) under that story
- Read the Gherkin acceptance criteria for each task

### 2. Verify dependencies

- Check if prerequisite stories/tasks are completed (`[x]`)
- If dependencies are incomplete, list them and ask for confirmation before proceeding

### 3. Plan the implementation

- Identify which files need to be created or modified
- Respect architecture separation:
  - Engine logic → `src/game/engine/`
  - Render code → `src/game/render/`
  - State/atoms → `src/game/state/`
  - Save logic → `src/game/save/`
- List the plan before writing code

### 4. Implement each task

For each task in the story:

1. Write the implementation code
2. Write or update tests in the appropriate test file
3. Follow all conventions from `CLAUDE.md`:
   - TypeScript strict, no `any`
   - ES modules only
   - 2-space indentation
   - Functional components with hooks
   - Engine code must NOT import Phaser
4. Run `npm test` to verify
5. Run `npm run lint` to verify

### 5. Update SPECS.md

After all tasks pass:

1. Mark completed tasks: `[ ]` → `[x]`
2. If all tasks in a story complete, mark the story header
3. Update the progress summary table at the top of SPECS.md

### 6. Commit guidance

Suggest a conventional commit message:
```
feat(engine): implement <story-description>

Implements US-X.Y: <story title>
Tasks: T-X.Y.1, T-X.Y.2, ...
```

## Quality checks

- [ ] All Gherkin scenarios pass
- [ ] No `any` types introduced
- [ ] Engine code has zero Phaser imports
- [ ] Tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] SPECS.md updated with task statuses
