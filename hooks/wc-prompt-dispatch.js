#!/usr/bin/env node
/**
 * wc-prompt-dispatch — UserPromptSubmit / beforeSubmitPrompt hook
 *
 * Analyzes the user's prompt keywords and injects dispatch hints
 * so the AI agent knows which skills/tools to invoke before starting work.
 * Works on both Claude Code and Cursor via shared output module.
 */

const { handleStdin, injectContext, emptyResponse } = require("./lib/output");

// Keyword → dispatch hint mapping
const DISPATCH_RULES = [
  [/\b(ui|component|page|visual|design|layout|style|theme)\b/i,
    "WC-DISPATCH: UI task detected → invoke wc-visual-verify skill after changes. Take screenshots at 3 viewports."],
  [/\b(research|compare|evaluate|which|best|alternative|recommend|pros.?cons|trade.?off)\b/i,
    "WC-DISPATCH: Research task detected → invoke wc-research-first skill. Dual-angle research required (good + bad)."],
  [/\b(install|add|package|dependency|npm|pnpm|bun|pip)\b/i,
    "WC-DISPATCH: Package task detected → invoke wc-version-check skill. Verify latest version via WebSearch before installing."],
  [/\b(bug|error|broken|failing|crash|fix|debug)\b/i,
    "WC-DISPATCH: Bug/debug task detected → debug systematically: reproduce, hypothesize, instrument, verify, fix, re-verify."],
  [/\b(deploy|ship|production|release|publish)\b/i,
    "WC-DISPATCH: Deployment task detected → run build, verify no errors/warnings, check environment variables before deploying."],
  [/\b(review|pr|pull request|code review)\b/i,
    "WC-DISPATCH: Review task detected → check correctness, edge cases, security, performance, readability."],
  [/\b(responsive|mobile|tablet|breakpoint|viewport)\b/i,
    "WC-DISPATCH: Responsive task detected → test at 375px, 768px, 1440px viewports. Mobile-first approach."],
  [/\b(i18n|translat\w*|locale|internationali[sz]\w*)\b/i,
    "WC-DISPATCH: i18n task detected → verify all required locale files exist and contain new keys."],
  [/\b(accessib\w*|a11y|wcag|screen.?reader|aria|focus)\b/i,
    "WC-DISPATCH: Accessibility task detected → verify semantic HTML, ARIA, keyboard nav, contrast AA, prefers-reduced-motion."],
  [/\b(plan|spec|architect|rfc)\b/i,
    "WC-DISPATCH: Planning task detected → write structured plan: goals, constraints, approach, risks, steps."],
];

handleStdin((data) => {
  const prompt = data.prompt || "";
  const hints = [];

  for (const [pattern, hint] of DISPATCH_RULES) {
    if (pattern.test(prompt)) {
      hints.push(hint);
    }
  }

  if (hints.length > 0) {
    return injectContext("UserPromptSubmit", hints.join("\n"));
  }
  return emptyResponse();
});
