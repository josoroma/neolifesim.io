# CLAUDE.md — Complete Guide

> Based on Anthropic's official documentation: [Memory](https://code.claude.com/docs/en/memory) and [Best Practices](https://code.claude.com/docs/en/best-practices).

---

## 1. What is CLAUDE.md?

`CLAUDE.md` is a Markdown file that provides **persistent instructions** to Claude Code for a project, your personal workflow, or your entire organization. Claude reads it at the start of **every session**, injecting it as context into the conversation window.

Unlike **auto memory** (notes that Claude writes by itself), `CLAUDE.md` is written and maintained **by you** to explicitly guide Claude's behavior.

| Aspect          | CLAUDE.md                          | Auto Memory                             |
| --------------- | ---------------------------------- | --------------------------------------- |
| Who writes it   | You                                | Claude                                  |
| What it contains | Instructions and rules            | Learnings and discovered patterns       |
| Scope           | Project, user, or organization     | Per working tree                        |
| Loaded in       | Every session                      | Every session (first 200 lines)         |
| Use it for      | Code standards, workflows, architecture | Build commands, debugging insights, preferences |

---

## 2. Locations and Scope

`CLAUDE.md` can live in several locations, each with a different scope. More specific locations take **higher precedence** over more general ones.

| Location | Path | Purpose | Example content | Scope |
| --- | --- | --- | --- | --- |
| **Managed policy** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` · Linux/WSL: `/etc/claude-code/CLAUDE.md` · Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | Organizational instructions managed by IT/DevOps | Corporate standards, security policies | All users in the organization |
| **Project instructions** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Shared team instructions | Project architecture, code standards, common workflows | Team (via version control) |
| **User instructions** | `~/.claude/CLAUDE.md` | Personal preferences for all projects | Code style preferences, tool shortcuts | Only you (all projects) |
| **Local instructions** | `./CLAUDE.local.md` | Personal per-project preferences, **not committed to git** | Sandbox URLs, preferred test data | Only you (current project) |

---

## 3. How Files Are Loaded

Claude Code reads `CLAUDE.md` files by **traversing the directory tree upward** from your current working directory. If you run Claude in `foo/bar/`, it loads instructions from:

- `foo/bar/CLAUDE.md`
- `foo/bar/CLAUDE.local.md`
- `foo/CLAUDE.md`
- `foo/CLAUDE.local.md`

`CLAUDE.md` files in **subdirectories** are loaded **on demand** when Claude reads files in those subdirectories (not at startup).

### Additional directories

With the `--add-dir` flag and the `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` environment variable, you can load `CLAUDE.md` files from external directories:

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared-config
```

---

## 4. How to Create a Project CLAUDE.md

### Automatic generation with `/init`

Run `/init` inside a Claude Code session to generate an initial `CLAUDE.md`. Claude analyzes your codebase and creates a file with:

- Build commands
- Testing instructions
- Project conventions it discovers

If a `CLAUDE.md` already exists, `/init` **suggests improvements** instead of overwriting it.

### Manual creation

Create `./CLAUDE.md` or `./.claude/CLAUDE.md` at the root of your project and add instructions that apply to anyone working on the project.

---

## 5. Recommended Format

There is no mandatory format, but it is recommended to keep it **short and readable**. Example:

```markdown
# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```

### Structure

- Use **Markdown headings** (`#`, `##`) and **bullet points** (`-`) to group related instructions.
- Claude scans the structure the same way a human reader does: organized sections are easier to follow than dense paragraphs.

---

## 6. Writing Effective Instructions

### Size

Aim for **fewer than 200 lines** per `CLAUDE.md` file. Longer files consume more context and reduce adherence.

### Specificity

Write instructions concrete enough to be verifiable:

| ✅ Good | ❌ Bad |
| --- | --- |
| `"Use 2-space indentation"` | `"Format code properly"` |
| `"Run npm test before committing"` | `"Test your changes"` |
| `"API handlers live in src/api/handlers/"` | `"Keep files organized"` |

### Consistency

If two rules contradict each other, Claude may choose one arbitrarily. Periodically review your `CLAUDE.md` files to remove obsolete or conflicting instructions.

### Emphasis

You can add emphasis (e.g., `"IMPORTANT"` or `"YOU MUST"`) to improve adherence on critical instructions.

---

## 7. What to Include and What Not

| ✅ Include | ❌ Do not include |
| --- | --- |
| Bash commands Claude cannot guess | Things Claude can discover by reading the code |
| Code style rules that differ from defaults | Standard language conventions Claude already knows |
| Testing instructions and preferred test runners | Detailed API documentation (link to docs instead) |
| Repository etiquette (branch naming, PR conventions) | Information that changes frequently |
| Project-specific architectural decisions | Long explanations or tutorials |
| Dev environment quirks (required environment variables) | File-by-file codebase descriptions |
| Common gotchas or non-obvious behaviors | Self-evident practices like "write clean code" |

**Golden rule**: for each line, ask yourself *"If I remove this, would Claude make mistakes?"*. If not, remove it.

---

## 8. Importing Additional Files

`CLAUDE.md` files can import other files using the `@path/to/import` syntax. Imported files are expanded and loaded into context at startup along with the `CLAUDE.md` that references them.

```markdown
See @README.md for project overview and @package.json for available npm commands.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

- Both relative and absolute paths are allowed.
- Relative paths are resolved relative to the file containing the import.
- Imported files can recursively import other files, with a maximum depth of **5 hops**.

---

## 9. Organizing Rules with `.claude/rules/`

For large projects, you can split instructions into multiple files inside the `.claude/rules/` directory. This keeps instructions modular and easier to maintain.

### Structure

```
your-project/
├── .claude/
│   ├── CLAUDE.md           # Main project instructions
│   └── rules/
│       ├── code-style.md   # Code style guidelines
│       ├── testing.md      # Testing conventions
│       └── security.md     # Security requirements
```

### Path-specific rules

Rules can be scoped to specific files using YAML frontmatter with the `paths` field:

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

Supported glob patterns:

| Pattern | Matches |
| --- | --- |
| `**/*.ts` | All TypeScript files in any directory |
| `src/**/*` | All files under `src/` |
| `*.md` | Markdown files at the project root |
| `src/components/*.tsx` | React components in a specific directory |

Multiple patterns and brace expansion can be specified:

```yaml
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

### User rules

Personal rules in `~/.claude/rules/` apply to all projects on your machine:

```
~/.claude/rules/
├── preferences.md    # Personal coding preferences
└── workflows.md      # Preferred workflows
```

User rules are loaded **before** project rules, giving project rules higher priority.

### Sharing rules between projects with symlinks

The `.claude/rules/` directory supports symlinks:

```bash
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```

---

## 10. Management for Large Teams

### Deploying CLAUDE.md at the organization level

Create the file at the managed policy location:

- **macOS**: `/Library/Application Support/ClaudeCode/CLAUDE.md`
- **Linux/WSL**: `/etc/claude-code/CLAUDE.md`
- **Windows**: `C:\Program Files\ClaudeCode\CLAUDE.md`

Deploy it with your configuration management system (MDM, Group Policy, Ansible, etc.).

> Managed policy files **cannot be excluded** by individual configurations.

### Excluding specific CLAUDE.md files

In large monorepos, use `claudeMdExcludes` to skip irrelevant files:

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

---

## 11. Best Practices

1. **Keep the file short** (<200 lines). Bloated files cause Claude to ignore your instructions.
2. **Commit to git** your `CLAUDE.md` so your team can contribute. The file **accumulates value over time**.
3. **Use `CLAUDE.local.md`** for personal per-project preferences that should not be pushed to the repository.
4. **Review it like code**: when something goes wrong, review the `CLAUDE.md`, prune it regularly, and test changes by observing whether Claude's behavior actually changes.
5. **Use `/memory`** to verify which `CLAUDE.md` files are being loaded in your current session.
6. **Move detailed content** to separate files referenced with `@path` or split your instructions into `.claude/rules/`.
7. **Avoid conflicts**: if two files give different guidance for the same behavior, Claude may choose arbitrarily.
8. **For instructions that must always execute without exception**, use [hooks](https://code.claude.com/docs/en/hooks-guide) instead of `CLAUDE.md` (hooks are deterministic, `CLAUDE.md` is advisory).
9. **For domain knowledge or workflows relevant only sometimes**, use [skills](https://code.claude.com/docs/en/skills) instead of `CLAUDE.md` (they load on demand without bloating every conversation).

---

## 12. Troubleshooting

### Claude doesn't follow my CLAUDE.md

`CLAUDE.md` is context, **not enforcement**. Claude reads it and tries to follow it, but there is no guarantee of strict compliance, especially for vague or conflicting instructions.

**To debug:**

1. Run `/memory` to verify that your files are being loaded.
2. Verify that the relevant `CLAUDE.md` is in a location that gets loaded for your session.
3. Make the instructions more specific.
4. Look for conflicting instructions across multiple `CLAUDE.md` files.

### My CLAUDE.md is too large

Files over 200 lines consume more context and reduce adherence. Move detailed content to separate files with `@path` imports or split it into `.claude/rules/`.

### Instructions disappear after `/compact`

`CLAUDE.md` **fully survives** compaction. After `/compact`, Claude re-reads your `CLAUDE.md` from disk and re-injects it fresh. If an instruction disappeared, it was given only in conversation, not written in `CLAUDE.md`.

---

## 13. Complete CLAUDE.md Example

```markdown
# Project: NeoLifeSim

## Build & Run
- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Tests: `npm test`
- Single test: `npm test -- --grep "test name"`
- Lint: `npm run lint`

## Code Style
- TypeScript strict mode, no `any` types
- Use ES modules (import/export), not CommonJS (require)
- 2-space indentation
- Prefer functional components with hooks over class components

## Architecture
- `src/core/` — Game engine and simulation logic
- `src/ui/` — React components
- `src/api/` — API handlers
- `src/types/` — Shared TypeScript types

## Git Workflow
- Branch naming: `feat/`, `fix/`, `chore/` prefixes
- Commit messages: conventional commits format
- Always run `npm test` and `npm run lint` before committing

## IMPORTANT
- NEVER modify files in `src/core/engine.ts` without running the full test suite
- All API responses must use the standard error format in `src/types/api.ts`

## References
- @README.md for project overview
- @docs/architecture.md for detailed architecture decisions
```

---

## 14. Official References

- [Memory — Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Best Practices — Claude Code Docs](https://code.claude.com/docs/en/best-practices)
- [Skills](https://code.claude.com/docs/en/skills)
- [Hooks](https://code.claude.com/docs/en/hooks-guide)
- [Settings](https://code.claude.com/docs/en/settings)
- [Sub-agents](https://code.claude.com/docs/en/sub-agents)
