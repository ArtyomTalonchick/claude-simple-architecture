# Core rules

Rules that apply to every project, whatever its stack. A core rule names no technology — no library, framework
or tool; a rule that needs such a name goes to a stack folder in [../stack/](../stack/).

Each core rule gets its own file here, `<rule>.md`, written by the template in `docs/rule-format.md` of this
plugin's repository.

- [View and Presenter](view-presenter.md) — markup in the View, all logic in the Presenter.
- [Levels and placement](levels.md) — every level has the same shape — the entry, its non-UI code in the logic
  folder, its stores in the stores folder, shared units in the components folder and child units; code lives at
  the lowest level that covers all its users; an entry of the logic folder with parts only it uses is a folder that
  holds them, nested at any depth.
- [Stateful logic and plain functions](stateful-logic-and-functions.md) — three kinds of non-UI code: stateful logic
  uses state, lifecycle or a store subscription, a task carries out a business action or a step of one, a plain
  function has no business logic, does no I/O and calls no task or stateful logic, and lives by its users; one
  concern per piece of stateful logic. A store is data shared by the code that reads it, kept apart in the stores
  folder and reached only by tasks, plain functions and, on a client, by a Presenter or stateful logic.
- [Tasks](tasks.md) — a business action, one that stays the same in any UI, is a task: a function with nothing from
  the UI framework; the Presenter or stateful logic awaits it and keeps loading and error; the Presenter navigates.
- [Pure zone](pure-zone.md) — code that knows nothing of the app lives in `lib/` and the ui-kit at the root,
  with the design-system theme, in folders named by what they hold, and depends on nothing from the app, by import
  or by key, nor knows it by meaning: a ui-kit component named after or shaped by the domain, holding the app's own
  text, or a placeholder or part of such a component is app code, even with plain props. Generic I/O — I/O that
  knows nothing of the app — is its own kind there, called only by tasks; `lib/` holds no tasks.
- [One thing per file](one-thing-per-file.md) — one View, Presenter, stateful logic, task or plain function per file;
  a file over the line limit is a violation.
- [Imports](imports.md) — import along the structure only, never into another app; between kinds of code, View →
  Presenter → stateful logic → tasks → plain functions, a Presenter, stateful logic, a task or a plain function may
  import a store, and only a task imports generic I/O.
