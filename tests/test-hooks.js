#!/usr/bin/env node
/**
 * Automated tests for WhytCard AI Plugin hooks.
 * Validates JSON output format matches Claude Code protocol spec.
 *
 * Run: node tests/test-hooks.js
 */

const { execSync } = require("child_process");
const path = require("path");

const HOOKS_DIR = path.join(__dirname, "..", "hooks");
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runHook(hookFile, stdinData) {
  const hookPath = path.join(HOOKS_DIR, hookFile);
  const input = typeof stdinData === "string" ? stdinData : JSON.stringify(stdinData);
  const result = execSync(`echo '${input.replace(/'/g, "'\\''")}' | node "${hookPath}"`, {
    encoding: "utf8",
    timeout: 10000,
  });
  return JSON.parse(result.trim() || "{}");
}

function runSessionStart() {
  const hookPath = path.join(HOOKS_DIR, "wc-session-start.js");
  const result = execSync(`node "${hookPath}"`, { encoding: "utf8", timeout: 10000 });
  return JSON.parse(result.trim());
}

// ─── wc-session-start.js ───────────────────────────────────────────────

console.log("\n wc-session-start.js");

test("outputs hookSpecificOutput with SessionStart event", () => {
  const out = runSessionStart();
  assert(out.hookSpecificOutput, "missing hookSpecificOutput");
  assert(out.hookSpecificOutput.hookEventName === "SessionStart", "wrong hookEventName");
});

test("includes additionalContext with constitution", () => {
  const out = runSessionStart();
  assert(out.hookSpecificOutput.additionalContext, "missing additionalContext");
  assert(
    out.hookSpecificOutput.additionalContext.includes("WHYTCARD-CONSTITUTION"),
    "missing WHYTCARD-CONSTITUTION tag"
  );
});

test("does NOT include top-level additional_context (deprecated)", () => {
  const out = runSessionStart();
  assert(!out.additional_context, "top-level additional_context should not exist");
});

test("injects only core principles, not dispatch table", () => {
  const out = runSessionStart();
  const ctx = out.hookSpecificOutput.additionalContext;
  assert(ctx.includes("Never suppose"), "missing core principle");
  assert(!ctx.includes("Plugin Dispatch Table"), "dispatch table should not be in session start context");
});

test("includes anti-hallucination protocol in core", () => {
  const out = runSessionStart();
  const ctx = out.hookSpecificOutput.additionalContext;
  assert(ctx.includes("Anti-hallucination"), "missing anti-hallucination protocol");
});

// ─── wc-pre-edit-gate.js ───────────────────────────────────────────────

console.log("\n wc-pre-edit-gate.js");

test("TSX file → visual reminder via additionalContext", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "x.tsx" } });
  assert(out.hookSpecificOutput, "missing hookSpecificOutput");
  assert(out.hookSpecificOutput.hookEventName === "PreToolUse", "wrong hookEventName");
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL reminder");
});

test("JSX file → visual reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "x.jsx" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL for JSX");
});

test("CSS file → visual reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "style.css" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL for CSS");
});

test("SCSS file → visual reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "theme.scss" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL for SCSS");
});

test("Vue file → visual reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "App.vue" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL for Vue");
});

test("Svelte file → visual reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "Page.svelte" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL for Svelte");
});

test("Astro file → visual reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "index.astro" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL for Astro");
});

test("HTML file → visual reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "index.html" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL for HTML");
});

test(".module.css file → visual reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "Button.module.css" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), "missing WC-VISUAL for .module.css");
});

test("TypeScript file → no reminder (empty object)", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "utils.ts" } });
  assert(!out.hookSpecificOutput, "non-visual file should not have hookSpecificOutput");
});

test("package.json → version reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "package.json" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VERSIONS"), "missing WC-VERSIONS reminder");
});

test("Write tool → research reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Write", tool_input: { file_path: "utils.ts" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-RESEARCH"), "missing WC-RESEARCH reminder");
});

test("Write + TSX → visual + research reminders", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Write", tool_input: { file_path: "Modal.tsx" } });
  const ctx = out.hookSpecificOutput.additionalContext;
  assert(ctx.includes("WC-VISUAL"), "missing WC-VISUAL");
  assert(ctx.includes("WC-RESEARCH"), "missing WC-RESEARCH");
});

test("empty stdin → empty object", () => {
  const hookPath = path.join(HOOKS_DIR, "wc-pre-edit-gate.js");
  const result = execSync(`echo '' | node "${hookPath}"`, { encoding: "utf8", timeout: 10000 });
  const out = JSON.parse(result.trim() || "{}");
  assert(!out.hookSpecificOutput, "empty input should produce empty object");
});

test("invalid JSON → empty object", () => {
  const hookPath = path.join(HOOKS_DIR, "wc-pre-edit-gate.js");
  const result = execSync(`echo 'not json' | node "${hookPath}"`, { encoding: "utf8", timeout: 10000 });
  const out = JSON.parse(result.trim() || "{}");
  assert(!out.hookSpecificOutput, "invalid JSON should produce empty object");
});

test("does NOT use deprecated systemMessage field", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "x.tsx" } });
  assert(!out.systemMessage, "should not use deprecated systemMessage field");
});

// ─── wc-post-edit-verify.js ────────────────────────────────────────────

console.log("\n wc-post-edit-verify.js");

test("TSX file → post-edit visual reminder", () => {
  const out = runHook("wc-post-edit-verify.js", { tool_name: "Edit", tool_input: { file_path: "Button.tsx" } });
  assert(out.hookSpecificOutput, "missing hookSpecificOutput");
  assert(out.hookSpecificOutput.hookEventName === "PostToolUse", "wrong hookEventName");
  assert(out.hookSpecificOutput.additionalContext.includes("WC-POST-EDIT"), "missing WC-POST-EDIT");
});

test("CSS file → post-edit visual reminder", () => {
  const out = runHook("wc-post-edit-verify.js", { tool_name: "Edit", tool_input: { file_path: "style.css" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-POST-EDIT"), "missing WC-POST-EDIT for CSS");
});

test("TypeScript file → no reminder", () => {
  const out = runHook("wc-post-edit-verify.js", { tool_name: "Edit", tool_input: { file_path: "utils.ts" } });
  assert(!out.hookSpecificOutput, "non-visual file should not have hookSpecificOutput");
});

// ─── wc-prompt-dispatch.js ─────────────────────────────────────────────

console.log("\n wc-prompt-dispatch.js");

test("UI keywords → visual dispatch", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "Fix the component layout" });
  assert(out.hookSpecificOutput, "missing hookSpecificOutput");
  assert(out.hookSpecificOutput.hookEventName === "UserPromptSubmit", "wrong hookEventName");
  assert(out.hookSpecificOutput.additionalContext.includes("UI task"), "missing UI dispatch");
});

test("bug keywords → debug dispatch", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "There is a bug in login" });
  assert(out.hookSpecificOutput.additionalContext.includes("Bug/debug"), "missing bug dispatch");
});

test("install keywords → package dispatch", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "Install react-query" });
  assert(out.hookSpecificOutput.additionalContext.includes("Package task"), "missing package dispatch");
});

test("research keywords → research dispatch", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "What is the best ORM for Node.js?" });
  assert(out.hookSpecificOutput.additionalContext.includes("Research task"), "missing research dispatch");
});

test("multiple keywords → multiple dispatches", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "Fix the bug in the login page component" });
  const ctx = out.hookSpecificOutput.additionalContext;
  assert(ctx.includes("UI task"), "missing UI dispatch");
  assert(ctx.includes("Bug/debug"), "missing bug dispatch");
});

test("no keywords → empty object", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "Hello, how are you?" });
  assert(!out.hookSpecificOutput, "no keywords should produce empty object");
});

test("a11y keywords → accessibility dispatch", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "Check the accessibility of the form" });
  assert(out.hookSpecificOutput.additionalContext.includes("Accessibility"), "missing a11y dispatch");
});

test("i18n keywords → i18n dispatch", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "Add translations for the settings page" });
  assert(out.hookSpecificOutput.additionalContext.includes("i18n"), "missing i18n dispatch");
});

// ─── Summary ───────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
