## Imports

**Rule.** Import only along the structure: from your own children through their entry, from the shared folders of
your own level and of any level above, from the pure zone, and from the shared types package. Never reach into a
child, into another branch, into a parent or into another app. Between kinds of code, imports go one way: View →
Presenter → stateful logic → tasks → helpers; a task may also import a store.

**Why.** When imports follow the folders, the folders tell the truth: a unit can be changed inside without
breaking anyone, moved or deleted with its folder, and every dependency is visible from where a file lies. A
single import into another branch or a parent ties two places that look apart, and the next change to one
breaks the other. The one-way order between kinds of code keeps logic out of Views and keeps helpers free to run
anywhere.

**How to check.** For each import in the diff, find where its target lies and what kind of code both sides are.
Level, parent, sibling and branch are as defined in [Levels and placement](levels.md); a file in a shared folder
belongs to the level that holds the folder.

- Allowed targets:
  - an own child unit, through its entry — the child's View, which also passes on its props type
    ([View and Presenter](view-presenter.md));
  - the shared folders, the types file and the constants file of the own level and of any level above it — so a
    file in one shared folder may import from another shared folder of the same level;
  - the pure zone of the own app, from anywhere in it;
  - the shared types package (`shared` in the config), from any app and any kind of code;
  - packages from outside the project, from any kind of code.
- A violation:
  - an import from inside a child unit — anything in its logic folder, its own children or shared folders. A
    unit's logic folder is inside the unit: only the unit's own View and the files in that folder import from it;
  - an import from another branch — a unit inside a sibling, or anything under a level that is not the own level
    or one above it. The code belongs in a shared folder of the lowest common level;
  - an import of a parent's or an ancestor's View or Presenter. Data comes down through props;
  - in a project with several apps (`apps` in the config), an import from another app — its code, its pure zone,
    anything under its root. What two apps share goes to the shared types package, if it is a type;
  - in the shared types package, an import from any app, and any runtime code — a function, a constant, a value. It
    holds types only, so every app can use it and none depends on another through it;
  - a pure zone file importing from the app ([Pure zone](pure-zone.md)).
- By kind, among the allowed targets, a violation is any import outside this list:
  - View → its own Presenter, child units, components from shared folders and from the ui-kit, types, constants;
  - Presenter → stateful logic, tasks, helpers, types, constants — never a View or a component;
  - stateful logic → stateful logic, tasks, helpers, types, constants;
  - task → tasks, stores, helpers, types, constants — never a View, a Presenter, other stateful logic or a helper
    that acts on the screen ([Tasks](tasks.md));
  - helper → helpers, types, constants.
- A type-only import is allowed for every kind from any allowed target, including a child's View: a Presenter may
  import the props type its child passes on. It brings in no markup and no logic.
- When two units need the same logic, it goes to a stateful logic folder above them. When they need the same
  data, it goes to a store: shared stateful logic gives each user its own copy of the state, not one state.
- A test ([Levels and placement](levels.md)) may import the code it tests, even when that code sits one folder
  up from a tests folder, and anything that code itself may import. It is not an import from a parent.
- The rule is about targets, not path syntax: a relative path and a path alias are judged the same, and the path
  style is never a finding. Recommended:
  import own child units and the code a test tests by a relative path, everything else through the project's
  root alias, so a path shows at a glance whether it stays inside the unit.

**Good.**

```
OrdersPage/
  OrdersPage            imports OrderTable (its child's View), logic/presenter
  logic/
    presenter           imports hooks/orderFilters, tasks/cancelOrder, helpers/formatPrice, the row type from
                        OrderTable
  hooks/
    orderFilters        imports hooks/ordersStore, helpers/formatPrice, lib/helpers/debounce
    ordersStore         a store, used by orderFilters and cancelOrder
  components/
    StatusBadge         used by OrderTable and OrderFilters
  tasks/
    cancelOrder         imports hooks/ordersStore (a store), tasks/notifyUser — called by the presenter and
                        by OrderTable/logic/presenter
    notifyUser          called by cancelOrder and by OrderFilters/logic/presenter
  helpers/
    formatPrice
  OrderTable/
    OrderTable          imports logic/presenter, OrdersPage/components/StatusBadge
    logic/
      presenter         imports OrdersPage/hooks/orderFilters, OrdersPage/tasks/cancelOrder
  OrderFilters/
    OrderFilters        imports logic/presenter, OrdersPage/components/StatusBadge
    logic/
      presenter         imports OrdersPage/hooks/orderFilters, OrdersPage/tasks/notifyUser
```

```
client/src/             app "client"
  OrderList/
    logic/
      presenter         imports shared/src/order (the Order type)
server/src/             app "server"
  orders/
    createOrder         imports shared/src/order
shared/src/             the shared types package
  order                 type Order — types only
```

**Bad.**

```
OrdersPage/
  OrdersPage            imports OrderTable/logic/presenter — inside a child
  tasks/
    cancelOrder         imports hooks/orderFilters — a task importing stateful logic that is not a store
  OrderTable/
    logic/
      presenter         imports OrdersPage/logic/presenter — a parent's Presenter
                        imports OrderFilters/logic/statusLabel — another branch
                        imports OrdersPage/components/StatusBadge — a Presenter importing a component
  OrderFilters/
```

```
client/src/
  OrderList/
    logic/
      presenter         imports server/src/orders/createOrder — another app
shared/src/
  order                 imports client/src/OrderList — the shared package importing an app
  orderStatuses         ORDER_STATUSES = ['new', 'paid'] — runtime code in the shared package
```

**Stack notes.** None.
