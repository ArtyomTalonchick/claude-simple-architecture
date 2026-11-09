## Imports

**Rule.** Import only along the structure: from your own children through their entry, from the shared folders
of your own level and of any level above, and from the pure zone. Never reach into a child, into another
branch or into a parent. Between kinds of code, imports go one way: View → Presenter → stateful logic →
helpers.

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
  - the pure zone, from anywhere;
  - packages from outside the project, from any kind of code.
- A violation:
  - an import from inside a child unit — its Presenter, its stateful logic, its own children or shared folders;
  - an import from another branch — a unit inside a sibling, or anything under a level that is not the own level
    or one above it. The code belongs in a shared folder of the lowest common level;
  - an import of a parent's or an ancestor's View or Presenter. Data comes down through props;
  - a pure zone file importing from the app ([Pure zone](pure-zone.md)).
- By kind, among the allowed targets, a violation is any import outside this list:
  - View → its own Presenter, child units, components from shared folders and the pure zone, types, constants;
  - Presenter → stateful logic, helpers, types, constants — never a View or a component;
  - stateful logic → stateful logic, helpers, types, constants;
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
  OrdersPage            imports OrderTable (its child's View)
  presenter             imports hooks/orderFilters, helpers/formatPrice, the row type from OrderTable
  hooks/
    orderFilters        imports helpers/formatPrice, lib/helpers/debounce
  helpers/
    formatPrice
  OrderTable/
    OrderTable          imports its presenter, OrdersPage/components/StatusBadge
    presenter           imports OrdersPage/hooks/orderFilters
  OrderFilters/
```

**Bad.**

```
OrdersPage/
  OrdersPage            imports OrderTable/presenter — inside a child
  OrderTable/
    presenter           imports OrdersPage/presenter — a parent's Presenter
                        imports OrderFilters/helpers/statusLabel — another branch
                        imports OrdersPage/components/StatusBadge — a Presenter importing a component
  OrderFilters/
```

**Stack notes.** None.
