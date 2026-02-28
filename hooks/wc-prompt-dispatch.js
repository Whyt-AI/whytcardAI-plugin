#!/usr/bin/env node
/**
 * wc-prompt-dispatch — UserPromptSubmit / beforeSubmitPrompt hook
 *
 * Analyzes the user's prompt keywords and injects dispatch hints
 * so the AI agent knows which skills/tools to invoke before starting work.
 * Works on both Claude Code and Cursor via shared output module.
 */

const fs = require("fs");
const path = require("path");
const { handleStdin, injectContext, emptyResponse, loadConfig } = require("./lib/output");
const {
  getDefaultGlobalRoot,
  resolveGlobalRoot,
  getGlobalConfigPath,
  loadGlobalKbConfig,
  hasLocalWhytcard,
  getGlobalProjectDir,
  getGlobalDocsDir,
} = require("./lib/whytcard-kb");

// Keyword → dispatch hint mapping
const DISPATCH_RULES = [
  [/\b(orchestrator|orchestrat\w+|end[\s-]?to[\s-]?end|e2e|from\s+scratch|build\s+(?:an|a)\s+(?:app|tool|system)|je\s+veux\s+un\s+outil|projet\s+complet)\b/i,
    "WC-DISPATCH: End-to-end build request detected → invoke wc-Whytcard_orchestrator. One command runs setup → brainstorm → plan → execute → review."],
  [/\b(setup|init\w*|\.whytcard)\b/i,
    "WC-DISPATCH: Setup detected → invoke wc-1_setup. Initialize .whytcard/ knowledge base in the project."],
  [/\b(ui|component|page|visual|design|layout|style|theme)\b/i,
    "WC-DISPATCH: UI task detected → visual verification required after changes (3 viewports). If installed, use wc-visual-verify; otherwise follow the visual-verify rule."],
  [/\b(research|compare|evaluate|which|best|alternative|recommend|pros.?cons|trade.?off)\b/i,
    "WC-DISPATCH: Research task detected → dual-angle research required (good + bad). If installed, use wc-research-first."],
  [/\b(install|add|package|dependency|npm|pnpm|bun|pip)\b/i,
    "WC-DISPATCH: Package task detected → verify latest versions via WebSearch before installing. If installed, use wc-version-check."],
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
    "WC-DISPATCH: Planning task detected → invoke wc-3_plan. Read brainstorm from .whytcard/, verify decisions, architect A-Z."],
  [/\b(brainstorm\w*|ideate?\b|explor\w+\s+(?:idea|option|approach|solution)|think\s+through|weigh\s+(?:option|approach)|let'?s\s+think|on\s+(?:r[eé]fl[eé]chit?|pense)|what\s+(?:if|about)|should\s+(?:we|i)\s+(?:use|go\s+with|pick|choose))\b/i,
    "WC-DISPATCH: Brainstorming detected → invoke wc-2_brainstorm. Challenge assumptions, research live, output to .whytcard/brainstorms/."],
  [/\b(build|execut\w+|implement|construct|cr[eé]\w+\s+(?:le|the)\s+proje[ct]|go\s+build|start\s+(?:building|coding|implementing))\b/i,
    "WC-DISPATCH: Execution detected → invoke wc-4_execute. Read plan from .whytcard/plans/, build increment by increment, log to .whytcard/logs/."],
  [/\b(review|audit|quality|ship|ready\s+(?:to|for)\s+(?:ship|prod|deploy|launch)|final\s+check)\b/i,
    "WC-DISPATCH: Review task detected → invoke wc-5_review. 8-pass quality gate, output to .whytcard/reviews/."],
];

handleStdin((data) => {
  const prompt = data.prompt || "";
  const hints = [];

  // ─── Auto-onboarding (no slash commands needed) ──────────────────────
  // Keep this lightweight: do not write files here. SessionStart hook does the bootstrap.
  if (process.env.WHYTCARD_DISABLE_AUTO_SETUP !== "1") {
    const cwd = data.cwd || process.cwd();
    const projectRoot = (() => {
      let dir = path.resolve(cwd);
      for (let i = 0; i < 12; i++) {
        if (fs.existsSync(path.join(dir, ".git"))) return dir;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
      return path.resolve(cwd);
    })();

    const projectCfg = loadConfig(projectRoot);
    if (projectCfg.autoSetup !== false) {
      const resolvedRoot =
        typeof projectCfg.globalRoot === "string" && projectCfg.globalRoot.trim()
          ? projectCfg.globalRoot.trim()
          : resolveGlobalRoot();
      const globalCfg = loadGlobalKbConfig(resolvedRoot);
      const cfgPath = getGlobalConfigPath(resolvedRoot);
      const defaultRoot = getDefaultGlobalRoot();
      const globalProjectDir = getGlobalProjectDir(resolvedRoot, projectRoot);
      const globalDocsDir = getGlobalDocsDir(globalProjectDir);

      const kbMissing = !hasLocalWhytcard(projectRoot);
      const needsConfirm = !globalCfg || globalCfg.confirmed !== true;

      if (kbMissing || needsConfirm) {
        hints.push(
          [
            "WC-ONBOARDING: WhytCard knowledge base should be auto-initialized (no /wc-* required).",
            kbMissing ? `- This project has no .whytcard yet at: ${path.join(projectRoot, ".whytcard")}` : "- .whytcard exists",
            !globalCfg
              ? `- No global config yet. Default recommendation: GLOBAL at ${defaultRoot}`
              : `- Global config found at ${cfgPath} (confirmed=${globalCfg.confirmed === true})`,
            "Ask the user ONCE to confirm:",
            "1) kbMode: GLOBAL (recommended) or LOCAL",
            `2) If GLOBAL: globalRoot location (default: ${resolvedRoot || defaultRoot})`,
            "Then persist config (kbMode, globalRoot, confirmed:true) and ensure .whytcard points to the right location.",
            `GLOBAL target for this repo: ${globalDocsDir}`,
          ].join("\n")
        );
      }
    }
  }

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
