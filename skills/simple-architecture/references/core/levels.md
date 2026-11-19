## Levels and placement

**Rule.** The app root and every unit folder are levels, and every level has the same shape: the unit's entry at its
root, the own unit's non-UI code in its logic folder (default `_logic/`) — apart from its stores, which go to its
stores folder (default `_stores/`) — the types file and the constants file of the level, the shared components
folder (default `_components/`) and the child units next to them. The logic folder holds only the own unit's code:
only the unit's entry and the files of that folder import from it. A level shares with its units only components,
stores with UI state, a types file and a constants file; put each at the lowest level that covers all its users,
and move it up when a user appears outside that level. Tasks that two or more units call, and the stores those
tasks reach, do not live in the levels: they go to the app's tasks folder and stores folder (default `tasks/` and
`stores/`) next to the pure zone. An entry of the logic folder with parts only it uses is a folder that holds them,
and only its entry is used from outside; a part with parts only it uses is such a folder inside it, at any depth. In
a tasks folder that folder is allowed, not required, at any depth: a task and its parts may also lie flat. A store
with parts only it uses — the type of its API, its implementations — is such a folder in its stores folder.

**Why.** Code that sits next to its only user can be changed without checking anyone else; code that sits higher
than needed looks shared, so every change to it needs a search for users that do not exist. One shape on every
level means one set of rules to know: a module reads the same way as the app, at any depth. A logic folder that
holds only its unit's code says what that unit does, and whether a file may import from it is answered by the path
alone, with no users to count. Business actions do not depend on the UI, so they do not belong in the UI tree:
spread over its levels, a task moves each time a new caller appears; in the app's own folders it stays put. With
the own unit's code in one folder and its stores in another, the View — the file people look for — is not lost
among a dozen files of other kinds, and the data is seen apart from the logic around it. The same holds one step
down, at every depth: the parts of one function, kept in its folder, are not mistaken for other code of the unit,
and a reader sees which files belong together — a flat list of files does not say what uses what.

**How to check.**

- What a level is:
  - the app root (`root` in the config), and every unit folder — a folder of a level's shape, next to the entry or
    in the components folder, that holds a file named as the folder: the unit's entry. In an app with a UI the
    entry is the unit's View; in an app with no UI it is the file that gives the unit to its users — for a
    server's route module, the file that builds its routes. In a project with several apps, the root of each app
    (`apps` in the config) is a root level of its own; no level spans two apps, and the shared types package is
    not a level;
  - the logic folder, the stores folder, the components folder, the types file and the constants file, and the
    files in them, belong to the level that holds them; a unit folder inside the components folder
    (`_components/StatusBadge/`) is a level of its own;
  - an entry folder in the logic folder or the tasks folder (below) is not a level and not a unit, even though it
    holds a file named as the folder: the unit definition applies to the folders of a level's shape, not to the
    folders inside the logic folder or the tasks folder. An entry folder, the entry folders nested in it and their
    files belong to the level that holds the logic folder;
  - the app's tasks folder and stores folder (below) are not levels and belong to no level;
  - the parent of a level is the nearest level above it; levels with the same parent are siblings; one level's
    subtree is a branch.
- The shape of a level, every part optional:
  - the entry, named as the folder, at the level root;
  - the logic folder (default `_logic/`) with the non-UI code of the own unit but its stores: the Presenter,
    stateful logic, plain functions, and a tasks folder (default `_tasks/`) with the tasks only this unit calls and
    the plain functions only those tasks use ([Stateful logic and plain functions](stateful-logic-and-functions.md)).
    It holds the own unit's code only — never code the level's other units use. The logic folder holds files, entry
    folders and the tasks folder; the tasks folder holds task files, task entry folders, and the plain functions only
    its tasks use, as files or entry folders. Tests aside (below), these lists name the whole shape. A level with no
    such code has no logic folder;
  - the types file and the constants file (`types` and `constants`) at the level root, with the types and the
    constants that two or more files of the level use — files of the own unit, of its child units, or both;
  - the stores folder (default `_stores/`) with the stores of the level
    ([Stateful logic and plain functions](stateful-logic-and-functions.md)), as files or store entry folders
    (below): the own unit's stores and the stores with UI state the level's units share. A store that a task of
    the app's tasks folder reads or changes is not here: it is in the app's stores folder (below). A level with no
    store has no stores folder;
  - the components folder (default `_components/`) with the child units used by two or more units of this level;
  - child units — unit folders used only by this level, with the same shape inside.
- What a level shares with the units below it is only this: the units in its components folder, the stores in its
  stores folder, its types file and its constants file. There is no place at a level for shared logic. Behaviour
  that two units need is a component that holds it — a toggle with its own Presenter, a small component that formats
  what it shows — placed by the rules of the components folder. A task, a store a task reaches and a plain function
  on the app's data that several units use go to the app's folders (below).
- The app's tasks folder and stores folder hold what the app's units share of its business code. Their places are
  set per app by the config keys `tasks` and `stores` (see `SKILL.md`); by default they lie next to the pure zone,
  named `tasks/` and `stores/` with no prefix — they are not folders of a level's shape: next to the folder the
  `lib` key names, or, without it, at the root level next to its shape, as the pure zone is. They do not move with
  their users.
  - The app's tasks folder holds the tasks with users in two or more units, and the plain functions that work on
    the app's data — convert it, validate it, build a request — used by tasks of this folder or by two or more
    units. A task one unit calls stays in that unit's `_logic/_tasks/`; when a second unit calls it, it moves to the
    app's tasks folder in one step, with the plain functions only it uses, and any store it reaches moves to the
    app's stores folder. The users of a task are the units that call it and the tasks of the app's tasks folder
    that call it: a task that only other tasks of this folder call stays here.
  - The app's stores folder holds the stores that a task of the app's tasks folder reads or changes.
  - Folders inside either are optional: tasks and stores may be grouped by topic (`tasks/favorites/`,
    `tasks/search/`), as pure-zone modules are. A folder named by the kind of code (`helpers/`, `utils/`, `hooks/`,
    a nested `tasks/`) is a violation ([Pure zone](pure-zone.md)). An entry folder for a task and the plain
    functions only it uses is allowed there, not required, as in a unit's tasks folder (below); a store with parts
    only it uses is a store entry folder, as in a level's stores folder (below).
  - The app's tasks folder may hold a types file and a constants file, for the types and constants that two or more
    of its files use, or that its files and the units use. The type of a store's data is declared in the store file,
    as part of its API, and imported from there.
  - A task in the app's tasks folder whose only user is one unit is a violation: it belongs in that unit's
    `_logic/_tasks/`. A store in the app's stores folder that no task of the app's tasks folder reaches is a
    violation: it belongs in the stores folder of the lowest level that covers its users. A store in a level's stores
    folder that a task of the app's tasks folder reaches is a violation: it belongs in the app's stores folder.
- An entry folder: stateful logic, a plain function or a task — an entry of the logic folder or the tasks folder,
  not the Presenter — that has parts only it uses is a folder named as its entry file, holding the entry and
  those parts. A part is code that only this entry uses, directly or through its other parts: stateful logic or a
  plain function of stateful logic, a plain function of a task, a plain function of a plain function, and a types or
  a constants file used only inside the folder. A task is never a part — of stateful logic, of a plain function or
  of another task: it lies in a tasks folder as a task of its own, and other tasks call it freely. The parts decide,
  not the line count: an entry with parts only it uses is a folder at any size. In a tasks folder — a unit's or the
  app's — the folder is a convenience: a task and the plain functions only it uses may lie flat in the tasks folder,
  or in an entry folder named as the task, and both are fine. In the folder:
  - the entry is the file named as the folder; the parts are files next to it, one thing each, and keep their own
    kinds;
  - a part that has parts only it uses is an entry folder of its own, inside its entry's folder: named as the part,
    holding it and those parts — at any depth, by the same rules; inside a task's entry folder that nested folder is
    allowed, not required, as in the tasks folder. An entry folder holds no folder but its tests and the entry
    folders of its parts;
  - its tests — of the entry and of the parts that lie in it as files — sit in it, in a tests folder or beside the
    files, by the project's convention (below);
  - from outside the folder only the entry is imported; the entry imports its parts — a part that is an entry
    folder through its entry — and the parts import each other ([Imports](imports.md));
  - its users are the users of its entry: the folder counts as one file of the folder that holds it — the logic
    folder, the tasks folder, or the folder of the entry it is a part of.
- A store entry folder: a store with parts only it uses is a folder named as the store, in a stores folder — a
  level's or the app's — holding the store's entry and those parts: the type of its API, its implementations, the
  plain functions only it uses, a constants file used only inside the folder. The entry is the store its users
  reach: it gives them the API and, when the store has several implementations, picks one by the environment (in
  memory locally, a database where the app is deployed). An implementation is a part of the store, not a store of
  its own, so the entry importing it is not one store importing another. The rules of an entry folder hold:
  only the entry is imported from outside, a part used from outside is not a part, and a folder that holds only its
  entry is a file. A store entry folder is not a level and not a unit; it belongs to the level that holds the
  stores folder, or to none in the app's stores folder.
- In a unit's logic folder outside its tasks folder, an entry with parts only it uses whose parts lie next to it —
  in the logic folder, or in the folder of the entry it is a part of — is a violation: it is an entry folder, and
  those parts move into it. In a tasks folder, a unit's or the app's, parts lying flat are not a violation, inside
  a task's entry folder too: an entry folder is not required there.
- A part used by anything outside its entry's folder, tests aside, is a violation: it is not a part of that entry.
  It moves out to the nearest folder that covers all its users: next to the folder — in the outer entry folder
  when all its users are there, else in the logic folder, or in the tasks folder if only tasks use it — or, when
  its users sit in other units, where those users say (below). An entry folder that holds only its entry, or its
  entry and its tests, is a violation: it is a file.
- Any other file or folder at a level root is a violation: a folder of stateful logic, functions or tasks, or a file
  of non-UI code, goes to the logic folder; a store goes to the stores folder; a unit goes next to the entry or to
  the components folder. Tests, the pure zone and the app's tasks folder and stores folder are not part of the shape
  (below).
- A types file or a constants file in the logic folder is a violation: it lies at the level root. A store in the
  logic folder or in its tasks folder is a violation, even when one unit uses it: it goes to the stores folder of the
  same level.
- The root level is not named after its entry. Its root holds the files of its own unit: the entry — the file that
  builds the app (e.g. `App`, `createApp`) — and the file the app starts from (e.g. `main`, `index`), which runs
  the entry and may wrap it in what the app mounts around it (the theme, a data cache, a stricter checking mode
  for development). An app that runs in more than one runtime — a server started locally and as a cloud function —
  has one start file per runtime, each running the same entry in its own way (`index`, `function`). None of them is
  a violation; a second start file for one runtime is. The rest of the root unit's non-UI code goes to its logic
  folder and its stores folder. The root level has no other exception for shared code: it is a level like any other.
- A unit that only the start files use, to wrap the entry in what the app mounts around it, is a child unit of the
  root level, next to the entry. Its user is the start file, not the entry, and that is not a violation: the start
  file belongs to the root level's own unit.
- The logic folder belongs to the own unit: only the unit's entry and the files of the logic folder import from it.
  A file in it used by anything else — a child unit, a sibling, another level, the app's tasks folder — is a
  violation, found by the path of the import alone ([Imports](imports.md)). It goes where its kind says: a task or a
  plain function on the app's data used by two or more units to the app's tasks folder; code that knows nothing of
  the app to the pure zone ([Pure zone](pure-zone.md)); a type or a constant to the types file or the constants file
  of the lowest level that covers its users; behaviour of the UI that two units need to a component that holds it.
  A file whose only user is one child unit belongs in that child's logic folder.
- The users of a file in a level's stores folder, of its types file and constants file, and of a unit in its
  components folder are counted by where they sit. The level's own unit — its entry and the files of its logic
  folder and its stores folder — counts as one user; each child unit, with everything inside it, counts as one more.
  Code used by the own unit and by one child unit has two users: it stays at the level, and the child imports it
  from there, as code of a level above ([Imports](imports.md)).
- A store in a level's stores folder whose only user is one child unit is a violation: it belongs in that child's
  stores folder. A type or a constant in a level's types file or constants file whose only users sit in one child
  unit is a violation: it belongs in that child. A unit in the components folder with only one user is a violation:
  it belongs in that user's folder, as its child unit.
- A plain function lies by its users. Inside a unit: in the tasks folder when only the unit's tasks use it, in the
  logic folder outside the tasks folder when a Presenter, stateful logic or the entry of a unit with no UI uses it,
  with or without tasks ([Stateful logic and plain functions](stateful-logic-and-functions.md)). One that works on
  the app's data and is used by tasks of the app's tasks folder, or by two or more units, lies next to the tasks in
  the app's tasks folder; a Presenter may import it. One that knows nothing of the app goes to the pure zone.
- A child unit or a file used by two or more siblings, or from outside its parent level, is a violation: it
  belongs where its users are covered — a unit in the components folder of the lowest level that covers them, a
  store with UI state in its stores folder, a type or a constant in its types file or constants file; a task, a
  store a task of the app's tasks folder reaches and a plain function on the app's data in the app's folders.
- A type or a constant used by one file lives in that file. One used by two or more files lives in the types file
  or the constants file at the root of the lowest level that covers those files, in the app's tasks folder when a
  file of that folder uses it, or in the innermost entry folder that holds them all — not exported from one of its
  users, which would make one user look like its owner. A type or a constant in a types file or a constants file
  with only one user file is a violation: it belongs in that file.
- A type that is part of a props type — the type of one prop, such as an icon name or a variant — goes the way the
  props type goes: declared with it, passed on by the View, imported from the View
  ([View and Presenter](view-presenter.md)), however many files use it. That is not a shared type exported from
  one of its users, and it does not move to a types file. The pure zone has no types file: a type a pure-zone
  module exports is part of its API and is imported from that module ([Pure zone](pure-zone.md)). The same holds for
  the type of a store's data: it is part of the store's API.
- A type is used by a file that names it. A file that derives a type from another file's value or type — the type
  of a function, of its parameters or of its result — without naming the type it reaches does not use that type:
  it does not count among the type's users, and the type stays where it is declared.
- An empty logic, tasks, stores or components folder is a violation, and so is an empty app tasks folder or stores
  folder: a folder exists only when it has content.
- A child unit does not need the parent's name as a prefix.
- The exceptions are the pure zone ([Pure zone](pure-zone.md)) and the app's tasks folder and stores folder: they sit
  at the root level next to its shape — or, when the app's `lib` key sets the pure zone apart, outside every level,
  and the root level holds none of them — and their code stays there whatever the number of its users. The ui-kit is
  part of the pure zone, not a components folder of the root level: its name is set on its own and does not follow
  the components folder's name.
- Tests are not part of the shape. A test lives next to the code it tests — a test file beside it, or a tests
  folder in the folder that holds it, by the project's convention — and is not a unit, a folder of the shape or a
  level. A test is not a user: it does not count when deciding where code goes, and a file used by one unit and by
  tests still has one user. Only where a test lives is checked; what it imports is not ([Imports](imports.md)).

**Good.**

```
OrdersPage/
  OrdersPage            View
  types                 StatusCount — used by _logic/orderFilters and by OrderFilters
                        OrderFilter — used by the presenter and orderFilters
  constants             PAGE_SIZE — used by the presenter and by OrderTable
  _logic/               only OrdersPage's own code
    presenter           Presenter
    orderFilters        used only by the presenter
    openOrder           declares OpenOrderOptions; the presenter derives the type of openOrder's parameters
                        without naming it — one user, so the type stays in openOrder
    _tasks/
      exportOrders/     an entry folder — not a unit and not a level; in a tasks folder allowed, not required
        exportOrders    the entry: a task only OrdersPage calls
        toCsvRow        a part: a plain function only exportOrders uses
        tests/          tests of exportOrders and toCsvRow
      printOrders       a task only OrdersPage calls, lying flat with toPrintRow, the plain function only it
      toPrintRow        uses — as fine as an entry folder in a tasks folder
  _stores/
    filtersStore        the selected filters, UI state read by orderFilters and by OrderTable — shared by the level
  _components/
    StatusBadge/        used by OrderTable and OrderFilters
  OrderTable/           used only by OrdersPage
    OrderTable
    _logic/
      presenter         calls the app's task cancelOrder; reads PAGE_SIZE from OrdersPage/constants
      selectedRows      stateful logic: subscribes to _stores/selectionStore
    _stores/
      selectionStore    used only inside OrderTable
    tests/              tests of OrderTable and its presenter — not a level
  OrderFilters/         used only by OrdersPage
    OrderFilters        no logic, so no _logic/
```

The app's own folders, next to the pure zone — `root` is `src/App`, `lib` is `src/lib`:

```
src/
  main                  starts the app: runs App
  lib/                  the pure zone: knows nothing of the app
  stores/               the app's data
    ordersStore         read and changed by tasks/orders/cancelOrder and tasks/orders/loadOrders
  tasks/                business actions
    orders/             a folder by topic — optional
      cancelOrder       called by OrderTable and by OrderDetails — two units
      loadOrders        called by OrdersPage and by Dashboard — two units
      toOrderRequest    a plain function on the app's data: used by cancelOrder and by OrderForm's presenter
  App/                  the UI tree: ordinary levels, the root level included
    App
    OrdersPage/
```

Entry folders nest: a part with parts only it uses is an entry folder inside its entry's folder.

```
ProductSearch/
  ProductSearch         View
  _logic/
    presenter           Presenter: search = productSearch()
    productSearch/      an entry folder — productSearch is used only by the presenter
      productSearch     the entry: stateful logic, joins productParams and productRequest
      productParams     a part: the query and the filters kept in the address — used only by productSearch
      productRequest/   a part with a part only it uses — an entry folder inside productSearch/
        productRequest  its entry: stateful logic, keeps loading and error of the task searchProducts, which it
                        calls from the search handler it returns
        toSearchView    a part of productRequest: a plain function, response -> the list to show
        tests/          tests of productRequest and toSearchView
      tests/            tests of productSearch and productParams
    _tasks/
      searchProducts    the server call for a query — only ProductSearch calls it; a task is never a part
```

The root level of an app with a UI, with the file the app starts from:

```
src/
  main                  starts the app: runs App, wrapped in AppShell and a stricter checking mode
  App                   the root unit's entry: builds the app
  AppShell/             what the app mounts around App — the theme, a data cache; its only user is main, so it is
    AppShell            a child unit of the root level
```

An app with no UI has the same levels, with an entry in place of a View. Its `root` is `src`, so its pure zone and
its own folders lie at the root level, next to its shape:

```
src/
  index                 starts the app locally: serves createApp
  function              starts the app as a cloud function: wraps createApp — one start file per runtime
  createApp             the root unit's entry: builds the app with its route modules
  lib/                  the pure zone
  stores/
    ordersCache         orders kept in memory, read and filled by tasks/loadOrder
    ordersTable/        a store entry folder, read and changed by tasks/loadOrder: a store with parts only it uses
      ordersTable       the entry: the store's API; picks the database where the app is deployed, memory otherwise
      types             OrdersTable — the API: list, get, put, remove
      memoryOrders      a part: the API over a map
      databaseOrders    a part: the API over the app's own database, through its client
  tasks/
    loadOrder           called by orders and by items — two units
    parseOrderId        a plain function on the app's data: used by items and payments
  orders/
    orders              the entry: builds the routes of /orders
    types               used by orders and by the child units
    _logic/
      requireUser       used only by orders
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
  types                 OpenOrderOptions — moved out of openOrder because the presenter derives the type of
                        openOrder's parameters; that is no use of the type: it belongs in openOrder
  hooks/
    orderFilters        a stateful logic folder at the level root — it belongs in _logic/
  _logic/
    constants           PAGE_SIZE, used by the presenter and by OrderTable — a constants file in _logic/: it lies at
                        the level root, OrdersPage/constants
    formatTotal         used only by OrderTable — it belongs in OrderTable/_logic/
    statusLabel         a plain function the presenter and OrderTable/_logic/presenter use — OrderTable imports from
                        its parent's logic folder: behaviour two units need is a component, a StatusLabel in
                        OrdersPage/_components/, or, if it only converts the app's data, a plain function in the
                        app's tasks folder
    ordersStore         a store in _logic/ — it belongs in a stores folder
    openOrder
    orderFilters/
      orderFilters
      statusOptions     a part of orderFilters, but OrderFilters/_logic/presenter uses it too — not a part, and
                        not a file of OrdersPage/_logic/ either, which OrderFilters may not import: a constant, it
                        belongs in OrdersPage/constants
    _tasks/
      cancelOrder       called by the presenter and by OrderTable/_logic/presenter — two units: it belongs in the
                        app's tasks folder
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
      types             StatusCount, which _logic/orderFilters of OrdersPage uses too — a types file in _logic/, and
                        OrdersPage would import from inside a child: it belongs in OrdersPage/types
```

The app's own folders, misused:

```
src/
  stores/
    selectionStore      UI state no task of tasks/ reaches — it belongs in the stores folder of the lowest level
                        that covers its users
    ordersTable         the store's entry, with its parts lying next to it — a store with parts only it uses is a
    memoryOrders        store entry folder: ordersTable/
    databaseOrders
  tasks/
    exportOrders        called only by OrdersPage — one unit: it belongs in OrdersPage/_logic/_tasks/
    helpers/            a folder named by the kind of code
  App/
    OrdersPage/
      _stores/
        ordersStore     read by tasks/orders/cancelOrder — a store a task of the app's tasks folder reaches: it
                        belongs in src/stores/
```

The search above, with the parts lying flat:

```
ProductSearch/
  ProductSearch
  _logic/
    presenter
    productSearch       its parts lie next to it — it is an entry folder: productSearch/
    productParams       used only by productSearch — a part: it belongs in productSearch/
    productRequest      used only by productSearch — a part: it belongs in productSearch/
    toSearchView        used only by productRequest — a part of a part: it belongs in productSearch/productRequest/
    _tasks/
      searchProducts
```

The nesting lost one level down, and a part used from outside its folder:

```
ProductSearch/
  _logic/
    presenter           imports productSearch/productParams
    productSearch/
      productSearch
      productParams     the presenter uses it too — not a part: it moves out to _logic/, the nearest folder that
                        covers the presenter and productSearch
      productRequest    its part lies next to it — it is an entry folder: productSearch/productRequest/
      toSearchView      used only by productRequest — it belongs in productSearch/productRequest/
```

**Stack notes.**

- [react/view-presenter.md](../stack/react/view-presenter.md) — the View and Presenter files of a level.
- [react/levels.md](../stack/react/levels.md) — a type derived from a value or another type is not used by the file
  that derives it.
