## Levels and placement

**Rule.** The app root and every unit folder are levels, and every level has the same shape: the View at its root,
the unit's own logic in its logic folder (default `logic/`), the shared folders and the child units next to them.
Put code at the lowest level that covers all its users: in the logic folder of its one unit, or in a shared folder
of the level that holds all its users. When a user appears outside that level, move the code up to the level that
covers them all.

**Why.** Code that sits next to its only user can be changed without checking anyone else; code that sits higher
than needed looks shared, so every change to it needs a search for users that do not exist. One shape on every
level means one set of rules to know: a module reads the same way as the app, at any depth. With the unit's own
logic in one folder, the View — the file people look for — is not lost among a dozen files of other kinds.

**How to check.**

- What a level is:
  - the app root (`root` in the config), and every unit folder — a folder named as the View it holds. In a
    project with several apps, the root of each app (`apps` in the config) is a root level of its own; no level
    spans two apps, and the shared types package is not a level;
  - a shared folder and the files in it belong to the level that holds the folder; a unit folder inside a shared
    folder (`components/StatusBadge/`) is a level of its own;
  - the parent of a level is the nearest level above it; levels with the same parent are siblings; one level's
    subtree is a branch.
- The shape of a level, every part optional:
  - its own unit — the View (named as the folder) at the level root, and the logic folder (default `logic/`) with
    everything else of the unit's own: the Presenter, stateful logic and helpers only the unit uses, and a tasks
    folder (the same name as the shared one, default `tasks/`) with its own tasks. The logic folder is flat apart
    from `tasks/`. A unit without logic has no logic folder;
  - child units — unit folders used only by this level, with the same shape inside;
  - shared folders, for code used by two or more units of this level: the components folder (default
    `components/`), the stateful logic folder (default `hooks/`), the helpers folder (default `helpers/`), the
    tasks folder (default `tasks/`);
  - a types file and a constants file (`types` and `constants`) for types and constants used by two or more
    files of this level — of its own unit, or of two or more of its units.
- The shared folders, the types file and the constants file stay at the level root, next to the child units, never
  in the logic folder: the logic folder holds only the unit's own code. Any other file only the own unit uses, at
  the level root, is a violation: it belongs in the logic folder.
- The level's own unit counts as one of its units, next to its child units. Code used by the own unit and by one
  child unit has two users: it goes to a shared folder, the types file or the constants file of the level, and the
  child imports it from there, as code of a level above. Inside the child it would be a violation: the own unit
  would import from inside a child.
- A file in a shared folder of a level with only one user is a violation: it belongs in that user's logic folder.
  A type or a constant in the types file or the constants file with only one user file is a violation: it belongs
  in that file. When that one user is itself a file in a shared folder, the file is a part
  of it: a task becomes a folder with its parts ([Tasks](tasks.md)); stateful logic or a helper sits next to its
  user in the same shared folder.
- A child unit or a file used by two or more siblings, or from outside its parent level, is a violation: it
  belongs in a shared folder of the lowest level that covers all its users.
- A type or a constant used by one file lives in that file. One used by two or more files of one unit, and by no
  other unit, lives in the types file or the constants file of that unit's level — not in the logic folder, which
  holds only the unit's own code, and not exported from one of its users, which would make one user look like its
  owner.
- An empty shared folder is a violation: a shared folder exists only when it has content.
- A child unit does not need the parent's name as a prefix.
- The exception is the pure zone ([Pure zone](pure-zone.md)): pure code stays there whatever the number of its
  users, and the lib folder may hold other folders of pure code, such as the theme.
- Tests are not part of the shape. A test lives next to the code it tests — a test file beside it, or a tests
  folder in the folder that holds it, by the project's convention — and is not a unit, a shared folder or a level.
  A test is not a user: it does not count when deciding where code goes, and a file used by one unit and by tests
  still has one user.

**Good.**

```
OrdersPage/
  OrdersPage            View
  logic/                the own unit's logic
    presenter           Presenter
    orderFilters        used only by the presenter
    tasks/
      exportOrders      a task only the presenter calls
  constants             PAGE_SIZE — used by the presenter and by OrderTable
  types                 StatusCount — used by orderFilters (the own unit) and by OrderFilters
                        OrderFilter — used by the presenter and orderFilters, by no other unit
  components/
    StatusBadge/        used by OrderTable and OrderFilters
  OrderTable/           used only by OrdersPage
    OrderTable
    logic/
      presenter
    tests/              tests of OrderTable and its presenter — not a level
  OrderFilters/         used only by OrdersPage
    OrderFilters        no logic, so no logic/
```

**Bad.**

```
OrdersPage/
  OrdersPage
  presenter             at the level root — it belongs in logic/
  logic/
    hooks/
      orderFilters      a shared folder inside logic/ — only the presenter uses it, so it sits in logic/ itself
  components/           empty
  OrderTable/
    StatusBadge/        OrderFilters uses it too — it belongs in OrdersPage/components/
  OrderFilters/
    types               StatusCount — orderFilters of OrdersPage uses it too, so OrdersPage would import from
                        inside a child — it belongs in OrdersPage/types
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — the View and Presenter files of a
level.
