# Changelog

All notable changes to this plugin are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.0] — 2026-11-09

### Added

- The principle behind every rule, in the skill: changing code that exists matters more than adding new code;
  when two ways both work, pick the one that is easier to change later.
- Core rule "View and Presenter": markup in the View, all logic in the Presenter; with its React side —
  `MyComponent.tsx` and the `usePresenter` hook.
- Core rule "Levels and placement": every code folder has the same shape — its unit, children, shared folders —
  and code lives at the lowest level that covers all its users.
- Core rule "Stateful logic and helpers": stateful logic uses state, lifecycle or a store, a helper is a plain
  function; with its React side — stateful logic is a hook, and the `use` prefix goes only on functions that call
  hooks.
- Core rule "Pure zone": code that knows nothing of the app lives in `lib/` and the ui-kit at the root level and
  imports nothing from the app.
- Core rule "One thing per file": one View, Presenter, stateful logic or helper per file; a file longer than
  `maxFileLines` gets a warning, not a finding.
- Core rule "Imports": import only along the structure — own children through their entry, shared folders of the
  own level and above, the pure zone; between kinds of code, View → Presenter → stateful logic → helpers. With
  its Zustand side: a store is used only from a Presenter or stateful logic.
- The project config `.claude/simple-architecture/config.json`: the stack, the root level, folder names and the
  file size limit, all with defaults. The SessionStart hook and the architecture-reviewer agent read it.
- The architecture-reviewer agent reports warnings — signals to look at, such as a long file — apart from
  findings.

### Changed

- Each stack is a folder with one file per rule, named as the core rule it carries out: `stack/react/`,
  `stack/zustand/`.

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
