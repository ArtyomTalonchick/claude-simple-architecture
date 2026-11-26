# Wrong values in the config

What happens to a value of `.claude/simple-architecture/config.json` that cannot be used. The keys and their
defaults are in [SKILL.md](../SKILL.md), section "The config". At session start the hook does all of this and
names each problem; read this file when its output is not in the context.

In every case below the user is told what was not used and why.

## A file that cannot be read

- No file: the project does not follow Simple Architecture.
- A file that is not valid JSON, or whose top level is not an object (an array, a string, `null`): the config
  cannot be read. Tell the user, and do not apply or judge code by the rules until it is fixed.

## Unknown keys

A key the config does not know — at the top level, in `folders` or in an app of `apps` — is ignored.

## Wrong types

A value of the wrong type is ignored and its default is used:

- `stack` (and an app's `stack`) that is not a list of non-empty names → `[]`.
- `root`, `shared`, a key of `folders`, `lib`, `tasks` or `stores` that is not a non-empty folder name → its
  default (`shared`, `lib`: none).
- `folders` that is not an object → every folder name keeps its default.
- `maxFileLines` that is not a positive whole number → `120`.

Names in `stack` are trimmed and compared in lower case; a repeated name counts once. Paths may use either slash;
empty and `.` parts are dropped.

## Unknown stack names

A name in `stack` with no stack folder in `references/stack/` is skipped; the other stacks are still read. Tell the
user the name has no stack folder, and name the stacks that exist.

## Ignored paths

`lib` is ignored, and the pure zone stays `folders.lib` under `root`, when it is:

- absolute, or has a `..` part;
- the root level or a folder that holds it;
- inside the root level anywhere but `<root>/<folders.lib>`. That one place is the default, so it is used with no
  problem to report.

With `lib` set, the start file and the test infrastructure beside the root folder are files of the app
([SKILL.md](../SKILL.md)); with `lib` ignored, they lie at the root level's root, as without `lib`.

`tasks` or `stores` is ignored, and its default is used, when it is:

- absolute, or has a `..` part;
- the root level or a folder that holds it;
- inside the pure zone;
- inside the root level, other than a folder directly under it;
- the root level's stores folder (`<root>/<folders.stores>`);
- for `stores`: the same folder as the app's tasks folder.

The same holds for an app's `lib`, `tasks` and `stores`, against that app's root.

## `apps` with no usable app

- `apps` that is not an object is ignored.
- An app that is not an object, or has no `root` folder name, is skipped. A wrong value in an app that has a
  `root` falls back as above; the app is still used.
- With no usable app left — `apps` is empty, is not an object, or every app is skipped — `apps` is ignored and the
  project is one app, read from the top-level `root`, `stack`, `lib`, `tasks` and `stores` as without `apps`.
- With at least one usable app, the top-level `root`, `stack`, `lib`, `tasks` and `stores` are ignored, and the
  user is told each one that is set.
