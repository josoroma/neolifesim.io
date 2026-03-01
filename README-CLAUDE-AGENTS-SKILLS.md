# Technical Guide: `.claude/skills/` and `.claude/agents/`

> Based exclusively on Anthropic's official documentation — [code.claude.com/docs](https://code.claude.com/docs)
> Research date: 2026-02-28

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [`.claude/skills/` — Skills Directory](#2-claudeskills--skills-directory)
3. [`.claude/agents/` — Subagents Directory](#3-claudeagents--subagents-directory)
4. [Differences Between Skills and Agents](#4-differences-between-skills-and-agents)
5. [Interaction Between Skills and Agents](#5-interaction-between-skills-and-agents)
6. [Agent Skills — Open Standard](#6-agent-skills--open-standard)
7. [Plugins: Distributing Skills and Agents](#7-plugins-distributing-skills-and-agents)
8. [Official Best Practices](#8-official-best-practices)
9. [Sources Consulted](#9-sources-consulted)

---

## 1. Executive Summary

Claude Code uses two directories within `.claude/` with distinct purposes:

| Directory | Purpose | Main file | Invocation |
| --- | --- | --- | --- |
| `.claude/skills/<name>/` | Reusable instructions, slash commands, domain knowledge | `SKILL.md` | `/name` or automatically by Claude |
| `.claude/agents/<name>.md` | Specialized subagents with isolated context, their own tools and model | The `.md` file itself | Automatic or explicit delegation by Claude |

**Skills** extend what Claude **knows and can do** within the main conversation.
**Agents (Subagents)** create **isolated instances** of Claude with their own context, tools, and permissions.

---

## 2. `.claude/skills/` — Skills Directory

### 2.1 Functional purpose

Skills are packaged instructions that Claude can automatically load when relevant, or that the user can manually invoke with `/name`. They replace and extend the previous `.claude/commands/` system.

> "Skills extend what Claude can do. Create a `SKILL.md` file with instructions, and Claude adds it to its toolkit."
> — Official documentation

### 2.2 Directory structure

Each skill is a **directory** with `SKILL.md` as the entry point:

```
.claude/skills/
├── my-skill/
│   ├── SKILL.md           # Main instructions (REQUIRED)
│   ├── template.md        # Template for Claude to complete (optional)
│   ├── examples/
│   │   └── sample.md      # Expected output example (optional)
│   └── scripts/
│       └── validate.sh    # Script executable by Claude (optional)
```

### 2.3 `SKILL.md` file format

Two parts: **YAML frontmatter** (between `---`) + **Markdown content**.

```markdown
---
name: my-skill
description: Description of what it does and when to use it
---

Instructions that Claude follows when the skill is invoked.
Can include numbered steps, rules, templates, etc.
```

### 2.4 Frontmatter fields (complete reference)

**All fields are optional.** Only `description` is recommended.

| Field | Required | Description |
| --- | --- | --- |
| `name` | No | Name for display and `/slash-command`. If omitted, uses the directory name. Lowercase letters, numbers, and hyphens only (max 64 characters). |
| `description` | Recommended | What the skill does and when to use it. Claude uses this to decide when to apply it. If omitted, uses the first paragraph of the content. |
| `argument-hint` | No | Hint shown in autocomplete. E.g.: `[issue-number]` or `[filename] [format]`. |
| `disable-model-invocation` | No | `true` to prevent Claude from loading the skill automatically. Manual invocation only with `/name`. Default: `false`. |
| `user-invocable` | No | `false` to hide from the `/` menu. For background knowledge that the user should not invoke directly. Default: `true`. |
| `allowed-tools` | No | Tools that Claude can use without asking permission when the skill is active. |
| `model` | No | Model to use when the skill is active. |
| `context` | No | `fork` to execute in an isolated subagent. |
| `agent` | No | Type of subagent to use when `context: fork`. Options: `Explore`, `Plan`, `general-purpose`, or any custom agent from `.claude/agents/`. |
| `hooks` | No | Lifecycle hooks specific to the skill. |

### 2.5 Locations and scoping

| Level | Location | Availability |
| --- | --- | --- |
| Enterprise | Managed settings | All users in the organization |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where the plugin is enabled |

**Priority when names conflict:** enterprise > personal > project. Plugin skills use the namespace `plugin-name:skill-name`.

### 2.6 Automatic discovery from nested directories

Claude Code automatically discovers skills in nested `.claude/skills/` directories. If you're editing in `packages/frontend/`, Claude also searches in `packages/frontend/.claude/skills/`. This supports monorepos.

### 2.7 Types of skill content

1. **Reference content** — Knowledge that Claude applies inline: conventions, patterns, style guides.
2. **Task content** — Step-by-step instructions for a specific action (deploy, commit, code generation). Use `disable-model-invocation: true`.

### 2.8 Variable substitution

| Variable | Description |
| --- | --- |
| `$ARGUMENTS` | All arguments passed when invoking the skill |
| `$ARGUMENTS[N]` or `$N` | Specific argument by index (0-based) |
| `${CLAUDE_SESSION_ID}` | Current session ID |

### 2.9 Dynamic context injection

The `` !`command` `` syntax executes shell commands **before** the content reaches Claude. The output replaces the placeholder:

```markdown
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
```

### 2.10 Supporting files

Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files:

```
my-skill/
├── SKILL.md             (summary and navigation)
├── reference.md         (detailed API docs)
├── examples.md          (usage examples)
└── scripts/
    └── helper.py        (utility script)
```

Reference from `SKILL.md` so Claude knows what each file contains:

```markdown
## Additional resources
- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

### 2.11 Invocation control

| Configuration | User invokes | Claude invokes | Behavior |
| --- | --- | --- | --- |
| (default) | Yes | Yes | Description always in context, full content when invoked |
| `disable-model-invocation: true` | Yes | No | Description NOT in context, full content when user invokes |
| `user-invocable: false` | No | Yes | Description always in context, full content when invoked |

### 2.12 Context budget for skills

Skill descriptions are loaded into context. If you have many skills, they may exceed the character budget (2% of the context window, fallback of 16,000 characters). Verify with `/context`. To override: use the `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable.

---

## 3. `.claude/agents/` — Subagents Directory

### 3.1 Functional purpose

Subagents are specialized AI assistants that handle specific types of tasks. Each subagent runs in its **own context window** with a custom system prompt, specific tool access, and independent permissions.

> "Subagents are specialized AI assistants that handle specific types of tasks. Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions."
> — Official documentation

### 3.2 File structure

Subagents are individual Markdown files (not directories like skills):

```
.claude/agents/
├── code-reviewer.md
├── debugger.md
└── data-scientist.md
```

### 3.3 Subagent file format

**YAML frontmatter** + **Markdown body** (which becomes the system prompt):

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

The frontmatter defines the configuration. The body becomes the subagent's **system prompt**. Subagents receive **only** this prompt (plus basic environment details like the working directory), **not** the full Claude Code prompt.

### 3.4 Frontmatter fields (complete reference)

Only `name` and `description` are required.

| Field | Required | Description |
| --- | --- | --- |
| `name` | **Yes** | Unique identifier. Lowercase letters and hyphens. |
| `description` | **Yes** | When Claude should delegate to this subagent. |
| `tools` | No | Tools the subagent can use. Inherits all if omitted. |
| `disallowedTools` | No | Denied tools, removed from the inherited or specified list. |
| `model` | No | Model to use: `sonnet`, `opus`, `haiku`, or `inherit`. Default: `inherit`. |
| `permissionMode` | No | Permission mode: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, or `plan`. |
| `maxTurns` | No | Maximum agentic turns before the subagent stops. |
| `skills` | No | Skills to load into the subagent's context at startup. The full content is injected, not just made available. |
| `mcpServers` | No | Available MCP servers. Existing server name or inline definition. |
| `hooks` | No | Lifecycle hooks scoped to this subagent. |
| `memory` | No | Persistent memory scope: `user`, `project`, or `local`. Enables cross-session learning. |
| `background` | No | `true` to always run as a background task. Default: `false`. |
| `isolation` | No | `worktree` to run in a temporary git worktree with an isolated copy of the repo. |

### 3.5 Locations and scoping

| Level | Location | Priority |
| --- | --- | --- |
| `--agents` CLI flag | Current session (JSON) | 1 (highest) |
| `.claude/agents/` | Current project | 2 |
| `~/.claude/agents/` | All your projects | 3 |
| Plugin `agents/` | Where the plugin is enabled | 4 (lowest) |

When multiple subagents share the same name, the highest-priority location wins.

### 3.6 Built-in subagents

Claude Code includes built-in subagents:

| Subagent | Model | Tools | Purpose |
| --- | --- | --- | --- |
| **Explore** | Haiku (fast) | Read-only (Read denies Write/Edit) | Code search and analysis |
| **Plan** | (inherited) | Read-only | Task planning |
| **general-purpose** | (inherited) | All | General tasks |

### 3.7 Interactive creation with `/agents`

The `/agents` command provides an interactive interface to:
- View all available subagents
- Create new subagents with guided setup or Claude-generated configuration
- Edit existing configuration
- Delete custom subagents

### 3.8 Creation via CLI

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer.",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

The `--agents` flag accepts JSON with the same fields as file frontmatter: `description`, `prompt`, `tools`, `disallowedTools`, `model`, `permissionMode`, `mcpServers`, `hooks`, `maxTurns`, `skills`, and `memory`.

### 3.9 Persistent memory

The `memory` field enables a persistent directory that survives across conversations:

| Scope | Location | When to use |
| --- | --- | --- |
| `user` | `~/.claude/agent-memory/<name>/` | Cross-project learnings (recommended) |
| `project` | `.claude/agent-memory/<name>/` | Project-specific knowledge, shareable via VCS |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, NOT versionable (gitignored) |

When memory is enabled:
- The prompt includes instructions to read/write to the memory directory
- The first 200 lines of `MEMORY.md` are included
- The Read, Write, Edit tools are automatically enabled

### 3.10 Hooks in subagents

**In subagent frontmatter** — only execute while the subagent is active:

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
```

**In project `settings.json`** — lifecycle events:

| Event | Matcher | When |
| --- | --- | --- |
| `SubagentStart` | Agent type name | When a subagent starts |
| `SubagentStop` | Agent type name | When a subagent completes |

### 3.11 Spawning restriction

From a main agent (`claude --agent`), you can restrict which subagents it can create:

```yaml
tools: Agent(worker, researcher), Read, Bash
```

This is an **allowlist**: only `worker` and `researcher` can be invoked.

---

## 4. Differences Between Skills and Agents

| Aspect | `.claude/skills/` | `.claude/agents/` |
| --- | --- | --- |
| **File structure** | Directory with `SKILL.md` + supporting files | Individual `.md` file |
| **Main file** | `SKILL.md` (inside a named directory) | `<name>.md` (direct file) |
| **Execution context** | Inline in the main conversation (by default) | Its own isolated context window |
| **Invocation** | `/name` by user or automatically by Claude | Automatic or explicit delegation by Claude |
| **System prompt** | Instructions added to existing context | The file body BECOMES the system prompt |
| **Tools** | Can restrict with `allowed-tools` (permissive only) | Can specify **and deny** (`tools` + `disallowedTools`) |
| **Model** | Can specify with `model` | Can specify with `model` (`sonnet`, `opus`, `haiku`, `inherit`) |
| **Permissions** | Inherits from the conversation | Can override with `permissionMode` |
| **Persistent memory** | No | Yes (`memory: user\|project\|local`) |
| **Supporting files** | Yes (templates, examples, scripts inside the dir) | No (single file) |
| **Hooks** | Yes (`hooks` in frontmatter) | Yes (`hooks` in frontmatter + `SubagentStart/Stop` events) |
| **Required fields** | None (only `description` recommended) | `name` and `description` |
| **Sub-spawning** | Cannot create subagents | Cannot create subagents (only main agent with `claude --agent` can) |
| **Primary use case** | Domain knowledge, commands, workflows | Isolated tasks, explorations, reviews, debugging |

---

## 5. Interaction Between Skills and Agents

Skills and subagents work together in two directions:

### 5.1 Skill that executes in a subagent (`context: fork`)

The skill defines the task and chooses an agent type to execute it:

```markdown
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

The `agent` field can be a built-in (`Explore`, `Plan`, `general-purpose`) or any custom subagent from `.claude/agents/`.

### 5.2 Subagent with preloaded skills (`skills` field)

The subagent controls the system prompt and loads skill content as reference:

```markdown
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

The **full content** of each skill is injected into the subagent's context. Subagents **do not inherit** skills from the parent conversation; they must be listed explicitly.

---

## 6. Agent Skills — Open Standard

> "Claude Code skills follow the Agent Skills open standard, which works across multiple AI tools."
> — Official documentation

Claude Code implements the [Agent Skills](https://agentskills.io/) standard and extends it with additional features:
- Invocation control (`disable-model-invocation`, `user-invocable`)
- Execution in subagent (`context: fork`, `agent`)
- Dynamic context injection (`` !`command` ``)

---

## 7. Plugins: Distributing Skills and Agents

Plugins can package both components:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── code-reviewer/
│   │   └── SKILL.md
│   └── pdf-processor/
│       ├── SKILL.md
│       └── scripts/
├── agents/
│   ├── security-reviewer.md
│   ├── performance-tester.md
│   └── compliance-checker.md
└── hooks/
    └── hooks.json
```

Components are automatically discovered when the plugin is installed. Plugin skills use the namespace `plugin-name:skill-name` to avoid conflicts.

---

## 8. Official Best Practices

### For Skills

1. **Clear descriptions** — include keywords that users would naturally say
2. **`SKILL.md` under 500 lines** — move detailed reference to separate files
3. **`disable-model-invocation: true`** for workflows with side effects (`/deploy`, `/commit`)
4. **`user-invocable: false`** for background knowledge that is not actionable as a command
5. **Use `allowed-tools`** to create restricted modes (e.g.: read-only)
6. **Commit `.claude/skills/`** to version control to share with the team

### For Agents

1. **Focused subagents** — each should excel at a specific task
2. **Detailed descriptions** — Claude uses them to decide when to delegate
3. **Limit tool access** — grant only necessary permissions
4. **Commit `.claude/agents/`** — share project subagents with the team
5. **Use memory** — `user` as default, `project` or `local` when knowledge is codebase-specific
6. **Include memory instructions** in the prompt so the agent proactively maintains its knowledge base

### When to use each

| Situation | Use |
| --- | --- |
| Code conventions, patterns, style guides | **Skill** (inline reference) |
| Workflow with specific steps (deploy, commit, review) | **Skill** (task with `/name`) |
| Codebase exploration without modifying files | **Agent** (read-only with limited tools) |
| Debugging with edit access | **Agent** (with tools: Read, Edit, Bash) |
| Task that produces voluminous output | **Agent** (isolates the context) |
| Independent parallel investigation | **Agent** (multiple instances) |
| Reusable prompts in the main conversation | **Skill** |
| Automatic post-change review | **Agent** (with PostToolUse hooks) |

---

## 9. Sources Consulted

| Source | URL | Status |
| --- | --- | --- |
| Extend Claude with skills | https://code.claude.com/docs/en/skills | ✅ Verified |
| Create custom subagents | https://code.claude.com/docs/en/sub-agents | ✅ Verified |
| Plugins reference | https://code.claude.com/docs/en/plugins-reference | ✅ Verified |
| Orchestrate teams of Claude Code sessions | https://code.claude.com/docs/en/agent-teams | ✅ Verified |

> **Note:** All information in this document comes exclusively from Anthropic's official documentation at `code.claude.com/docs`. No inferences or unofficially documented community practices are included.
