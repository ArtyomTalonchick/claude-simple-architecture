# Core rules

Rules that apply to every project, whatever its stack. A core rule names no technology — no library, framework
or tool; a rule that needs such a name goes to a stack file in [../stack/](../stack/).

Each core rule gets its own file here, `<rule>.md`, written by the template in `docs/rule-format.md` of this
plugin's repository.

- [View and Presenter](view-presenter.md) — markup in the View, all logic in the Presenter.
- [Levels and placement](levels.md) — every code folder has the same shape; code lives at the lowest level that
  covers all its users.
