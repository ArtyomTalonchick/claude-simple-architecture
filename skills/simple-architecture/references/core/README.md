# Core rules

Rules that apply to every project, whatever its stack. A core rule names no technology; a rule that needs one goes
to a stack folder in [../stack/](../stack/). Each rule has its own file, written by the template in
`docs/rule-format.md` of this plugin's repository. Each line below is the rule's **Rule.** sentence.

- [View and Presenter](view-presenter.md) — Split a UI unit into a View, which holds only markup and styles and
  takes every value and handler from its Presenter, and a Presenter, which holds all its logic — state, effects,
  data access, computations, handlers. A UI unit with no logic has no Presenter.
- [Levels](levels.md) — Give the app root and every unit folder the same shape: the unit's entry, a logic folder
  (default `_logic/`) with the own unit's non-UI code but its stores, a stores folder (default `_stores/`), a types
  file, a constants file, a components folder (default `_components/`) and the child units. Put nothing else at a
  level root, and nothing but the own unit's code in its logic folder.
- [Placement by users](placement.md) — Put each child unit, store, type and constant at the lowest level that
  covers all its users, and move it when its users change. A level shares only the units of its components folder,
  its stores, its types file and its constants file — there is no shared logic at a level.
- [The app's tasks and stores folders](app-folders.md) — Put the tasks that two or more units call, and the stores
  those tasks reach, in the app's tasks folder and stores folder (default `tasks/` and `stores/`, next to the pure
  zone), outside every level. A task that one unit calls stays in that unit's tasks folder, and a store that no
  task of the app's tasks folder reaches stays in a level's stores folder.
- [Entry folders](entry-folders.md) — Put an entry of a logic folder, or a store, that has parts only it uses in a
  folder named as it, holding the entry and those parts, and nest a part with parts of its own the same way, at any
  depth; in a tasks folder such a folder is allowed, not required. From outside the folder, import only its entry.
- [Types and constants](types-and-constants.md) — Keep a type or a constant in the one file that uses it; put one
  that two or more files use in the types file or the constants file of the lowest level that covers them, of the
  app's tasks folder, or of the innermost entry folder that holds them all — never export it from one of its users.
  A type that is part of an API — a props type, a pure-zone module's type, a store's data — stays with that API.
- [Stateful logic and plain functions](stateful-logic-and-functions.md) — Split non-UI code into stateful logic (it
  uses state, lifecycle or a store subscription, or calls other stateful logic), tasks and plain functions (no
  business logic, no I/O, no call of stateful logic, nor of a task unless only the UI side uses them), keep shared
  data apart in stores, and let each kind be called only by the kinds listed below. Give one piece of stateful
  logic one concern.
- [Tasks](tasks.md) — Write each business action — one that would stay the same action in another UI — as a task:
  a function named with a verb, with nothing from the UI framework, that holds the action's steps and its
  conditions on the app's data. Call it from an event — a handler or another task, an effect only on start or
  mount — and leave to the caller only the state of the call and what follows, navigation included.
- [Pure zone](pure-zone.md) — Keep code that knows nothing of the app — by import, by key or by meaning — in the
  pure zone: the lib folder (default `lib/`) at the root level, or where the app's `lib` key puts it, with the
  ui-kit and the design-system theme, in folders named by what their code is about, never by the kind of code.
  Generic I/O, code that does I/O and knows nothing of the app, is a kind of its own: it lives only here, and only
  tasks call it.
- [One thing per file](one-thing-per-file.md) — A file holds one thing — one View, Presenter, piece of stateful
  logic, task, plain function, piece of generic I/O or store — with the types and constants only it uses. A file is
  no longer than the configured limit (`maxFileLines`, default 120).
- [Imports](imports.md) — Import only along the structure — your own children through their entry, your own unit's
  logic folder, the shared folders and files of your level and of the levels above, the app's tasks folder and
  stores folder, the pure zone, the shared types package — and from an entry folder only its entry. Imports go one
  way: levels → the app's tasks folder → the app's stores folder → the pure zone, and View → Presenter → stateful
  logic and the UI side's plain functions → tasks → plain functions, with stores and generic I/O open only to the
  kinds listed below.
