// SessionStart hook: tells the agent whether the project follows Simple Architecture, the resolved values of
// its config, the plugin version in use, and that the skill is read before writing code.
// Plain stdout of a SessionStart hook is added to the session as context.
// It never fails the session: any error ends with exit code 0.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_PATH = '.claude/simple-architecture/config.json';

const DEFAULT_FOLDERS = {
  lib: 'lib',
  uiKit: 'lib/components',
  components: 'components',
  hooks: 'hooks',
  helpers: 'helpers',
  tasks: 'tasks',
  logic: 'logic',
};
const DEFAULTS = { stack: [], root: 'src', folders: DEFAULT_FOLDERS, maxFileLines: 120, apps: null, shared: null };

function readStdinJson() {
  try {
    if (process.stdin.isTTY) return {};
    const text = readFileSync(0, 'utf8').trim();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function projectRoot() {
  if (process.env.CLAUDE_PROJECT_DIR) return process.env.CLAUDE_PROJECT_DIR;
  const input = readStdinJson();
  if (typeof input.cwd === 'string' && input.cwd) return input.cwd;
  return process.cwd();
}

const pluginRoot = () => process.env.CLAUDE_PLUGIN_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
const rulesFolder = () => join(pluginRoot(), 'skills', 'simple-architecture');

// The version this session loaded, from the plugin's own manifest; null when it cannot be read.
function pluginVersion() {
  try {
    const manifest = JSON.parse(
      readFileSync(join(pluginRoot(), '.claude-plugin', 'plugin.json'), 'utf8').replace(/^﻿/, '')
    );
    return isText(manifest.version) ? manifest.version.trim() : null;
  } catch {
    return null;
  }
}

function versionLine() {
  const version = pluginVersion();
  return `Simple Architecture plugin version in this session: ${version || 'unknown'}.`;
}

function knownStacks() {
  const dir = join(rulesFolder(), 'references', 'stack');
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

const isText = (value) => typeof value === 'string' && value.trim() !== '';

// Returns { status: 'missing' } | { status: 'invalid', error } | { status: 'ok', raw }.
function readConfig(root) {
  let text;
  try {
    text = readFileSync(join(root, CONFIG_PATH), 'utf8');
  } catch {
    return { status: 'missing' };
  }
  try {
    const raw = JSON.parse(text.replace(/^﻿/, ''));
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      return { status: 'invalid', error: 'the top level is not an object' };
    }
    return { status: 'ok', raw };
  } catch (error) {
    return { status: 'invalid', error: error.message };
  }
}

const stackList = (value) => [...new Set(value.map((name) => name.trim().toLowerCase()))];

// Several apps of one repository: { name: { root, stack } }. Returns a list of { name, root, stack }, or null when
// there is no usable app, so the config falls back to one app.
function resolveApps(raw, problems) {
  if (!raw.apps || typeof raw.apps !== 'object' || Array.isArray(raw.apps)) {
    problems.push('"apps" is not an object');
    return null;
  }
  const apps = [];
  for (const [name, app] of Object.entries(raw.apps)) {
    if (!app || typeof app !== 'object' || Array.isArray(app) || !isText(app.root)) {
      problems.push(`"apps.${name}" has no "root" folder name, so it is skipped`);
      continue;
    }
    let stack = [];
    if ('stack' in app) {
      if (Array.isArray(app.stack) && app.stack.every(isText)) stack = stackList(app.stack);
      else problems.push(`"apps.${name}.stack" is not a list of names`);
    }
    for (const key of Object.keys(app)) {
      if (key !== 'root' && key !== 'stack') problems.push(`"apps.${name}.${key}" is not a known key`);
    }
    apps.push({ name, root: app.root.trim(), stack });
  }
  if (!apps.length) {
    problems.push('"apps" has no usable app');
    return null;
  }
  for (const key of ['root', 'stack']) {
    if (key in raw) problems.push(`"${key}" is ignored because "apps" is set`);
  }
  return apps;
}

// Applies the defaults; every value of the wrong type is replaced by its default and noted in `problems`.
function resolveConfig(raw) {
  const problems = [];
  const config = { ...DEFAULTS, folders: { ...DEFAULT_FOLDERS } };

  if ('stack' in raw) {
    if (Array.isArray(raw.stack) && raw.stack.every(isText)) {
      config.stack = stackList(raw.stack);
    } else {
      problems.push('"stack" is not a list of names');
    }
  }
  if ('root' in raw) {
    if (isText(raw.root)) config.root = raw.root.trim();
    else problems.push('"root" is not a folder name');
  }
  if ('folders' in raw) {
    if (raw.folders && typeof raw.folders === 'object' && !Array.isArray(raw.folders)) {
      for (const [key, value] of Object.entries(raw.folders)) {
        if (!(key in DEFAULT_FOLDERS)) problems.push(`"folders.${key}" is not a known key`);
        else if (isText(value)) config.folders[key] = value.trim();
        else problems.push(`"folders.${key}" is not a folder name`);
      }
    } else {
      problems.push('"folders" is not an object');
    }
  }
  if ('maxFileLines' in raw) {
    if (Number.isInteger(raw.maxFileLines) && raw.maxFileLines > 0) config.maxFileLines = raw.maxFileLines;
    else problems.push('"maxFileLines" is not a positive whole number');
  }
  if ('apps' in raw) config.apps = resolveApps(raw, problems);
  if ('shared' in raw) {
    if (isText(raw.shared)) config.shared = raw.shared.trim();
    else problems.push('"shared" is not a folder name');
  }
  for (const key of Object.keys(raw)) {
    if (!(key in DEFAULTS)) problems.push(`"${key}" is not a known key`);
  }
  return { config, problems };
}

function main() {
  const known = knownStacks();
  const available = known.length ? known.join(', ') : 'none';
  const read = readConfig(projectRoot());

  if (read.status === 'missing') {
    console.log(
      `${versionLine()} ` +
        `Simple Architecture: this project does not follow it - it has no ${CONFIG_PATH}. ` +
        `To opt in, create that file, for example {"stack": ["${known[0] || 'react'}"]} ` +
        `(available stacks: ${available}; every key is optional, see the simple-architecture skill).`
    );
    return;
  }
  if (read.status === 'invalid') {
    console.log(
      `${versionLine()} ` +
        `Simple Architecture: ${CONFIG_PATH} cannot be read (${read.error}). Tell the user. ` +
        'Until it is fixed, do not apply or judge code by the Simple Architecture rules.'
    );
    return;
  }

  const { config, problems } = resolveConfig(read.raw);
  // If the stack folders cannot be listed, trust the declared names rather than call them all unknown.
  const usedOf = (stack) => (known.length ? stack.filter((name) => known.includes(name)) : stack);
  const stackText = (stack) => (usedOf(stack).length ? usedOf(stack).join(', ') : 'none - core rules only');
  const declared = config.apps ? config.apps.flatMap((app) => app.stack) : config.stack;
  const unknown = known.length ? [...new Set(declared.filter((name) => !known.includes(name)))] : [];
  const f = config.folders;

  const lines = [
    `This project follows Simple Architecture (${CONFIG_PATH}).`,
    `${versionLine()} Its rules: ${rulesFolder()}. Pass this folder to the architecture-reviewer agent, so it checks against the same rules as the skill.`,
  ];
  if (config.apps) {
    lines.push('Apps - each is checked on its own, by the core and its own stacks; an app never imports from another app:');
    for (const app of config.apps) {
      lines.push(
        `- ${app.name}: root level ${app.root}/; stack ${stackText(app.stack)}; pure zone ${app.root}/${f.lib}/; UI kit ${app.root}/${f.uiKit}/.`
      );
    }
  } else {
    lines.push(
      `Stack: ${stackText(config.stack)}.`,
      `Root level: ${config.root}/. Pure zone: ${config.root}/${f.lib}/. UI kit: ${config.root}/${f.uiKit}/.`
    );
  }
  if (config.shared) {
    lines.push(`Shared types package: ${config.shared}/ - types only; every app may import it, and it imports no app.`);
  }
  lines.push(
    `Shared folders on every level: ${f.components}/, ${f.hooks}/, ${f.helpers}/, ${f.tasks}/. A unit's own logic: ${f.logic}/ next to its View.`,
    `File size limit: ${config.maxFileLines} lines; a longer file is a violation (test files and generated files are not checked).`
  );
  if (unknown.length) {
    lines.push(
      `Unknown stack names, skipped (no stack folder): ${unknown.join(', ')}. Available: ${available}. Tell the user.`
    );
  }
  if (problems.length) {
    lines.push(`Config problems (the value is ignored, its default is used): ${problems.join('; ')}. Tell the user.`);
  }
  lines.push(
    'Before writing, changing, moving or reviewing code structure, read the simple-architecture skill: the core first, then only the declared stacks' +
      (config.apps ? ' of the app whose root holds the code.' : '.') +
      ' Use the folder names above wherever the rules name a default.'
  );
  console.log(lines.join('\n'));
}

try {
  main();
} catch {
  // Never block the session.
}
process.exit(0);
