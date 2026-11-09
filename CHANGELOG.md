# Changelog

All notable changes to this plugin are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- The project config `.claude/simple-architecture/config.json`: the stack, the root level, folder names and the
  file size limit, all with defaults. The SessionStart hook and the architecture-reviewer agent read it.
- The architecture-reviewer agent reports warnings — signals to look at, such as a long file — apart from
  findings.

### Removed

- The `Simple Architecture stack:` line in `CLAUDE.md`: the stack is set in the config now.
- The empty Chakra UI stack file.

## [0.0.0] — 2026-11-08

### Added

- The rule template and the way a rule is added: `docs/rule-format.md`.
- The questions log: `docs/questions.md`.
- The `simple-architecture` skill with its layout: core rules and stack files for React, Zustand and Chakra UI,
  all stubs with no rules yet.
- The stack line a project puts in its `CLAUDE.md`: `Simple Architecture stack: react, zustand, chakra`.
- The architecture-reviewer agent: a read-only reviewer that checks a diff against the core and the declared
  stack rules and reports each finding with the rule it breaks.
- A SessionStart hook that tells the agent whether the project follows Simple Architecture, which stack it
  declares, and to read the skill before writing code; projects without a stack line are told how to declare one.
- CI that runs `claude plugin validate . --strict` on every push to `main` and every pull request.
