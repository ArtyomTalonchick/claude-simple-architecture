## Levels and placement

**Rule.** The app root and every unit folder are levels, and every level has the same shape: the unit's entry at its
root, the level's non-UI code in its logic folder (default `logic/`), the shared components folder (default
`components/`) and the child units next to them. Put code at the lowest level that covers all its users: in the
logic folder of the one unit that uses it, or of the level that holds all its users. When a user appears outside
that level, move the code up to the level that covers them all.

**Why.** Code that sits next to its only user can be changed without checking anyone else; code that sits higher
than needed looks shared, so every change to it needs a search for users that do not exist. One shape on every
level means one set of rules to know: a module reads the same way as the app, at any depth. With all of a level's
non-UI code in one folder, the View — the file people look for — is not lost among a dozen files of other kinds,
and code does not move between folders of one level when its users change: only the level it sits on says who may
use it.

**How to check.**

- What a level is:
  - the app root (`root` in the config), and every unit folder — a folder that holds a file named as the folder:
    the unit's entry. In an app with a UI the entry is the unit's View; in an app with no UI it is the file that
    gives the unit to its users — for a server's route module, the file that builds its routes. In a project with
    several apps, the root of each app (`apps` in the config) is a root level of its own; no level spans two apps,
    and the shared types package is not a level;
  - the logic folder and the components folder, and the files in them, belong to the level that holds them; a
    unit folder inside the components folder (`components/StatusBadge/`) is a level of its own;
  - the parent of a level is the nearest level above it; levels with the same parent are siblings; one level's
    subtree is a branch.
- The shape of a level, every part optional:
  - the entry, named as the folder, at the level root;
  - the logic folder (default `logic/`) with all the non-UI code of the level: the Presenter, stateful logic,
    helpers, a types file and a constants file (`types` and `constants`), and a tasks folder (default `tasks/`)
    with the tasks. It holds both the own unit's code and the code the level's units share. The logic folder is
    flat apart from the tasks folder. A level with no non-UI code has no logic folder;
  - the components folder (default `components/`) with the child units used by two or more units of this level;
  - child units — unit folders used only by this level, with the same shape inside.
- Any other file or folder at a level root is a violation: a stateful logic, helpers or tasks folder, a types or
  constants file, or a file of non-UI code goes to the logic folder; a unit goes next to the entry or to the
  components folder. Tests and the pure zone are not part of the shape (below).
- The root level is not named after its entry. Its root holds two files of its own unit: the entry — the file that
  builds the app (e.g. `App`, `createApp`) — and the file the app starts from (e.g. `main`, `index`), which only
  runs the entry. Neither is a violation; the rest of the root level's non-UI code goes to its logic folder.
- The users of a file in a level's logic folder are counted by where they sit. The level's own unit — its entry
  and the other files of its logic folder — counts as one user; each child unit, with everything inside it,
  counts as one more. Code used by the own unit and by one child unit has two users: it stays in the level's logic
  folder, and the child imports it from there, as code of a level above ([Imports](imports.md)).
- A file in a level's logic folder whose only user is one child unit is a violation: it belongs in that child's
  logic folder. A unit in the components folder with only one user is a violation: it belongs in that user's
  folder, as its child unit.
- A task whose only user is another task is a part of it: it lives in that task's file, or in the task's folder
  next to its entry ([Tasks](tasks.md)) — not as a task of its own in the tasks folder.
- A child unit or a file used by two or more siblings, or from outside its parent level, is a violation: it
  belongs at the lowest level that covers all its users — a unit in that level's components folder, other code in
  its logic folder.
- A type or a constant used by one file lives in that file. One used by two or more files lives in the types file
  or the constants file of the logic folder of the lowest level that covers those files — not exported from one of
  its users, which would make one user look like its owner. A type or a constant in a types file or a constants
  file with only one user file is a violation: it belongs in that file.
- An empty logic, tasks or components folder is a violation: a folder exists only when it has content.
- A child unit does not need the parent's name as a prefix.
- The exception is the pure zone ([Pure zone](pure-zone.md)): it sits at the root level next to its shape, and pure
  code stays there whatever the number of its users.
- Tests are not part of the shape. A test lives next to the code it tests — a test file beside it, or a tests
  folder in the folder that holds it, by the project's convention — and is not a unit, a folder of the shape or a
  level. A test is not a user: it does not count when deciding where code goes, and a file used by one unit and by
  tests still has one user.

**Good.**

```
OrdersPage/
  OrdersPage            View
  logic/
    presenter           Presenter
    orderFilters        used only by the presenter
    constants           PAGE_SIZE — used by the presenter and by OrderTable
    types               StatusCount — used by orderFilters and by OrderFilters
                        OrderFilter — used by the presenter and orderFilters
    tasks/
      exportOrders      a task only the presenter calls
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

An app with no UI has the same levels, with an entry in place of a View:

```
src/
  index                 starts the app: runs createApp
  createApp             the root unit's entry: builds the app with its route modules
  orders/
    orders              the entry: builds the routes of /orders
    logic/
      requireUser       used by orders
      parseOrderId      used by two child units
      types             used by orders and by the child units
      tasks/
        loadOrder       used by orders and by items
    items/              the routes of /orders/:id/items — a child unit
      items             the entry
    payments/           the routes of /orders/:id/payments — a child unit
      payments          the entry
```

**Bad.**

```
OrdersPage/
  OrdersPage
  presenter             at the level root — it belongs in logic/
  types                 at the level root — it belongs in logic/
  hooks/
    orderFilters        a stateful logic folder at the level root — it belongs in logic/
  logic/
    formatTotal         used only by OrderTable — it belongs in OrderTable/logic/
  components/           empty
  OrderTable/
    OrderTable
    StatusBadge/        OrderFilters uses it too — it belongs in OrdersPage/components/
  OrderFilters/
    OrderFilters
    logic/
      types             StatusCount — orderFilters of OrdersPage uses it too, so OrdersPage would import from
                        inside a child — it belongs in OrdersPage/logic/types
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — the View and Presenter files of a
level.
