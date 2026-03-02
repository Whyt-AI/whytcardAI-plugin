#!/usr/bin/env node

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HOOKS_DIR = path.join(ROOT, "hooks");
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
  const result = execFileSync("node", [hookPath], {
    input,
    encoding: "utf8",
    timeout: 10000,
    env: { ...process.env, WHYTCARD_DISABLE_AUTO_SETUP: "1" },
  });
  return JSON.parse(result.trim() || "{}");
}

console.log("\n## hooks/lib/output.js");
const lib = require("../hooks/lib/output");

test("detectPlatform returns known value", () => {
  const p = lib.detectPlatform();
  assert(["claude-code", "cursor", "unknown"].includes(p), `unexpected ${p}`);
});

test("isVisualFile detects TSX", () => {
  assert(lib.isVisualFile("test.tsx"), "tsx should be visual");
});

test("isVisualFile rejects TS", () => {
  assert(!lib.isVisualFile("test.ts"), "ts should not be visual");
});

console.log("\n## hooks/session-init.js");

test("session-init injects SessionStart context", () => {
  const out = JSON.parse(execFileSync("node", [path.join(HOOKS_DIR, "session-init.js")], {
    encoding: "utf8",
    timeout: 10000,
    env: { ...process.env, WHYTCARD_DISABLE_AUTO_SETUP: "1" },
  }).trim());
  assert(out.hookSpecificOutput, "missing hookSpecificOutput");
  assert(out.hookSpecificOutput.hookEventName === "SessionStart", "wrong event");
  assert(out.hookSpecificOutput.additionalContext.includes("WHYTCARD-AGENTS"), "missing tag");
  assert(out.hookSpecificOutput.additionalContext.includes("AGENTS.md"), "should include AGENTS content");
  assert(out.hookSpecificOutput.additionalContext.includes("How you think (principles)"), "missing core principles section");
  assert(out.hookSpecificOutput.additionalContext.includes("<WC-ONBOARDING>"), "missing onboarding context");
});

console.log("\n## hooks/post-edit-check.js");

test("post-edit-check triggers on visual file", () => {
  const out = runHook("post-edit-check.js", { tool_input: { file_path: "App.tsx" } });
  assert(out.hookSpecificOutput, "missing hookSpecificOutput");
  assert(out.hookSpecificOutput.hookEventName === "PostToolUse", "wrong event");
  assert(out.hookSpecificOutput.additionalContext.includes("WC-POST-EDIT"), "missing marker");
});

test("post-edit-check ignores non-visual file", () => {
  const out = runHook("post-edit-check.js", { tool_input: { file_path: "server.ts" } });
  assert(!out.hookSpecificOutput, "should be empty for non-visual file");
});

console.log("\n## minimal file structure");

const required = [
  "AGENTS.md",
  "CLAUDE.md",
  ".cursor/hooks.json",
  ".claude/settings.json",
  "hooks/lib/output.js",
  "hooks/lib/whytcard-kb.js",
  "hooks/session-init.js",
  "hooks/post-edit-check.js",
  ".github/copilot-instructions.md",
  ".github/agents/whytcard-ai.agent.md",
  "setup.sh",
  "setup.ps1",
  "README.md",
];

for (const file of required) {
  test(`${file} exists`, () => {
    assert(fs.existsSync(path.join(ROOT, file)), `missing ${file}`);
  });
}

const removed = [
  "constitution.md",
  "install.js",
  "hooks/wc-session-start.js",
  "hooks/wc-pre-edit-gate.js",
  "hooks/wc-post-edit-verify.js",
  "hooks/wc-prompt-dispatch.js",
  "hooks/hooks.json",
  ".claude-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  "agents/wc-quality-gate/AGENT.md",
  "commands/setup.md",
  "rules/constitution.mdc",
  "skills/wc-setup/SKILL.md",
];

for (const file of removed) {
  test(`${file} removed`, () => {
    assert(!fs.existsSync(path.join(ROOT, file)), `${file} should not exist`);
  });
}

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
