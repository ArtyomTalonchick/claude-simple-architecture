## Imports

**Rule.** Import only along the structure: from your own children through their entry, from your own unit's logic
folder, from the stores folder, the components folder, the types file and the constants file of your own level and
of any level above, from the app's tasks folder and stores folder, from the pure zone, and from the shared types
package; from an entry folder, at any depth, only its entry. Never reach into another unit's logic folder — an
ancestor's included — into a child, into another branch, into a parent's entry, into the parts of an entry folder
from outside it, or into another app. Between the app's parts, imports go one way: levels → the app's tasks folder →
the app's stores folder → the pure zone. Between kinds of code, imports go one way: View → Presenter → stateful
logic → tasks → plain functions; a Presenter, stateful logic, a task and a plain function may also import a store,
and only a task (and generic I/O itself) imports the generic I/O of the pure zone.

**Why.** When imports follow the folders, the folders tell the truth: a unit can be changed inside without
breaking anyone, moved or deleted with its folder, and every dependency is visible from where a file lies. A
single import into another branch or a parent ties two places that look apart, and the next change to one
breaks the other. A logic folder open only to its own unit makes the check a matter of the path: no users to count,
no reading of who else calls a file. The one-way order between the app's parts keeps business code free of the UI
tree, and the one-way order between kinds of code keeps logic out of Views, keeps the order of a business action's
steps with its caller, and keeps plain functions free to run wherever their users are.

**How to check.** For each import in the diff, find where its target lies and what kind of code both sides are.
Level, parent, sibling and branch are as defined in [Levels and placement](levels.md); a file in a logic folder, a
stores folder or a components folder, and the types file and the constants file, belong to the level that holds
them. The app's tasks folder and stores folder belong to no level.

- Allowed targets:
  - an own child unit, through its entry ([Levels and placement](levels.md)) — in an app with a UI the child's
    View, which also passes on its props type and the types that are part of it
    ([View and Presenter](view-presenter.md));
  - the own unit's logic folder — stateful logic, tasks, plain functions — from the unit's entry and from the files
    of that logic folder only. The Presenter is imported only by its own entry. An entry folder there
    ([Levels and placement](levels.md)) is imported only through its entry;
  - inside an entry folder, the entry imports its parts and the parts import each other; a part that is an entry
    folder of its own is imported only through its entry, from its outer folder too;
  - the types file and the constants file of the own level and of any level above it;
  - the stores in the stores folder of the own level and of any level above it, from a Presenter, stateful logic, a
    task or a plain function. A store entry folder there is imported only through its entry;
  - the units in the components folder of the own level and of any level above it, through their entry;
  - the app's tasks folder — its tasks, its plain functions, its types and constants — from any level, by the kinds
    below; from inside the folder too. An entry folder there is imported only through its entry;
  - the app's stores folder, from any level and from the app's tasks folder, by the kinds below. A store entry
    folder there is imported only through its entry;
  - the pure zone of the own app — at the root level, or where the app's `lib` key puts it — from anywhere in the
    app, by the kinds below. A type of the pure zone is imported from the module that exports it: the pure zone
    has no types file ([Pure zone](pure-zone.md));
  - the shared types package (`shared` in the config), from any app and any kind of code;
  - packages from outside the project, from any kind of code.
- A violation:
  - an import from another unit's logic folder — a parent's, an ancestor's, a sibling's, a child's — of any file in
    it: the Presenter, stateful logic, a task, a plain function. It is found by the path alone, whoever else uses the
    file. The code goes where [Levels and placement](levels.md) says: a task or a plain function on the app's data to
    the app's tasks folder, a type or a constant to a types file or a constants file, behaviour of the UI to a
    component that holds it;
  - an import from inside a child unit — anything in its logic folder, its stores folder, its components folder,
    its types file, its constants file or its own children. A level's stores folder, types file and constants file
    are open to the level itself and to the levels below it, never to the levels above;
  - an import from another branch — a unit inside a sibling, or anything under a level that is not the own level
    or one above it. The code belongs at the lowest common level, or in the app's folders;
  - an import of a parent's or an ancestor's entry. Data comes down through props;
  - in the app's tasks folder, an import from any level; in the app's stores folder, an import from any level or from
    the app's tasks folder. A file of the app's tasks folder imports only from that folder, the app's stores folder,
    the pure zone and the shared types package; a file of the app's stores folder only from the pure zone and the
    shared types package;
  - an import of a part of an entry folder — any file in it but its entry — from outside that folder, whatever
    the level and however deep the folder is nested. The part is not a part then: it moves out to the nearest
    folder that covers all its users ([Levels and placement](levels.md));
  - in a project with several apps (`apps` in the config), an import from another app — its code, its pure zone,
    anything under its root. What two apps share goes to the shared types package, if it is a type;
  - in the shared types package, an import from any app, and any runtime code — a function, a constant, a value. It
    holds types only, so every app can use it and none depends on another through it;
  - a pure zone file importing from the app ([Pure zone](pure-zone.md)).
- By kind, among the allowed targets, a violation is any import outside this list. Code of the pure zone counts
  under its own kind: a pure function as a plain function, pure stateful logic as stateful logic, a ui-kit
  component as a component, generic I/O as generic I/O ([Pure zone](pure-zone.md)). An error class of the pure
  zone — the error that generic I/O throws, for one — is named on its own below: code imports it to throw it, or to
  tell the error apart by its class and answer with it:
  - the file the app starts from — one per runtime ([Levels and placement](levels.md)) → the root entry, the child
    units of the root level it wraps the entry in, the pure zone, types, constants;
  - View → its own Presenter, child units, components from components folders and from the ui-kit, types,
    constants;
  - the entry of a unit with no UI → child units, tasks, plain functions, error classes of the pure zone, types,
    constants — never stateful logic, which is tied to the life of a UI unit
    ([Stateful logic and plain functions](stateful-logic-and-functions.md));
  - Presenter → stateful logic, tasks, stores, plain functions, error classes of the pure zone, types, constants —
    never a View or a component;
  - stateful logic → stateful logic, tasks, stores, plain functions, error classes of the pure zone, types,
    constants;
  - task → tasks, stores, plain functions, generic I/O, error classes of the pure zone, types, constants — never a
    View, a Presenter, stateful logic, the UI framework, or a plain function that acts on the screen or imports from
    the UI framework ([Tasks](tasks.md));
  - plain function → plain functions, stores, types, constants, and pure functions, error classes, types and
    constants of the pure zone — never a task, stateful logic or generic I/O. One that only the UI side uses may
    also import the UI framework's API that is not stateful logic
    ([Stateful logic and plain functions](stateful-logic-and-functions.md));
  - store → plain functions that reach no store, directly or through other plain functions, types, constants, and
    pure functions, types and constants of the pure zone — never another store, a task or stateful logic
    ([Stateful logic and plain functions](stateful-logic-and-functions.md)). The entry of a store entry folder
    imports its parts — the type of its API, its implementations — and that is not one store importing another
    ([Levels and placement](levels.md)); on a server, a store may import the client of its own database;
  - generic I/O ([Pure zone](pure-zone.md)) → generic I/O, pure functions, error classes, types, constants of the
    pure zone. No kind but a task and generic I/O imports it.
- A type-only import is allowed for every kind from any allowed target, including a child's View: a Presenter may
  import the props type its child passes on, or a type that is part of it, such as a variant. It brings in no
  markup and no logic.
- When two units need the same business action, it is a task in the app's tasks folder. When they need the same
  data, it goes to a store: in the app's stores folder when a task of the app's tasks folder reaches it, otherwise in
  the stores folder of the lowest level above them — shared stateful logic would give each user its own copy of the
  state, not one state. When they need the same behaviour of the UI, it is a component that holds it, in the
  components folder of that level: a level has no place for shared logic ([Levels and placement](levels.md)).
- A test ([Levels and placement](levels.md)) is not held to these limits. It may import the code it tests, even
  when that code sits one folder up from a tests folder, and whatever it needs to set up, reset and check state —
  any store, task or function of the app. A test's imports are never a violation.
- Advice, not a violation: an integration test of a level goes through its entry for what it checks — it renders
  the View, or calls the entry of a unit with no UI, and the child units come in through their entries. Such a test
  does not break on a change inside a child unit. Importing a store, a task or a function only to set up, reset or
  check state does not go against it.
- The rule is about targets, not path syntax: a relative path and a path alias are judged the same, and the path
  style is never a finding. Recommended:
  import own child units and the code a test tests by a relative path, everything else through the project's
  root alias, so a path shows at a glance whether it stays inside the unit.

**Good.**

```
src/
  lib/
    http/
      fetchJson
  stores/
    ordersStore         imports nothing of the app — a store of the app's stores folder imports only the pure zone
                        and the shared types package
  tasks/
    cancelOrder         imports stores/ordersStore, tasks/notifyUser, lib/http/fetchJson — called by OrdersPage
                        and by OrderTable
    notifyUser          called by cancelOrder and by OrderFilters
    formatPrice         a plain function on the app's data — used by cancelOrder and by two units
  App/
    OrdersPage/
      OrdersPage        imports OrderTable (its child's View), _logic/presenter
      types             OrderFilter — used by _logic/orderFilters and by OrderFilters
      _logic/
        presenter       imports _logic/orderFilters, tasks/cancelOrder, tasks/formatPrice, the row type from
                        OrderTable
        orderFilters    imports _stores/filtersStore, types, lib/debounce/debounce
        selectedCount   a plain function: imports stores/ordersStore and reads it once — used by the presenter
        _tasks/
          exportOrders/ an entry folder: the presenter imports exportOrders, its entry, and nothing else in it
            exportOrders  imports csvHeader and toCsvRow/toCsvRow — its parts, a nested entry folder through
                          its entry — and stores/ordersStore
            csvHeader     a part: the header line, in the order of the columns
            toCsvRow/     a part with a part only it uses: an entry folder inside exportOrders/
              toCsvRow    imports formatCsvCell, its own part, and csvHeader for the order of the columns —
                          parts import each other
              formatCsvCell
      _stores/
        filtersStore    UI state of the page, read by orderFilters and by OrderFilters
      _components/
        StatusBadge     used by OrderTable and OrderFilters
      OrderTable/
        OrderTable      imports _logic/presenter, OrdersPage/_components/StatusBadge
        _logic/
          presenter     imports tasks/cancelOrder, tasks/formatPrice — the app's tasks folder, not the parent's
                        logic folder
      OrderFilters/
        OrderFilters    imports _logic/presenter, OrdersPage/_components/StatusBadge
        _logic/
          presenter     imports OrdersPage/_stores/filtersStore, OrdersPage/types, tasks/notifyUser
      tests/
        OrdersPage      a test of the page: renders OrdersPage, imports stores/ordersStore to seed and reset it
                        and tasks/cancelOrder to set up a cancelled order — a test imports what it needs
```

```
client/src/             app "client"
  OrderList/
    _logic/
      presenter         imports shared/src/order (the Order type)
server/src/             app "server"
  orders/
    orders              the entry: imports _logic/_tasks/createOrder, and lib/errors/NotFoundError to tell that
                        error apart when the task throws it and answer "not found"
    _logic/
      _tasks/
        createOrder     imports shared/src/order
shared/src/             the shared types package
  order                 type Order — types only
```

**Bad.**

```
src/
  stores/
    ordersStore         imports tasks/notifyUser — a store importing a task, and the app's stores folder importing
                        the app's tasks folder
  tasks/
    cancelOrder         imports App/OrdersPage/_logic/orderFilters — the app's tasks folder importing from a level,
                        and a task importing stateful logic
  App/
    OrdersPage/
      OrdersPage        imports OrderTable/_logic/presenter — inside a child
      _logic/
        formatTotal     imports tasks/notifyUser — a plain function importing a task
        statusLabel
        _tasks/
          exportOrders/
            exportOrders  imports toCsvRow/formatCsvCell — a part of the nested entry folder toCsvRow/, from
                          outside it
            toCsvRow/
              toCsvRow
              formatCsvCell
      OrderTable/
        _logic/
          presenter     imports OrdersPage/_logic/presenter — a parent's Presenter
                        imports OrdersPage/_logic/statusLabel — a parent's logic folder, however many use it
                        imports OrdersPage/_logic/_tasks/exportOrders — a task in a parent's logic folder: a task
                        two units call belongs in the app's tasks folder
                        imports OrderFilters/_logic/presenter — another branch
                        imports OrdersPage/_components/StatusBadge — a Presenter importing a component
                        imports lib/http/fetchJson — generic I/O outside a task
      OrderFilters/
        _stores/
          filterStore   imported by OrdersPage/_logic/orderFilters — inside a child
```

```
client/src/
  OrderList/
    _logic/
      presenter         imports server/src/orders/_logic/_tasks/createOrder — another app
shared/src/
  order                 imports client/src/OrderList — the shared package importing an app
  orderStatuses         ORDER_STATUSES = ['new', 'paid'] — runtime code in the shared package
```

**Stack notes.** None.
