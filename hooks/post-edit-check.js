#!/usr/bin/env node

const { handleStdin, injectContext, emptyResponse, isVisualFile } = require("./lib/output");

handleStdin((data) => {
  const toolInput = data.tool_input || {};
  const filePath = (toolInput.file_path || "").toLowerCase();

  if (!isVisualFile(filePath)) return emptyResponse();

  return injectContext(
    "PostToolUse",
    `WC-POST-EDIT: Visual file "${toolInput.file_path || filePath}" changed. Before declaring done, verify screenshots at 375px, 768px, 1440px in light and dark mode.`
  );
});
