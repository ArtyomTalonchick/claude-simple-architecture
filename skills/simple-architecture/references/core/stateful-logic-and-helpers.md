## Stateful logic and helpers

**Rule.** Split non-UI logic into three kinds: stateful logic, tasks and helpers. Stateful logic uses state,
lifecycle or a subscription to a store, or calls other stateful logic; a task carries out a user action and
reaches stores, the server or other tasks ([Tasks](tasks.md)); a helper is a plain function that does none of
this. Stateful logic goes to the stateful logic folder (default `hooks/`), tasks to the tasks folder (default
`tasks/`) and helpers to the helpers folder (default `helpers/`). A helper may be called from anywhere, except that
a task never calls one that acts on the screen; a task from a Presenter, stateful logic or another task; stateful
logic only from a Presenter or other stateful logic. One piece of stateful logic has one concern; the code that
uses them joins them.

**Why.** A helper keeps nothing between calls and needs nothing set up around it, so it can be moved, reused and
tested anywhere; most helpers take input and return output, and some act on the screen at the moment they are
called. Stateful logic
is tied to the life of a UI unit and works only inside it. When the two are mixed, a plain function picks up a
hidden dependency on that life cycle, and a reader cannot tell from where a function lies what it needs to run.
Two concerns in one piece of stateful logic change for different reasons, so each change means reading both, and
neither can be reused without the other.

**How to check.**

- A store is data that lives outside any one UI unit and is shared by the units that read it. A store, and the
  code that subscribes to it to show its data, are stateful logic, placed by [Levels and placement](levels.md):
  next to its one user, or in the stateful logic folder of the lowest level that covers all its users.
- The store test: a plain function that reads or changes a store once, at the time it is called, is a task, not a
  misplaced helper. Code that follows a store's changes is stateful logic.
- A file in a helpers folder that uses state, lifecycle or a store, calls the server, or calls stateful logic or a
  task, is a violation: it is stateful logic or a task.
- A file in a stateful logic folder that uses no state, lifecycle or subscription and calls no stateful logic is a
  violation: it is a task or a helper.
- Stateful logic called from a helper or a task is a violation. Stateful logic called from a View is a violation
  of [View and Presenter](view-presenter.md).
- A function that acts on the screen — reads or changes the focus, the selection, the elements on it, or starts a
  screen transition — and keeps no state of its own between calls is a helper, even though it returns nothing. It
  is part of the UI: a task that calls it is a violation of [Tasks](tasks.md). One that keeps state between calls
  or follows the screen's changes is stateful logic.
- The same split holds for stateful logic or a helper that sits next to its only user, outside a shared folder:
  what it is decides what it may call and who may call it.
- One piece of stateful logic that holds two concerns is a violation: its state and results fall into two groups,
  and one group needs from the other at most a plain value it could take as an argument — for example, the value
  of a field and the request made with that value. Split it into two, pass that value as an argument, and join
  them in the Presenter or in other stateful logic. Steps of one job — waiting, cancelling and retrying one
  request — are one concern.
- The groups of that test are formed by state and lifecycle, not by results. A value computed only from the
  input — memoized or not — has no state of its own and forms no group: it stays with the state it is returned
  next to. For example, a filter that returns its options computed from the list, the selected option and the
  filtered list is one concern. A value with state or lifecycle of its own — a request, a subscription — can form a
  second group.

**Good.**

```
OrdersPage/
  hooks/
    orderFilters        keeps the filter state
    currentUser         subscribes to the store
    statusFilter        options computed from the orders, the selected status, the filtered orders — one
                        concern: the options have no state of their own
  helpers/
    formatPrice         number -> text, no state
  tasks/
    cancelOrder         server call, then the orders store: remove the order — read once, no subscription
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
    currentUser         subscribes to the store — stateful logic
    cancelOrder         server call, then a store change — a task
  OrderSearch/
    OrderSearch         View
    presenter           search = orderSearch()
    orderSearch         the field and the request in one — two concerns
```

**Stack notes.**

- [react/stateful-logic-and-helpers.md](../stack/react/stateful-logic-and-helpers.md) — stateful logic in React
  is a hook.
- [react/tasks.md](../stack/react/tasks.md) — a task in React.
- [zustand/stateful-logic-and-helpers.md](../stack/zustand/stateful-logic-and-helpers.md) — a store is stateful
  logic.
