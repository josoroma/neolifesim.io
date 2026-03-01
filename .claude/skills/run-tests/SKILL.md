---
description: "Run the test suite, report results, and suggest fixes. Usage: /run-tests [filter]"
disable-model-invocation: true
---

# Run Tests

Run the project test suite and analyze results.

## Usage

```
/run-tests              # Run all tests
/run-tests needs        # Run tests matching "needs"
/run-tests --coverage   # Run with coverage report
```

## Workflow

### 1. Run tests

```bash
# All tests
npm test

# Filtered
npm test -- --grep "<filter>"

# With coverage (if configured)
npm test -- --coverage
```

### 2. Analyze results

For each failing test:

1. Read the test file to understand what's expected
2. Read the source file being tested
3. Identify the root cause:
   - **Logic error** — incorrect implementation
   - **Missing implementation** — stub or TODO
   - **Test setup issue** — wrong mocks, missing fixtures
   - **Architecture violation** — engine importing Phaser, etc.

### 3. Report

```
## Test Results

✅ Passed: X
❌ Failed: Y
⏭️ Skipped: Z

### Failures

#### test-name-here
- **File**: src/game/engine/needs.test.ts
- **Expected**: hunger decreases by 1 per tick
- **Actual**: hunger unchanged
- **Root cause**: updateNeeds() not called in game loop
- **Suggested fix**: Add updateNeeds(state) call in tick()
```

### 4. Fix (if requested)

- Apply fixes following project conventions
- Re-run tests to verify
- Run `npm run lint` to ensure no lint regressions

## Engine isolation check

After tests pass, verify engine purity:

```bash
grep -r "from 'phaser'" src/game/engine/ || echo "✅ No Phaser imports in engine"
grep -r "from \"phaser\"" src/game/engine/ || echo "✅ No Phaser imports in engine"
grep -r "window\." src/game/engine/ || echo "✅ No window references in engine"
grep -r "document\." src/game/engine/ || echo "✅ No document references in engine"
```
