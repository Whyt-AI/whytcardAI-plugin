#!/usr/bin/env node
/**
 * wc-post-edit-verify — PostToolUse hook for Edit/Write/NotebookEdit
 *
 * After a visual file is edited, injects a strong reminder to take
 * screenshots before considering the task done.
 * Works on both Claude Code and Cursor via shared output module.
 */

const { handleStdin, injectContext, emptyResponse, isVisualFile } = require("./lib/output");

handleStdin((data) => {
  const toolInput = data.tool_input || {};
  const filePath = (toolInput.file_path || "").toLowerCase();

  if (isVisualFile(filePath)) {
    return injectContext(
      "PostToolUse",
      `WC-POST-EDIT: Visual file "${toolInput.file_path || filePath}" was just modified. Before declaring this task done, you MUST take screenshots at 3 viewports (375px, 768px, 1440px) to verify the visual result.`
    );
  }
  return emptyResponse();
});
