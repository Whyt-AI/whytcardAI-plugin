# /quality-gate

Run the WhytCard quality gate verification on the current work.

## Instructions

Invoke the `wc-quality-gate` agent to perform a comprehensive verification of the current session's work. The agent will check:

1. **Research evidence** — Were official sources consulted? Was dual-angle research done?
2. **Visual verification** — Were screenshots taken at 3 viewports? Both modes checked?
3. **Code quality** — No TODOs, no console.logs, no hardcoded strings?
4. **Accessibility** — Focus indicators, contrast, semantic HTML?
5. **i18n** — All locale files present with new keys?

Output a verdict: READY FOR PRODUCTION, NOT READY (with details), or CONDITIONAL.
