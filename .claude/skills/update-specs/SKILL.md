---
description: "Update task and story statuses in SPECS.md. Usage: /update-specs T-3.1.1 T-3.1.2 done"
disable-model-invocation: true
---

# Update Specs

Update task and story statuses in SPECS.md and recalculate progress.

## Usage

```
/update-specs <task-ids...> <status>
/update-specs T-3.1.1 T-3.1.2 done
/update-specs T-5.2.1 in-progress
/update-specs T-4.1.3 blocked
```

## Status markers

| Marker | Meaning      |
|--------|-------------|
| `[ ]`  | Todo        |
| `[~]`  | In progress |
| `[x]`  | Done        |
| `[!]`  | Blocked     |

## Workflow

### 1. Validate tasks exist

- Read `SPECS.md`
- Locate each listed task ID
- If a task ID is not found, report it and skip

### 2. Update task markers

- Replace the checkbox marker for each task
- Example: `- [ ] **T-3.1.1**` → `- [x] **T-3.1.1**`

### 3. Cascade to story level

After updating tasks, check if all tasks under a user story are `[x]`:
- If yes → mark the story as complete
- If some are `[~]` → mark story as in-progress
- If any are `[!]` → mark story as blocked

### 4. Update progress summary

Recalculate the progress table at the top of SPECS.md:

```markdown
| Epic | Stories | Tasks | Done | Progress |
|------|---------|-------|------|----------|
| E1   | 3       | 12    | 8    | 67%      |
| ...  | ...     | ...   | ...  | ...      |
```

### 5. Report changes

```
## SPECS.md Updated

### Tasks changed
- T-3.1.1: [ ] → [x]
- T-3.1.2: [ ] → [x]

### Story status
- US-3.1: [ ] → [x] (all 4 tasks complete)

### Overall progress
- Total tasks: 130
- Completed: 24 (18%)
- In progress: 3 (2%)
- Blocked: 0
```
