#!/usr/bin/env node
/**
 * SessionStart hook — WhytCard AI Constitution
 *
 * Injects the agent's operating principles into every conversation.
 * Works on both Claude Code and Cursor via shared output module.
 *
 * Loads only core principles at session start. The dispatch table
 * is loaded on-demand via the wc-dispatch skill.
 */

const fs = require("fs");
const path = require("path");
const { injectContext, loadConfig, getPluginRoot } = require("./lib/output");

// ─── Load constitution ──────────────────────────────────────────────────

const pluginRoot = getPluginRoot();
const constitutionPath = path.join(pluginRoot, "constitution.md");
let constitution = "";
try {
  const full = fs.readFileSync(constitutionPath, "utf8");
  const marker = "<!-- CORE_PRINCIPLES_END";
  const markerIndex = full.indexOf(marker);
  constitution = markerIndex !== -1 ? full.substring(0, markerIndex).trim() : full;
} catch (err) {
  constitution = "ERROR: Could not load constitution.md — " + err.message;
  process.stderr.write(`wc-session-start: failed to load constitution — ${err.message}\n`);
}

// ─── Detect project stack ───────────────────────────────────────────────

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
  for (const pyFile of ["requirements.txt", "pyproject.toml", "setup.py"]) {
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

  // Other languages
  if (fs.existsSync(path.join(cwd, "Cargo.toml"))) signals.push("rust");
  if (fs.existsSync(path.join(cwd, "go.mod"))) signals.push("go");
  if (fs.existsSync(path.join(cwd, "Dockerfile")) || fs.existsSync(path.join(cwd, "docker-compose.yml"))) {
    signals.push("docker");
  }

  // Monorepo: scan one level of subdirectories
  try {
    const entries = fs.readdirSync(cwd, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        const subPkg = path.join(cwd, entry.name, "package.json");
        if (fs.existsSync(subPkg)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(subPkg, "utf8"));
            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (allDeps["next"]) signals.push("nextjs");
            if (allDeps["react"]) signals.push("react");
            if (allDeps["vue"]) signals.push("vue");
          } catch { /* ignore */ }
        }
      }
    }
  } catch { /* ignore */ }

  return [...new Set(signals)];
}

// ─── Build context and output ───────────────────────────────────────────

const cwd = process.cwd();
const stack = detectStack(cwd);
const config = loadConfig(cwd);

const stackLine = stack.length > 0
  ? `\nDetected stack: ${stack.join(", ")}. Prioritize tools and patterns for these technologies.`
  : "";

const configLine = `\nProject config: viewports=${JSON.stringify(config.viewports)}, visualVerification=${config.visualVerification}, darkModeCheck=${config.darkModeCheck}`;

const context = `<WHYTCARD-CONSTITUTION>
${constitution}
${stackLine}${configLine}
</WHYTCARD-CONSTITUTION>`;

process.stdout.write(injectContext("SessionStart", context));
