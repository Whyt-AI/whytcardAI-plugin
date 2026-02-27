#!/usr/bin/env node
/**
 * SessionStart hook — WhytCard AI Constitution
 *
 * Injects the agent's operating principles and plugin routing table
 * into every Claude Code conversation via hookSpecificOutput.additionalContext.
 *
 * Output format (Claude Code SessionStart protocol):
 *   { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "..." } }
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
  process.stderr.write(`wc-session-start: failed to load constitution — ${err.message}\n`);
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
      if (allDeps["vue"]) signals.push("vue");
      if (allDeps["svelte"] || allDeps["@sveltejs/kit"]) signals.push("svelte");
      if (allDeps["tailwindcss"]) signals.push("tailwind");
      if (allDeps["@supabase/supabase-js"] || allDeps["@supabase/ssr"]) signals.push("supabase");
      if (allDeps["stripe"]) signals.push("stripe");
      if (allDeps["next-intl"] || allDeps["i18next"] || allDeps["vue-i18n"]) signals.push("i18n");
      if (allDeps["@radix-ui/react-dialog"] || allDeps["@radix-ui/themes"]) signals.push("radix");
      if (allDeps["motion"] || allDeps["framer-motion"]) signals.push("motion");
      if (allDeps["playwright"] || allDeps["@playwright/test"]) signals.push("playwright");
      if (allDeps["astro"]) signals.push("astro");
    } catch (err) {
      process.stderr.write(`wc-session-start: failed to parse package.json — ${err.message}\n`);
    }
  }

  // Python
  const pyFiles = ["requirements.txt", "pyproject.toml", "setup.py"];
  for (const pyFile of pyFiles) {
    const pyPath = path.join(cwd, pyFile);
    if (fs.existsSync(pyPath)) {
      try {
        const content = fs.readFileSync(pyPath, "utf8").toLowerCase();
        if (content.includes("fastapi")) signals.push("fastapi");
        if (content.includes("django")) signals.push("django");
        if (content.includes("flask")) signals.push("flask");
        if (content.includes("groq")) signals.push("groq");
      } catch { /* ignore */ }
    }
  }

  // Rust
  if (fs.existsSync(path.join(cwd, "Cargo.toml"))) signals.push("rust");

  // Go
  if (fs.existsSync(path.join(cwd, "go.mod"))) signals.push("go");

  // Docker
  if (fs.existsSync(path.join(cwd, "Dockerfile")) || fs.existsSync(path.join(cwd, "docker-compose.yml"))) {
    signals.push("docker");
  }

  // Monorepo: scan one level of subdirectories for package.json
  try {
    const entries = fs.readdirSync(cwd, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        const subPkg = path.join(cwd, entry.name, "package.json");
        if (fs.existsSync(subPkg)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(subPkg, "utf8"));
            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (allDeps["next"] && !signals.includes("nextjs")) signals.push("nextjs");
            if (allDeps["react"] && !signals.includes("react")) signals.push("react");
            if (allDeps["vue"] && !signals.includes("vue")) signals.push("vue");
          } catch { /* ignore */ }
        }
      }
    }
  } catch { /* ignore */ }

  // Deduplicate
  return [...new Set(signals)];
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

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: context
  }
}));
