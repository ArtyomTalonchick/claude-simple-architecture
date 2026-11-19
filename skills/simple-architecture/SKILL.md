---
name: simple-architecture
description: Rules for code structure by Simple Architecture — layers, module boundaries, dependency direction. Use when writing, changing, moving or reviewing code structure (new files, modules, imports, where code belongs) in a project that has a `.claude/simple-architecture/config.json`.
---

# Simple Architecture

Rules for how code is split into layers and modules. They come in two parts:

- **Core** — applies to every project. Names no technology.
- **Stack** — one file per technology. A project loads only the files for the stack it declares.

## The principle

Architecture exists to cut the human effort of building and keeping a system. Of that effort, changing code that
exists matters more than adding new code: a feature is added once and changed many times.

So when two ways to write something both work, pick the one that is easier to change later, even if it takes
longer to write now. Every rule below serves this. When a case is not covered by a rule, decide it by this
principle.

## When it applies

Use these rules when you write, change, move or review code structure — new files and modules, imports, where a
piece of code belongs — in a project that follows Simple Architecture. A project follows it when it has the
config file `.claude/simple-architecture/config.json` (see below).

## Order of reading

1. The core: [references/core/](references/core/README.md) and every rule file in it. Core rules come first and
   always apply.
2. The stacks the project declares, in the order it lists them: for each, `references/stack/<name>/README.md`
   and every rule file in that folder. A stack rule file is named as the core rule it carries out; it says how
   that rule is carried out with one technology and never overrides it.

Do not read stacks the project does not declare. In a project with several apps (`apps` in the config), read the
core and then only the stacks of the app whose root, pure zone set by `lib`, tasks folder or stores folder holds the
code; code in the shared types package gets the core only.

## The config

A project opts in with one file at its root: `.claude/simple-architecture/config.json`. Every key is optional;
a missing key takes its default. The full file with the defaults:

```json
{
  "stack": [],
  "root": "src",
  "folders": {
    "lib": "lib",
    "uiKit": "lib/components",
    "components": "_components",
    "tasks": "_tasks",
    "logic": "_logic",
    "stores": "_stores"
  },
  "maxFileLines": 120
}
```

- **`stack`** — the stacks to read, in order. Each name is a stack folder: `react` means
  `references/stack/react/`. Names are compared in lower case. An unknown name is skipped, and the user is told
  it has no stack folder. An empty list means core rules only.
- **`root`** — the folder of the app's root level, relative to the project root.
- **`lib`** — optional, no default: the folder of the pure zone set apart from the root level, relative to the
  project root, as `root` is — for example `"root": "src/App", "lib": "src/lib"`. The pure zone then lies outside
  every level, and the root level holds no pure zone. Without it, the pure zone is `folders.lib` under `root`. A
  value inside the root level other than that default place, a value that holds the root level, and an absolute
  path or one with `..` are ignored, and the user is told.
- **`tasks`**, **`stores`** — optional: the app's tasks folder and stores folder, relative to the project root, as
  `lib` is. They hold what the app's units share of its business code — the tasks that two or more units call, and
  the stores those tasks reach — outside every level
  ([Levels and placement](references/core/levels.md)). By default they lie next to the pure zone: `tasks` and
  `stores` next to the folder `lib` names, or, without `lib`, at the root level (`<root>/tasks`, `<root>/stores`).
  They are not `folders.tasks` and `folders.stores`, which name folders inside a level. A value that is absolute or
  has `..`, one that holds the root level, one inside the pure zone, one inside the root level other than a folder
  directly under it, and one that is the same folder as the other key or as the root level's stores folder are
  ignored, the default is used, and the user is told.
- **`folders.lib`** — the pure zone, relative to `root`. When `lib` is set, `lib` takes its place.
- **`folders.uiKit`** — the ui-kit, relative to `root`. Wherever it lives, it belongs to the pure zone. Its name
  is set here on its own and does not follow `folders.components`: the ui-kit is part of the pure zone, not a
  level's shared components folder. When `lib` is set, the ui-kit lies inside it as it lies inside `folders.lib`:
  the default `lib/components` becomes `<lib>/components`, and a ui-kit set outside `folders.lib` is taken as
  relative to `lib`.
- **`folders.logic`** — the name of the folder next to a level's entry that holds the own unit's non-UI code but
  its stores — the Presenter, stateful logic, plain functions and its tasks, as files or entry folders. Only the
  unit's entry and the files of the folder import from it. A level's types and constants files lie at the level
  root, not in it.
- **`folders.tasks`** — the name of the tasks folder inside the logic folder: the tasks only its unit calls.
- **`folders.stores`** — the name of the folder next to a level's entry that holds the level's stores: data that
  lives longer than one call and is shared by the code that reads it — the own unit's, and the stores the level's
  units share, UI state or data their tasks reach — as files, or as store entry folders for a store with parts only
  it uses.
- **`folders.components`** — the name of the folder for the child units that two or more units of a level share.
- The same names are used on every level.
- **`maxFileLines`** — a positive whole number: the size above which a file is a violation. Test files and files
  written by a tool are not checked.

A repository with several apps — a client, a server and a package of types they share — declares them instead of
`root`, `stack`, `lib`, `tasks` and `stores`:

```json
{
  "apps": {
    "client": { "root": "client/src/App", "lib": "client/src/lib", "stack": ["react", "zustand"] },
    "server": { "root": "server/src", "stack": [] }
  },
  "shared": "shared/src"
}
```

- **`apps`** — the apps, by name. Each has a **`root`** (required), relative to the project root, a **`stack`**
  (default `[]`), read as the top-level `stack` is, and a **`lib`**, a **`tasks`** and a **`stores`** (optional),
  read as the top-level keys are. Each app is checked on its own: its levels start at its root, its pure zone and
  ui-kit are relative to its root or set by its `lib`, its tasks folder and stores folder lie by its own keys, and
  only its own stacks apply. An app without `root` is skipped, and the user is told.
  With at least one usable app, the top-level `root`, `stack`, `lib`, `tasks` and `stores` are ignored;
  `folders` and `maxFileLines` apply to every app. With none — `apps` is empty, is not an object, or every app in
  it is skipped — `apps` is ignored, the user is told, and the project is one app, as without `apps`.
- **`shared`** — the shared types package, relative to the project root: types only, imported by every app,
  importing no app ([Imports](references/core/imports.md)). Optional, with or without `apps`.

The rules name a folder by its role and its default, for example "the logic folder (default `_logic/`)"; in a
project, use the configured name.

A value of the wrong type is ignored, its default is used, and the user is told; so is an unknown key. A file
that is not valid JSON, or whose top level is not an object, means the config cannot be read: tell the user, and
do not apply or judge by the rules until it is fixed. No file means the project does not follow Simple Architecture.

At session start a hook reads the config and passes the resolved values to the agent. When those values are not
in the context (a subagent, a hook that did not run), read the config by the rules above.

## Reference files

- [references/core/](references/core/README.md) — core rules.
- [references/stack/react/](references/stack/react/README.md) — React.
- [references/stack/zustand/](references/stack/zustand/README.md) — Zustand.

Every rule follows the template in `docs/rule-format.md` of this plugin's repository.
