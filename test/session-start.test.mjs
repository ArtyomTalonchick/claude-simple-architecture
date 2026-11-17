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
  assert.match(
    out,
    /On every level: its non-UI code in _logic\/ next to its entry, tasks in _logic\/_tasks\/; its stores in _stores\/, never in _logic\/; shared child units in _components\/\./
  );
  assert.match(out, /File size limit: 120 lines; a longer file is a violation \(test files and generated files are not checked\)\./);
  assert.doesNotMatch(out, /problems|Unknown/);
});

test('full config: its values are used', () => {
  const out = runHook(
    JSON.stringify({
      stack: ['React', 'zustand', 'react'],
      root: 'app',
      folders: { lib: 'shared', uiKit: 'ui-kit', components: 'parts', tasks: 'actions', logic: 'own', stores: 'state' },
      maxFileLines: 200,
    })
  );
  assert.match(out, /Stack: react, zustand\./);
  assert.match(out, /Root level: app\/\. Pure zone: app\/shared\/\. UI kit: app\/ui-kit\/\./);
  assert.match(
    out,
    /On every level: its non-UI code in own\/ next to its entry, tasks in own\/actions\/; its stores in state\/, never in own\/; shared child units in parts\/\./
  );
  assert.match(out, /File size limit: 200 lines; a longer file is a violation \(/);
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
    JSON.stringify({ stack: 'react', root: 1, folders: { store: 'x', toString: 'y', tasks: 5 }, maxFileLines: 0, extra: true })
  );
  assert.match(out, /Stack: none - core rules only\./);
  assert.match(out, /Root level: src\//);
  assert.match(out, /tasks in _logic\/_tasks\//);
  assert.match(out, /File size limit: 120 lines; a longer file is a violation \(/);
  for (const problem of [
    '"stack" is not a list of names',
    '"root" is not a folder name',
    '"folders.store" is not a known key',
    '"folders.toString" is not a known key',
    '"folders.tasks" is not a folder name',
    '"maxFileLines" is not a positive whole number',
    '"extra" is not a known key',
  ]) {
    assert.ok(out.includes(problem), `names the problem: ${problem}`);
  }
});

test('the removed keys folders.hooks and folders.helpers get the unknown-key notice', () => {
  const out = runHook(JSON.stringify({ folders: { hooks: 'use', helpers: 'utils', logic: 'own' } }));
  assert.ok(out.includes('"folders.hooks" is not a known key'), 'names folders.hooks');
  assert.ok(out.includes('"folders.helpers" is not a known key'), 'names folders.helpers');
  assert.match(out, /its non-UI code in own\/ next to its entry/);
  assert.doesNotMatch(out, /use\/|utils\//);
});

test('folders.stores: a custom name is used, and a value of the wrong type falls back to _stores', () => {
  const custom = runHook(JSON.stringify({ folders: { stores: 'data' } }));
  assert.match(custom, /its stores in data\/, never in _logic\//);
  assert.doesNotMatch(custom, /problems|stores\//);

  const wrong = runHook(JSON.stringify({ folders: { stores: 3 } }));
  assert.match(wrong, /its stores in _stores\/, never in _logic\//);
  assert.ok(wrong.includes('"folders.stores" is not a folder name'), 'names folders.stores');
});

test('folders.components does not rename the ui-kit', () => {
  const out = runHook(JSON.stringify({ folders: { components: 'parts' } }));
  assert.match(out, /UI kit: src\/lib\/components\/\./);
  assert.match(out, /shared child units in parts\/\./);
});

test('a byte order mark at the start of the file is ignored', () => {
  const out = runHook('﻿{"stack": ["react"]}');
  assert.match(out, /Stack: react\./);
});

test('several apps and a shared types package: each app with its own root and stack', () => {
  const out = runHook(
    JSON.stringify({
      apps: { client: { root: 'client/src', stack: ['React'] }, server: { root: 'server/src' } },
      shared: 'shared/src',
    })
  );
  assert.match(out, /an app never imports from another app/);
  assert.match(out, /- client: root level client\/src\/; stack react; pure zone client\/src\/lib\//);
  assert.match(out, /- server: root level server\/src\/; stack none - core rules only;/);
  assert.match(out, /Shared types package: shared\/src\/ - types only; every app may import it, and it imports no app\./);
  assert.match(out, /only the declared stacks of the app whose root holds the code\./);
  assert.doesNotMatch(out, /Root level: src|problems|Unknown/);
});

test('apps with mistakes: bad entries are skipped and named, top-level root and stack are ignored', () => {
  const out = runHook(
    JSON.stringify({
      root: 'src',
      stack: ['react'],
      apps: { web: { root: 'web', stack: ['vue'], extra: 1 }, broken: { stack: [] }, bad: { root: 'x', stack: 'react' } },
      shared: 5,
    })
  );
  assert.match(out, /- web: root level web\/; stack none - core rules only;/);
  assert.match(out, /- bad: root level x\/;/);
  assert.match(out, /Unknown stack names, skipped \(no stack folder\): vue\./);
  for (const problem of [
    '"apps.broken" has no "root" folder name, so it is skipped',
    '"apps.bad.stack" is not a list of names',
    '"apps.web.extra" is not a known key',
    '"root" is ignored because "apps" is set',
    '"stack" is ignored because "apps" is set',
    '"shared" is not a folder name',
  ]) {
    assert.ok(out.includes(problem), `names the problem: ${problem}`);
  }
});

test('apps with no usable app: one app as before, with the top-level root and stack', () => {
  for (const apps of [{ broken: {} }, {}]) {
    const out = runHook(JSON.stringify({ stack: ['react'], root: 'app', apps }));
    assert.match(out, /Stack: react\./);
    assert.match(out, /Root level: app\//);
    assert.ok(out.includes('"apps" has no usable app, so it is ignored and the project is one app'));
    assert.ok(!out.includes('is ignored because "apps" is set'), 'the top-level root and stack are used');
  }
});

test('the config problems heading covers a skipped app as well as an ignored key', () => {
  const out = runHook(JSON.stringify({ apps: { web: { root: 'web' }, broken: {} }, maxFileLines: 'x' }));
  assert.ok(out.includes('Config problems (each value named here is not used: a key falls back to its default, an app is skipped)'));
  assert.ok(out.includes('"apps.broken" has no "root" folder name, so it is skipped'));
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
