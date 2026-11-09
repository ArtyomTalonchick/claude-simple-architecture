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

Do not read stacks the project does not declare.

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
    "components": "components",
    "hooks": "hooks",
    "helpers": "helpers"
  },
  "maxFileLines": 150
}
```

- **`stack`** — the stacks to read, in order. Each name is a stack folder: `react` means
  `references/stack/react/`. Names are compared in lower case. An unknown name is skipped, and the user is told
  it has no stack folder. An empty list means core rules only.
- **`root`** — the folder of the app's root level, relative to the project root.
- **`folders.lib`** — the pure zone, relative to `root`.
- **`folders.uiKit`** — the ui-kit, relative to `root`. Wherever it lives, it belongs to the pure zone.
- **`folders.components`**, **`folders.hooks`**, **`folders.helpers`** — the names of the shared folders: for
  components, for stateful logic and for helpers. The same names are used on every level.
- **`maxFileLines`** — a positive whole number: the size above which a file gets a warning.

The rules name a folder by its role and its default, for example "the stateful logic folder (default
`hooks/`)"; in a project, use the configured name.

A value of the wrong type is ignored, its default is used, and the user is told; so is an unknown key. A file
that is not valid JSON means the config cannot be read: tell the user, and do not apply or judge by the rules
until it is fixed. No file means the project does not follow Simple Architecture.

At session start a hook reads the config and passes the resolved values to the agent. When those values are not
in the context (a subagent, a hook that did not run), read the config by the rules above.

## Reference files

- [references/core/](references/core/README.md) — core rules.
- [references/stack/react/](references/stack/react/README.md) — React.
- [references/stack/zustand/](references/stack/zustand/README.md) — Zustand.

Every rule follows the template in `docs/rule-format.md` of this plugin's repository.
