# simple-architecture

A Claude Code plugin with architecture rules. It gives the agent a small, fixed set of rules for how code is
split into layers and modules, and a way for each project to say which technologies it uses, so only the rules
that apply are loaded.

## Install

Add the marketplace and install the plugin:

```
/plugin marketplace add ArtyomTalonchick/claude-simple-architecture
/plugin install simple-architecture@simple-architecture
```

## Update

```
/plugin marketplace update simple-architecture
```

Then restart Claude Code, or run `/reload-plugins`, to load the new version: until then a running session keeps
the version it loaded. The `architecture-reviewer` agent uses that same version and warns when a newer one is
installed. Changes between versions are listed in [CHANGELOG.md](CHANGELOG.md).

## Develop locally

Load the plugin from a working copy instead of the marketplace:

```
claude --plugin-dir path/to/claude-simple-architecture
```

Check the manifest and the plugin's files:

```
claude plugin validate .
```

## How the rules are organised

- **Core rules** apply to every project. They describe structure — layers, module boundaries, dependency
  direction — and name no technology, library or framework.
- **Stack rules** apply only when a project declares that stack (for example, a UI library or a state manager).
  They say how the core rules are carried out with that technology and never contradict the core.

Examples in the rules are generic: they name no real project.

The rules live in the `simple-architecture` skill:

```
skills/simple-architecture/
  SKILL.md              when the rules apply and the order of reading
  references/core/      core rules, one file per rule
  references/stack/     one folder per stack: react/, zustand/ — one file per rule, named as the core
                        rule it carries out
```

Each stack folder stands on its own, so a stack can later move to a plugin of its own by moving its folder.

The core rules are listed in
[skills/simple-architecture/references/core/README.md](skills/simple-architecture/references/core/README.md).

## Configure your project

A project opts in with one file at its root, `.claude/simple-architecture/config.json`. Every key is optional;
this is the full file with the defaults:

```jsonc
{
  // Stacks by stack folder name: "react", "zustand". Empty — core rules only.
  "stack": [],
  // The app's root level, relative to the project root.
  "root": "src",
  // Optional, no default: the pure zone set apart from the root level, relative to the project root, e.g.
  // "src/lib" with "root": "src/App". It then lies outside every level, with the ui-kit inside it.
  // Without it, the pure zone is "folders.lib" under "root".
  "folders": {
    // The pure zone, relative to "root". It knows nothing of the app. "lib" above takes its place when set.
    "lib": "lib",
    // The ui-kit, relative to "root". Set "ui-kit" to keep it at the root level (without "lib"). It is part of the pure zone,
    // so its name does not follow "components". With "lib" set, it lies inside "lib": "<lib>/components".
    "uiKit": "lib/components",
    // The same names on every level.
    // Child units that two or more units of a level share.
    "components": "_components",
    // The tasks folder inside the logic folder.
    "tasks": "_tasks",
    // A level's non-UI code but its stores — its own unit's and what its units share — next to its entry.
    "logic": "_logic",
    // A level's stores — data shared by the code that reads it — next to its entry.
    "stores": "_stores"
  },
  // Files longer than this are a violation; tests and generated files are not checked.
  "maxFileLines": 120
}
```

A repository with several apps declares them instead of `root`, `stack` and `lib`; each app is checked on its
own, by the core and its own stacks, and an app never imports from another app:

```jsonc
{
  "apps": {
    // The pure zone apart from the root level, as the top-level "lib".
    "client": { "root": "client/src/App", "lib": "client/src/lib", "stack": ["react", "zustand"] },
    // No stack yet — core rules only.
    "server": { "root": "server/src", "stack": [] }
  },
  // A package of types both apps import. Types only; it imports no app.
  "shared": "shared/src"
}
```

The comments are only for this example: the file itself is plain JSON, without comments. An unknown stack name
is skipped, and you are told it has no stack folder. A value of the wrong type and an unknown key are ignored, and
you are told; so is an app without `root`, and `apps` with no usable app leaves the project one app, as without
`apps`. A file that is not a JSON object cannot be read: the agent tells you and does not apply the rules.
Without the file, the project does not follow Simple Architecture.

At the start of every session a hook reads the config and tells the agent the resolved values, any problems,
and that the skill is read before writing code. Without the file, the agent is told only how to add one. The hook
needs Node.js on the PATH.

Every rule follows one template, and a rule goes from an idea to a release in a fixed way — see
[docs/rule-format.md](docs/rule-format.md). Questions found while writing rules are logged in
[docs/questions.md](docs/questions.md).

## Review a change

The plugin ships the `architecture-reviewer` agent. It is read-only: it reads the rules, your config and the
diff, and reports each finding as `file:line`, the rule it breaks and why — or says there are no findings.

Ask for it before you commit, for example: "Run the architecture-reviewer agent on my changes." By default it
reviews staged and unstaged changes against `HEAD`; you can pass a commit range or a list of files instead.

## License

[MIT](LICENSE)
