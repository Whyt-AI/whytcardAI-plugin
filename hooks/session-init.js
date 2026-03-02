#!/usr/bin/env node

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

const pluginRoot = getPluginRoot();
const agentsPath = path.join(pluginRoot, "AGENTS.md");
let principles = "";
try {
  principles = fs.readFileSync(agentsPath, "utf8").trim();
} catch (err) {
  principles = `ERROR: Could not load AGENTS.md — ${err.message}`;
}

function detectStack(cwd) {
  const signals = [];
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next) signals.push("nextjs");
      if (deps.react) signals.push("react");
      if (deps.vue) signals.push("vue");
      if (deps.svelte || deps["@sveltejs/kit"]) signals.push("svelte");
      if (deps.tailwindcss) signals.push("tailwind");
      if (deps["@supabase/supabase-js"] || deps["@supabase/ssr"]) signals.push("supabase");
      if (deps.astro) signals.push("astro");
    } catch {}
  }
  if (fs.existsSync(path.join(cwd, "Cargo.toml"))) signals.push("rust");
  if (fs.existsSync(path.join(cwd, "go.mod"))) signals.push("go");
  return [...new Set(signals)];
}

function findProjectRoot(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

const projectRoot = findProjectRoot(process.cwd());
const stack = detectStack(projectRoot);
const config = loadConfig(projectRoot);

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
    } catch {}
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
      return { status: "created", mode: "local", kbPath };
    }

    const { projDir, docsDir } = ensureGlobalProjectLayout({
      globalRoot: resolvedRoot,
      projectRoot: rootDir,
      stack,
      projectName,
    });
    ensureOnboardingBrainstorm(docsDir, { projectName, projectRoot: rootDir, kbMode: "global", globalRoot: resolvedRoot, stack });

    if (!tryCreateDirLink(kbPath, docsDir)) {
      ensureKbSkeleton(kbPath);
      ensureIndexMd(kbPath, { projectName, stack, sourceLabel: "local-fallback" });
      ensureOnboardingBrainstorm(kbPath, { projectName, projectRoot: rootDir, kbMode: "local-fallback", globalRoot: resolvedRoot, stack });
      return { status: "created", mode: "local-fallback", kbPath };
    }

    return { status: "linked", mode: "global", kbPath, globalDocsDir: docsDir, globalProjectDir: projDir };
  } catch (err) {
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
  const currentMode = globalCfg ? String(globalCfg.kbMode || globalCfg.mode || "global").toLowerCase() : "global";
  const globalProjectDir = getGlobalProjectDir(resolvedRoot, rootDir);
  const globalDocsDir = getGlobalDocsDir(globalProjectDir);

  if ((kbStatus.status === "present" || kbStatus.status === "linked") && globalCfg && globalCfg.confirmed !== false) return "";

  return `\n\n<WC-ONBOARDING>\nAsk the user ONCE (default = GLOBAL):\n1) KB mode: GLOBAL (recommended) or LOCAL\n2) If GLOBAL: global root path (default: ${defaultRoot})\n\nCurrent config: mode=${currentMode}, globalRoot=${resolvedRoot}, config=${cfgPath}\n\nOn choice, ensure:\n- locator: ${path.join(defaultRoot, "locator.json")}\n- config: ${cfgPath} with { version, kbMode, globalRoot, confirmed:true }\n- GLOBAL path: ${globalProjectDir} and link .whytcard -> ${globalDocsDir}\n- LOCAL fallback if linking fails\n\nDetected KB status: ${kbStatus.status}\n</WC-ONBOARDING>`;
}

const stackLine = stack.length ? `\nDetected stack: ${stack.join(", ")}.` : "";
const configLine = `\nProject config: viewports=${JSON.stringify(config.viewports)}, visualVerification=${config.visualVerification}, darkModeCheck=${config.darkModeCheck}`;
const onboarding = buildOnboardingContext(projectRoot);
const context = `<WHYTCARD-AGENTS>\n${principles}${stackLine}${configLine}\n</WHYTCARD-AGENTS>`;

process.stdout.write(injectContext("SessionStart", context + onboarding));
