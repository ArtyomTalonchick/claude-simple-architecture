// SessionStart hook: tells the agent whether the project follows Simple Architecture,
// which stack it declares, and that the skill is read before writing code.
// Plain stdout of a SessionStart hook is added to the session as context.
// It never fails the session: any error ends with exit code 0.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PREFIX = 'Simple Architecture stack:';

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
    return readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .map((name) => name.slice(0, -3))
      .sort();
  } catch {
    return [];
  }
}

// Returns the list after the colon of the first stack line, or null when there is no such line.
function declaredStack(root) {
  let text;
  try {
    text = readFileSync(join(root, 'CLAUDE.md'), 'utf8');
  } catch {
    return null;
  }
  for (const line of text.replace(/^﻿/, '').split(/\r?\n/)) {
    const trimmed = line.replace(/^ +/, '');
    if (trimmed.startsWith(PREFIX)) {
      const names = trimmed
        .slice(PREFIX.length)
        .split(',')
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean);
      return [...new Set(names)];
    }
  }
  return null;
}

function main() {
  const known = knownStacks();
  const declared = declaredStack(projectRoot());
  const available = known.length ? known.join(', ') : 'none';

  if (declared === null) {
    console.log(
      'Simple Architecture: this project does not follow it - its root CLAUDE.md has no stack line. ' +
        `To opt in, add a line such as "${PREFIX} ${known.slice(0, 2).join(', ') || 'react'}" ` +
        `(available stacks: ${available}; an empty list means core rules only).`
    );
    return;
  }

  // If the stack files cannot be listed, trust the declared names rather than call them all unknown.
  const used = known.length ? declared.filter((name) => known.includes(name)) : declared;
  const unknown = known.length ? declared.filter((name) => !known.includes(name)) : [];
  const lines = [
    'This project follows Simple Architecture (declared in its root CLAUDE.md).',
    `Declared stack: ${used.length ? used.join(', ') : 'none - core rules only'}.`,
  ];
  if (unknown.length) {
    lines.push(
      `Unknown stack names, skipped (no stack file): ${unknown.join(', ')}. Available: ${available}. Tell the user.`
    );
  }
  lines.push(
    'Before writing, changing, moving or reviewing code structure, read the simple-architecture skill: the core first, then only the declared stack files.'
  );
  console.log(lines.join('\n'));
}

try {
  main();
} catch {
  // Never block the session.
}
process.exit(0);
