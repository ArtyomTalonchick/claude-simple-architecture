---
name: simple-architecture
description: Rules for code structure by Simple Architecture — layers, module boundaries, dependency direction. Use when writing, changing, moving or reviewing code structure (new files, modules, imports, where code belongs) in a project that has a `.claude/simple-architecture/config.json`.
---

# Simple Architecture

Rules for how code is split into layers and modules, in two parts: the **core**, which applies to every project and
names no technology, and the **stacks**, one folder per technology, read only for the stacks a project declares.

## The principle

Architecture exists to cut the human effort of building and keeping a system, and changing code that exists matters
more than adding new code: a feature is added once and changed many times. So when two ways to write something both
work, pick the one that is easier to change later, even if it takes longer to write now. Every rule serves this; a
case no rule covers is decided by it.

## When it applies

Use these rules when you write, change, move or review code structure — new files and modules, imports, where a
piece of code belongs — in a project that has `.claude/simple-architecture/config.json`. No file means the project
does not follow Simple Architecture.

A caller may skip the `architecture-reviewer` agent only when no changed file lies inside an app or the shared
package; one such file is reviewed.

## Order of reading

1. The core: [references/core/](references/core/README.md) and every rule file in it.
2. The stacks the project declares, in the order it lists them: for each, `references/stack/<name>/README.md` and
   every rule file in that folder. A stack rule file is named as the core rule it carries out and never overrides
   it.

A file of an app lies in its root, its pure zone set by `lib`, its tasks folder, its stores folder or its types folder,
or, when it sets `lib`, is its start file or test infrastructure beside the root folder
([Levels](references/core/levels.md)). With `apps` in the config, read the core and then only the stacks of the
app that holds the code; code in the shared package gets the core only.

## The config

Every key is optional; a missing key takes its default. The full file with the defaults:

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
  "maxFileLines": 120,
  "storeAccess": "direct"
}
```

- **`stack`** — the stacks to read, in order, each named by its stack folder: `react` means
  `references/stack/react/`. Default `[]`: core rules only.
- **`root`** — the folder of the app's root level, relative to the project root. Default `src`.
- **`lib`** — the folder of the pure zone set apart from the root level, relative to the project root, for example
  `"root": "src/App", "lib": "src/lib"`; the pure zone then lies outside every level. No default: without it, the
  pure zone is `folders.lib` under `root`.
- **`tasks`**, **`stores`**, **`types`** — the app's tasks folder, stores folder and types folder, relative to the
  project root ([The app's folders](references/core/app-folders.md)); not `folders.tasks` and `folders.stores`.
  Default: next to the pure zone — next to the folder `lib` names, or, without `lib`, `<root>/tasks`,
  `<root>/stores` and `<root>/types`.
- **`folders.lib`** — the pure zone, relative to `root`; when `lib` is set, `lib` takes its place. Default `lib`.
- **`folders.uiKit`** — the ui-kit, relative to `root`: part of the pure zone, so its name does not follow
  `folders.components`. Default `lib/ui-kit`; with `lib` set, it lies inside `lib` as inside `folders.lib`
  (`<lib>/ui-kit`), and a ui-kit set outside `folders.lib` is taken as relative to `lib`.
- **`folders.logic`** — a level's logic folder ([Levels](references/core/levels.md)). Default `_logic`.
- **`folders.tasks`** — the tasks folder inside the logic folder: the tasks only its unit calls. Default `_tasks`.
- **`folders.stores`** — a level's stores folder. Default `_stores`.
- **`folders.components`** — a level's folder for the child units that two or more of its units share. Default
  `_components`.
- The same folder names are used on every level.
- **`maxFileLines`** — the size in lines above which a file is a violation
  ([One thing per file](references/core/one-thing-per-file.md)). Default `120`.
- **`storeAccess`** — how the stores of the stores folders are reached. `"direct"`, the default: through the
  store's own API, the rules as they are without the key. `"closed"`: a store is a folder of plain data behind
  named reads and writes ([Closed store access](references/core/closed-store-access.md)); that rule and the stack
  rules that carry it out apply only then.

A repository with several apps — a client, a server and a package of code they share — declares them instead of
`root`, `stack`, `lib`, `tasks`, `stores`, `types` and `storeAccess`:

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
  `tasks`, `stores`, `types` and `storeAccess`, read as the top-level keys are; each app is checked on its own, by
  its own root, stacks and `storeAccess`. The same top-level keys are then ignored; `folders` and `maxFileLines`
  apply to every app. Apps that set `lib` keep `root` in separate parent folders
  ([references/config.md](references/config.md)).
- **`shared`** — the shared package, relative to the project root: types and the runtime code two or more apps
  use, imported by every app, importing no app ([Imports](references/core/imports.md)). Optional, no default, with or without `apps`.

The rules name a folder by its role and its default, for example "the logic folder (default `_logic/`)"; in a
project, use the configured name.

At session start a hook reads the config, passes the resolved values to the agent and names every value it could not
use. When those values are not in the context (a subagent, a hook that did not run), read the config by the keys
above, and handle a wrong value — or a file that cannot be read — by [references/config.md](references/config.md).

## Reference files

- [references/core/](references/core/README.md) — core rules.
- [references/config.md](references/config.md) — what happens to a wrong value in the config.
- [references/stack/react/](references/stack/react/README.md) — React.
- [references/stack/zustand/](references/stack/zustand/README.md) — Zustand.

Every rule follows the template in `docs/rule-format.md` of this plugin's repository.
