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

Then restart Claude Code, or run `/reload-plugins`, to load the new version. Changes between versions are listed
in [CHANGELOG.md](CHANGELOG.md).

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
  references/stack/     one file per stack: react.md, zustand.md
```

Each stack file stands on its own, so a stack can later move to a plugin of its own by moving its file.

The core rules are listed in
[skills/simple-architecture/references/core/README.md](skills/simple-architecture/references/core/README.md).

## Configure your project

A project opts in with one file at its root, `.claude/simple-architecture/config.json`. Every key is optional;
this is the full file with the defaults:

```jsonc
{
  // Stacks by stack file name: "react", "zustand". Empty — core rules only.
  "stack": [],
  // The app's root level, relative to the project root.
  "root": "src",
  "folders": {
    // The pure zone, relative to "root". It knows nothing of the app.
    "lib": "lib",
    // The ui-kit, relative to "root". Set "ui-kit" to keep it at the root level.
    "uiKit": "lib/components",
    // Shared folders: the same names on every level.
    "components": "components",
    "hooks": "hooks",
    "helpers": "helpers"
  },
  // Files longer than this get a warning, not an error.
  "maxFileLines": 150
}
```

The comments are only for this example: the file itself is plain JSON, without comments. An unknown stack name
is skipped, and you are told it has no stack file. A value of the wrong type is ignored, and you are told.
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
