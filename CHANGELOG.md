# Changelog

All notable changes to this plugin are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- The config key `lib` sets the pure zone apart from the root level: a folder relative to the project root, as
  `root` is — per app in `apps`, or at the top level for one app — for example
  `{"root": "src/App", "lib": "src/lib"}`. The pure zone then lies outside every level, with the ui-kit inside it
  (`folders.uiKit`, default `lib/components`, becomes `<lib>/components`), and the root level holds only the app's
  code: a lib folder there is an ordinary folder at a level root. Pure code still imports nothing of the app, now
  also not the app's code outside the root level, such as the file the app starts from. A value inside the root
  level other than the default place, one that holds the root level, and an absolute path or one with `..` are
  ignored, and you are told. The SessionStart hook prints the resolved pure zone, and the reviewer checks the
  files of a pure zone set apart by the rules of its app. Without the key nothing changes.

### Changed

- Five small cases the rules left open are settled as allowed, and the reviewer no longer reports them. The file
  the app starts from runs the entry and may wrap it in what the app mounts around it — in React `StrictMode` and
  providers; a unit only it uses for that is a child unit of the root level. A type that is part of a props type —
  an icon name, a variant — is declared with it and passed on by the View, like the props type, not moved to a
  types file; the pure zone has no types file, and a type a pure-zone module exports is imported from that module.
  A View without a Presenter that passes all its props on to one child may declare its props type as an alias of
  the child's; a unit with no props has no props type, not an empty one. A short handler that acts on the screen —
  prevent the default action, move the focus — may stay inline in the Presenter; it moves to a plain function when
  it grows or is reused, a judgement, not a check. An error class of the pure zone may be imported to tell an error
  apart and answer with it — by the entry of a unit with no UI, a Presenter, stateful logic, a task, a plain
  function and generic I/O. To update: nothing to change.
- Two cases left to judgement are settled. A function that subscribes to a screen event and unsubscribes within
  the same call, keeping nothing between calls — such as an async function that waits once for a resize or a
  transition end, or a timeout, and removes its listener before it resolves — is a plain function of the UI side,
  not stateful logic: "follows the screen's changes" means over time, across calls. A file that derives a type
  from another file's value or type — in TypeScript `typeof fn`, `Parameters<typeof fn>`, `ReturnType<…>` — is
  not a user of that type, so the type stays where it is declared. The React stack has a new rule file,
  `levels.md`, with the TypeScript example. To update: nothing to change; a type moved to a types file only
  because another file derived it can move back to the file that declares it.
- A test's imports are no longer checked: a test may import whatever it needs to set up, reset and check state —
  any store, task or function of the app — and the reviewer does not report them. "Nothing more than the tested
  code may import" (0.2.3) is gone. An integration test of a level going through the level's entry is now advice,
  not a violation: such a test does not break on a change inside a child unit. Where a test lives is checked as
  before. To update: nothing to change; a test the reviewer reported for an import is now fine.
- A ui-kit component is checked by meaning, not only by its imports. Plain props — strings, numbers, callbacks —
  do not make a component pure: one named after or shaped by a domain entity (an order card, not a card), one that
  holds the app's own text (a "Cart" label), and a placeholder or a part of such a component know the app and are a
  violation in the ui-kit. Generic defaults its user can replace, such as a "Close" aria label, are not the app's
  text. Such a component is app code and is placed by its users: a child unit of its one user, or a unit in the
  components folder of the lowest level that covers them all. The reviewer now reports these. To update: move each such component out
  of the ui-kit to its place in the app.
- **Breaking:** an entry of the logic folder or the tasks folder — stateful logic, a plain function or a task, not
  the Presenter — with parts only it uses is an entry folder; before, it only might be one. Its parts lying flat
  next to it are a violation the reviewer reports. Entry folders nest: a part with parts only it uses is an entry
  folder of its own inside its entry's folder, at any depth, by the same rules — "an entry folder holds no folder
  but its tests" is gone. A part used from outside its own folder moves out to the nearest folder that covers all
  its users. To update: for each entry whose parts lie flat next to it, make the entry folder and move the parts
  into it; do the same inside it for each part with parts of its own; fix the imports to go through each folder's
  entry.
- **Breaking:** a folder in the lib folder named by the kind of code — `hooks/`, `helpers/`, `utils/`,
  `functions/`, `services/` and the like — is a violation the reviewer reports, as a tasks folder there already is.
  The lib folder's folders are named by what their code is about (`lib/http/`, `lib/dates/`, `lib/pagination/`):
  a kind says how the code is written, not what it does, and a folder named by kind grows into a drawer of
  unrelated code. "A name by kind is a name by content too" is gone. The ui-kit (default `lib/components/`) and
  errors, the theme, icons and styles stay as they are. To update: move each piece of a `lib/hooks/`,
  `lib/helpers/` or `lib/utils/` folder to a folder named by what it is about (a debounce to `lib/debounce/`, a
  date formatter to `lib/dates/`), and fix the imports.

## [0.2.3] — 2026-11-17

### Changed

- **Breaking:** the default service folder names start with `_`: `_logic`, `_tasks`, `_stores` and `_components`
  (`lib` and the ui-kit, `lib/components`, stay). A service folder now stands apart from the unit folders at a
  glance and sorts above them. A project that keeps the old names sets them in `folders`:
  `{"folders": {"logic": "logic", "tasks": "tasks", "stores": "stores", "components": "components"}}`.
- The rules name a service folder by its role — the logic folder, the tasks folder, the stores folder, the
  components folder — and give the default only in parentheses and in the examples, so they read right with
  custom names; the React and Zustand rules named the default folders as if they were fixed.
- The ui-kit's name (`folders.uiKit`) is set on its own and does not follow `folders.components`: the ui-kit is
  part of the pure zone, not a level's shared components folder.
- Any entry of the logic folder — stateful logic, a plain function or a task — with parts only it uses may be an
  entry folder named as its entry file: the entry, its parts and their tests. Others import only the entry; a part
  used from outside the folder is a violation and moves out next to it. The parts decide, not the line count: a task
  folder no longer depends on the file limit, and a task used only by another task always lives in its folder.
  The logic folder is no longer flat apart from the tasks folder, and an entry folder is not a unit or a level.
- **Breaking:** a task is defined by meaning: a business action, or a step of one, that would stay the same action
  in another UI or in another app on another UI framework (log out, place an order, clear the cart). The store
  test — a function that reads or changes a store once is a task — is gone. The helper kind is replaced by the
  plain function: non-UI code with no business logic that is neither a task nor stateful logic. It may be pure or
  reach a store through its own API (in Zustand, `getState()` / `setState()`), never subscribes, does no I/O and
  calls no task and no stateful logic. Its place follows its users: one used only by tasks lives in the tasks
  folder; one used by a Presenter or stateful logic lives in the logic folder. A plain function a task calls has
  nothing from the UI; one only the UI side uses may act on the screen and use the UI framework's API that is not
  a hook (in React, `flushSync`). The one-way order is View → Presenter → stateful logic → tasks → plain functions.
  A Presenter may hand a change of UI state, such as which screen is shown, to a plain function. The rule
  "Stateful logic and helpers" is now "Stateful logic and plain functions" (`stateful-logic-and-functions.md`, in
  the core and in the React and Zustand stacks). To update: a function that only changes UI state in a store moves
  out of the tasks folder into the logic folder; a plain function used only by tasks moves into the tasks folder;
  a plain function a task calls stops acting on the screen.
- A test imports only what the code it tests may import. An integration test of a level goes through the level's
  entry; a test that imports the inside of a child unit is a violation, as it is for code.

## [0.2.2] — 2026-11-16

### Added

- The config key `folders.stores` (default `stores`): the name of a level's stores folder.

### Changed

- A unit is a folder with an entry file named as the folder: the View in an app with a UI, and in an app with no
  UI the file that gives the unit to its users, such as the file that builds a server's routes. An app with no UI
  now has levels, checked by the same rules; the View and Presenter rule covers UI units only, and Imports lists
  what such an entry may import.
- The root level holds the file that builds the app and the file the app starts from at its root; neither is a
  violation.
- **Breaking:** a level keeps all its non-UI code in its `logic/` folder — its own unit's and the code its units
  share: stateful logic, helpers, tasks (in `logic/tasks/`), types and constants. The shared `hooks/`, `helpers/`
  and `tasks/` folders of a level and the `types` and `constants` files at its root are gone; a level root holds
  only the entry, `logic/`, `components/` and the child units. Code lives in the `logic/` of the lowest level that
  covers all its users, and a file there used by only one child unit belongs in that child's `logic/`. A unit may
  import from the `logic/` of its own level and of any level above, except that level's Presenter. The config keys
  `folders.hooks` and `folders.helpers` are removed: drop them from your config, or the session-start hook names
  them as unknown keys. `folders.tasks` now names the tasks folder inside `logic/`.
- **Breaking:** a store is a kind of its own, no longer stateful logic: data that lives longer than one call and is
  shared by the code that reads it, on a client or a server — a cache or an in-memory table on a server is a store.
  A store file holds the data and its own API, nothing else. It lives in the level's `stores/` folder, at the lowest
  level that covers all its users, never in `logic/`: move a store kept in `logic/` there. Only a task, through the
  store's API, and on a client a Presenter or stateful logic reach a store. In Zustand, a store made by `create`
  lives in `stores/` and holds its state and actions only.
- **Breaking:** generic I/O — code that does I/O, such as a request or a storage access, and knows nothing of the
  app — is a kind of its own that lives only in the pure zone: neither a task nor a helper. Only a task, and other
  generic I/O, calls or imports it; a Presenter, stateful logic, a helper, a View, a store or the entry of a unit
  with no UI that calls it is a violation. A task that calls it is still the step that reaches the server, and code
  in the app that does I/O is still a task. Folders inside `lib/` are named by what they hold (`lib/http/`,
  `lib/errors/`, `lib/theme/`), and a tasks folder in `lib/` is now a violation, since the pure zone has no
  business logic: move generic I/O from `lib/tasks/` to a folder named by its content, and app tasks to the app.

## [0.2.1] — 2026-11-16

### Fixed

- "Tasks" no longer says that stateful logic may navigate after a task: the Presenter navigates, as the rest of the
  rules say.
- In React, a `use…` function that calls no hook moves to where its kind belongs: a task if it reaches a store or
  the server, a helper otherwise — not always to helpers.
- A config whose `apps` has no usable app — empty, not an object, or every app without `root` — is one app with
  the top-level `root` and `stack`: the skill, which the reviewer reads, now says so, as the session-start hook
  already did.
  The hook's config problems line now also fits a skipped app.
- The architecture-reviewer counts the lines of every added or changed file as a whole against `maxFileLines`,
  so a small edit to a file already over the limit is no longer missed.
- The Good example in "Imports" no longer has a View call a task: every caller of a task is a Presenter or another
  task that imports it. Its stateful logic now imports the store it uses, and its shared component has two users.
- "One thing per file" now exempts a file written by a tool from the file limit in its rule as well, not only in
  How to check.

## [0.2.0] — 2026-11-16

### Added

- Tasks, a third kind of non-UI code next to stateful logic and helpers: a user action as a plain function named
  with a verb, with nothing from the UI framework, that reaches stores through their own API and throws on
  failure. The Presenter awaits it, keeps loading and error, and navigates. Shared tasks go to the tasks folder,
  configured by the new key `folders.tasks` (default `tasks`). In Zustand, a task may use `getState()` and
  `setState()`; a View and a helper still may not.
- A unit's own logic — the Presenter, its stateful logic, helpers and `tasks/` — lives in a `logic/` folder next to
  its View, flat apart from `tasks/`; the level's shared folders stay at the level root. The folder name is set by
  the new key `folders.logic` (default `logic`). In React, `usePresenter.ts` moves to `logic/`.
- A repository with several apps: the config declares `apps`, each with its own `root` and `stack`, and a shared
  types package `shared`. Each app is checked on its own, by the core and its own stacks; an app never imports from
  another app; the shared package holds types only and imports no app. A config without `apps` works as before.
  The session-start hook prints every app, and the architecture-reviewer checks each file by the rules of its app.
- A warning in "View and Presenter": a Presenter whose own state and lifecycle form two or more groups by the
  two-concerns test should move them out as stateful logic and only join it; a Presenter with one group stays
  whole.

### Changed

- Imports between kinds of code go one way: View → Presenter → stateful logic → tasks → helpers; a task may also
  import a store.
- A View takes components from shared folders and from the ui-kit only, no longer from anywhere in the pure zone.
- A file in a shared folder whose one user is itself a file of a shared folder is a part of that user: a task
  becomes a folder with its parts; stateful logic or a helper sits next to its user in the same shared folder.
- The types file and the constants file of a level hold what two or more files of the level use — of one unit or
  of several — not only what two or more units share. A type or a constant used by several files of one unit, and
  by no other unit, lives there, not in `logic/`.
- The file limit `maxFileLines` defaults to 120 lines, and a longer file is a violation, not a warning. A file
  written by a tool is not checked against it; a type declaration file written by hand is.
- A function that acts on the screen — focus, selection, a screen transition — and keeps nothing between calls is
  a helper; a task never calls it.
- A test file is not checked against the file limit: its cases are read one at a time, and a split by case would
  spread the tests of one thing over several files.

## [0.1.3] — 2026-11-09

### Changed

- A level's own unit counts as one of its units for the shared folders, the types file and the constants file:
  code used by the own unit and by one child unit goes to the level and the child imports it from there.
- The two-concerns test of stateful logic groups state and lifecycle, not results: a value computed only from the
  input, memoized or not, forms no group of its own.

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
