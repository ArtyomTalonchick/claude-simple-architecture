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
    "uiKit": "lib/ui-kit",
    "components": "_components",
    "tasks": "_tasks",
    "logic": "_logic",
    "stores": "_stores"
  },
  "maxFileLines": 120
}
```

- **`stack`** — the stacks to read, in order, each named by its stack folder: `react` means
  `references/stack/react/`. Default `[]`: core rules only.
- **`root`** — the folder of the app's root level, relative to the project root. Default `src`.
- **`lib`** — the folder of the pure zone set apart from the root level, relative to the project root, for example
  `"root": "src/App", "lib": "src/lib"`; the pure zone then lies outside every level. No default: without it, the
  pure zone is `folders.lib` under `root`.
- **`tasks`**, **`stores`** — the app's tasks folder and stores folder, relative to the project root: the tasks
  that two or more units call and the stores those tasks reach, outside every level
  ([Levels and placement](references/core/levels.md)); not `folders.tasks` and `folders.stores`. Default: next to
  the pure zone — next to the folder `lib` names, or, without `lib`, `<root>/tasks` and `<root>/stores`.
- **`folders.lib`** — the pure zone, relative to `root`; when `lib` is set, `lib` takes its place. Default `lib`.
- **`folders.uiKit`** — the ui-kit, relative to `root`: part of the pure zone, so its name does not follow
  `folders.components`. Default `lib/ui-kit`; with `lib` set, it lies inside `lib` as inside `folders.lib`
  (`<lib>/ui-kit`), and a ui-kit set outside `folders.lib` is taken as relative to `lib`.
- **`folders.logic`** — the folder next to a level's entry with the own unit's non-UI code but its stores — the
  Presenter, stateful logic, plain functions and its tasks — imported only by the unit's entry and the folder's own
  files. Default `_logic`.
- **`folders.tasks`** — the tasks folder inside the logic folder: the tasks only its unit calls. Default `_tasks`.
- **`folders.stores`** — the folder next to a level's entry with the level's stores — the own unit's and those the
  level's units share — as files or store entry folders. Default `_stores`.
- **`folders.components`** — the folder for the child units that two or more units of a level share. Default
  `_components`.
- The same folder names are used on every level.
- **`maxFileLines`** — the size in lines above which a file is a violation; test files and files written by a
  tool are not checked. Default `120`.

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

- **`apps`** — the apps, by name, each with a `root` (required), a `stack` (default `[]`) and an optional `lib`,
  `tasks` and `stores`, read as the top-level keys are; each app is checked on its own, from its own root, by
  its own stacks. In their place the top-level `root`, `stack`, `lib`, `tasks` and `stores` are ignored;
  `folders` and `maxFileLines` apply to every app.
- **`shared`** — the shared types package, relative to the project root: types only, imported by every app,
  importing no app ([Imports](references/core/imports.md)). Optional, no default, with or without `apps`.

The rules name a folder by its role and its default, for example "the logic folder (default `_logic/`)"; in a
project, use the configured name.

No file means the project does not follow Simple Architecture.

At session start a hook reads the config, passes the resolved values to the agent and names every value it could
not use. When those values are not in the context (a subagent, a hook that did not run), read the config by the
keys above, and handle a wrong value — or a file that cannot be read — by
[references/config.md](references/config.md).

## Reference files

- [references/core/](references/core/README.md) — core rules.
- [references/config.md](references/config.md) — what happens to a wrong value in the config.
- [references/stack/react/](references/stack/react/README.md) — React.
- [references/stack/zustand/](references/stack/zustand/README.md) — Zustand.

Every rule follows the template in `docs/rule-format.md` of this plugin's repository.
