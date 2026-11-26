# Changelog

All notable changes to this plugin are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- Wording left unclear after 0.3.1 is tidied, and no rule changes: "Stateful logic and plain functions" says that
  a task does not subscribe and may read again, without "the limit"; "Tasks" says that a task may import the
  framework that takes requests as it imports its database client, and links to "One thing per file" for the file
  of a function a task is split into.

## [0.3.1] — 2026-11-25

### Changed

- The rules are shorter and say the same: a check stated in two rule files stays in one, and the other links to it
  — when an effect or stateful logic may call a task is in "Tasks" only, what a plain function may import in
  "Imports" only, who may import a file of a logic folder in "Imports" only. "Imports" no longer adds "never …" where
  its closed lists already forbid the import. An example case is shown once. The core `README.md` is an index of the
  rules, not a copy of each **Rule.** paragraph. Word budgets lowered to fit: the reviewer agent 1600→1400, the
  core `README.md` 850→300, `core/pure-zone.md` 1450→1400, `core/stateful-logic-and-functions.md` 1700→1650, the
  React `stateful-logic-and-functions.md` 750→700. `docs/rule-format.md` says how rules are kept short.
- The reviewer agent is shorter: it resolves the config by `SKILL.md` instead of repeating the list of its values,
  and no longer has a "No rules yet" report — the core always has rules.
- "Tasks" and "Stateful logic and plain functions" say that a task may read and change a store at any moment it
  runs, after its own `await` too — the limit is against a subscription, not against a second read. A Good example
  shows a task that checks the store again before it writes the answer.
- "View and Presenter" says what the child-unit check limits — what a parent passes to a child unit of its own. A
  component of the ui-kit or a components folder may get any value or handler; a unit of a components folder may
  also read a store and call a task in its own Presenter, a ui-kit component may not.
- Three places where the reviewer had to judge are settled. A function a task is split into is a file of its own, a
  part of the task. The number of store actions a handler calls, or of stores, does not make it a task: changes of
  UI state stay in the handler or a plain function. A type goes the way the code does: a logic file that needs a
  part of the props type declares and exports it, and the Presenter imports it from there — in the types file when
  several logic files need it; a logic file that imports from its own View or Presenter, a type too, is a violation.
- "View and Presenter": a View may pick one child of several from its own literal table by a ready key, as it picks
  a style row. A ready key compared to a literal is a violation — a two-way choice goes by a ready flag, one of
  three or more by the table. The type of a key the Presenter returns lives in the Presenter, and the View imports
  it. The React rule shows the table of components in a Good example; its word budget is raised 1050→1100 for it.
- A store file may export its own readings — on Zustand, read hooks and selectors — when a reading means the same
  to every user, such as "is a user signed in"; a Presenter or stateful logic calls them as it calls the store. The
  core and the Zustand rule now say the same. A computation for one user in a store file stays a violation, and the
  Zustand rule shows both cases; its word budget is raised 700→750 for them.
- "Tasks": in an app with no UI the framework that takes its requests is not the UI framework — a task may import
  it, as its database client. A middleware is a task: one that two route units share lies in the app's tasks folder
  ("Placement by users"), and the one-user middleware in the example of "Levels" lies in its unit's tasks folder.
- The file the app starts from may call, on start, a task of the root unit's tasks folder — a check or a setup the
  app needs before it runs, such as a server that stops when its config is wrong. "Levels" says it and shows it,
  "Imports" lists that task among the start file's targets, and "Tasks" lists the app's start among a task's
  callers; the word budget of `core/tasks.md` is raised 1400→1450 for it.
- The shared package (`shared` in the config) may hold, next to types, the runtime code two or more apps use and
  that imports no app: plain functions on its types, constants, schemas, and code that would lie in a pure zone,
  generic I/O included. A store, a task, stateful logic, a component and code only one app uses are violations
  there. Its files are checked as their kind, and only a task calls its generic I/O. The session-start hook, the
  skill and the reviewer no longer call it types-only. The word budget of `core/imports.md` is raised 1550→1600
  for the new target, its violations and the two example cases.
- The `architecture-reviewer` agent gets the diff before it reads the rules: when no changed file lies inside an
  app or the shared package it says so at once and reads no rule file, and it reads only the stacks of the apps
  that hold a changed file. The skill says a caller may skip the reviewer only for such a diff.
- The reviewer reports a placement under Warnings, not as a finding, when the caller names a second user that a
  later commit of the same task adds — the file and its unit — and that user would make the placement right; the
  warning names the planned user. A user planned for another task does not count, and the placement rules do not
  change: code is placed by today's users.
- "Types and constants" links to "View and Presenter" for where a props type, its parts and a key type live
  instead of repeating it, and the example of "Imports" no longer says a plain function reads a store "once".

## [0.3.0] — 2026-11-22

### Added

- Advice in "Tasks", not a check: data that only the calling unit shows — the loaded list, its loading flag, its
  error — is returned by the task and kept in the Presenter, and a store is for state several units need, a small
  store of UI state shared by a few units included. A Good example shows a Presenter that keeps the loading, the
  result and the error of its own task with no store. The "Why" of "Imports" gives the reason for the direction:
  code that changes often imports code that changes less often. The "Why" of "Tasks" and "View and Presenter" says
  the caller sets the interface, so what is behind it can change without the caller.
- A check in "View and Presenter": a child unit reads the store and calls the task in its own Presenter. A Presenter
  that hands a child unit a value read from a store or computed from one, or a handler that only calls a task, is a
  violation. Props carry the item a list repeats the child for — whole, its id or a ready row — and options of the
  look; a component of the ui-kit or of a components folder takes all as props. What several units read is a store,
  in the shape they read it. "Imports" no longer says "data comes down through props" and points here instead.
- "View and Presenter" and its React form say that a plain read of a prop's field is not a computation: a Presenter
  that only returns its props or reads their fields (`{ show, name: show.name }`) is a pass-through Presenter.

### Changed

- The rules no longer say how a task reports a failure: a task may throw it or return it, and the reviewer reports
  neither. The check "catching an error only to return it as a value is a violation" and its React form
  (`return { error }`) are gone. What stays: an optimistic update and its rollback are one task, and a failure shown
  by units that did not call the task is written to a store — such a task need not also report it to its caller.
- A plain function that only the UI side uses — a Presenter, stateful logic, other such plain functions — may call
  a task the way a Presenter does: await it and decide what the screen shows, such as a toast, its Undo and an error
  toast. A plain function that a task calls still may not call a task, and a task still knows nothing of the UI. In
  "Entry folders", a part that calls a task and decides what the screen shows is not a step of the business action
  and keeps its kind. "Imports" lets such a plain function import tasks. Passing the task's call as a callback
  (`goHome(() => clearSearch())`) is still allowed, no longer required.
- A View may read a row of its own literal style table by a ready key from its Presenter (`STYLES[p.size]`): a
  style lookup, like a theme value, not a value picked by a condition. The key's default and a key chosen by a
  condition stay in the Presenter. "View and Presenter in React" shows the table, checked with
  `satisfies Record<Variant, CSSProperties>`.
- A reference to an element that only one inline handler uses, to move the focus (a `useRef` of an input that the
  clear handler focuses again), forms no group of state in the two-concerns test of "Stateful logic and plain
  functions", so a Presenter that keeps it next to a debounced search gets no warning of two groups.
- A View may read a text from the app's resources by a literal key, with ready values from its Presenter as
  parameters: a text by key is markup, like a style by name. Plural forms and formats declared in the resource may
  take a ready raw value. A key built from data, a computation in the parameters, a text chosen by a condition and
  reading or changing the language stay violations. "View and Presenter in React" allows `t` of a translation hook
  and `<Trans>` in a component, only as text, and `usePresenter.ts` may call `t` for a text that depends on data.

## [0.2.8] — 2026-11-21

### Added

- Word budgets for the rule files, the skill and the reviewer agent in `test/word-budgets.json`: `node --test`
  fails when a file is over its budget, a rule lacks a section of the template, or a **Rule.** is longer than two
  sentences. `docs/rule-format.md` says how a budget is kept and raised.

### Changed

- The default ui-kit folder (`folders.uiKit`) is `lib/ui-kit`, not `lib/components`: the name says "ui-kit", and an
  import from it no longer reads as the app's shared components or a level's `_components` folder. With `lib` set,
  the default ui-kit is `<lib>/ui-kit`. A project that relies on the default sets `"uiKit": "lib/components"` in
  `folders` to keep its folder, or renames the folder to `lib/ui-kit`.
- The skill describes each config key in one or two sentences — what it names and its default. What happens to a
  wrong value (an unknown stack name, an ignored path, a wrong type, a file that is not valid JSON, `apps` with no
  usable app) moved to one reference file, `references/config.md`. The handling itself is unchanged.
- The rule files are shorter and follow the rule format: each **Rule.** is one or two sentences, "How to check"
  holds only checks, and a statement lives in one file that the others link to; what the rules require is
  unchanged. `core/levels.md` is split into rules of one idea each: `levels.md` (the shape of a level),
  `placement.md` (placement by users), `app-folders.md` (the app's tasks and stores folders), `entry-folders.md`
  (entry folders, store entry folders included) and `types-and-constants.md` (where a type or a constant lives).
  The React rule on derived types moved from `stack/react/levels.md` to `stack/react/types-and-constants.md`. The
  `architecture-reviewer` agent refers to the rule files instead of restating them, and `core/README.md` lists
  every core rule with its Rule sentence.

## [0.2.7] — 2026-11-19

### Changed

- A store with parts only it uses — the type of its API, its implementations — is a store entry folder in its
  stores folder, a level's or the app's, with the rules of any entry folder. Its implementations are parts, not
  stores of their own.
- On a server, a store whose API reads and writes its own database through the database's client is allowed: it is
  the store's own data, not a business action. A store may have several implementations behind one API, picked by
  the environment.
- A root level may hold one start file per runtime the app runs in — a server started locally and as a cloud
  function.
- A task that only one other task calls may be a part of that task's entry folder, or a task of its own in the
  tasks folder. It moves out when a second caller appears. Reading or writing a storage directly is I/O: a task.
- A level shares any store that no task of the app's tasks folder reaches, not only UI state — a server cache that
  the tasks of two of its units reach lives in the level's stores folder.
- A plain function of the UI side may run a callback inside a screen transition; the Presenter passes a task's call
  (`goHome(() => clearSearch())`). Redoing the task's store changes in the plain function is a violation.
- A task that writes its own failure to a store where the UI reads it need not rethrow, with or without a rollback.
- A store may keep the handle that cancels an ongoing call next to its status; only tasks use it.
- A types or constants file inside an entry folder of a logic folder, used only there, is a part, not a violation.

## [0.2.6] — 2026-11-19

### Changed

- A task's argument may come from a store's data. Only a condition on the app's data before the call — a Presenter
  that reads it to decide whether to call the task — is a violation. Passing what the event was about — the id of
  the clicked item, the typed text, the chosen value — is fine, wherever the caller got it: `toggleFavorite(show.id)`
  for an item of a list read from a store is no longer reported. Advice, not checked: a value the task can read from
  a store itself and that the event does not choose — the current page, the active filters — the task reads.
- An entry folder for a task is optional in every tasks folder, a unit's `_logic/_tasks/` as the app's `tasks/`: a
  task and the plain functions only it uses may lie flat there, or in an entry folder named as the task. An entry
  folder that is used keeps its rules: only its entry is imported from outside, and one that holds only its entry is
  a file. Stateful logic and plain functions of the logic folder outside the tasks folder still need an entry
  folder for their parts.

## [0.2.5] — 2026-11-19

### Added

- The config keys `tasks` and `stores` set the app's tasks folder and stores folder, relative to the project root,
  as `lib` is — per app in `apps`, or at the top level for one app. By default they lie next to the pure zone: next
  to the folder `lib` names (`src/tasks/`, `src/stores/` with `"lib": "src/lib"`), or, without `lib`, at the root
  level (`<root>/tasks`, `<root>/stores`). They are not `folders.tasks` and `folders.stores`, which name folders
  inside a level. A value that is absolute or has `..`, one that holds the root level, one inside the pure zone, one
  inside the root level other than directly under it, and one that is the same folder as the other key or as the
  root level's stores folder are ignored, and you are told. The SessionStart hook prints both folders.

### Changed

- **Breaking:** a level's logic folder holds only its own unit's code — the Presenter, its stateful logic, its plain
  functions and the tasks only this unit calls — and only the unit's entry and the files of that folder import from
  it. An import from another unit's logic folder, an ancestor's included, is a violation, checked by the path alone.
  A level shares with its units only components, stores with UI state, and a types file and a constants file, which
  now lie at the level root, not in the logic folder; there is no place at a level for shared logic, and behaviour
  two units need is a component that holds it. Tasks with users in two or more units, and the plain functions on
  the app's data that they or several units use, go to the app's tasks folder; the stores those tasks reach go to
  the app's stores folder. Imports go one way: levels → the app's tasks folder → the app's stores folder → the pure
  zone; the app's folders import nothing from a level. Folders by topic are allowed in them, and an entry folder for
  a task is allowed there, not required. A task is never a part of another task any more: tasks call each other
  freely. The root level has no exception for shared code left. To update: move each task two or more units call
  to the app's tasks folder, with the stores it reaches to the app's stores folder; move types and constants files
  from the logic folders to the level roots; replace every import from a parent's or an ancestor's logic folder —
  by a task or a plain function in the app's tasks folder, a type or a constant at a level root, or a component that
  holds the behaviour; take a task out of another task's entry folder and put it next to it.
- **Breaking:** an event calls the task. A task is called from an event handler — of a Presenter, of stateful logic,
  of the entry of a unit with no UI — or from another task; an effect calls it only on start or mount. An effect, a
  hook or other stateful logic that watches state, props or a store and calls a task when they change is a
  violation, a generic "request follows its params" hook included: the handler that changed the data calls the task.
  The steps and the conditions around the app's data belong to the task — "go to the next page" reads the page and
  the page count and returns when there is none — and a Presenter that checks them before the call is a violation.
  A delay before the call is a plain function around it (a debounce made once), not stateful logic that follows a
  value; `lib/debounce/` is a pure function in the examples. The state of a call may stay in the caller, or the task
  may write it to a store when units that did not call it show it; no check chooses. A task that rolls back its
  change and writes the error to a store need not rethrow. New examples: an optimistic update with its rollback in
  one task, and the note that the rollback undoes the task's own change, not a snapshot. React: `useEffect` calls a
  task only with an empty dependency list; Zustand: a task may write its status with `setState`. To update: move
  each task call out of effects with dependencies into the handlers that change the data, move the conditions on
  the app's data from Presenters into tasks, and wrap delayed calls in a debounce made once.

## [0.2.4] — 2026-11-18

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
