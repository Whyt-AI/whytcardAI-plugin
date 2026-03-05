/**
 * WhytCard Knowledge Base (KB) helpers.
 *
 * Goal: enable "local vs global" .whytcard storage with near-zero friction.
 *
 * Notes:
 * - Hooks should remain fast and safe: this module only reads small files and
 *   computes paths. It does NOT create directories by default.
 * - Any actual filesystem writes are meant to be performed by the agent during
 *   onboarding (from instructions injected in wc-session-start).
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

function getDefaultGlobalRoot() {
  return path.join(os.homedir(), ".whytcard");
}

function getGlobalConfigPath(globalRoot) {
  const root = globalRoot || getDefaultGlobalRoot();
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

function loadGlobalKbConfig(globalRoot) {
  const cfgPath = getGlobalConfigPath(globalRoot);
  const cfg = safeReadJson(cfgPath);
  if (!cfg) return null;
  return cfg;
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
  const root = globalRoot || getDefaultGlobalRoot();
  const slug = getProjectSlug(cwd);
  const id = computeProjectId(cwd);
  return path.join(root, "projects", `${slug}-${id}`);
}

function hasLocalWhytcard(cwd) {
  const whytcardPath = path.join(cwd, ".whytcard");
  try {
    // lstatSync returns info about the path itself, and succeeds even for
    // dangling symlinks. This lets us distinguish "no .whytcard at all"
    // from "a .whytcard symlink whose target is missing".
    fs.lstatSync(whytcardPath);
    return true;
  } catch (err) {
    if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) {
      return false;
    }
    // For any unexpected error, fail closed and report "no local whytcard".
    return false;
  }
}

module.exports = {
  getDefaultGlobalRoot,
  getGlobalConfigPath,
  loadGlobalKbConfig,
  detectGitRemoteUrl,
  computeProjectId,
  getProjectSlug,
  getGlobalProjectDir,
  hasLocalWhytcard,
};

