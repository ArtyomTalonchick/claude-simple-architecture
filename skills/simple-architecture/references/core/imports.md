## Imports

**Rule.** Import only along the structure: from your own children through their entry, from the logic folder, the
stores folder and the components folder of your own level and of any level above — except that level's Presenter —
from the pure zone, and from the shared types package. Never reach into a child, into another branch, into a
parent's entry or Presenter, or into another app. Between kinds of code, imports go one way: View → Presenter →
stateful logic → tasks → helpers; a Presenter, stateful logic and a task may also import a store, and only a task
(and generic I/O itself) imports the generic I/O of the pure zone.

**Why.** When imports follow the folders, the folders tell the truth: a unit can be changed inside without
breaking anyone, moved or deleted with its folder, and every dependency is visible from where a file lies. A
single import into another branch or a parent ties two places that look apart, and the next change to one
breaks the other. The one-way order between kinds of code keeps logic out of Views and keeps helpers free to run
anywhere.

**How to check.** For each import in the diff, find where its target lies and what kind of code both sides are.
Level, parent, sibling and branch are as defined in [Levels and placement](levels.md); a file in a logic folder, a
stores folder or a components folder belongs to the level that holds the folder.

- Allowed targets:
  - an own child unit, through its entry ([Levels and placement](levels.md)) — in an app with a UI the child's
    View, which also passes on its props type ([View and Presenter](view-presenter.md));
  - anything in the logic folder of the own level and of any level above it — stateful logic, tasks, helpers,
    types, constants — except that level's Presenter, which only its own entry imports;
  - the stores in the stores folder of the own level and of any level above it, from a Presenter, stateful logic or
    a task;
  - the units in the components folder of the own level and of any level above it, through their entry;
  - the pure zone of the own app, from anywhere in it, by the kinds below;
  - the shared types package (`shared` in the config), from any app and any kind of code;
  - packages from outside the project, from any kind of code.
- A violation:
  - an import from inside a child unit — anything in its logic folder, its stores folder, its components folder or
    its own children. A level's logic folder and stores folder are open to the level itself and to the levels below
    it, never to the levels above;
  - an import from another branch — a unit inside a sibling, or anything under a level that is not the own level
    or one above it. The code belongs in the logic folder or the components folder of the lowest common level;
  - an import of a parent's or an ancestor's entry or Presenter. Data comes down through props;
  - in a project with several apps (`apps` in the config), an import from another app — its code, its pure zone,
    anything under its root. What two apps share goes to the shared types package, if it is a type;
  - in the shared types package, an import from any app, and any runtime code — a function, a constant, a value. It
    holds types only, so every app can use it and none depends on another through it;
  - a pure zone file importing from the app ([Pure zone](pure-zone.md)).
- By kind, among the allowed targets, a violation is any import outside this list:
  - View → its own Presenter, child units, components from components folders and from the ui-kit, types,
    constants;
  - the entry of a unit with no UI → child units, stateful logic, tasks, helpers, types, constants;
  - Presenter → stateful logic, tasks, stores, helpers, types, constants — never a View or a component;
  - stateful logic → stateful logic, tasks, stores, helpers, types, constants;
  - task → tasks, stores, helpers, generic I/O, types, constants — never a View, a Presenter, stateful logic or
    a helper that acts on the screen ([Tasks](tasks.md));
  - store → helpers, types, constants — never another store, a task or stateful logic
    ([Stateful logic and helpers](stateful-logic-and-helpers.md));
  - helper → helpers, types, constants;
  - generic I/O ([Pure zone](pure-zone.md)) → generic I/O, helpers, types, constants of the pure zone. No kind but
    a task and generic I/O imports it.
- A type-only import is allowed for every kind from any allowed target, including a child's View: a Presenter may
  import the props type its child passes on. It brings in no markup and no logic.
- When two units need the same logic, it goes to the logic folder of the lowest level above them. When they need
  the same data, it goes to a store in the stores folder of that level: shared stateful logic gives each user its
  own copy of the state, not one state.
- A test ([Levels and placement](levels.md)) may import the code it tests, even when that code sits one folder
  up from a tests folder, and anything that code itself may import. It is not an import from a parent.
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
    orderFilters        imports _stores/ordersStore, _logic/formatPrice, lib/helpers/debounce
    formatPrice
    _tasks/
      cancelOrder       imports _stores/ordersStore, _logic/_tasks/notifyUser, lib/http/fetchJson — called by the
                        presenter and by OrderTable/_logic/presenter
      notifyUser        called by cancelOrder and by OrderFilters/_logic/presenter
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
```

```
client/src/             app "client"
  OrderList/
    _logic/
      presenter         imports shared/src/order (the Order type)
server/src/             app "server"
  orders/
    orders              the entry: imports _logic/_tasks/createOrder
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
    _tasks/
      cancelOrder       imports _logic/orderFilters — a task importing stateful logic
  _stores/
    ordersStore         imports _logic/_tasks/notifyUser — a store importing a task
  OrderTable/
    _logic/
      presenter         imports OrdersPage/_logic/presenter — a parent's Presenter
                        imports OrderFilters/_logic/statusLabel — another branch
                        imports OrdersPage/_components/StatusBadge — a Presenter importing a component
                        imports lib/http/fetchJson — generic I/O outside a task
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
