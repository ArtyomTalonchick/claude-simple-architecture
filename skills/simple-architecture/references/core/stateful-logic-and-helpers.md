## Stateful logic and helpers

**Rule.** Split non-UI logic into three kinds: stateful logic, tasks and helpers, and keep shared data apart from
them in stores. Stateful logic uses state, lifecycle or a subscription to a store, or calls other stateful logic; a
task carries out a user action, or a step of one, and reaches stores, the server or other tasks
([Tasks](tasks.md)); a helper is a plain function that does none of this; a store is data that lives longer than one
call and is shared by the code that reads it. Stateful logic and helpers go to the logic folder (default `logic/`),
tasks to the tasks folder inside it (default `logic/tasks/`), stores to the stores folder (default `stores/`), on
the level set by [Levels and placement](levels.md). A helper may be called from a Presenter, stateful logic, a task
or another helper, except that a task never calls one that acts on the screen; a task from a Presenter, stateful
logic or another task; stateful logic only from a Presenter or other stateful logic; a store is reached only by a
task, through its own API, and on a client by a Presenter or stateful logic; generic I/O of the pure zone — I/O
that knows nothing of the app ([Pure zone](pure-zone.md)) — only by a task. One piece of stateful logic has one
concern; the code that uses them joins them.

**Why.** A helper keeps nothing between calls and needs nothing set up around it, so it can be moved, reused and
tested anywhere; most helpers take input and return output, and some act on the screen at the moment they are
called. Stateful logic is tied to the life of a UI unit and works only inside it. When the two are mixed, a plain
function picks up a hidden dependency on that life cycle, and a reader cannot tell what a function needs to run
without reading all of it. Two concerns in one piece of stateful logic change for different reasons, so each
change means reading both, and neither can be reused without the other. A store is data, not logic: kept apart and
reached only through its own API, it can be replaced — data kept in memory by a database — without touching the
logic around it, and the few kinds of code that reach it show who depends on it.

**How to check.**

- A store is data that lives longer than one call and is shared by the code that reads it, on a client or on a
  server: the state several UI units read, a cache or an in-memory table on a server. A store is a kind of its own,
  not stateful logic; the code that subscribes to it to show its data is stateful logic.
- A store file holds the data and its own API — reading and changing that data — and nothing else. A server call,
  a step of a user action, a subscription to show the data, or a computation for one of its users in a store file
  is a violation: it goes to a task, to stateful logic or to a helper.
- A store lives in the stores folder (default `stores/`) of the lowest level that covers all its users
  ([Levels and placement](levels.md)). A store in a logic folder or a tasks folder is a violation, even with one
  user.
- Who reaches a store: a task, through the store's own API, on any app; on a client also a Presenter or stateful
  logic, which subscribe to it or make one call of its action ([Tasks](tasks.md)). A View, a helper, another store or
  the entry of a unit with no UI reaching a store directly is a violation: a View takes the data from its
  Presenter, an entry calls a task.
- The store test: a plain function that reads or changes a store once, at the time it is called, is a task, not a
  misplaced helper — a step of an action, named with a verb (`readCart`, `clearSession`). Code that follows a
  store's changes is stateful logic.
- Stateful logic and helpers share the logic folder, so what a function does decides its kind, not where it lies.
  A function used as a helper — called from a task or another helper — that uses state, lifecycle or a store,
  calls the server or generic I/O, or calls stateful logic or a task, is a violation: it is stateful logic or a
  task.
- Generic I/O ([Pure zone](pure-zone.md)) is neither a task nor a helper: it does I/O and knows nothing of the app,
  and it lives only in the pure zone. Only a task, and other generic I/O, calls it. A Presenter, stateful logic, a
  helper, a View, a store or the entry of a unit with no UI that calls it is a violation, as reaching the server
  outside a task is. In the app, a function that does I/O is a task, whatever it calls to do it.
- A function marked as stateful logic by the stack's convention that uses no state, lifecycle or subscription and
  calls no stateful logic is a violation: it is a task or a helper.
- A function in the logic folder, outside its tasks folder, that uses no state, lifecycle or subscription but
  reaches the server, calls generic I/O, or reads or changes a store once is a violation: it is a task and goes to
  the tasks folder.
  A file in the tasks folder that uses state, lifecycle or a subscription, or calls stateful logic, is a
  violation: it is stateful logic and goes to the logic folder.
- Stateful logic called from a helper or a task is a violation; a store is not stateful logic, so a task that
  reaches one through its API ([Tasks](tasks.md)) calls none. Stateful logic called from a View is a violation
  of [View and Presenter](view-presenter.md).
- A function that acts on the screen — reads or changes the focus, the selection, the elements on it, or starts a
  screen transition — and keeps no state of its own between calls is a helper, even though it returns nothing. It
  is part of the UI: a task that calls it is a violation of [Tasks](tasks.md). One that keeps state between calls
  or follows the screen's changes is stateful logic.
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
  logic/
    orderFilters        stateful logic: keeps the filter state
    currentUser         stateful logic: subscribes to stores/userStore
    statusFilter        stateful logic: options computed from the orders, the selected status, the filtered
                        orders — one concern: the options have no state of their own
    formatPrice         a helper: number -> text, no state
    tasks/
      cancelOrder       server call, then stores/ordersStore: remove the order — once, no subscription
  stores/
    ordersStore         a store: the orders and its API — read, set, remove
    userStore           a store: the current user and its API
  OrderSearch/
    OrderSearch         View
    logic/
      presenter         query = searchQuery(); result = ordersRequest(query.value)
      searchQuery       the field: value, change, clear
      ordersRequest     the request for a query: wait for typing to stop, cancel, retry
```

A server keeps its stores the same way:

```
orders/
  orders                the entry: builds the routes of /orders, calls logic/tasks/loadOrder
  logic/
    tasks/
      loadOrder         reads stores/ordersCache; on a miss, loads the order and puts it there
  stores/
    ordersCache         a store: orders by id in memory, with get, put and clear
```

**Bad.**

```
OrdersPage/
  logic/
    orderFilters        keeps the filter state
    formatPrice         called by a task as a helper, but follows the currency in the store — stateful logic
    cancelOrder         server call, then a store change — a task outside tasks/
    toOrderLines        a helper that loads the products with lib/http/fetchJson — I/O in the app is a task
    ordersStore         a store in logic/ — it belongs in stores/
    tasks/
      currentUser       subscribes to the store — stateful logic, not a task
  stores/
    cartStore           the cart and its API, and loadCart, which calls the server — a task inside a store
  OrderSearch/
    OrderSearch         View
    logic/
      presenter         search = orderSearch()
      orderSearch       the field and the request in one — two concerns
```

**Stack notes.**

- [react/stateful-logic-and-helpers.md](../stack/react/stateful-logic-and-helpers.md) — stateful logic in React
  is a hook.
- [react/tasks.md](../stack/react/tasks.md) — a task in React.
- [zustand/stateful-logic-and-helpers.md](../stack/zustand/stateful-logic-and-helpers.md) — a Zustand store and
  who may use it.
