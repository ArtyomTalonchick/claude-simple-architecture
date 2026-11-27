# Core rules

Rules that apply to every project, whatever its stack. A core rule names no technology; a rule that needs one goes
to a stack folder in [../stack/](../stack/). Each rule has its own file, written by the template in
`docs/rule-format.md` of this plugin's repository; its **Rule.** paragraph states it, and the line below only says
what it is about.

- [View and Presenter](view-presenter.md) — a UI unit as a View with markup and styles only, and a Presenter with
  all its logic.
- [Levels](levels.md) — the one shape of the app root and of every unit folder.
- [Placement by users](placement.md) — a child unit, store, type or constant at the lowest level that covers its
  users.
- [The app's folders](app-folders.md) — the tasks two or more units call, the stores they reach and the types
  these share with the units, outside every level.
- [Entry folders](entry-folders.md) — an entry with parts only it uses, in a folder named as it.
- [Types and constants](types-and-constants.md) — where a type, a schema or a constant lies by the files that use it.
- [Stateful logic and plain functions](stateful-logic-and-functions.md) — the kinds of non-UI code, stores, and who
  calls whom.
- [Closed store access](closed-store-access.md) — with `storeAccess` set to `"closed"`, a store as a folder of
  plain data behind named reads and writes.
- [Tasks](tasks.md) — a business action as one function with nothing from the UI framework, called from an event.
- [Pure zone](pure-zone.md) — code that knows nothing of the app, generic I/O included.
- [One thing per file](one-thing-per-file.md) — one thing in a file, and the file size limit.
- [Imports](imports.md) — the allowed targets of an import and its one direction.
