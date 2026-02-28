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
const {
  getDefaultGlobalRoot,
  getGlobalConfigPath,
  loadGlobalKbConfig,
  getGlobalProjectDir,
  getGlobalDocsDir,
  resolveGlobalRoot,
  hasLocalWhytcard,
  ensureGlobalConfig,
  ensureKbSkeleton,
  ensureIndexMd,
  ensureOnboardingBrainstorm,
  ensureGlobalProjectLayout,
  tryCreateDirLink,
} = require("./lib/whytcard-kb");

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

function findProjectRoot(startDir) {
  // Prefer a git root if present; otherwise use the current working directory.
  let dir = path.resolve(startDir);
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

const projectRoot = findProjectRoot(cwd);
const stack = detectStack(projectRoot);
const config = loadConfig(projectRoot);

const stackLine = stack.length > 0
  ? `\nDetected stack: ${stack.join(", ")}. Prioritize tools and patterns for these technologies.`
  : "";

const configLine = `\nProject config: viewports=${JSON.stringify(config.viewports)}, visualVerification=${config.visualVerification}, darkModeCheck=${config.darkModeCheck}`;

// ─── Knowledge base onboarding (auto, no commands) ──────────────────────

function looksLikeProject(rootDir) {
  for (const p of [".git", "package.json", "pyproject.toml", "requirements.txt", "Cargo.toml", "go.mod"]) {
    if (fs.existsSync(path.join(rootDir, p))) return true;
  }
  return false;
}

function shouldAutoSetupKb(rootDir) {
  if (process.env.WHYTCARD_DISABLE_AUTO_SETUP === "1") return false;
  if (config && config.autoSetup === false) return false;
  return looksLikeProject(rootDir);
}

function detectProjectName(rootDir) {
  const pkgPath = path.join(rootDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (pkg && typeof pkg.name === "string" && pkg.name.trim()) return pkg.name.trim();
    } catch { /* ignore */ }
  }
  return path.basename(path.resolve(rootDir));
}

function bootstrapKbIfNeeded(rootDir) {
  const kbPath = path.join(rootDir, ".whytcard");
  if (hasLocalWhytcard(rootDir)) return { status: "present", kbPath };

  try {
    const projectName = detectProjectName(rootDir);
    const perProjectMode = config && typeof config.kbMode === "string" ? config.kbMode : null;
    const perProjectRoot = config && typeof config.globalRoot === "string" ? config.globalRoot : null;

    const resolvedRoot = (perProjectRoot && perProjectRoot.trim()) ? perProjectRoot.trim() : resolveGlobalRoot();
    let globalCfg = loadGlobalKbConfig(resolvedRoot);

    if (!globalCfg) {
      ensureGlobalConfig({ kbMode: perProjectMode || "global", globalRoot: resolvedRoot, confirmed: false });
      globalCfg = loadGlobalKbConfig(resolvedRoot);
    }

    const mode = String(perProjectMode || globalCfg.kbMode || globalCfg.mode || "global").toLowerCase();

    if (mode === "local") {
      ensureKbSkeleton(kbPath);
      ensureIndexMd(kbPath, { projectName, stack, sourceLabel: "local-kb" });
      ensureOnboardingBrainstorm(kbPath, { projectName, projectRoot: rootDir, kbMode: "local", globalRoot: resolvedRoot, stack });
      return { status: "created", mode: "local", kbPath, globalRoot: resolvedRoot, globalCfg };
    }

    const { projDir, docsDir } = ensureGlobalProjectLayout({
      globalRoot: resolvedRoot,
      projectRoot: rootDir,
      stack,
      projectName,
    });
    ensureOnboardingBrainstorm(docsDir, { projectName, projectRoot: rootDir, kbMode: "global", globalRoot: resolvedRoot, stack });

    const linked = tryCreateDirLink(kbPath, docsDir);
    if (!linked) {
      ensureKbSkeleton(kbPath);
      ensureIndexMd(kbPath, { projectName, stack, sourceLabel: "local-fallback" });
      ensureOnboardingBrainstorm(kbPath, { projectName, projectRoot: rootDir, kbMode: "local-fallback", globalRoot: resolvedRoot, stack });
      return {
        status: "created",
        mode: "local-fallback",
        kbPath,
        globalRoot: resolvedRoot,
        globalCfg,
        globalProjectDir: projDir,
        globalDocsDir: docsDir,
      };
    }

    return {
      status: "linked",
      mode: "global",
      kbPath,
      globalRoot: resolvedRoot,
      globalCfg,
      globalProjectDir: projDir,
      globalDocsDir: docsDir,
    };
  } catch (err) {
    process.stderr.write(`wc-session-start: KB bootstrap failed (non-fatal) — ${err.message}\n`);
    return { status: "error", kbPath, error: err.message };
  }
}

function buildOnboardingContext(rootDir) {
  const kbStatus = shouldAutoSetupKb(rootDir)
    ? bootstrapKbIfNeeded(rootDir)
    : { status: hasLocalWhytcard(rootDir) ? "present" : "absent", kbPath: path.join(rootDir, ".whytcard") };

  const defaultRoot = getDefaultGlobalRoot();
  const resolvedRoot = (config && typeof config.globalRoot === "string" && config.globalRoot.trim())
    ? config.globalRoot.trim()
    : resolveGlobalRoot();
  const cfgPath = getGlobalConfigPath(resolvedRoot);
  const globalCfg = loadGlobalKbConfig(resolvedRoot);
  const globalProjectDir = getGlobalProjectDir(resolvedRoot, rootDir);
  const globalDocsDir = getGlobalDocsDir(globalProjectDir);

  // If config exists and is confirmed, and KB is present, do not nag.
  if (kbStatus.status === "present" && globalCfg && globalCfg.confirmed !== false) return "";
  if (kbStatus.status === "linked" && globalCfg && globalCfg.confirmed !== false) return "";

  // First-time onboarding (no config yet)
  if (!globalCfg) {
    return `

<WC-ONBOARDING>
WhytCard detected that this project has no knowledge base yet.

Goal: the user should NOT have to run slash commands (no /wc-* required).

Ask the user ONCE (default = GLOBAL):
1) Knowledge base mode: GLOBAL (recommended) or LOCAL
2) If GLOBAL: where should the global root live? (default: ${defaultRoot})

Then configure:
- Persist choice:
  - write ${cfgPath} with { version, kbMode, globalRoot, confirmed }
  - write ${path.join(defaultRoot, "locator.json")} with { globalRoot } so we can find it later
- If GLOBAL:
  - Create: {globalRoot}/projects/{projectSlug}-{projectId}/docs/{brainstorms,plans,research,logs,reviews,stacks,context,etc,instructions}/
  - Create: {globalRoot}/projects/{projectSlug}-{projectId}/instructions/
  - Create: meta.json (repo path, projectId, createdAt, stack)
  - Create a directory link in the repo: .whytcard -> ${globalDocsDir}
  - If linking fails: fall back to LOCAL .whytcard
- If LOCAL:
  - Create .whytcard/{brainstorms,plans,logs,reviews,research,context,stacks,etc,instructions}/ + index.md

After onboarding, proceed with the user's request normally.
</WC-ONBOARDING>`;
  }

  // Config exists but may be unconfirmed → request confirmation once.
  const confirmed = globalCfg.confirmed === true;
  const currentMode = String(globalCfg.kbMode || globalCfg.mode || "global").toLowerCase();

  if (!confirmed) {
    const whatWeDid =
      kbStatus.status === "linked"
        ? `Auto-created GLOBAL KB and linked ${kbStatus.kbPath} -> ${kbStatus.globalDocsDir}`
        : kbStatus.status === "created"
          ? `Auto-created KB (${kbStatus.mode}) at ${kbStatus.kbPath}`
          : `KB is not initialized yet.`;

    return `

<WC-ONBOARDING>
WhytCard onboarding needs ONE confirmation (then never ask again on this machine).

${whatWeDid}

Current config:
- kbMode: ${currentMode}
- globalRoot: ${resolvedRoot}
- config: ${cfgPath}

Ask the user:
- Keep GLOBAL (recommended) or switch to LOCAL?
- If GLOBAL: keep location "${resolvedRoot}" or choose another path?

Then:
- Update ${cfgPath}: set { kbMode, globalRoot, confirmed:true }
- If mode/location changes, migrate by re-linking .whytcard accordingly (junction/symlink). If linking fails, keep LOCAL.
</WC-ONBOARDING>`;
  }

  // Confirmed config exists, but KB missing → guide attachment.
  if (currentMode === "global") {
    return `

<WC-ONBOARDING>
WhytCard GLOBAL knowledge base is configured.
If this project has no .whytcard yet, attach it automatically:
- Ensure global project dir exists: ${globalProjectDir}
- Create directory link in repo: .whytcard -> ${globalDocsDir}
- If linking fails: fall back to LOCAL .whytcard
</WC-ONBOARDING>`;
  }

  return `

<WC-ONBOARDING>
WhytCard is configured in LOCAL mode but this project has no .whytcard yet.
Create .whytcard/ in the repo and initialize index.md (same structure as usual).
</WC-ONBOARDING>`;
}

const onboarding = buildOnboardingContext(projectRoot);

const context = `<WHYTCARD-CONSTITUTION>
${constitution}
${stackLine}${configLine}
</WHYTCARD-CONSTITUTION>`;

process.stdout.write(injectContext("SessionStart", context + onboarding));
