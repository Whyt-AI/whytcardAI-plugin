---
name: dispatch
description: Smart task router that analyzes the user's request and invokes the best combination of plugins, skills, and tools. Use at the start of any non-trivial task.
---

# Task Dispatch

You are the dispatcher. Analyze the user's request and determine which skills, plugins, and tools to invoke.

## Process

1. **Parse the request** — what is the user asking? What category does it fall into?
2. **Check the constitution's dispatch table** — which plugins/skills match?
3. **Check detected stack** — are there stack-specific tools to use?
4. **Invoke ALL matching skills** — don't pick one, invoke every relevant one
5. **Report what you invoked** — tell the user which tools you're using and why

## Decision tree

```
Request received
├── Contains UI/visual/design keywords?
│   ├── YES → Invoke frontend-design
│   └── After changes → Playwright screenshots (3 viewports)
├── Contains research/docs/how-to keywords?
│   ├── YES → Context7 resolve + query-docs
│   └── ALSO → WebSearch (dual-angle: good + bad)
├── Contains feature/implement/build keywords?
│   ├── YES → superpowers:brainstorming FIRST
│   └── THEN → workflows:plan
├── Contains bug/error/broken keywords?
│   └── YES → superpowers:systematic-debugging
├── Contains deploy/ship/production keywords?
│   └── YES → superpowers:verification-before-completion
├── Contains package/install/dependency keywords?
│   └── YES → WebSearch latest version + Context7 docs
├── Contains review/PR keywords?
│   └── YES → workflows:review
└── None of the above?
    └── Apply constitution principles, research first
```

## Stack-aware dispatch

If the session-start hook detected specific technologies, also invoke:
- **nextjs** → Context7 for Next.js docs on any Next.js question
- **supabase** → MCP supabase tools for any DB/auth question
- **stripe** → stripe:stripe-best-practices for any payment question
- **tailwind** → Context7 for Tailwind docs on any styling question
- **playwright** → Browser tools for any testing/screenshot need

## Output

After dispatching, summarize in one line:
"Dispatched: [skill1], [skill2], [tool1] — because [reason]"
