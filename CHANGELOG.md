# Changelog

All notable changes to this plugin are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- A level's own unit counts as one of its units for the shared folders, the types file and the constants file:
  code used by the own unit and by one child unit goes to the level and the child imports it from there.

## [0.1.2] — 2026-11-09

### Changed

- The rules version in use is named: the SessionStart hook prints the plugin version and its rules folder, and the
  architecture-reviewer agent names the version and folder it read. The reviewer stays on the session's version,
  as the skill does, and warns when a newer version is installed and the session must be restarted.
- Choosing a value by a condition in a View — a fallback, a default, an optional read, turning `null` into
  `undefined` — is a computation and belongs to the Presenter; choosing markup by a ready flag stays allowed.
- A new pattern in "View and Presenter": a Presenter may return a child's props as one ready value, or nothing when
  the child is hidden, and the View passes it on whole. It is a pattern, not a check.

## [0.1.1] — 2026-11-09

### Changed

- Rule gaps found in the first real use are closed: `usePresenter` is exempt from the `use` prefix rule; a View
  may read styles from the design system (in React, styling hooks), and a computed constant anywhere in a View
  file is a computation; one concern per piece of stateful logic; the design-system theme belongs to the pure
  zone, and a dependency by key counts as an import; tests are not part of the level shape and may import the
  code they test; a recommendation on relative paths and the path alias; an example of a View that only chooses
  a screen. Each decision is logged in `docs/questions.md`.

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
