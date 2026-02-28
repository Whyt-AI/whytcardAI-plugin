/**
 * WhytCard Knowledge Base (KB) helpers.
 *
 * Goal: enable "local vs global" .whytcard storage with near-zero friction.
 *
 * Notes:
 * - This module is used by hooks, so it must stay fast and safe.
 * - It may perform small, deterministic filesystem writes for auto-onboarding
 *   (creating KB skeletons, config, and directory links). All operations are
 *   idempotent and best-effort with fallbacks.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

function getDefaultGlobalRoot() {
  return path.join(os.homedir(), ".whytcard");
}

function getLocatorPath() {
  // Stable pointer so we can find the chosen globalRoot in future sessions.
  return path.join(getDefaultGlobalRoot(), "locator.json");
}

function getGlobalConfigPath(globalRoot) {
  const root = globalRoot || resolveGlobalRoot();
  return path.join(root, "config.json");
}

function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function loadLocator() {
  return safeReadJson(getLocatorPath());
}

function resolveGlobalRoot() {
  const locator = loadLocator();
  const root = locator && locator.globalRoot ? String(locator.globalRoot) : "";
  return root.trim() ? root : getDefaultGlobalRoot();
}

function loadGlobalKbConfig(globalRoot) {
  const cfgPath = getGlobalConfigPath(globalRoot);
  const cfg = safeReadJson(cfgPath);
  if (!cfg) return null;
  return { ...cfg, _resolved: { globalRoot: path.dirname(cfgPath), configPath: cfgPath } };
}

function detectGitRemoteUrl(cwd) {
  // Lightweight parse of .git/config (no spawning git).
  const gitConfigPath = path.join(cwd, ".git", "config");
  if (!fs.existsSync(gitConfigPath)) return null;
  try {
    const raw = fs.readFileSync(gitConfigPath, "utf8");
    // Prefer [remote "origin"] url
    const originBlockMatch = raw.match(/\[remote\s+"origin"\]([\s\S]*?)(\n\[|$)/);
    const block = originBlockMatch ? originBlockMatch[1] : raw;
    const urlMatch = block.match(/^\s*url\s*=\s*(.+)\s*$/m);
    return urlMatch ? urlMatch[1].trim() : null;
  } catch {
    return null;
  }
}

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "project";
}

function computeProjectId(cwd) {
  const remote = detectGitRemoteUrl(cwd);
  const base = remote || path.resolve(cwd);
  return crypto.createHash("sha1").update(base).digest("hex").slice(0, 10);
}

function getProjectSlug(cwd) {
  return slugify(path.basename(path.resolve(cwd)));
}

function getGlobalProjectDir(globalRoot, cwd) {
  const root = globalRoot || resolveGlobalRoot();
  const slug = getProjectSlug(cwd);
  const id = computeProjectId(cwd);
  return path.join(root, "projects", `${slug}-${id}`);
}

function hasLocalWhytcard(cwd) {
  return fs.existsSync(path.join(cwd, ".whytcard"));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function safeWriteJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function safeWriteFileIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return false;
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

function ensureLocator(globalRoot) {
  const root = String(globalRoot || "").trim() || getDefaultGlobalRoot();
  const locatorPath = getLocatorPath();
  safeWriteJson(locatorPath, { version: 1, globalRoot: root, updatedAt: new Date().toISOString() });
  return locatorPath;
}

function ensureGlobalConfig({ kbMode, globalRoot, confirmed } = {}) {
  const root = String(globalRoot || "").trim() || resolveGlobalRoot();
  ensureLocator(root);

  const cfgPath = getGlobalConfigPath(root);
  const existing = safeReadJson(cfgPath) || {};
  const next = {
    version: 1,
    kbMode: kbMode || existing.kbMode || "global",
    globalRoot: root,
    confirmed: typeof confirmed === "boolean" ? confirmed : (existing.confirmed ?? false),
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  safeWriteJson(cfgPath, next);
  return { cfgPath, config: next };
}

function getGlobalDocsDir(globalProjectDir) {
  return path.join(globalProjectDir, "docs");
}

function ensureKbSkeleton(kbRoot) {
  const root = path.resolve(kbRoot);
  ensureDir(root);
  ensureDir(path.join(root, "brainstorms"));
  ensureDir(path.join(root, "plans"));
  ensureDir(path.join(root, "logs"));
  ensureDir(path.join(root, "reviews"));
  ensureDir(path.join(root, "research"));
  ensureDir(path.join(root, "context"));
  ensureDir(path.join(root, "stacks"));
  ensureDir(path.join(root, "etc"));
  ensureDir(path.join(root, "instructions"));
  return root;
}

function buildInitialIndexMd({ projectName, stack, createdAtIso, sourceLabel }) {
  const created = createdAtIso || new Date().toISOString().slice(0, 16).replace("T", " ");
  const stackLine = stack && stack.length ? stack.join(", ") : "unknown";
  const source = sourceLabel || "auto-onboarding";
  const today = new Date().toISOString().slice(0, 10);

  return `# ${projectName || "Project"} — WhytCard Knowledge Base

**Created**: ${created}
**Stack**: ${stackLine}
**Status**: initialized

---

## Quick Reference

| Category | Count | Latest |
|---|---:|---|
| Brainstorms | 0 | — |
| Plans | 0 | — |
| Executions | 0 | — |
| Reviews | 0 | — |
| Research | 0 | — |

## Decision Log

| Date | Decision | Context | Source |
|---|---|---|---|
| ${today} | Initialized WhytCard knowledge base | Auto onboarding | ${source} |

## Active Plan

None yet. Start by describing what you want to build — the agent will create a brainstorm and a plan automatically.
`;
}

function ensureIndexMd(kbRoot, { projectName, stack, sourceLabel } = {}) {
  const idxPath = path.join(kbRoot, "index.md");
  safeWriteFileIfMissing(
    idxPath,
    buildInitialIndexMd({ projectName, stack, sourceLabel })
  );
  return idxPath;
}

function buildOnboardingBrainstormMd({ projectName, projectRoot, kbMode, globalRoot, stack } = {}) {
  const now = new Date().toISOString();
  const stackLine = stack && stack.length ? stack.join(", ") : "unknown";
  const mode = kbMode || "global";
  const root = globalRoot || resolveGlobalRoot();

  return `# Onboarding — ${projectName || "Project"}

**Created**: ${now}
**Repo**: ${projectRoot ? path.resolve(projectRoot) : "unknown"}
**ProjectId**: ${projectRoot ? computeProjectId(projectRoot) : "unknown"}
**Stack**: ${stackLine}
**KB mode (current)**: ${mode}
**Global root (current)**: ${root}

---

## Goal

Make WhytCard zero-friction: user installs → the KB is ready → no slash commands required.

## One-time questions to confirm (ask the user)

1. Do you want **GLOBAL** (recommended) or **LOCAL** knowledge base?
2. If GLOBAL: where should the global root live? (default: \`${root}\`)
3. Should \`.whytcard/\` be added to \`.gitignore\` for this repo?

## Notes

- GLOBAL means: \`.whytcard\` in the repo is a directory link to \`{globalRoot}/projects/{projectSlug}-{projectId}/docs\`
- LOCAL means: \`.whytcard/\` is stored inside the repo.
`;
}

function ensureOnboardingBrainstorm(kbRoot, info = {}) {
  const filePath = path.join(kbRoot, "brainstorms", "00_onboarding.md");
  safeWriteFileIfMissing(filePath, buildOnboardingBrainstormMd(info));
  return filePath;
}

function ensureGlobalProjectLayout({ globalRoot, projectRoot, stack, projectName } = {}) {
  const root = String(globalRoot || "").trim() || resolveGlobalRoot();
  const projDir = getGlobalProjectDir(root, projectRoot);
  const docsDir = getGlobalDocsDir(projDir);

  ensureDir(projDir);
  ensureDir(docsDir);
  ensureDir(path.join(projDir, "instructions"));
  ensureKbSkeleton(docsDir);
  ensureIndexMd(docsDir, { projectName, stack, sourceLabel: "global-kb" });

  const metaPath = path.join(projDir, "meta.json");
  if (!fs.existsSync(metaPath)) {
    safeWriteJson(metaPath, {
      version: 1,
      projectId: computeProjectId(projectRoot),
      slug: getProjectSlug(projectRoot),
      repoPath: path.resolve(projectRoot),
      remote: detectGitRemoteUrl(projectRoot),
      createdAt: new Date().toISOString(),
      stack: stack || [],
      kbMode: "global",
      docsDir,
    });
  }

  return { projDir, docsDir, metaPath };
}

function tryCreateDirLink(linkPath, targetPath) {
  try {
    if (fs.existsSync(linkPath)) return true;
    ensureDir(path.dirname(linkPath));
    const type = process.platform === "win32" ? "junction" : "dir";
    fs.symlinkSync(targetPath, linkPath, type);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  getDefaultGlobalRoot,
  getLocatorPath,
  loadLocator,
  resolveGlobalRoot,
  getGlobalConfigPath,
  loadGlobalKbConfig,
  detectGitRemoteUrl,
  computeProjectId,
  getProjectSlug,
  getGlobalProjectDir,
  getGlobalDocsDir,
  hasLocalWhytcard,
  ensureDir,
  safeWriteJson,
  ensureLocator,
  ensureGlobalConfig,
  ensureKbSkeleton,
  ensureIndexMd,
  ensureOnboardingBrainstorm,
  ensureGlobalProjectLayout,
  tryCreateDirLink,
};

