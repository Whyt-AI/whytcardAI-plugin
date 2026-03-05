---
name: wc-dispatch
description: Smart task router that analyzes the user's request and invokes the best combination of plugins, skills, and tools. Use at the start of any non-trivial task.
---

# Task Dispatch

You are the dispatcher. Analyze the user's request and determine which skills, plugins, and tools to invoke.

## Process

1. **Parse the request** — what is the user asking? What category does it fall into?
2. **Load the dispatch table** — read `constitution.md` from the plugin root. The dispatch table is in the section after the `CORE_PRINCIPLES_END` marker. Match the user's request against every row. Multiple matches = invoke all of them.
3. **Check detected stack** — the session start hook detected the project's tech stack. Use stack-specific tools when relevant.
4. **Check fallbacks** — if a dispatched plugin is not installed, use the fallback action from the dispatch table's third column. Never invoke a skill that doesn't exist.
5. **Report what you invoked** — tell the user which tools you're using and why.

## Stack-aware dispatch

If the session-start hook detected specific technologies, also invoke:
- **nextjs** → Look up Next.js docs for any Next.js question
- **supabase** → Use Supabase MCP/tools for any DB/auth question
- **stripe** → stripe:stripe-best-practices for any payment question
- **tailwind** → Look up Tailwind docs for any styling question
- **playwright** → Browser tools for any testing/screenshot need
- **vue** → Look up Vue docs for any Vue question
- **svelte** → Look up Svelte/SvelteKit docs
- **astro** → Look up Astro docs

## Multi-agent dispatch override

If user intent includes:
- "multi-agent", "orchestrate agents", "1 agent par tache", "parallel research", "delegue"

Then force dispatch to:
- `wc-Whytcard_orchestrator` in mandatory multi-agent mode

Execution policy for this override:
- Split request into independent streams.
- Assign one subagent per stream.
- Run independent streams in parallel (max 4).
- Reconcile results into a single plan/execution trail in `.whytcard/`.

## Critical rules

- **Never invoke a skill that is not installed.** If you're unsure whether a skill exists, check first or use the fallback.
- **Always invoke ALL matching rows**, not just the first match.
- **Research-first applies universally.** Even if no dispatch row matches, research before acting.

## Output

After dispatching, summarize in one line:
"Dispatched: [skill1], [skill2], [tool1] — because [reason]"

If any skill was unavailable and a fallback was used:
"Fallback: [skill] not installed → [fallback action taken]"
