---
name: wc-dispatch
description: Smart task router that analyzes the user's request and invokes the best combination of plugins, skills, and tools. Use at the start of any non-trivial task.
---

# Task Dispatch

You are the dispatcher. Analyze the user's request and determine which skills, plugins, and tools to invoke.

## Process

1. **Parse the request** — what is the user asking? What category does it fall into?
2. **Check the constitution's dispatch table** — it was injected at session start inside `<WHYTCARD-CONSTITUTION>`. Match the user's request against every row. Multiple matches = invoke all of them.
3. **Check detected stack** — the session start hook detected the project's tech stack. Use stack-specific tools when relevant.
4. **Check fallbacks** — if a dispatched plugin is not installed, use the fallback action from the dispatch table's third column. Never invoke a skill that doesn't exist.
5. **Report what you invoked** — tell the user which tools you're using and why.

## Stack-aware dispatch

If the session-start hook detected specific technologies, also invoke:
- **nextjs** → Context7 for Next.js docs on any Next.js question
- **supabase** → MCP supabase tools for any DB/auth question
- **stripe** → stripe:stripe-best-practices for any payment question
- **tailwind** → Context7 for Tailwind docs on any styling question
- **playwright** → Browser tools for any testing/screenshot need
- **vue** → Context7 for Vue docs on any Vue question
- **svelte** → Context7 for Svelte/SvelteKit docs
- **astro** → Context7 for Astro docs

## Critical rules

- **Never invoke a skill that is not installed.** If you're unsure whether a skill exists, check first or use the fallback.
- **Always invoke ALL matching rows**, not just the first match.
- **Research-first applies universally.** Even if no dispatch row matches, research before acting.

## Output

After dispatching, summarize in one line:
"Dispatched: [skill1], [skill2], [tool1] — because [reason]"

If any skill was unavailable and a fallback was used:
"Fallback: [skill] not installed → [fallback action taken]"
