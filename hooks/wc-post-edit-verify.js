#!/usr/bin/env node
/**
 * wc-post-edit-verify — PostToolUse hook for Edit/Write/NotebookEdit
 *
 * After a visual file is edited, injects a strong reminder into Claude's context
 * to take Playwright screenshots before considering the task done.
 *
 * Input format (via stdin JSON):
 *   { tool_name, tool_input: { file_path, ... }, tool_output, session_id, cwd }
 *
 * Output format (Claude Code PostToolUse protocol):
 *   { hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: "..." } }
 */

const VISUAL_EXTENSIONS = [
  ".tsx", ".jsx",
  ".vue", ".svelte", ".astro",
  ".css", ".scss", ".sass", ".less",
  ".module.css", ".module.scss",
  ".html",
];

function isVisualFile(filePath) {
  return VISUAL_EXTENSIONS.some((ext) => filePath.endsWith(ext));
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

  const toolInput = data.tool_input || {};
  const filePath = (toolInput.file_path || "").toLowerCase();

  if (isVisualFile(filePath)) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `WC-POST-EDIT: Visual file "${toolInput.file_path || filePath}" was just modified. Before declaring this task done, you MUST take Playwright screenshots at 3 viewports (375px, 768px, 1440px) to verify the visual result.`
      }
    }));
  } else {
    process.stdout.write(JSON.stringify({}));
  }
});
