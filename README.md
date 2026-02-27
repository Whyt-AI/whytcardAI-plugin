# whytcardAI-plugin

Claude Code plugin that enforces WhytCard's development philosophy: research-first, proof-driven, UX-obsessed, anti-hallucination.

## What it does

This plugin turns Claude Code from a code assistant into a disciplined co-founder CTO that:

- **Never supposes** — researches before opining, proves before claiming
- **Dispatches the right tools** — automatically routes tasks to the best plugin/skill/MCP
- **Verifies visually** — takes Playwright screenshots after every UI change
- **Checks versions live** — never trusts training data for package versions
- **Thinks UX-first** — evaluates every decision from the user's perspective
- **Researches both sides** — good AND bad, with named examples and real data

## Structure

```
whytcardAI-plugin/
├── .claude-plugin/
│   └── plugin.json              ← Plugin manifest
├── constitution.md              ← Core principles + dispatch table
├── hooks/
│   ├── hooks.json               ← Hook event configuration
│   ├── wc-session-start.js      ← Injects constitution at conversation start
│   └── wc-pre-edit-gate.js      ← Reminds about verification before edits
├── skills/
│   ├── wc-dispatch/SKILL.md    ← Smart task router
│   ├── wc-visual-verify/SKILL.md ← Visual verification protocol
│   ├── wc-research-first/SKILL.md ← Research methodology
│   └── wc-version-check/SKILL.md ← Package version verification
└── agents/
    └── wc-quality-gate/AGENT.md ← Final quality gate
```

## Installation

### As a Claude Code plugin (recommended)

```bash
claude plugin add /path/to/whytcardAI-plugin
```

Or add to `~/.claude/settings.json`:
```json
{
  "enabledPlugins": {
    "whytcardAI-plugin@local": true
  }
}
```

### Manual (copy files)

1. Copy `constitution.md` content into your project's `CLAUDE.md`
2. Copy hooks to `~/.claude/hooks/`
3. Copy skills to `~/.claude/skills/`

## How it works

### Session Start
`wc-session-start.js` runs at every conversation start. It:
1. Loads `constitution.md` (principles + dispatch table)
2. Detects the project's tech stack from `package.json` / `requirements.txt`
3. Injects everything into the conversation context

### During Work
- `wc-pre-edit-gate.js` reminds about visual verification before UI edits (.tsx/.jsx)
- Skills are available for explicit invocation: `/wc-dispatch`, `/wc-visual-verify`, `/wc-research-first`, `/wc-version-check`
- The dispatch table in the constitution guides automatic skill selection

### Before Stopping
- A **prompt-based Stop hook** (in `hooks.json`) verifies that visual checks, version checks, and research were done
- The `wc-quality-gate` agent can be invoked for comprehensive final verification

## Works with these plugins

The dispatch table routes to skills from these plugins (install them separately):

| Plugin | Used for |
|---|---|
| `superpowers` | Brainstorming, debugging, planning, git workflows |
| `compound-engineering` | Multi-agent reviews, deep analysis |
| `frontend-design` | Design-quality UI development |
| `code-review` | Code review workflows |
| `feature-dev` | Feature development with architecture understanding |
| `stripe` | Payment integration best practices |
| `vercel` | Deployment workflows |
| `firecrawl` | Web scraping and content extraction |
| `playwright` | Browser automation and screenshots |
| `context7` | Library documentation lookup |
| `huggingface-skills` | ML operations |

## Philosophy

This plugin encodes a development philosophy, not a rigid process:

1. Research before opinions
2. Evidence before claims
3. Visual proof before "done"
4. User perspective before developer convenience
5. Latest and best, always verified
6. Dense communication, no filler
7. Problems are precise, never vague
