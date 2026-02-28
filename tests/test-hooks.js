#!/usr/bin/env node
/**
 * Comprehensive test suite for WhytCard AI Plugin.
 * Tests hooks, shared module, platform detection, JSON configs, and rules.
 *
 * Run: node tests/test-hooks.js
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const HOOKS_DIR = path.join(__dirname, "..", "hooks");
const ROOT = path.join(__dirname, "..");
let passed = 0;
let failed = 0;
let section = "";

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected "${expected}", got "${actual}"`);
}

function runHook(hookFile, stdinData) {
  const hookPath = path.join(HOOKS_DIR, hookFile);
  const input = typeof stdinData === "string" ? stdinData : JSON.stringify(stdinData);
  const result = execFileSync("node", [hookPath], {
    input,
    encoding: "utf8",
    timeout: 10000,
  });
  return JSON.parse(result.trim() || "{}");
}

function runSessionStart() {
  const hookPath = path.join(HOOKS_DIR, "wc-session-start.js");
  const result = execFileSync("node", [hookPath], { encoding: "utf8", timeout: 10000 });
  return JSON.parse(result.trim());
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 1: Shared utility module (hooks/lib/output.js)
// ═══════════════════════════════════════════════════════════════════════

console.log("\n hooks/lib/output.js — Shared utilities");

const lib = require("../hooks/lib/output");

test("detectPlatform returns string", () => {
  const p = lib.detectPlatform();
  assert(typeof p === "string", "detectPlatform should return string");
  assert(["claude-code", "cursor", "unknown"].includes(p), `unexpected platform: ${p}`);
});

test("injectContext returns valid JSON with hookSpecificOutput", () => {
  const result = JSON.parse(lib.injectContext("PreToolUse", "test"));
  assert(result.hookSpecificOutput, "missing hookSpecificOutput");
  assertEqual(result.hookSpecificOutput.hookEventName, "PreToolUse", "wrong hookEventName");
  assertEqual(result.hookSpecificOutput.additionalContext, "test", "wrong additionalContext");
});

test("emptyResponse returns {}", () => {
  assertEqual(lib.emptyResponse(), "{}", "emptyResponse should be {}");
});

test("denyAction returns correct structure", () => {
  const result = JSON.parse(lib.denyAction("Stop", "not verified"));
  assert(result.hookSpecificOutput, "missing hookSpecificOutput");
  assertEqual(result.hookSpecificOutput.permissionDecision, "deny", "wrong decision");
  assertEqual(result.hookSpecificOutput.permissionDecisionReason, "not verified", "wrong reason");
});

test("allowAction with reason returns correct structure", () => {
  const result = JSON.parse(lib.allowAction("Stop", "all good"));
  assertEqual(result.hookSpecificOutput.permissionDecision, "allow", "wrong decision");
});

test("allowAction without reason returns {}", () => {
  assertEqual(lib.allowAction("Stop"), "{}", "no-reason allowAction should be {}");
});

test("isVisualFile detects all visual extensions", () => {
  for (const ext of [".tsx", ".jsx", ".vue", ".svelte", ".astro", ".css", ".scss", ".sass", ".less", ".module.css", ".module.scss", ".html"]) {
    assert(lib.isVisualFile(`test${ext}`), `should detect ${ext}`);
  }
});

test("isVisualFile rejects non-visual extensions", () => {
  for (const ext of [".ts", ".js", ".json", ".md", ".py", ".go", ".rs", ".toml"]) {
    assert(!lib.isVisualFile(`test${ext}`), `should reject ${ext}`);
  }
});

test("loadConfig returns defaults when no config file", () => {
  const config = lib.loadConfig("/nonexistent/path");
  assert(config.visualVerification === true, "default visualVerification should be true");
  assert(config.versionCheck === true, "default versionCheck should be true");
  assert(config.researchFirst === true, "default researchFirst should be true");
  assert(Array.isArray(config.viewports), "viewports should be array");
});

test("getPluginRoot returns a valid path", () => {
  const root = lib.getPluginRoot();
  assert(typeof root === "string", "getPluginRoot should return string");
  assert(root.length > 0, "getPluginRoot should not be empty");
});

test("handleStdin is a function", () => {
  assert(typeof lib.handleStdin === "function", "handleStdin should be a function");
});

test("VISUAL_EXTENSIONS has all expected extensions", () => {
  assert(lib.VISUAL_EXTENSIONS.length >= 11, `expected ≥11 extensions, got ${lib.VISUAL_EXTENSIONS.length}`);
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 2: wc-session-start.js
// ═══════════════════════════════════════════════════════════════════════

console.log("\n wc-session-start.js");

test("outputs hookSpecificOutput with SessionStart event", () => {
  const out = runSessionStart();
  assert(out.hookSpecificOutput, "missing hookSpecificOutput");
  assertEqual(out.hookSpecificOutput.hookEventName, "SessionStart", "wrong hookEventName");
});

test("includes additionalContext with constitution", () => {
  const out = runSessionStart();
  assert(out.hookSpecificOutput.additionalContext, "missing additionalContext");
  assert(out.hookSpecificOutput.additionalContext.includes("WHYTCARD-CONSTITUTION"), "missing tag");
});

test("does NOT include top-level additional_context (deprecated)", () => {
  const out = runSessionStart();
  assert(!out.additional_context, "top-level additional_context should not exist");
});

test("injects only core principles, not dispatch table", () => {
  const ctx = runSessionStart().hookSpecificOutput.additionalContext;
  assert(ctx.includes("Never suppose"), "missing core principle");
  assert(!ctx.includes("Plugin Dispatch Table"), "dispatch table leaked into session start");
});

test("includes anti-hallucination protocol", () => {
  const ctx = runSessionStart().hookSpecificOutput.additionalContext;
  assert(ctx.includes("Anti-hallucination"), "missing anti-hallucination");
});

test("includes project config in context", () => {
  const ctx = runSessionStart().hookSpecificOutput.additionalContext;
  assert(ctx.includes("Project config:"), "missing project config");
  assert(ctx.includes("viewports"), "missing viewports in config");
});

test("constitution is platform-agnostic (no Context7)", () => {
  const ctx = runSessionStart().hookSpecificOutput.additionalContext;
  assert(!ctx.includes("Context7"), "Context7 should not appear in core principles");
});

test("constitution is platform-agnostic (no Playwright)", () => {
  const ctx = runSessionStart().hookSpecificOutput.additionalContext;
  assert(!ctx.includes("Playwright"), "Playwright should not appear in core principles");
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 3: wc-pre-edit-gate.js
// ═══════════════════════════════════════════════════════════════════════

console.log("\n wc-pre-edit-gate.js");

const visualExtensions = [".tsx", ".jsx", ".css", ".scss", ".vue", ".svelte", ".astro", ".html", ".module.css", ".sass", ".less", ".module.scss"];

for (const ext of visualExtensions) {
  test(`${ext} file → visual reminder`, () => {
    const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: `test${ext}` } });
    assert(out.hookSpecificOutput, `missing hookSpecificOutput for ${ext}`);
    assert(out.hookSpecificOutput.additionalContext.includes("WC-VISUAL"), `missing WC-VISUAL for ${ext}`);
  });
}

const nonVisualExtensions = [".ts", ".js", ".json", ".py", ".go", ".rs", ".md"];

for (const ext of nonVisualExtensions) {
  test(`${ext} file → no reminder`, () => {
    const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: `test${ext}` } });
    assert(!out.hookSpecificOutput, `${ext} should not trigger reminder`);
  });
}

test("package.json → version reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "package.json" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-VERSIONS"), "missing version reminder");
});

test("Write tool → research reminder", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Write", tool_input: { file_path: "utils.ts" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-RESEARCH"), "missing research reminder");
});

test("Write + TSX → visual + research reminders", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Write", tool_input: { file_path: "Modal.tsx" } });
  const ctx = out.hookSpecificOutput.additionalContext;
  assert(ctx.includes("WC-VISUAL"), "missing WC-VISUAL");
  assert(ctx.includes("WC-RESEARCH"), "missing WC-RESEARCH");
});

test("empty stdin → empty object", () => {
  const hookPath = path.join(HOOKS_DIR, "wc-pre-edit-gate.js");
  const result = execFileSync("node", [hookPath], { input: "", encoding: "utf8", timeout: 10000 });
  const out = JSON.parse(result.trim() || "{}");
  assert(!out.hookSpecificOutput, "empty input should produce empty object");
});

test("invalid JSON → empty object", () => {
  const hookPath = path.join(HOOKS_DIR, "wc-pre-edit-gate.js");
  const result = execFileSync("node", [hookPath], { input: "not json", encoding: "utf8", timeout: 10000 });
  const out = JSON.parse(result.trim() || "{}");
  assert(!out.hookSpecificOutput, "invalid JSON should produce empty object");
});

test("does NOT use deprecated systemMessage field", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "x.tsx" } });
  assert(!out.systemMessage, "should not use deprecated systemMessage");
});

test("uses hookSpecificOutput.additionalContext (not top-level)", () => {
  const out = runHook("wc-pre-edit-gate.js", { tool_name: "Edit", tool_input: { file_path: "x.tsx" } });
  assert(!out.additionalContext, "should not have top-level additionalContext");
  assert(out.hookSpecificOutput.additionalContext, "should have nested additionalContext");
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 4: wc-post-edit-verify.js
// ═══════════════════════════════════════════════════════════════════════

console.log("\n wc-post-edit-verify.js");

test("TSX file → post-edit visual reminder", () => {
  const out = runHook("wc-post-edit-verify.js", { tool_name: "Edit", tool_input: { file_path: "Button.tsx" } });
  assert(out.hookSpecificOutput, "missing hookSpecificOutput");
  assertEqual(out.hookSpecificOutput.hookEventName, "PostToolUse", "wrong hookEventName");
  assert(out.hookSpecificOutput.additionalContext.includes("WC-POST-EDIT"), "missing WC-POST-EDIT");
});

test("CSS file → post-edit visual reminder", () => {
  const out = runHook("wc-post-edit-verify.js", { tool_name: "Edit", tool_input: { file_path: "style.css" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-POST-EDIT"), "missing WC-POST-EDIT");
});

test("Vue file → post-edit visual reminder", () => {
  const out = runHook("wc-post-edit-verify.js", { tool_name: "Edit", tool_input: { file_path: "App.vue" } });
  assert(out.hookSpecificOutput.additionalContext.includes("WC-POST-EDIT"), "missing WC-POST-EDIT for Vue");
});

test("TypeScript file → no reminder", () => {
  const out = runHook("wc-post-edit-verify.js", { tool_name: "Edit", tool_input: { file_path: "utils.ts" } });
  assert(!out.hookSpecificOutput, "non-visual file should not trigger");
});

test("empty input → empty object", () => {
  const hookPath = path.join(HOOKS_DIR, "wc-post-edit-verify.js");
  const result = execFileSync("node", [hookPath], { input: "", encoding: "utf8", timeout: 10000 });
  assertEqual(result.trim(), "{}", "empty input → {}");
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 5: wc-prompt-dispatch.js
// ═══════════════════════════════════════════════════════════════════════

console.log("\n wc-prompt-dispatch.js");

const dispatchCases = [
  ["Fix the component layout", "UI task"],
  ["There is a bug in login", "Bug/debug"],
  ["Install react-query", "Package task"],
  ["What is the best ORM for Node.js?", "Research task"],
  ["Deploy to production", "Deployment task"],
  ["Review this PR", "Review task"],
  ["Make it responsive for mobile", "Responsive task"],
  ["Add translations for settings", "i18n task"],
  ["Check accessibility of the form", "Accessibility task"],
  ["Write the architecture spec", "Planning task"],
];

for (const [prompt, expectedFragment] of dispatchCases) {
  test(`"${prompt.substring(0, 40)}..." → ${expectedFragment}`, () => {
    const out = runHook("wc-prompt-dispatch.js", { prompt });
    assert(out.hookSpecificOutput, `missing hookSpecificOutput for: ${prompt}`);
    assert(out.hookSpecificOutput.additionalContext.includes(expectedFragment), `missing "${expectedFragment}"`);
  });
}

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

test("empty prompt → empty object", () => {
  const out = runHook("wc-prompt-dispatch.js", { prompt: "" });
  assert(!out.hookSpecificOutput, "empty prompt should produce empty object");
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 6: JSON config validation
// ═══════════════════════════════════════════════════════════════════════

console.log("\n JSON config files");

const jsonFiles = [
  ".claude-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  "hooks/hooks.json",
  ".cursor/hooks.json",
];

for (const file of jsonFiles) {
  test(`${file} is valid JSON`, () => {
    const content = fs.readFileSync(path.join(ROOT, file), "utf8");
    JSON.parse(content); // throws if invalid
  });
}

test("Claude Code manifest has required fields", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin/plugin.json"), "utf8"));
  assert(manifest.name, "missing name");
  assert(manifest.version, "missing version");
  assert(manifest.description, "missing description");
});

test("Cursor manifest has required fields", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, ".cursor-plugin/plugin.json"), "utf8"));
  assert(manifest.name, "missing name");
  assert(manifest.displayName, "missing displayName (Cursor requires this)");
  assert(manifest.version, "missing version");
  assert(manifest.description, "missing description");
  assert(manifest.keywords, "missing keywords (Cursor requires this)");
});

test("Both manifests have same version", () => {
  const claude = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin/plugin.json"), "utf8"));
  const cursor = JSON.parse(fs.readFileSync(path.join(ROOT, ".cursor-plugin/plugin.json"), "utf8"));
  assertEqual(claude.version, cursor.version, "version mismatch between manifests");
});

test("Claude Code hooks.json has all required events", () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, "hooks/hooks.json"), "utf8"));
  const events = Object.keys(hooks.hooks);
  for (const evt of ["SessionStart", "PreToolUse", "PostToolUse", "UserPromptSubmit", "Stop"]) {
    assert(events.includes(evt), `missing event: ${evt}`);
  }
});

test("Cursor hooks.json has version field", () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, ".cursor/hooks.json"), "utf8"));
  assertEqual(hooks.version, 1, "Cursor hooks.json should have version: 1");
});

test("Cursor hooks.json uses camelCase event names", () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, ".cursor/hooks.json"), "utf8"));
  const events = Object.keys(hooks.hooks);
  for (const evt of events) {
    assert(evt[0] === evt[0].toLowerCase(), `${evt} should be camelCase`);
  }
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 7: Rules (.mdc) validation
// ═══════════════════════════════════════════════════════════════════════

console.log("\n Rules (.mdc files)");

const ruleFiles = [
  "constitution.mdc",
  "visual-verify.mdc",
  "research-first.mdc",
  "version-check.mdc",
  "brainstorm.mdc",
  "execution-tracking.mdc",
];

for (const file of ruleFiles) {
  test(`rules/${file} exists and has YAML frontmatter`, () => {
    const content = fs.readFileSync(path.join(ROOT, "rules", file), "utf8");
    assert(content.startsWith("---"), `${file} should start with YAML frontmatter`);
    const endIndex = content.indexOf("---", 3);
    assert(endIndex > 3, `${file} should have closing --- for frontmatter`);
  });
}

test("constitution.mdc has alwaysApply: true", () => {
  const content = fs.readFileSync(path.join(ROOT, "rules/constitution.mdc"), "utf8");
  assert(content.includes("alwaysApply: true"), "constitution rule should always apply");
});

test("visual-verify.mdc has glob patterns for visual files", () => {
  const content = fs.readFileSync(path.join(ROOT, "rules/visual-verify.mdc"), "utf8");
  assert(content.includes("**/*.tsx"), "should include tsx glob");
  assert(content.includes("**/*.css"), "should include css glob");
  assert(content.includes("**/*.vue"), "should include vue glob");
});

test("version-check.mdc has glob patterns for dependency files", () => {
  const content = fs.readFileSync(path.join(ROOT, "rules/version-check.mdc"), "utf8");
  assert(content.includes("**/package.json"), "should include package.json glob");
  assert(content.includes("**/requirements.txt"), "should include requirements.txt glob");
  assert(content.includes("**/Cargo.toml"), "should include Cargo.toml glob");
});

test("research-first.mdc has description (agent-decided)", () => {
  const content = fs.readFileSync(path.join(ROOT, "rules/research-first.mdc"), "utf8");
  assert(content.includes("description:"), "should have description for agent-decided activation");
  assert(!content.includes("alwaysApply"), "research rule should NOT always apply");
  assert(!content.includes("globs"), "research rule should NOT have globs (agent-decided)");
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 8: Constitution content checks
// ═══════════════════════════════════════════════════════════════════════

console.log("\n Constitution content quality");

test("constitution.md has CORE_PRINCIPLES_END marker", () => {
  const content = fs.readFileSync(path.join(ROOT, "constitution.md"), "utf8");
  assert(content.includes("CORE_PRINCIPLES_END"), "missing CORE_PRINCIPLES_END marker");
});

test("constitution.md has all 7 principles", () => {
  const content = fs.readFileSync(path.join(ROOT, "constitution.md"), "utf8");
  for (let i = 1; i <= 7; i++) {
    assert(content.includes(`## ${i}.`), `missing principle ${i}`);
  }
});

test("constitution.md has dispatch table with fallbacks", () => {
  const content = fs.readFileSync(path.join(ROOT, "constitution.md"), "utf8");
  assert(content.includes("Fallback"), "dispatch table should have Fallback column");
});

test("no hardcoded year in constitution", () => {
  const content = fs.readFileSync(path.join(ROOT, "constitution.md"), "utf8");
  assert(!content.includes("2025"), "should not have hardcoded 2025");
  assert(!content.includes("2026"), "should not have hardcoded 2026");
});

test("no hardcoded year in skills", () => {
  const skillsDir = path.join(ROOT, "skills");
  const dirs = fs.readdirSync(skillsDir);
  for (const dir of dirs) {
    const skillPath = path.join(skillsDir, dir, "SKILL.md");
    if (fs.existsSync(skillPath)) {
      const content = fs.readFileSync(skillPath, "utf8");
      assert(!content.includes("2025"), `${dir}/SKILL.md has hardcoded 2025`);
      assert(!content.includes("2026"), `${dir}/SKILL.md has hardcoded 2026`);
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 9: File structure validation
// ═══════════════════════════════════════════════════════════════════════

console.log("\n File structure");

const requiredFiles = [
  ".claude-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  ".cursor/hooks.json",
  "hooks/hooks.json",
  "hooks/lib/output.js",
  "hooks/wc-session-start.js",
  "hooks/wc-pre-edit-gate.js",
  "hooks/wc-post-edit-verify.js",
  "hooks/wc-prompt-dispatch.js",
  "constitution.md",
  "rules/constitution.mdc",
  "rules/visual-verify.mdc",
  "rules/research-first.mdc",
  "rules/version-check.mdc",
  "rules/brainstorm.mdc",
  "rules/execution-tracking.mdc",
  "skills/wc-brainstorm/SKILL.md",
  "skills/wc-plan/SKILL.md",
  "skills/wc-execute/SKILL.md",
  "skills/wc-review/SKILL.md",
  "skills/wc-dispatch/SKILL.md",
  "skills/wc-visual-verify/SKILL.md",
  "skills/wc-research-first/SKILL.md",
  "skills/wc-version-check/SKILL.md",
  "commands/brainstorm.md",
  "commands/plan.md",
  "commands/execute.md",
  "commands/review.md",
  "commands/quality-gate.md",
  "commands/research.md",
  "commands/verify-visual.md",
  "agents/wc-quality-gate/AGENT.md",
  "README.md",
];

for (const file of requiredFiles) {
  test(`${file} exists`, () => {
    assert(fs.existsSync(path.join(ROOT, file)), `missing: ${file}`);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════════

console.log(`\n${"═".repeat(60)}`);
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(60)}\n`);
process.exit(failed > 0 ? 1 : 0);
