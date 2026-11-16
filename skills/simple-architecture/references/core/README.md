# Core rules

Rules that apply to every project, whatever its stack. A core rule names no technology — no library, framework
or tool; a rule that needs such a name goes to a stack folder in [../stack/](../stack/).

Each core rule gets its own file here, `<rule>.md`, written by the template in `docs/rule-format.md` of this
plugin's repository.

- [View and Presenter](view-presenter.md) — markup in the View, all logic in the Presenter.
- [Levels and placement](levels.md) — every code folder has the same shape; code lives at the lowest level that
  covers all its users.
- [Stateful logic and helpers](stateful-logic-and-helpers.md) — three kinds of non-UI code: stateful logic uses
  state, lifecycle or a store subscription, a task carries out a user action, a helper is a plain function; one
  concern per piece of stateful logic.
- [Tasks](tasks.md) — a user action is a plain function that reaches stores directly; the Presenter awaits it,
  keeps loading and error, and navigates.
- [Pure zone](pure-zone.md) — code that knows nothing of the app lives in `lib/` and the ui-kit at the root,
  with the design-system theme, and depends on nothing from the app, by import or by key.
- [One thing per file](one-thing-per-file.md) — one View, Presenter, stateful logic, task or helper per file; a file
  over the line limit is a violation.
- [Imports](imports.md) — import along the structure only; between kinds of code, View → Presenter → stateful
  logic → tasks → helpers.
