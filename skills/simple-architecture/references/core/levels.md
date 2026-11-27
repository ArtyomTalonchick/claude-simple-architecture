## Levels

**Rule.** Give the app root and every unit folder the same shape: the unit's entry, a logic folder (default
`_logic/`) with the own unit's non-UI code but its stores, a stores folder (default `_stores/`), a types file,
schema files, a constants file, a components folder (default `_components/`) and the child units. Put nothing else
at a level root, and nothing but the own unit's code in its logic folder.

**Why.** One shape on every level means one set of rules to know: a module reads the same way as the app, at any
depth. With the own unit's code in one folder and its stores in another, the entry — the file people look for — is
not lost among files of other kinds, and the data is seen apart from the logic. A logic folder that holds only its
unit's code says what that unit does, and whether a file may import from it is answered by the path alone.

**How to check.**

- A level is the app root (`root` in the config; with `apps`, each app's root — no level spans two apps, and the
  shared package is not a level) and every unit folder: a folder next to the unit's entry or in a components folder
  that holds a file named as the folder, the unit's entry. In an app with a UI the entry is the unit's View; in an
  app with no UI it is the file that gives the unit to its users, such as the one that builds a server's routes.
  A route's handler is no kind of its own: it is that entry, or a part of it — a function the entry calls, in the
  entry's file or in the logic folder — and imports what the entry may ([Imports](imports.md)). What it does and
  what it leaves to a task: [Tasks](tasks.md).
- The logic folder, the stores folder, the components folder, the types file and the constants file, and the files
  in them, belong to the level that holds them. A unit folder in the components folder is a level of its own.
  Entry folders ([Entry folders](entry-folders.md)) and the app's three folders
  ([The app's folders](app-folders.md)) are not levels.
- The parent of a level is the nearest level above it; levels with the same parent are siblings; a level's subtree
  is a branch.
- The parts, each optional:
  - the entry, named as the folder, at the level root;
  - the logic folder: the Presenter — with no UI, the entry's route handlers — stateful logic and plain functions
    of the own unit, as files or entry folders, and a tasks folder (default `_tasks/`) with the tasks only this
    unit calls and the plain functions only those tasks use, as files or entry folders. Tests and a schema beside
    its one user aside, it holds nothing else;
  - the types file, the constants file (`types`, `constants`) and the schema files at the level root
    ([Types and constants](types-and-constants.md));
  - the stores folder: the stores of the level, as files or store entry folders
    ([Placement by users](placement.md));
  - the components folder: the child units that two or more units of this level use;
  - child units: unit folders used only by this level, with the same shape.
- Any other file or folder at a level root is a violation: a folder of stateful logic, functions or tasks (such as
  `hooks/`) or a file of non-UI code goes to the logic folder, a store to the stores folder, a unit next to the entry
  or to the components folder. Tests, the test infrastructure, the pure zone ([Pure zone](pure-zone.md)) and the
  app's three folders are not part of the shape.
- Who may import a file of the logic folder: [Imports](imports.md).
- A types file or a constants file in the logic folder, outside an entry folder, is a violation: it lies at the
  level root. A store in the logic folder or its tasks folder is a violation, even with one user: it goes to the
  stores folder of the same level.
- An empty logic, tasks, stores or components folder or app's tasks, stores or types folder is a violation.
- A child unit needs no prefix of its parent's name.
- The root level is not named after its entry. Its root holds the entry, the file that builds the app (`App`,
  `createApp`), and the file the app starts from (`main`, `index`), which runs the entry and may wrap it in what the
  app mounts around it — a theme, a data cache, a stricter checking mode for development. On start it may call a
  task of the root unit's tasks folder: a check or a setup the app needs before it runs. An app that runs in more
  than one runtime — a server started locally and as a cloud function — has one start file per runtime (`index`,
  `function`), each running the same entry; a second start file for one runtime is a violation. A unit that only the
  start files use to wrap the entry is a child unit of the root level, next to the entry.
  The root level has no other exception: the rest of its unit's code follows the shape.
- When the app sets `lib`, the start files lie in the folder that holds `root`, beside the root folder (`src/main`
  next to `src/App/` and `src/lib/`), not at the root level's root, and are checked as start files all the same.
- A test lives next to the code it tests — a test file beside it, or a tests folder in the folder that holds it, by
  the project's convention — and is not a unit, a level or a folder of the shape. Only where it lives is checked:
  its imports are not ([Imports](imports.md)), and it is not a user ([Placement by users](placement.md)).
- The test infrastructure — a setup file of the test runner, fixtures the tests of two or more places share — lies
  in one folder beside the start file, named by the project's convention. As with a test, only its place is
  checked, not its imports. A fixture the tests of one unit use lies with those tests. A file that is neither a test
  nor test infrastructure and imports from it is a violation.

**Good.**

```
OrdersPage/
  OrdersPage            View
  types                 StatusCount — used by _logic/orderFilters and by OrderFilters
  constants             PAGE_SIZE — used by the presenter and by OrderTable
  _logic/               only OrdersPage's own code
    presenter           Presenter
    orderFilters        used only by the presenter
    _tasks/
      exportOrders      a task only OrdersPage calls
  _stores/
    filtersStore        UI state read by orderFilters and by OrderTable — shared by the level
  _components/
    StatusBadge/        used by OrderTable and OrderFilters
  OrderTable/           used only by OrdersPage
    OrderTable
    _logic/
      presenter
    _stores/
      selectionStore    used only inside OrderTable
    tests/              tests of OrderTable — not a level
  OrderFilters/
    OrderFilters        no logic, so no _logic/
```

The root levels of an app with a UI and of a server that runs in two runtimes:

```
src/
  main                  starts the app: runs App, wrapped in AppShell and a stricter checking mode
  App                   the root unit's entry: builds the app
  AppShell/             the theme and a data cache around App; its only user is main — a child unit of the root
    AppShell
```

```
src/
  index                 starts the app locally: awaits checkConfig, exits when it fails, serves createApp
  function              starts it as a cloud function: wraps createApp — one start file per runtime
  createApp             the root unit's entry: builds the app with its route modules
  _logic/
    _tasks/
      checkConfig       a task: the check index awaits on start
  orders/
    orders              the entry: builds the routes of /orders
    _logic/
      _tasks/
        requireUser     a middleware only these routes use — a task
    items/              the routes of /orders/:id/items — a child unit
      items
```

With `lib` set to `src/lib` and `root` to `src/App`:

```
src/
  main                  the start file, beside the root folder
  test/                 the test runner's setup file and fixtures the tests of two units share
  App/
    App
  lib/
```

**Bad.**

```
OrdersPage/
  OrdersPage
  presenter             at the level root — it belongs in _logic/
  hooks/
    orderFilters        a stateful logic folder at the level root — it belongs in _logic/
  _logic/
    constants           a constants file in _logic/ — it lies at the level root
    ordersStore         a store in _logic/ — it belongs in _stores/
  _components/          empty
```

```
src/
  main                  starts the app in the browser
  start                 starts it in the browser too — a second start file for one runtime
  App
```

With `lib` set to `src/lib` and `root` to `src/App`:

```
src/
  App/
    main                at the root level's root — it lies in src/, beside App/
    _logic/
      presenter         imports a fixture from src/test/ — app code importing the test infrastructure
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — the View and Presenter files of a
level, and the start file.
