## Stateful logic and helpers

**Rule.** Split non-UI logic into stateful logic and helpers. Stateful logic uses state, lifecycle or a store, or
calls other stateful logic; a helper is a plain function that does none of this. Stateful logic goes to the
stateful logic folder (default `hooks/`) and helpers to the helpers folder (default `helpers/`). A helper may be
called from anywhere; stateful logic only from a Presenter or other stateful logic. One piece of stateful logic
has one concern; the code that uses them joins them.

**Why.** A helper takes input and returns output, so it can be moved, reused and tested anywhere. Stateful logic
is tied to the life of a UI unit and works only inside it. When the two are mixed, a plain function picks up a
hidden dependency on that life cycle, and a reader cannot tell from where a function lies what it needs to run.
Two concerns in one piece of stateful logic change for different reasons, so each change means reading both, and
neither can be reused without the other.

**How to check.**

- A store is data that lives outside any one UI unit and is shared by the units that read it. A store and the
  code that reads or changes it are stateful logic, placed by [Levels and placement](levels.md): next to its one
  user, or in the stateful logic folder of the lowest level that covers all its users.
- A file in a helpers folder that uses state, lifecycle or a store, or calls stateful logic, is a violation: it
  is stateful logic.
- A file in a stateful logic folder that uses none of these and calls no stateful logic is a violation: it is a
  helper.
- Stateful logic called from a helper is a violation. Stateful logic called from a View is a violation of
  [View and Presenter](view-presenter.md).
- The same split holds for stateful logic or a helper that sits next to its only user, outside a shared folder:
  what it is decides what it may call and who may call it.
- One piece of stateful logic that holds two concerns is a violation: its state and results fall into two groups,
  and one group needs from the other at most a plain value it could take as an argument — for example, the value
  of a field and the request made with that value. Split it into two, pass that value as an argument, and join
  them in the Presenter or in other stateful logic. Steps of one job — waiting, cancelling and retrying one
  request — are one concern.

**Good.**

```
OrdersPage/
  hooks/
    orderFilters        keeps the filter state
    currentUser         reads the store
  helpers/
    formatPrice         number -> text, no state
  OrderSearch/
    OrderSearch         View
    presenter           query = searchQuery(); result = ordersRequest(query.value)
    searchQuery         the field: value, change, clear
    ordersRequest       the request for a query: wait for typing to stop, cancel, retry
```

**Bad.**

```
OrdersPage/
  hooks/
    orderFilters        keeps the filter state
    formatPrice         number -> text, no state — a helper
  helpers/
    currentUser         reads the store — stateful logic
  OrderSearch/
    OrderSearch         View
    presenter           search = orderSearch()
    orderSearch         the field and the request in one — two concerns
```

**Stack notes.**

- [react/stateful-logic-and-helpers.md](../stack/react/stateful-logic-and-helpers.md) — stateful logic in React
  is a hook.
- [zustand/stateful-logic-and-helpers.md](../stack/zustand/stateful-logic-and-helpers.md) — a store is stateful
  logic.
