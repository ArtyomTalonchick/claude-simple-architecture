# Core rules

Rules that apply to every project, whatever its stack. A core rule names no technology — no library, framework
or tool; a rule that needs such a name goes to a stack folder in [../stack/](../stack/).

Each core rule gets its own file here, `<rule>.md`, written by the template in `docs/rule-format.md` of this
plugin's repository.

- [View and Presenter](view-presenter.md) — markup in the View, all logic in the Presenter.
- [Levels and placement](levels.md) — every code folder has the same shape; code lives at the lowest level that
  covers all its users.
- [Stateful logic and helpers](stateful-logic-and-helpers.md) — stateful logic uses state, lifecycle or a
  store; a helper is a plain function.
- [Pure zone](pure-zone.md) — code that knows nothing of the app lives in `lib/` and the ui-kit at the root, and
  imports nothing from the app.
- [One thing per file](one-thing-per-file.md) — one View, Presenter, stateful logic or helper per file; a long
  file gets a warning.
- [Imports](imports.md) — import along the structure only; between kinds of code, View → Presenter → stateful
  logic → helpers.
