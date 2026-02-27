#!/usr/bin/env node
/**
 * SessionStart hook — WhytCard AI Constitution
 *
 * Injects the agent's operating principles and plugin routing table
 * into every Claude Code conversation. This is the "constitution" that
 * governs how the agent thinks and acts.
 */

const fs = require("fs");
const path = require("path");

// Load the constitution from the markdown file
const constitutionPath = path.join(__dirname, "..", "constitution.md");
let constitution = "";
try {
  constitution = fs.readFileSync(constitutionPath, "utf8");
} catch (err) {
  constitution = "ERROR: Could not load constitution.md — " + err.message;
}

// Detect project stack from package.json, requirements.txt, etc.
function detectStack(cwd) {
  const signals = [];

  // Node/Frontend
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps["next"]) signals.push("nextjs");
      if (allDeps["react"]) signals.push("react");
      if (allDeps["tailwindcss"]) signals.push("tailwind");
      if (allDeps["@supabase/supabase-js"] || allDeps["@supabase/ssr"]) signals.push("supabase");
      if (allDeps["stripe"]) signals.push("stripe");
      if (allDeps["next-intl"]) signals.push("i18n");
      if (allDeps["@radix-ui/react-dialog"] || allDeps["@radix-ui/themes"]) signals.push("radix");
      if (allDeps["motion"] || allDeps["framer-motion"]) signals.push("motion");
      if (allDeps["playwright"] || allDeps["@playwright/test"]) signals.push("playwright");
    } catch { /* ignore */ }
  }

  // Python
  const reqPath = path.join(cwd, "requirements.txt");
  if (fs.existsSync(reqPath)) {
    try {
      const reqs = fs.readFileSync(reqPath, "utf8").toLowerCase();
      if (reqs.includes("fastapi")) signals.push("fastapi");
      if (reqs.includes("groq")) signals.push("groq");
    } catch { /* ignore */ }
  }

  // Rust
  if (fs.existsSync(path.join(cwd, "Cargo.toml"))) signals.push("rust");

  return signals;
}

const cwd = process.cwd();
const stack = detectStack(cwd);
const stackLine = stack.length > 0
  ? `\nDetected stack: ${stack.join(", ")}. Prioritize plugins for these technologies.`
  : "";

const context = `<WHYTCARD-CONSTITUTION>
${constitution}
${stackLine}
</WHYTCARD-CONSTITUTION>`;

// Escape for JSON
function escapeForJson(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

const escaped = escapeForJson(context);

process.stdout.write(JSON.stringify({
  additional_context: context,
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: context
  }
}));
