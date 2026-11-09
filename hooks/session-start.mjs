// SessionStart hook: tells the agent whether the project follows Simple Architecture, the resolved values of
// its config, and that the skill is read before writing code.
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
};
const DEFAULTS = { stack: [], root: 'src', folders: DEFAULT_FOLDERS, maxFileLines: 150 };

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

function knownStacks() {
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
  const dir = join(pluginRoot, 'skills', 'simple-architecture', 'references', 'stack');
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

// Applies the defaults; every value of the wrong type is replaced by its default and noted in `problems`.
function resolveConfig(raw) {
  const problems = [];
  const config = { ...DEFAULTS, folders: { ...DEFAULT_FOLDERS } };

  if ('stack' in raw) {
    if (Array.isArray(raw.stack) && raw.stack.every(isText)) {
      config.stack = [...new Set(raw.stack.map((name) => name.trim().toLowerCase()))];
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
      `Simple Architecture: this project does not follow it - it has no ${CONFIG_PATH}. ` +
        `To opt in, create that file, for example {"stack": ["${known[0] || 'react'}"]} ` +
        `(available stacks: ${available}; every key is optional, see the simple-architecture skill).`
    );
    return;
  }
  if (read.status === 'invalid') {
    console.log(
      `Simple Architecture: ${CONFIG_PATH} cannot be read (${read.error}). Tell the user. ` +
        'Until it is fixed, do not apply or judge code by the Simple Architecture rules.'
    );
    return;
  }

  const { config, problems } = resolveConfig(read.raw);
  // If the stack folders cannot be listed, trust the declared names rather than call them all unknown.
  const used = known.length ? config.stack.filter((name) => known.includes(name)) : config.stack;
  const unknown = known.length ? config.stack.filter((name) => !known.includes(name)) : [];
  const f = config.folders;

  const lines = [
    `This project follows Simple Architecture (${CONFIG_PATH}).`,
    `Stack: ${used.length ? used.join(', ') : 'none - core rules only'}.`,
    `Root level: ${config.root}/. Pure zone: ${config.root}/${f.lib}/. UI kit: ${config.root}/${f.uiKit}/.`,
    `Shared folders on every level: ${f.components}/, ${f.hooks}/, ${f.helpers}/.`,
    `File size warning above ${config.maxFileLines} lines.`,
  ];
  if (unknown.length) {
    lines.push(
      `Unknown stack names, skipped (no stack folder): ${unknown.join(', ')}. Available: ${available}. Tell the user.`
    );
  }
  if (problems.length) {
    lines.push(`Config problems (the value is ignored, its default is used): ${problems.join('; ')}. Tell the user.`);
  }
  lines.push(
    'Before writing, changing, moving or reviewing code structure, read the simple-architecture skill: the core first, then only the declared stacks. Use the folder names above wherever the rules name a default.'
  );
  console.log(lines.join('\n'));
}

try {
  main();
} catch {
  // Never block the session.
}
process.exit(0);
