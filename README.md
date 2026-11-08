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

## License

[MIT](LICENSE)
