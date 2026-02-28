#!/usr/bin/env node
/**
 * WhytCard AI Plugin — Global Installer for Cursor
 *
 * Installs rules, skills, hooks, and core files into ~/.cursor/
 * so the plugin applies across all projects.
 *
 * Usage:
 *   node install.js              Interactive install
 *   node install.js --uninstall  Interactive uninstall
 *   node install.js --force      Install without prompts
 *   node install.js --advanced   Also install optional + legacy skills
 *   node install.js --status     Show what's installed
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

// ─── Constants ──────────────────────────────────────────────────────────

const PLUGIN_ROOT = __dirname;
const CURSOR_HOME = path.join(os.homedir(), ".cursor");
const PLUGIN_ID = "whytcardAI-plugin";

const TARGETS = {
  rules: path.join(CURSOR_HOME, "rules"),
  skills: path.join(CURSOR_HOME, "skills-cursor"),
  plugin: path.join(CURSOR_HOME, "plugins", PLUGIN_ID),
  hooksFile: path.join(CURSOR_HOME, "hooks.json"),
};

const RULES = [
  { src: "rules/constitution.mdc", dst: "wc-constitution.mdc" },
  { src: "rules/visual-verify.mdc", dst: "wc-visual-verify.mdc" },
  { src: "rules/research-first.mdc", dst: "wc-research-first.mdc" },
  { src: "rules/version-check.mdc", dst: "wc-version-check.mdc" },
  { src: "rules/brainstorm.mdc", dst: "wc-brainstorm.mdc" },
  { src: "rules/execution-tracking.mdc", dst: "wc-execution-tracking.mdc" },
];

// Skills installed by default (minimal, ordered pipeline + orchestrator)
const CORE_SKILLS = [
  { src: "skills/wc-1_setup/SKILL.md", dst: "wc-1_setup/SKILL.md" },
  { src: "skills/wc-2_brainstorm/SKILL.md", dst: "wc-2_brainstorm/SKILL.md" },
  { src: "skills/wc-3_plan/SKILL.md", dst: "wc-3_plan/SKILL.md" },
  { src: "skills/wc-4_execute/SKILL.md", dst: "wc-4_execute/SKILL.md" },
  { src: "skills/wc-5_review/SKILL.md", dst: "wc-5_review/SKILL.md" },
  { src: "skills/wc-Whytcard_orchestrator/SKILL.md", dst: "wc-Whytcard_orchestrator/SKILL.md" },
];

// Optional extra skills (installs more commands; opt-in via --advanced)
const ADVANCED_SKILLS = [
  { src: "skills/wc-dispatch/SKILL.md", dst: "wc-dispatch/SKILL.md" },
  { src: "skills/wc-visual-verify/SKILL.md", dst: "wc-visual-verify/SKILL.md" },
  { src: "skills/wc-research-first/SKILL.md", dst: "wc-research-first/SKILL.md" },
  { src: "skills/wc-version-check/SKILL.md", dst: "wc-version-check/SKILL.md" },
];

// Legacy pipeline skills (kept for backward compatibility; opt-in via --advanced)
const LEGACY_SKILLS = [
  { src: "skills/wc-setup/SKILL.md", dst: "wc-setup/SKILL.md" },
  { src: "skills/wc-brainstorm/SKILL.md", dst: "wc-brainstorm/SKILL.md" },
  { src: "skills/wc-plan/SKILL.md", dst: "wc-plan/SKILL.md" },
  { src: "skills/wc-execute/SKILL.md", dst: "wc-execute/SKILL.md" },
  { src: "skills/wc-review/SKILL.md", dst: "wc-review/SKILL.md" },
];

const ALL_SKILLS = [...CORE_SKILLS, ...ADVANCED_SKILLS, ...LEGACY_SKILLS];

const HOOK_FILES = [
  "constitution.md",
  ".cursor-plugin/plugin.json",
  "hooks/lib/output.js",
  "hooks/lib/whytcard-kb.js",
  "hooks/wc-session-start.js",
  "hooks/wc-prompt-dispatch.js",
  "hooks/wc-pre-edit-gate.js",
  "hooks/wc-post-edit-verify.js",
];

const HOOK_MARKER = "whytcardAI-plugin";

// ─── ANSI colors ────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const log = (msg) => console.log(msg);
const ok = (msg) => log(`  ${c.green}+${c.reset} ${msg}`);
const skip = (msg) => log(`  ${c.dim}-${c.reset} ${c.dim}${msg}${c.reset}`);
const warn = (msg) => log(`  ${c.yellow}!${c.reset} ${msg}`);
const err = (msg) => log(`  ${c.red}x${c.reset} ${msg}`);
const header = (msg) => log(`\n${c.bold}${c.cyan}${msg}${c.reset}`);

// ─── Utilities ──────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

function removeDirIfEmpty(dir) {
  if (fs.existsSync(dir)) {
    try {
      const entries = fs.readdirSync(dir);
      if (entries.length === 0) {
        fs.rmdirSync(dir);
        return true;
      }
    } catch { /* ignore */ }
  }
  return false;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function buildHooksConfig() {
  const hooksDir = path.join(TARGETS.plugin, "hooks");
  const quote = (file) => `node "${path.join(hooksDir, file)}"`;
  return {
    sessionStart: [
      { command: quote("wc-session-start.js"), _source: HOOK_MARKER },
    ],
    beforeSubmitPrompt: [
      { command: quote("wc-prompt-dispatch.js"), _source: HOOK_MARKER },
    ],
    preToolUse: [
      { command: quote("wc-pre-edit-gate.js"), matcher: "Edit|Write|NotebookEdit", _source: HOOK_MARKER },
    ],
    postToolUse: [
      { command: quote("wc-post-edit-verify.js"), matcher: "Edit|Write|NotebookEdit", _source: HOOK_MARKER },
    ],
  };
}

// ─── Status ─────────────────────────────────────────────────────────────

function getStatus() {
  const status = { rules: [], skills: [], hooks: false, plugin: false };

  for (const rule of RULES) {
    const dst = path.join(TARGETS.rules, rule.dst);
    if (fs.existsSync(dst)) status.rules.push(rule.dst);
  }

  for (const skill of ALL_SKILLS) {
    const dst = path.join(TARGETS.skills, skill.dst);
    if (fs.existsSync(dst)) status.skills.push(skill.dst);
  }

  if (fs.existsSync(TARGETS.hooksFile)) {
    try {
      const content = fs.readFileSync(TARGETS.hooksFile, "utf8");
      status.hooks = content.includes(HOOK_MARKER);
    } catch { /* ignore */ }
  }

  status.plugin = fs.existsSync(path.join(TARGETS.plugin, "constitution.md"));
  return status;
}

function showStatus() {
  const status = getStatus();
  const total = RULES.length + ALL_SKILLS.length + 2; // +2 for hooks + plugin
  const installed =
    status.rules.length + status.skills.length + (status.hooks ? 1 : 0) + (status.plugin ? 1 : 0);

  header("WhytCard AI Plugin — Installation Status");
  log(`  Cursor home: ${c.dim}${CURSOR_HOME}${c.reset}\n`);

  log(`  ${c.bold}Rules${c.reset} (${status.rules.length}/${RULES.length}):`);
  for (const rule of RULES) {
    const installed = status.rules.includes(rule.dst);
    installed ? ok(rule.dst) : skip(`${rule.dst} (not installed)`);
  }

  const countInstalled = (list) => list.filter((s) => status.skills.includes(s.dst)).length;

  log(`\n  ${c.bold}Skills (core)${c.reset} (${countInstalled(CORE_SKILLS)}/${CORE_SKILLS.length}):`);
  for (const skill of CORE_SKILLS) {
    const installed = status.skills.includes(skill.dst);
    installed ? ok(skill.dst) : skip(`${skill.dst} (not installed)`);
  }

  log(`\n  ${c.bold}Skills (optional: --advanced)${c.reset} (${countInstalled(ADVANCED_SKILLS)}/${ADVANCED_SKILLS.length}):`);
  for (const skill of ADVANCED_SKILLS) {
    const installed = status.skills.includes(skill.dst);
    installed ? ok(skill.dst) : skip(`${skill.dst} (not installed)`);
  }

  log(`\n  ${c.bold}Skills (legacy: --advanced)${c.reset} (${countInstalled(LEGACY_SKILLS)}/${LEGACY_SKILLS.length}):`);
  for (const skill of LEGACY_SKILLS) {
    const installed = status.skills.includes(skill.dst);
    installed ? ok(skill.dst) : skip(`${skill.dst} (not installed)`);
  }

  log(`\n  ${c.bold}Hooks${c.reset}:`);
  status.hooks ? ok("Global hooks configured") : skip("Not configured");

  log(`\n  ${c.bold}Plugin core${c.reset}:`);
  status.plugin ? ok("Installed") : skip("Not installed");

  const pct = Math.round((installed / total) * 100);
  log(`\n  ${pct === 100 ? c.green : c.yellow}${installed}/${total} components installed (${pct}%)${c.reset}\n`);
}

// ─── Install ────────────────────────────────────────────────────────────

function installRules() {
  ensureDir(TARGETS.rules);
  let count = 0;
  for (const rule of RULES) {
    const src = path.join(PLUGIN_ROOT, rule.src);
    const dst = path.join(TARGETS.rules, rule.dst);
    if (!fs.existsSync(src)) {
      err(`Source not found: ${rule.src}`);
      continue;
    }
    copyFile(src, dst);
    ok(`Rule: ${rule.dst}`);
    count++;
  }
  return count;
}

function installSkills(skillsToInstall) {
  ensureDir(TARGETS.skills);
  let count = 0;
  for (const skill of skillsToInstall) {
    const src = path.join(PLUGIN_ROOT, skill.src);
    const dst = path.join(TARGETS.skills, skill.dst);
    if (!fs.existsSync(src)) {
      err(`Source not found: ${skill.src}`);
      continue;
    }
    copyFile(src, dst);
    ok(`Skill: ${skill.dst}`);
    count++;
  }
  return count;
}

function removeSkills(skillsToRemove) {
  let removed = 0;
  for (const skill of skillsToRemove) {
    const dst = path.join(TARGETS.skills, skill.dst);
    if (removeFile(dst)) {
      ok(`Removed skill: ${skill.dst}`);
      removed++;
    }
    removeDirIfEmpty(path.dirname(dst));
  }
  return removed;
}

function installPluginFiles() {
  ensureDir(TARGETS.plugin);
  let count = 0;
  for (const file of HOOK_FILES) {
    const src = path.join(PLUGIN_ROOT, file);
    const dst = path.join(TARGETS.plugin, file);
    if (!fs.existsSync(src)) {
      err(`Source not found: ${file}`);
      continue;
    }
    copyFile(src, dst);
    count++;
  }
  ok(`Plugin core: ${count} files`);
  return count;
}

function installHooks() {
  const ourHooks = buildHooksConfig();
  let existing = { version: 1, hooks: {} };

  if (fs.existsSync(TARGETS.hooksFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(TARGETS.hooksFile, "utf8"));
      if (!existing.hooks) existing.hooks = {};
    } catch {
      warn("Existing hooks.json is invalid, will be replaced");
      existing = { version: 1, hooks: {} };
    }
  }

  for (const [event, newEntries] of Object.entries(ourHooks)) {
    if (!existing.hooks[event]) {
      existing.hooks[event] = [];
    }
    // Remove old WhytCard entries
    existing.hooks[event] = existing.hooks[event].filter(
      (h) => !h._source || h._source !== HOOK_MARKER
    );
    // Also remove by command path match (handles entries without _source)
    existing.hooks[event] = existing.hooks[event].filter(
      (h) => !(h.command && h.command.includes(HOOK_MARKER))
    );
    existing.hooks[event].push(...newEntries);
  }

  fs.writeFileSync(TARGETS.hooksFile, JSON.stringify(existing, null, 2) + "\n", "utf8");
  ok("Hooks: merged into global hooks.json");
}

async function install(force, advanced) {
  header("WhytCard AI Plugin — Global Installation");
  log("");
  log(`  This will install the plugin globally into:`);
  log(`  ${c.dim}${CURSOR_HOME}${c.reset}`);
  log("");
  log(`  Components:`);
  log(`    ${c.cyan}${RULES.length}${c.reset} rules   -> ${c.dim}${TARGETS.rules}${c.reset}`);
  const skillsToInstall = advanced ? [...CORE_SKILLS, ...ADVANCED_SKILLS, ...LEGACY_SKILLS] : CORE_SKILLS;
  log(`    ${c.cyan}${skillsToInstall.length}${c.reset} skills  -> ${c.dim}${TARGETS.skills}${c.reset}`);
  log(`    ${c.cyan}${HOOK_FILES.length}${c.reset} files   -> ${c.dim}${TARGETS.plugin}${c.reset}`);
  log(`    ${c.cyan}4${c.reset} hooks   -> ${c.dim}${TARGETS.hooksFile}${c.reset}`);
  log("");
  log(`  Mode: ${c.bold}${advanced ? "advanced" : "minimal"}${c.reset}`);
  log("");

  // Check for existing installation
  const status = getStatus();
  const hasExisting = status.rules.length > 0 || status.skills.length > 0 || status.hooks || status.plugin;
  if (hasExisting) {
    warn("Existing installation detected — files will be updated");
    log("");
  }

  if (!force) {
    const answer = await ask(`  ${c.bold}Install globally? [Y/n]${c.reset} `);
    if (answer && answer !== "y" && answer !== "yes" && answer !== "o" && answer !== "oui") {
      log("\n  Cancelled.\n");
      process.exit(0);
    }
  }

  log("");
  header("Installing...");

  const rules = installRules();
  const skills = installSkills(skillsToInstall);
  if (!advanced) {
    removeSkills([...ADVANCED_SKILLS, ...LEGACY_SKILLS]);
  }
  const files = installPluginFiles();
  installHooks();

  header("Done");
  log("");
  log(`  ${c.green}${rules} rules, ${skills} skills, ${files} core files, 4 hooks${c.reset}`);
  log("");
  log(`  ${c.yellow}Restart Cursor${c.reset} to activate the plugin globally.`);
  log(`  ${c.dim}Enable "Third-party skills" in Cursor Settings > Features for hooks.${c.reset}`);
  log("");
}

// ─── Uninstall ──────────────────────────────────────────────────────────

function removeHooks() {
  if (!fs.existsSync(TARGETS.hooksFile)) {
    skip("No hooks.json found");
    return;
  }

  try {
    const existing = JSON.parse(fs.readFileSync(TARGETS.hooksFile, "utf8"));
    if (!existing.hooks) {
      skip("No hooks in hooks.json");
      return;
    }

    let removed = 0;
    for (const event of Object.keys(existing.hooks)) {
      const before = existing.hooks[event].length;
      existing.hooks[event] = existing.hooks[event].filter(
        (h) => !h._source || h._source !== HOOK_MARKER
      );
      existing.hooks[event] = existing.hooks[event].filter(
        (h) => !(h.command && h.command.includes(HOOK_MARKER))
      );
      removed += before - existing.hooks[event].length;
      if (existing.hooks[event].length === 0) {
        delete existing.hooks[event];
      }
    }

    if (Object.keys(existing.hooks).length === 0) {
      fs.unlinkSync(TARGETS.hooksFile);
      ok("Removed hooks.json (was only WhytCard hooks)");
    } else {
      fs.writeFileSync(TARGETS.hooksFile, JSON.stringify(existing, null, 2) + "\n", "utf8");
      ok(`Removed ${removed} hook entries from hooks.json`);
    }
  } catch {
    warn("Could not parse hooks.json, leaving it untouched");
  }
}

async function uninstall(force) {
  header("WhytCard AI Plugin — Uninstall");
  log("");

  const status = getStatus();
  const hasAnything = status.rules.length > 0 || status.skills.length > 0 || status.hooks || status.plugin;

  if (!hasAnything) {
    log("  Nothing to uninstall. Plugin is not installed globally.\n");
    process.exit(0);
  }

  log(`  Will remove:`);
  if (status.rules.length > 0) log(`    ${c.red}${status.rules.length}${c.reset} rules`);
  if (status.skills.length > 0) log(`    ${c.red}${status.skills.length}${c.reset} skills`);
  if (status.hooks) log(`    ${c.red}4${c.reset} hooks from hooks.json`);
  if (status.plugin) log(`    ${c.red}Plugin core${c.reset} files`);
  log("");

  if (!force) {
    const answer = await ask(`  ${c.bold}Uninstall? [y/N]${c.reset} `);
    if (answer !== "y" && answer !== "yes" && answer !== "o" && answer !== "oui") {
      log("\n  Cancelled.\n");
      process.exit(0);
    }
  }

  log("");
  header("Removing...");

  for (const rule of RULES) {
    const dst = path.join(TARGETS.rules, rule.dst);
    if (removeFile(dst)) ok(`Rule: ${rule.dst}`);
  }

  for (const skill of ALL_SKILLS) {
    const dst = path.join(TARGETS.skills, skill.dst);
    if (removeFile(dst)) ok(`Skill: ${skill.dst}`);
    const skillDir = path.dirname(dst);
    removeDirIfEmpty(skillDir);
  }

  if (fs.existsSync(TARGETS.plugin)) {
    fs.rmSync(TARGETS.plugin, { recursive: true, force: true });
    ok("Plugin core files");
    const pluginsDir = path.dirname(TARGETS.plugin);
    removeDirIfEmpty(pluginsDir);
  }

  removeHooks();

  header("Done");
  log(`\n  Plugin uninstalled. ${c.yellow}Restart Cursor${c.reset} to apply.\n`);
}

// ─── CLI entry point ────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isUninstall = args.includes("--uninstall");
const isForce = args.includes("--force");
const isStatus = args.includes("--status");
const isAdvanced = args.includes("--advanced");

if (!fs.existsSync(CURSOR_HOME)) {
  err(`Cursor home not found at ${CURSOR_HOME}`);
  err("Is Cursor installed?");
  process.exit(1);
}

if (isStatus) {
  showStatus();
} else if (isUninstall) {
  uninstall(isForce);
} else {
  install(isForce, isAdvanced);
}
