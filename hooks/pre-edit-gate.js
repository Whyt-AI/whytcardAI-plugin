#!/usr/bin/env node
/**
 * PreToolUse hook — runs before Edit/Write/NotebookEdit
 *
 * Lightweight gate that reminds the agent to verify before writing code.
 * Does NOT block — just injects a reminder into the conversation context.
 *
 * Checks:
 * 1. If editing a UI file (.tsx/.jsx) — remind about visual verification
 * 2. If editing a package.json — remind about version checking
 * 3. If creating a new file — remind about research-first
 */

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

  const filePath = (data.file_path || data.path || "").toLowerCase();
  const reminders = [];

  // UI file check
  if (filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
    reminders.push(
      "UI FILE: After this edit, you MUST take Playwright screenshots at 3 viewports (375/768/1440px) to verify the visual result."
    );
  }

  // Package.json check
  if (filePath.endsWith("package.json")) {
    reminders.push(
      "DEPENDENCIES: Verify you checked the latest version of any added package via WebSearch or Context7 before modifying package.json."
    );
  }

  // New file creation (Write tool)
  const toolName = data.tool_name || "";
  if (toolName === "Write") {
    reminders.push(
      "NEW FILE: Ensure you researched the best approach before creating this file. Is this file necessary, or can you edit an existing one?"
    );
  }

  if (reminders.length > 0) {
    process.stdout.write(
      JSON.stringify({
        followup_message: reminders.join("\n")
      })
    );
  } else {
    process.stdout.write(JSON.stringify({}));
  }
});
