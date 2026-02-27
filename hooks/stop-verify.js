#!/usr/bin/env node
/**
 * Stop hook — runs when the agent is about to stop
 *
 * Final verification gate. Checks conversation context for signs that
 * the agent may have skipped critical steps:
 *
 * 1. Did UI work without visual verification
 * 2. Added dependencies without version checking
 * 3. Made recommendations without research evidence
 *
 * This is a SOFT gate — it reminds, it doesn't block.
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

  // The stop hook receives the conversation transcript
  const transcript = data.transcript || data.messages || "";
  const transcriptStr = typeof transcript === "string"
    ? transcript
    : JSON.stringify(transcript);

  const warnings = [];

  // Check if UI files were edited but no screenshot was taken
  const editedTsx = transcriptStr.includes(".tsx") || transcriptStr.includes(".jsx");
  const tookScreenshot = transcriptStr.includes("browser_take_screenshot") ||
    transcriptStr.includes("screenshot") ||
    transcriptStr.includes("Playwright");

  if (editedTsx && !tookScreenshot) {
    warnings.push(
      "VISUAL VERIFICATION MISSING: UI files were edited but no screenshot was taken. " +
      "Use Playwright to take screenshots at 3 viewports (375/768/1440px) before considering work done."
    );
  }

  // Check if packages were added but version wasn't verified
  const addedPackage = transcriptStr.includes("npm install") ||
    transcriptStr.includes("npm add") ||
    transcriptStr.includes("pnpm add") ||
    transcriptStr.includes("bun add");
  const checkedVersion = transcriptStr.includes("latest version") ||
    transcriptStr.includes("bundlephobia") ||
    transcriptStr.includes("resolve-library-id");

  if (addedPackage && !checkedVersion) {
    warnings.push(
      "VERSION CHECK MISSING: Packages were installed without verifying current versions. " +
      "Use WebSearch or Context7 to confirm you installed the latest recommended version."
    );
  }

  if (warnings.length > 0) {
    const message = [
      "WHYTCARD CONSTITUTION — VERIFICATION REMINDER",
      "",
      ...warnings,
      "",
      "These are reminders, not blockers. Address them before declaring work complete."
    ].join("\n");

    process.stdout.write(JSON.stringify({ followup_message: message }));
  } else {
    process.stdout.write(JSON.stringify({}));
  }
});
