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
  uiKit: 'lib/ui-kit',
  components: '_components',
  tasks: '_tasks',
  logic: '_logic',
  stores: '_stores',
};
const DEFAULTS = {
  stack: [],
  root: 'src',
  lib: null,
  tasks: null,
  stores: null,
  types: null,
  folders: DEFAULT_FOLDERS,
  maxFileLines: 120,
  storeAccess: 'direct',
  apps: null,
  shared: null,
};

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

// Said of a pure zone set apart by the `lib` key.
const APART = ' (set by "lib": outside every level; the root level holds no pure zone)';

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

// A path with one kind of slash and no empty or "." parts: "./client\src/" -> "client/src".
const normalPath = (path) =>
  path
    .replace(/\\/g, '/')
    .split('/')
    .filter((part) => part !== '' && part !== '.')
    .join('/');
const isInside = (path, folder) => path === folder || path.startsWith(`${folder}/`);

// The `lib` key: the pure zone set apart from the root level, relative to the project root. Returns the folder, or
// null when the pure zone stays at its default place under the root (no key, a bad value, or the default place).
function resolveLib(value, label, root, folders, problems) {
  if (!isText(value)) {
    problems.push(`"${label}" is not a folder name`);
    return null;
  }
  if (/^([\\/]|[A-Za-z]:)/.test(value.trim()) || value.split(/[\\/]/).includes('..')) {
    problems.push(`"${label}" is not a folder path relative to the project root`);
    return null;
  }
  const lib = normalPath(value.trim());
  const rootPath = normalPath(root);
  if (!lib) {
    problems.push(`"${label}" is not a folder name`);
    return null;
  }
  if (isInside(rootPath, lib)) {
    problems.push(`"${label}" holds the root level, so it is ignored`);
    return null;
  }
  if (isInside(lib, rootPath)) {
    if (lib === normalPath(`${rootPath}/${folders.lib}`)) return null;
    problems.push(`"${label}" lies inside the root level, where the pure zone is set only by "folders.lib", so it is ignored`);
    return null;
  }
  return lib;
}

// The pure zone and the ui-kit of one app. With `lib` set, the ui-kit lies inside it as it lies inside the lib
// folder by default: "lib/ui-kit" becomes "<lib>/ui-kit"; a ui-kit set outside "folders.lib" is taken as
// relative to `lib`.
function pureZone(root, lib, folders) {
  if (!lib) return { lib: `${root}/${folders.lib}`, uiKit: `${root}/${folders.uiKit}`, apart: false };
  const libName = normalPath(folders.lib);
  const uiKit = normalPath(folders.uiKit);
  let inside = uiKit;
  if (uiKit === libName) inside = '';
  else if (uiKit.startsWith(`${libName}/`)) inside = uiKit.slice(libName.length + 1);
  return { lib, uiKit: inside ? `${lib}/${inside}` : lib, apart: true };
}

// The parent folder of a path, '' for a path with one part.
const parentOf = (path) => (path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '');

// The app's tasks folder, stores folder and types folder (keys `tasks`, `stores` and `types`), relative to the
// project root. By default they lie next to the pure zone: next to the folder `lib` names, or at the root level
// without it. A bad value is named in `problems` and the default is used.
function appFolders(raw, prefix, root, lib, folders, problems) {
  const rootPath = normalPath(root);
  const zone = normalPath(pureZone(rootPath, lib, folders).lib);
  const base = lib ? parentOf(lib) : rootPath;
  const levelStores = `${rootPath}/${normalPath(folders.stores)}`;
  const result = {};
  for (const key of ['tasks', 'stores', 'types']) {
    const fallback = base ? `${base}/${key}` : key;
    const label = `${prefix}${key}`;
    result[key] = fallback;
    if (!(key in raw)) continue;
    const value = raw[key];
    if (!isText(value)) {
      problems.push(`"${label}" is not a folder name`);
      continue;
    }
    if (/^([\\/]|[A-Za-z]:)/.test(value.trim()) || value.split(/[\\/]/).includes('..')) {
      problems.push(`"${label}" is not a folder path relative to the project root`);
      continue;
    }
    const path = normalPath(value.trim());
    let why = null;
    if (!path) why = 'is not a folder name';
    else if (isInside(rootPath, path)) why = 'holds the root level';
    else if (isInside(path, zone)) why = 'lies inside the pure zone';
    else if (isInside(path, rootPath) && parentOf(path) !== rootPath) {
      why = 'lies inside the root level other than directly under it';
    } else if (path === levelStores) why = "is the root level's stores folder";
    else if (key !== 'tasks' && path === result.tasks) why = 'is the same folder as the tasks folder';
    else if (key === 'types' && path === result.stores) why = 'is the same folder as the stores folder';
    if (why) problems.push(`"${label}" ${why}, so it is ignored`);
    else result[key] = path;
  }
  return result;
}

// The `storeAccess` key: how the stores of the stores folders are reached. Any value but the two modes is named
// in `problems` and "direct" is used.
const STORE_ACCESS = {
  direct: "direct - a store is reached through the store's own API",
  closed:
    'closed - a store of a stores folder is a folder of plain data behind named reads and writes, reached only through them (core rule "Closed store access")',
};
function storeAccess(raw, label, problems) {
  if (!('storeAccess' in raw)) return 'direct';
  if (typeof raw.storeAccess === 'string' && Object.hasOwn(STORE_ACCESS, raw.storeAccess)) return raw.storeAccess;
  problems.push(`"${label}" is not "direct" or "closed", so "direct" is used`);
  return 'direct';
}

// Several apps of one repository: { name: { root, stack, lib, tasks, stores, types, storeAccess } }. Returns a
// list of { name, root, stack, lib, tasks, stores, types, storeAccess }, or null when there is no usable app, so
// the config falls back to one app.
function resolveApps(raw, folders, problems) {
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
    const root = app.root.trim();
    const lib = 'lib' in app ? resolveLib(app.lib, `apps.${name}.lib`, root, folders, problems) : null;
    const { tasks, stores, types } = appFolders(app, `apps.${name}.`, root, lib, folders, problems);
    const access = storeAccess(app, `apps.${name}.storeAccess`, problems);
    for (const key of Object.keys(app)) {
      if (!['root', 'stack', 'lib', 'tasks', 'stores', 'types', 'storeAccess'].includes(key)) {
        problems.push(`"apps.${name}.${key}" is not a known key`);
      }
    }
    apps.push({ name, root, stack, lib, tasks, stores, types, storeAccess: access });
  }
  if (!apps.length) {
    problems.push('"apps" has no usable app, so it is ignored and the project is one app');
    return null;
  }
  for (const key of ['root', 'stack', 'lib', 'tasks', 'stores', 'types', 'storeAccess']) {
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
        if (!Object.hasOwn(DEFAULT_FOLDERS, key)) problems.push(`"folders.${key}" is not a known key`);
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
  if ('apps' in raw) config.apps = resolveApps(raw, config.folders, problems);
  if ('lib' in raw && !config.apps) config.lib = resolveLib(raw.lib, 'lib', config.root, config.folders, problems);
  if (!config.apps) Object.assign(config, appFolders(raw, '', config.root, config.lib, config.folders, problems));
  if (!config.apps) config.storeAccess = storeAccess(raw, 'storeAccess', problems);
  if ('shared' in raw) {
    if (isText(raw.shared)) config.shared = raw.shared.trim();
    else problems.push('"shared" is not a folder name');
  }
  for (const key of Object.keys(raw)) {
    if (!Object.hasOwn(DEFAULTS, key)) problems.push(`"${key}" is not a known key`);
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
      const zone = pureZone(app.root, app.lib, f);
      lines.push(
        `- ${app.name}: root level ${app.root}/; stack ${stackText(app.stack)}; pure zone ${zone.lib}/${zone.apart ? APART : ''}; UI kit ${zone.uiKit}/. Tasks folder ${app.tasks}/, stores folder ${app.stores}/, types folder ${app.types}/. Store access: ${STORE_ACCESS[app.storeAccess]}.`
      );
    }
  } else {
    const zone = pureZone(config.root, config.lib, f);
    lines.push(
      `Stack: ${stackText(config.stack)}.`,
      `Root level: ${config.root}/. Pure zone: ${zone.lib}/${zone.apart ? APART : ''}. UI kit: ${zone.uiKit}/.`,
      `The app's tasks folder: ${config.tasks}/. Its stores folder: ${config.stores}/. Its types folder: ${config.types}/.`,
      `Store access: ${STORE_ACCESS[config.storeAccess]}.`
    );
  }
  if (config.shared) {
    lines.push(`Shared package: ${config.shared}/ - types and the runtime code two or more apps use; every app may import it, and it imports no app.`);
  }
  lines.push(
    `On every level: the own unit's non-UI code in ${f.logic}/ next to its entry - only the unit itself imports from it - and the tasks only it calls in ${f.logic}/${f.tasks}/; its stores in ${f.stores}/, never in ${f.logic}/; its types and constants files at the level root; shared child units in ${f.components}/.`,
    "Tasks that two or more units call, and the stores those tasks reach, live in the app's tasks folder and stores folder, outside every level; they import no level.",
    "The types those two folders and the units share live in the app's types folder, outside every level; any code of the app outside the pure zone may import it, and it imports only the pure zone and the shared package.",
    `File size limit: ${config.maxFileLines} lines; a longer file is a violation (test files and generated files are not checked).`
  );
  if (unknown.length) {
    lines.push(
      `Unknown stack names, skipped (no stack folder): ${unknown.join(', ')}. Available: ${available}. Tell the user.`
    );
  }
  if (problems.length) {
    lines.push(`Config problems (each value named here is not used: a key falls back to its default, an app is skipped): ${problems.join('; ')}. Tell the user.`);
  }
  lines.push(
    'Before writing, changing, moving or reviewing code structure, read the simple-architecture skill: the core first, then only the declared stacks' +
      (config.apps ? ' of the app whose root, or pure zone, holds the code.' : '.') +
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
