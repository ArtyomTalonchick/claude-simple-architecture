// Tests for hooks/session-start.mjs. The hook runs as a black box: each test makes a temporary project, runs the
// hook with CLAUDE_PROJECT_DIR pointing at it, and checks what the agent would get — stdout and exit code 0.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const hook = join(pluginRoot, 'hooks', 'session-start.mjs');
const version = JSON.parse(readFileSync(join(pluginRoot, '.claude-plugin', 'plugin.json'), 'utf8')).version;

// Runs the hook for a project with the given config text; null means no config file. `root` is the plugin root
// the hook is told it runs from.
function runHook(configText, root = pluginRoot) {
  const project = mkdtempSync(join(tmpdir(), 'sa-hook-'));
  try {
    if (configText !== null) {
      const dir = join(project, '.claude', 'simple-architecture');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'config.json'), configText);
    }
    const result = spawnSync(process.execPath, [hook], {
      env: { ...process.env, CLAUDE_PROJECT_DIR: project, CLAUDE_PLUGIN_ROOT: root },
      input: '',
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, 'the hook always exits with 0');
    return result.stdout;
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
}

test('no config: the project does not follow it and is told how to opt in', () => {
  const out = runHook(null);
  assert.match(out, /does not follow it/);
  assert.match(out, /\.claude\/simple-architecture\/config\.json/);
  assert.match(out, /available stacks: react, zustand/);
});

test('empty config: every default', () => {
  const out = runHook('{}');
  assert.match(out, /This project follows Simple Architecture/);
  assert.match(out, /Stack: none - core rules only\./);
  assert.match(out, /Root level: src\/\. Pure zone: src\/lib\/\. UI kit: src\/lib\/components\/\./);
  assert.match(out, /Shared folders on every level: components\/, hooks\/, helpers\/\./);
  assert.match(out, /File size warning above 150 lines\./);
  assert.doesNotMatch(out, /problems|Unknown/);
});

test('full config: its values are used', () => {
  const out = runHook(
    JSON.stringify({
      stack: ['React', 'zustand', 'react'],
      root: 'app',
      folders: { lib: 'shared', uiKit: 'ui-kit', components: 'parts', hooks: 'use', helpers: 'utils' },
      maxFileLines: 200,
    })
  );
  assert.match(out, /Stack: react, zustand\./);
  assert.match(out, /Root level: app\/\. Pure zone: app\/shared\/\. UI kit: app\/ui-kit\/\./);
  assert.match(out, /Shared folders on every level: parts\/, use\/, utils\/\./);
  assert.match(out, /File size warning above 200 lines\./);
  assert.doesNotMatch(out, /problems|Unknown/);
});

test('unknown stack name: skipped, and the user is told', () => {
  const out = runHook('{"stack": ["react", "vue"]}');
  assert.match(out, /Stack: react\./);
  assert.match(out, /Unknown stack names, skipped \(no stack folder\): vue\./);
});

test('invalid JSON: the config cannot be read', () => {
  const out = runHook('{"stack": [');
  assert.match(out, /cannot be read/);
  assert.match(out, /do not apply or judge code/);
});

test('a top level that is not an object: the config cannot be read', () => {
  const out = runHook('[]');
  assert.match(out, /cannot be read \(the top level is not an object\)/);
});

test('wrong types and unknown keys: defaults are used and each problem is named', () => {
  const out = runHook(
    JSON.stringify({ stack: 'react', root: 1, folders: { store: 'x', hooks: 5 }, maxFileLines: 0, extra: true })
  );
  assert.match(out, /Stack: none - core rules only\./);
  assert.match(out, /Root level: src\//);
  assert.match(out, /hooks\/, helpers\//);
  assert.match(out, /File size warning above 150 lines\./);
  for (const problem of [
    '"stack" is not a list of names',
    '"root" is not a folder name',
    '"folders.store" is not a known key',
    '"folders.hooks" is not a folder name',
    '"maxFileLines" is not a positive whole number',
    '"extra" is not a known key',
  ]) {
    assert.ok(out.includes(problem), `names the problem: ${problem}`);
  }
});

test('a byte order mark at the start of the file is ignored', () => {
  const out = runHook('﻿{"stack": ["react"]}');
  assert.match(out, /Stack: react\./);
});

test('the plugin version is named in every branch, and the rules folder when the project follows it', () => {
  const line = `Simple Architecture plugin version in this session: ${version}.`;
  for (const configText of [null, '{}', '{"stack": [']) {
    assert.ok(runHook(configText).includes(line), `names the version for config ${configText}`);
  }
  const out = runHook('{}');
  assert.ok(out.includes(`Its rules: ${join(pluginRoot, 'skills', 'simple-architecture')}.`), 'names the rules folder');
  assert.match(out, /Pass this folder to the architecture-reviewer agent/);
});

test('a plugin root without a manifest: the version is unknown and the hook still prints', () => {
  const root = mkdtempSync(join(tmpdir(), 'sa-plugin-'));
  try {
    const out = runHook('{}', root);
    assert.match(out, /plugin version in this session: unknown./);
    assert.match(out, /This project follows Simple Architecture/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
