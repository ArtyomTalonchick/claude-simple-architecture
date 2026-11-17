## Levels and placement

**Rule.** The app root and every unit folder are levels, and every level has the same shape: the unit's entry at its
root, the level's non-UI code in its logic folder (default `_logic/`) — apart from its stores, which go to its
stores folder (default `_stores/`) — the shared components folder (default `_components/`) and the child units next
to them. Put code at the lowest level that covers all its users: in the logic folder or the stores folder of the one
unit that uses it, or of the level that holds all its users. When a user appears outside that level, move the code
up to the level that covers them all. An entry of the logic folder with parts only it uses may be a folder that
holds them, and only its entry is used from outside.

**Why.** Code that sits next to its only user can be changed without checking anyone else; code that sits higher
than needed looks shared, so every change to it needs a search for users that do not exist. One shape on every
level means one set of rules to know: a module reads the same way as the app, at any depth. With a level's non-UI
code in one folder and its stores in another, the View — the file people look for — is not lost among a dozen files
of other kinds, the data is seen apart from the logic around it, and code does not move between folders of one
level when its users change: only the level it sits on says who may use it. The same holds one step down: the
parts of one function, kept in its folder, are not mistaken for code the level shares.

**How to check.**

- What a level is:
  - the app root (`root` in the config), and every unit folder — a folder of a level's shape, next to the entry or
    in the components folder, that holds a file named as the folder: the unit's entry. In an app with a UI the
    entry is the unit's View; in an app with no UI it is the file that gives the unit to its users — for a
    server's route module, the file that builds its routes. In a project with several apps, the root of each app
    (`apps` in the config) is a root level of its own; no level spans two apps, and the shared types package is
    not a level;
  - the logic folder, the stores folder and the components folder, and the files in them, belong to the level that
    holds them; a unit folder inside the components folder (`_components/StatusBadge/`) is a level of its own;
  - an entry folder in the logic folder or the tasks folder (below) is not a level and not a unit, even though it
    holds a file named as the folder: the unit definition applies to the folders of a level's shape, not to the
    folders inside the logic folder or the tasks folder. An entry folder and its files belong to the level that
    holds the logic folder;
  - the parent of a level is the nearest level above it; levels with the same parent are siblings; one level's
    subtree is a branch.
- The shape of a level, every part optional:
  - the entry, named as the folder, at the level root;
  - the logic folder (default `_logic/`) with all the non-UI code of the level but its stores: the Presenter,
    stateful logic, plain functions, a types file and a constants file (`types` and `constants`), and a tasks
    folder (default `_tasks/`) with the tasks and the plain functions only tasks use
    ([Stateful logic and plain functions](stateful-logic-and-functions.md)). It holds both the own unit's code and
    the code the level's units share. The logic folder holds files, entry folders and the tasks folder; the tasks
    folder holds task files, task entry folders, and the plain functions only tasks use, as files or entry folders.
    Tests aside (below), these lists name the whole shape. A level with no such code has no logic folder;
  - the stores folder (default `_stores/`) with the stores of the level
    ([Stateful logic and plain functions](stateful-logic-and-functions.md)), flat: both the own unit's stores and
    the ones the level's units share. A level with no store has no stores folder;
  - the components folder (default `_components/`) with the child units used by two or more units of this level;
  - child units — unit folders used only by this level, with the same shape inside.
- An entry folder: stateful logic, a plain function or a task — an entry of the logic folder or the tasks folder,
  not the Presenter — that has parts only it uses may be a folder named as its entry file, holding the entry and
  those parts. A part is code that only this entry uses, directly or through its other parts: stateful logic or a
  plain function of stateful logic, a smaller task or a plain function of a task, a plain function of a plain
  function, and a types or a constants file used only inside the folder. A task is never a part of stateful logic
  or of a plain function: it stays in the tasks folder. The parts decide, not the line count: an entry with parts
  only it uses may be a folder at any size. In the folder:
  - the entry is the file named as the folder; the parts are files next to it, one thing each, and keep their own
    kinds. An entry folder holds no folder but its tests;
  - its tests — of the entry and of its parts — sit in it, in a tests folder or beside the files, by the project's
    convention (below);
  - from outside the folder only the entry is imported; the entry imports its parts, and the parts import each
    other ([Imports](imports.md));
  - its users are the users of its entry: the folder counts as one file of the logic folder or the tasks folder
    that holds it.
- A part used by anything outside its entry's folder, tests aside, is a violation: it is not a part. It moves out
  next to the folder — to the logic folder, or to the tasks folder if it is a task — or higher, by the rules
  below, when its users sit elsewhere. An entry folder that holds only its entry, or its entry and its tests, is a
  violation: it is a file.
- Any other file or folder at a level root is a violation: a folder of stateful logic, functions or tasks, a types or
  constants file, or a file of non-UI code goes to the logic folder; a store goes to the stores folder; a unit goes
  next to the entry or to the components folder. Tests and the pure zone are not part of the shape (below).
- A store in the logic folder or in its tasks folder is a violation, even when one unit uses it: it goes to the
  stores folder of the same level.
- The root level is not named after its entry. Its root holds two files of its own unit: the entry — the file that
  builds the app (e.g. `App`, `createApp`) — and the file the app starts from (e.g. `main`, `index`), which only
  runs the entry. Neither is a violation; the rest of the root level's non-UI code goes to its logic folder and its
  stores folder.
- The users of a file in a level's logic folder or stores folder are counted by where they sit. The level's own
  unit — its entry and the files of its logic folder and its stores folder — counts as one user; each child unit,
  with everything inside it, counts as one more. Code used by the own unit and by one child unit has two users: it
  stays in the level's folder, and the child imports it from there, as code of a level above ([Imports](imports.md)).
- A file in a level's logic folder whose only user is one child unit is a violation: it belongs in that child's
  logic folder. A store in a level's stores folder whose only user is one child unit is a violation: it belongs in
  that child's stores folder. A unit in the components folder with only one user is a violation: it belongs in that
  user's folder, as its child unit.
- A task whose only user is another task is a part of it: it lives in that task's entry folder, next to its entry
  ([Tasks](tasks.md)) — not as a task of its own in the tasks folder.
- Inside a level, a plain function lies by the kinds of its users: in the tasks folder when only tasks use it, in
  the logic folder outside the tasks folder when a Presenter, stateful logic or the entry of a unit with no UI uses
  it, with or without tasks
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)).
- A child unit or a file used by two or more siblings, or from outside its parent level, is a violation: it
  belongs at the lowest level that covers all its users — a unit in that level's components folder, a store in its
  stores folder, other code in its logic folder.
- A type or a constant used by one file lives in that file. One used by two or more files lives in the types file
  or the constants file of the logic folder of the lowest level that covers those files, or of the entry folder
  that holds them all — not exported from one of its users, which would make one user look like its owner. A type
  or a constant in a types file or a constants file with only one user file is a violation: it belongs in that
  file.
- An empty logic, tasks, stores or components folder is a violation: a folder exists only when it has content.
- A child unit does not need the parent's name as a prefix.
- The exception is the pure zone ([Pure zone](pure-zone.md)): it sits at the root level next to its shape, and pure
  code stays there whatever the number of its users. The ui-kit is part of the pure zone, not a components folder
  of the root level: its name is set on its own and does not follow the components folder's name.
- Tests are not part of the shape. A test lives next to the code it tests — a test file beside it, or a tests
  folder in the folder that holds it, by the project's convention — and is not a unit, a folder of the shape or a
  level. A test is not a user: it does not count when deciding where code goes, and a file used by one unit and by
  tests still has one user.

**Good.**

```
OrdersPage/
  OrdersPage            View
  _logic/
    presenter           Presenter
    orderFilters        used only by the presenter
    constants           PAGE_SIZE — used by the presenter and by OrderTable
    types               StatusCount — used by orderFilters and by OrderFilters
                        OrderFilter — used by the presenter and orderFilters
    _tasks/
      exportOrders/     an entry folder — not a unit and not a level
        exportOrders    the entry: a task only the presenter calls
        toCsvRow        a part: a plain function only exportOrders uses
        tests/          tests of exportOrders and toCsvRow
  _stores/
    ordersStore         read by orderFilters and by exportOrders — one user, the own unit, yet a store: not in
                        _logic/
  _components/
    StatusBadge/        used by OrderTable and OrderFilters
  OrderTable/           used only by OrdersPage
    OrderTable
    _logic/
      presenter
      selectedRows      stateful logic: subscribes to _stores/selectionStore
    _stores/
      selectionStore    used only inside OrderTable
    tests/              tests of OrderTable and its presenter — not a level
  OrderFilters/         used only by OrdersPage
    OrderFilters        no logic, so no _logic/
```

An app with no UI has the same levels, with an entry in place of a View:

```
src/
  index                 starts the app: runs createApp
  createApp             the root unit's entry: builds the app with its route modules
  orders/
    orders              the entry: builds the routes of /orders
    _logic/
      requireUser       used by orders
      parseOrderId      used by two child units
      types             used by orders and by the child units
      _tasks/
        loadOrder       used by orders and by items
    _stores/
      ordersCache       orders kept in memory, read and filled by loadOrder
    items/              the routes of /orders/:id/items — a child unit
      items             the entry
    payments/           the routes of /orders/:id/payments — a child unit
      payments          the entry
```

**Bad.**

```
OrdersPage/
  OrdersPage
  presenter             at the level root — it belongs in _logic/
  types                 at the level root — it belongs in _logic/
  hooks/
    orderFilters        a stateful logic folder at the level root — it belongs in _logic/
  _logic/
    formatTotal         used only by OrderTable — it belongs in OrderTable/_logic/
    ordersStore         a store in _logic/ — it belongs in OrdersPage/_stores/
    orderFilters/
      orderFilters
      statusOptions     a part of orderFilters, but OrderFilters/_logic/presenter uses it too — not a part: it
                        belongs next to the folder, in OrdersPage/_logic/
    _tasks/
      exportOrders/     holds only its entry — no parts, so it is a file: _tasks/exportOrders
        exportOrders
  _stores/
    selectionStore      used only by OrderTable — it belongs in OrderTable/_stores/
  _components/          empty
  OrderTable/
    OrderTable
    StatusBadge/        OrderFilters uses it too — it belongs in OrdersPage/_components/
  OrderFilters/
    OrderFilters
    _logic/
      types             StatusCount — orderFilters of OrdersPage uses it too, so OrdersPage would import from
                        inside a child — it belongs in OrdersPage/_logic/types
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — the View and Presenter files of a
level.
