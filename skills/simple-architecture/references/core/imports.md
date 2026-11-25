## Imports

**Rule.** Import only along the structure — your own children through their entry, your own unit's logic folder,
the shared folders and files of your level and of the levels above, the app's tasks folder and stores folder, the
pure zone, the shared types package — and from an entry folder only its entry. Imports go one way: levels → the
app's tasks folder → the app's stores folder → the pure zone, and View → Presenter → stateful logic and the UI side's
plain functions → tasks → plain functions, with stores and generic I/O open only to the kinds listed below.

**Why.** When imports follow the folders, the folders tell the truth: a unit can be changed inside without
breaking anyone, moved or deleted with its folder, and every dependency is visible from where a file lies. A
single import into another branch or a parent ties two places that look apart, and the next change to one breaks
the other. A change to a file can reach every file that imports it, so code that changes often imports code that
changes less often: the UI changes more often than business actions and data, which is why levels import tasks
and stores, never the reverse. The order between kinds of code keeps logic out of Views and plain functions free to run
wherever their users are.

**How to check.** For each import, find where its target lies and what kind of code both sides are. Level, parent,
sibling and branch are as in [Levels](levels.md).

- Allowed targets:
  - an own child unit, through its entry — in an app with a UI, its View, which also passes on its props type and
    the types that are part of it ([View and Presenter](view-presenter.md));
  - the own unit's logic folder, from the unit's entry and the files of that folder only; the Presenter only from
    its own entry;
  - the types file, the constants file, the stores and the components-folder units (through their entry) of the
    own level and of any level above it;
  - the app's tasks folder, from any level and from inside it; the app's stores folder, from any level and from the
    app's tasks folder;
  - the pure zone of the own app, from anywhere in the app; a type of it from the module that exports it;
  - the shared types package (`shared` in the config), from any app and any kind of code;
  - packages from outside the project, from any kind of code.
- An entry folder, a store entry folder included, at any depth and in any folder, is imported only through its
  entry ([Entry folders](entry-folders.md)); inside it, the entry imports its parts and the parts import each other.
- A violation:
  - an import from another unit's logic folder — a parent's, an ancestor's, a sibling's, a child's — of any file in
    it, found by the path alone, whoever else uses the file; where the code goes is set by
    [Placement by users](placement.md);
  - an import from inside a child unit — its logic folder, stores folder, components folder, types file, constants
    file or its own children: they are open to the level and the levels below it, never to the levels above;
  - an import from another branch — anything under a level that is not the own level or one above it;
  - an import of a parent's or an ancestor's entry; what comes through props is set by
    [View and Presenter](view-presenter.md);
  - in the app's tasks folder, an import from anywhere but that folder, the app's stores folder, the pure zone and
    the shared types package; in the app's stores folder, from anywhere but the pure zone and the shared types
    package — no level, and no task from a store;
  - with `apps` in the config, an import from another app — its code, its pure zone, anything under its root; what
    two apps share goes to the shared types package, if it is a type;
  - in the shared types package, an import from any app, or any runtime code — a function, a constant, a value;
  - in the pure zone, an import from the app ([Pure zone](pure-zone.md)).
- By kind, among the allowed targets, an import outside this list is a violation. Code of the pure zone counts as
  its kind: a pure function as a plain function, pure stateful logic as stateful logic, a ui-kit component as a
  component. An error class of the pure zone — such as the error generic I/O throws — is
  imported to throw it, or to tell the error apart by its class and answer with it:
  - the file the app starts from → the root entry, the child units of the root level it wraps the entry in, the
    pure zone, types, constants;
  - View → its own Presenter, child units, components from components folders and the ui-kit, types, constants;
  - the entry of a unit with no UI → child units, tasks, plain functions, error classes of the pure zone, types,
    constants;
  - Presenter → stateful logic, tasks, stores, plain functions, error classes of the pure zone, types, constants;
  - stateful logic → as a Presenter;
  - task → tasks, stores, plain functions, generic I/O, error classes of the pure zone, types, constants — never
    the UI framework, or a plain function that acts on the screen or imports from the UI framework
    ([Tasks](tasks.md));
  - plain function → plain functions, stores, types, constants, and pure functions, error classes, types and
    constants of the pure zone; one that only the UI side uses may also import tasks and the UI framework's API
    that is not stateful logic ([Stateful logic and plain functions](stateful-logic-and-functions.md));
  - store → plain functions that reach no store, directly or through other plain functions, types, constants, and
    pure functions, types and constants of the pure zone. The entry of a store entry folder imports its parts; on a
    server, a store may import the client of its own database;
  - generic I/O → generic I/O, pure functions, error classes, types and constants of the pure zone. No kind but a
    task and generic I/O imports it.
- A type-only import is allowed for every kind from any allowed target, a child's View included: a Presenter may
  import the props type its child passes on, or a type that is part of it.
- A test's imports are never a violation: it may import the code it tests, even one folder up from a tests folder,
  and any store, task or function it needs to set up, reset and check state. Advice, not checked: an integration
  test of a level goes through its entry — it renders the View, or calls the entry of a unit with no UI.
- A relative path and a path alias are judged the same; the path style is never a finding. Advice: import own
  child units and the code a test tests by a relative path, everything else through the project's root alias.

**Good.**

```
src/
  lib/
    http/
      fetchJson
  stores/
    ordersStore         imports nothing of the app
  tasks/
    cancelOrder         imports stores/ordersStore, tasks/notifyUser, lib/http/fetchJson
    notifyUser
    formatPrice         a plain function on the app's data
  App/
    OrdersPage/
      OrdersPage        imports OrderTable (its child's View), _logic/presenter
      types
      _logic/
        presenter       imports _logic/orderFilters, tasks/cancelOrder, tasks/formatPrice, the row type from
                        OrderTable
        orderFilters    imports _stores/filtersStore, types, lib/debounce/debounce
        selectedCount   a plain function: imports stores/ordersStore and reads it once
        _tasks/
          exportOrders/ the presenter imports exportOrders, its entry, and nothing else in it
            exportOrders  imports csvHeader and toCsvRow/toCsvRow — its parts, a nested entry folder through
                          its entry
            csvHeader
            toCsvRow/
              toCsvRow    imports formatCsvCell, its own part, and csvHeader — parts import each other
              formatCsvCell
      _stores/
        filtersStore
      _components/
        StatusBadge
      OrderTable/
        OrderTable      imports _logic/presenter, OrdersPage/_components/StatusBadge
      OrderFilters/
        _logic/
          presenter     imports OrdersPage/_stores/filtersStore, OrdersPage/types, tasks/notifyUser
      tests/
        OrdersPage      renders OrdersPage, imports stores/ordersStore to seed and reset it
```

```
client/src/             app "client"
  OrderList/
    _logic/
      presenter         imports shared/src/order (the Order type)
server/src/             app "server"
  orders/
    orders              the entry: imports _logic/_tasks/createOrder, and lib/errors/NotFoundError to answer
                        "not found" when the task throws it
shared/src/             the shared types package
  order                 type Order — types only
```

**Bad.**

```
src/
  stores/
    ordersStore         imports tasks/notifyUser — a store importing a task
  tasks/
    cancelOrder         imports App/OrdersPage/_logic/orderFilters — the app's tasks folder importing from a level
  App/
    OrdersPage/
      OrdersPage        imports OrderTable/_logic/presenter — inside a child
      _logic/
        formatTotal     imports tasks/notifyUser — a plain function exportOrders uses, importing a task
        _tasks/
          exportOrders/
            exportOrders  imports toCsvRow/formatCsvCell — a part of a nested entry folder, from outside it
      OrderTable/
        _logic/
          presenter     imports OrdersPage/_logic/statusLabel — a parent's logic folder, however many use it
                        imports OrderFilters/_logic/presenter — another branch
                        imports OrdersPage/_components/StatusBadge — a Presenter importing a component
                        imports lib/http/fetchJson — generic I/O outside a task
      OrderFilters/
        _stores/
          filterStore   imported by OrdersPage/_logic/orderFilters — inside a child
client/src/
  OrderList/
    _logic/
      presenter         imports server/src/orders/_logic/_tasks/createOrder — another app
shared/src/
  order                 imports client/src/OrderList — the shared package importing an app
  orderStatuses         ORDER_STATUSES = ['new', 'paid'] — runtime code in the shared package
```

**Stack notes.** None.
