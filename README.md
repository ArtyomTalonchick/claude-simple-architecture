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

Load the plugin from a working copy instead of the marketplace, and check the manifest and the plugin's files:

```
claude --plugin-dir path/to/claude-simple-architecture
claude plugin validate .
```

## How the rules are organised

- **Core rules** apply to every project. They describe structure — layers, module boundaries, dependency
  direction — and name no technology, library or framework.
- **Stack rules** apply only when a project declares that stack (for example, a UI library or a state manager).
  They say how the core rules are carried out with that technology and never contradict the core.

Examples in the rules are generic: they name no real project. The rules live in the `simple-architecture` skill:

```
skills/simple-architecture/
  SKILL.md              when the rules apply, the order of reading and the config keys
  references/config.md  what happens to a wrong value in the config
  references/core/      core rules, one file per rule, listed in its README.md
  references/stack/     one folder per stack: react/, zustand/ — one file per rule, named as the core
                        rule it carries out
```

Each stack folder stands on its own, so a stack can later move to a plugin of its own by moving its folder.

Every rule follows one template, and a rule goes from an idea to a release in a fixed way — see
[docs/rule-format.md](docs/rule-format.md). Questions found while writing rules are logged in
[docs/questions.md](docs/questions.md).

## Configure your project

A project opts in with one file at its root, `.claude/simple-architecture/config.json`; without it, the project
does not follow Simple Architecture. Every key is optional, so `{}` is a valid config. For example:

```json
{
  "stack": ["react", "zustand"],
  "root": "src/App",
  "lib": "src/lib",
  "maxFileLines": 150
}
```

A repository with several apps declares them in `apps`, with a `shared` package of the types and code they share; each app is
checked on its own, by the core and its own stacks. Every key, its default and the form with `apps` are described in
[SKILL.md](skills/simple-architecture/SKILL.md), section "The config"; what happens to a value that cannot be used,
in [references/config.md](skills/simple-architecture/references/config.md).

At the start of every session a hook reads the config and tells the agent the resolved values, any problems, and
that the skill is read before writing code. Without the file, the agent is told only how to add one. The hook needs
Node.js on the PATH.

## Review a change

The plugin ships the `architecture-reviewer` agent. It is read-only: it reads the rules, your config and the
diff, and reports each finding as `file:line`, the rule it breaks and why — or says there are no findings.

Ask for it before you commit, for example: "Run the architecture-reviewer agent on my changes." By default it
reviews staged and unstaged changes against `HEAD`; you can pass a commit range or a list of files instead.

## License

[MIT](LICENSE)
