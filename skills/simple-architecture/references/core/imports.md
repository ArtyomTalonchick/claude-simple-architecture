## Imports

**Rule.** Import only along the structure: from your own children through their entry, from the logic folder, the
stores folder and the components folder of your own level and of any level above — except that level's Presenter —
from the pure zone, and from the shared types package; from an entry folder, at any depth, only its entry.
Never reach into a child, into another branch, into a parent's entry or Presenter, into the parts of an entry
folder from outside it, or into another app. Between kinds of code, imports go one way: View → Presenter →
stateful logic → tasks → plain functions; a Presenter, stateful logic, a task and a plain function may also import a
store, and only a task (and generic I/O itself) imports the generic I/O of the pure zone.

**Why.** When imports follow the folders, the folders tell the truth: a unit can be changed inside without
breaking anyone, moved or deleted with its folder, and every dependency is visible from where a file lies. A
single import into another branch or a parent ties two places that look apart, and the next change to one
breaks the other. The one-way order between kinds of code keeps logic out of Views, keeps the order of a business
action's steps with its caller, and keeps plain functions free to run wherever their users are.

**How to check.** For each import in the diff, find where its target lies and what kind of code both sides are.
Level, parent, sibling and branch are as defined in [Levels and placement](levels.md); a file in a logic folder, a
stores folder or a components folder belongs to the level that holds the folder.

- Allowed targets:
  - an own child unit, through its entry ([Levels and placement](levels.md)) — in an app with a UI the child's
    View, which also passes on its props type and the types that are part of it
    ([View and Presenter](view-presenter.md));
  - anything in the logic folder of the own level and of any level above it — stateful logic, tasks, plain
    functions, types, constants — except that level's Presenter, which only its own entry imports. An entry folder
    there ([Levels and placement](levels.md)) is imported only through its entry;
  - inside an entry folder, the entry imports its parts and the parts import each other; a part that is an entry
    folder of its own is imported only through its entry, from its outer folder too;
  - the stores in the stores folder of the own level and of any level above it, from a Presenter, stateful logic, a
    task or a plain function;
  - the units in the components folder of the own level and of any level above it, through their entry;
  - the pure zone of the own app — at the root level, or where the app's `lib` key puts it — from anywhere in the
    app, by the kinds below. A type of the pure zone is imported from the module that exports it: the pure zone
    has no types file ([Pure zone](pure-zone.md));
  - the shared types package (`shared` in the config), from any app and any kind of code;
  - packages from outside the project, from any kind of code.
- A violation:
  - an import from inside a child unit — anything in its logic folder, its stores folder, its components folder or
    its own children. A level's logic folder and stores folder are open to the level itself and to the levels below
    it, never to the levels above;
  - an import from another branch — a unit inside a sibling, or anything under a level that is not the own level
    or one above it. The code belongs in the logic folder or the components folder of the lowest common level;
  - an import of a parent's or an ancestor's entry or Presenter. Data comes down through props;
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
  - the file the app starts from ([Levels and placement](levels.md)) → the root entry, the child units of the root
    level it wraps the entry in, the pure zone, types, constants;
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
    ([Stateful logic and plain functions](stateful-logic-and-functions.md));
  - generic I/O ([Pure zone](pure-zone.md)) → generic I/O, pure functions, error classes, types, constants of the
    pure zone. No kind but a task and generic I/O imports it.
- A type-only import is allowed for every kind from any allowed target, including a child's View: a Presenter may
  import the props type its child passes on, or a type that is part of it, such as a variant. It brings in no
  markup and no logic.
- When two units need the same logic, it goes to the logic folder of the lowest level above them. When they need
  the same data, it goes to a store in the stores folder of that level: shared stateful logic gives each user its
  own copy of the state, not one state.
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
OrdersPage/
  OrdersPage            imports OrderTable (its child's View), _logic/presenter
  _logic/
    presenter           imports _logic/orderFilters, _logic/_tasks/cancelOrder, _logic/formatPrice, the row type
                        from OrderTable
    orderFilters        imports _stores/ordersStore, _logic/formatPrice, lib/timing/debounce
    formatPrice
    selectedCount       a plain function: imports _stores/ordersStore and reads it once — used by the presenter
    _tasks/
      cancelOrder       imports _stores/ordersStore, _logic/_tasks/notifyUser, lib/http/fetchJson — called by the
                        presenter and by OrderTable/_logic/presenter
      notifyUser        called by cancelOrder and by OrderFilters/_logic/presenter
      exportOrders/     an entry folder: the presenter imports exportOrders, its entry, and nothing else in it
        exportOrders    imports csvHeader and toCsvRow/toCsvRow — its parts, a nested entry folder through its
                        entry — and _stores/ordersStore
        csvHeader       a part: the header line, in the order of the columns
        toCsvRow/       a part with a part only it uses: an entry folder inside exportOrders/
          toCsvRow      imports formatCsvCell, its own part, and csvHeader for the order of the columns — parts
                        import each other
          formatCsvCell
  _stores/
    ordersStore         a store, used by orderFilters and cancelOrder
  _components/
    StatusBadge         used by OrderTable and OrderFilters
  OrderTable/
    OrderTable          imports _logic/presenter, OrdersPage/_components/StatusBadge
    _logic/
      presenter         imports OrdersPage/_logic/orderFilters, OrdersPage/_logic/_tasks/cancelOrder — the
                        parent's logic folder, not its Presenter
  OrderFilters/
    OrderFilters        imports _logic/presenter, OrdersPage/_components/StatusBadge
    _logic/
      presenter         imports OrdersPage/_logic/orderFilters, OrdersPage/_logic/_tasks/notifyUser
  tests/
    OrdersPage          a test of the page: renders OrdersPage, imports _stores/ordersStore to seed and reset it
                        and _logic/_tasks/cancelOrder to set up a cancelled order — a test imports what it needs
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
OrdersPage/
  OrdersPage            imports OrderTable/_logic/presenter — inside a child
  _logic/
    formatPrice         imports _logic/_tasks/notifyUser — a plain function importing a task
    _tasks/
      cancelOrder       imports _logic/orderFilters — a task importing stateful logic
      exportOrders/
        exportOrders    imports toCsvRow/formatCsvCell — a part of the nested entry folder toCsvRow/, from
                        outside it
        toCsvRow/
          toCsvRow
          formatCsvCell
  _stores/
    ordersStore         imports _logic/_tasks/notifyUser — a store importing a task
  OrderTable/
    _logic/
      presenter         imports OrdersPage/_logic/presenter — a parent's Presenter
                        imports OrderFilters/_logic/statusLabel — another branch
                        imports OrdersPage/_components/StatusBadge — a Presenter importing a component
                        imports lib/http/fetchJson — generic I/O outside a task
                        imports OrdersPage/_logic/_tasks/exportOrders/toCsvRow — a part, from outside its entry
                        folder
  OrderFilters/
    _stores/
      filterStore       imported by OrdersPage/_logic/orderFilters — inside a child
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
