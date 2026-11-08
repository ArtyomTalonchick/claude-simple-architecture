---
name: simple-architecture
description: Rules for code structure by Simple Architecture — layers, module boundaries, dependency direction. Use when writing, changing, moving or reviewing code structure (new files, modules, imports, where code belongs) in a project whose CLAUDE.md has a "Simple Architecture stack:" line.
---

# Simple Architecture

Rules for how code is split into layers and modules. They come in two parts:

- **Core** — applies to every project. Names no technology.
- **Stack** — one file per technology. A project loads only the files for the stack it declares.

## When it applies

Use these rules when you write, change, move or review code structure — new files and modules, imports, where a
piece of code belongs — in a project that follows Simple Architecture. A project follows it when its `CLAUDE.md`
has a stack line (see below).

## No rules yet

This version has no rules: the core and every stack file are empty stubs. Do not invent rules in their name.
Until rules appear, follow the project's own conventions, and do not say a change breaks or follows Simple
Architecture.

## Order of reading

1. The core: [references/core/](references/core/README.md). Core rules come first and always apply.
2. The stack files the project declares, in the order it lists them. A stack rule says how a core rule is
   carried out with one technology; it never overrides the core.

Do not read stack files the project does not declare.

## The stack line

A project declares its stack with one line in the `CLAUDE.md` at its root:

```
Simple Architecture stack: react, zustand, chakra
```

- The line starts with `Simple Architecture stack:` exactly (leading spaces are allowed). The first such line
  counts; later ones are ignored.
- After the colon comes a comma-separated list of names. Spaces around names are ignored. Names are compared in
  lower case.
- Each name is the file name of a stack file without `.md`: `react` means `references/stack/react.md`.
- An unknown name is skipped, and the user is told it has no stack file.
- An empty list means core only. No line means the project does not follow Simple Architecture.

## Reference files

- [references/core/](references/core/README.md) — core rules.
- [references/stack/react.md](references/stack/react.md) — React.
- [references/stack/zustand.md](references/stack/zustand.md) — Zustand.
- [references/stack/chakra.md](references/stack/chakra.md) — Chakra UI.

Every rule follows the template in `docs/rule-format.md` of this plugin's repository.
