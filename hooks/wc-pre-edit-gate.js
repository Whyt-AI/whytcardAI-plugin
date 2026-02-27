#!/usr/bin/env node
/**
 * wc-pre-edit-gate — PreToolUse hook for Edit/Write/NotebookEdit
 *
 * Injects reminders into the AI agent's context before file edits.
 * Does NOT block tool execution. Respects wc-config.json.
 * Works on both Claude Code and Cursor via shared output module.
 */

const { handleStdin, injectContext, emptyResponse, isVisualFile, loadConfig } = require("./lib/output");

handleStdin((data) => {
  const toolName = data.tool_name || "";
  const toolInput = data.tool_input || {};
  const filePath = (toolInput.file_path || "").toLowerCase();
  const cwd = data.cwd || process.cwd();
  const config = loadConfig(cwd);
  const reminders = [];

  // Visual/UI file → remind visual verification
  if (config.visualVerification && isVisualFile(filePath)) {
    const vp = config.viewports || [375, 768, 1440];
    reminders.push(
      `WC-VISUAL: After this edit, take screenshots at ${vp.length} viewports (${vp.join("/")}px) to verify the result visually.`
    );
  }

  // package.json → remind version check (smart detection)
  if (config.versionCheck && filePath.endsWith("package.json")) {
    const editContent = toolInput.new_string || toolInput.content || toolInput.insert || "";
    const isDependencyEdit =
      editContent.includes("dependencies") ||
      editContent.includes("devDependencies") ||
      editContent.includes("peerDependencies") ||
      editContent.includes("optionalDependencies") ||
      /["'][\w@/-]+["']\s*:\s*["']\^?~?[\d]/.test(editContent) ||
      editContent === "";
    if (isDependencyEdit) {
      reminders.push(
        "WC-VERSIONS: Verify you checked the latest version of any added/changed package via WebSearch."
      );
    }
  }

  // Write tool (new file creation) → remind research-first
  if (config.researchFirst && toolName === "Write") {
    reminders.push(
      "WC-RESEARCH: Is this file necessary? Did you research the best approach before creating it?"
    );
  }

  if (reminders.length > 0) {
    return injectContext("PreToolUse", reminders.join("\n"));
  }
  return emptyResponse();
});
