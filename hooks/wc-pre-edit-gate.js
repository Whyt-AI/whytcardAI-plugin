#!/usr/bin/env node
/**
 * wc-pre-edit-gate — PreToolUse hook for Edit/Write/NotebookEdit
 *
 * Reads tool_input from stdin (Claude Code hook protocol).
 * Injects reminders into Claude's context via hookSpecificOutput.additionalContext.
 * Does NOT block tool execution.
 * Respects wc-config.json for per-project customization.
 *
 * Input format (via stdin JSON):
 *   { tool_name, tool_input: { file_path, ... }, session_id, cwd }
 *
 * Output format (Claude Code PreToolUse protocol):
 *   { hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: "..." } }
 */

const fs = require("fs");
const path = require("path");

// File extensions that affect visual output and require screenshot verification
const VISUAL_EXTENSIONS = [
  ".tsx", ".jsx",                          // React components
  ".vue", ".svelte", ".astro",             // Other UI frameworks
  ".css", ".scss", ".sass", ".less",       // Stylesheets
  ".module.css", ".module.scss",           // CSS modules
  ".html",                                 // HTML templates
];

/**
 * Check if a file path represents a visual/UI file.
 * Uses endsWith for each extension to handle compound extensions like .module.css.
 */
function isVisualFile(filePath) {
  return VISUAL_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

/**
 * Load per-project config. Returns defaults if no wc-config.json found.
 */
function loadConfig(cwd) {
  const defaults = { visualVerification: true, versionCheck: true, researchFirst: true };
  const configPath = path.join(cwd, "wc-config.json");
  if (!fs.existsSync(configPath)) return defaults;
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
  } catch {
    return defaults;
  }
}

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.stdout.write(JSON.stringify({}));
    return;
  }

  const toolName = data.tool_name || "";
  const toolInput = data.tool_input || {};
  const filePath = (toolInput.file_path || "").toLowerCase();
  const cwd = data.cwd || process.cwd();
  const config = loadConfig(cwd);
  const reminders = [];

  // Visual/UI file → remind visual verification (if enabled)
  if (config.visualVerification && isVisualFile(filePath)) {
    reminders.push(
      "WC-VISUAL: After this edit, take Playwright screenshots at 3 viewports (375/768/1440px) to verify the result visually."
    );
  }

  // package.json → remind version check (if enabled)
  // Only trigger if the edit content appears to touch dependencies
  if (config.versionCheck && filePath.endsWith("package.json")) {
    const editContent = toolInput.new_string || toolInput.content || toolInput.insert || "";
    const isDependencyEdit =
      editContent.includes("dependencies") ||
      editContent.includes("devDependencies") ||
      editContent.includes("peerDependencies") ||
      editContent.includes("optionalDependencies") ||
      /["'][\w@/-]+["']\s*:\s*["']\^?~?[\d]/.test(editContent) || // matches "pkg": "^1.0.0"
      editContent === ""; // if no content available, trigger anyway (safe default)
    if (isDependencyEdit) {
      reminders.push(
        "WC-VERSIONS: Verify you checked the latest version of any added/changed package via WebSearch or Context7."
      );
    }
  }

  // Write tool (new file creation) → remind research-first (if enabled)
  if (config.researchFirst && toolName === "Write") {
    reminders.push(
      "WC-RESEARCH: Is this file necessary? Did you research the best approach before creating it?"
    );
  }

  if (reminders.length > 0) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: reminders.join("\n")
      }
    }));
  } else {
    process.stdout.write(JSON.stringify({}));
  }
});
