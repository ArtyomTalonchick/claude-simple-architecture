## Stateful logic and plain functions

**Rule.** Split non-UI logic into three kinds: stateful logic, tasks and plain functions, and keep shared data apart
from them in stores. Stateful logic uses state, lifecycle or a subscription to a store, or calls other stateful
logic; a task carries out a business action, or a step of one, and reaches stores, the server or other tasks
([Tasks](tasks.md)); a plain function is non-UI code with no business logic that is neither of them nor the
Presenter — pure, or reaching a store through the store's own API — and takes load off a Presenter, stateful logic
or a task: it does no I/O and calls no task and no stateful logic; a store is data that lives longer than one call
and is shared by the code that reads it. Stateful logic goes to the logic folder (default `_logic/`) of its unit,
tasks to the tasks folder inside it (default `_logic/_tasks/`) or, when two or more units call them, to the app's
tasks folder (default `tasks/`), a plain function by its users — to the tasks folder when only tasks use it, to the
logic folder otherwise, to the app's tasks folder when it works on the app's data for several units — and stores to
the stores folder (default `_stores/`), or to the app's stores folder (default `stores/`) when a task of the app's
tasks folder reaches them, as set by [Levels and placement](levels.md); an entry with parts only it uses is a folder
that holds them. A plain function is called from a Presenter, stateful logic, a task, another plain function, the
entry of a unit with no UI, or a store, if the plain function reaches no store, and one that a task calls has
nothing from the UI; a task from an event handler of a Presenter, of stateful logic or of the entry of a unit with
no UI, or from another task — never by stateful logic that follows a value ([Tasks](tasks.md)); stateful logic
only from a Presenter or other stateful logic; a store is reached by a task and a plain function, through its own
API, and on a client by a Presenter or stateful logic; generic I/O of the pure zone — I/O that knows nothing of the
app ([Pure zone](pure-zone.md)) — only by a task. One piece of stateful logic has one concern; the code that uses
them joins them.

**Why.** A plain function keeps nothing between calls and needs nothing set up around it, so it can be moved,
reused and tested anywhere its users are; it holds no order of business steps, so the action stays readable in
one place — its task — and a Presenter or stateful logic sheds the details that are not its job. Stateful logic is
tied to the life of a UI unit and works only inside it. When the two are mixed, a plain function picks up a hidden
dependency on that life cycle, and a reader cannot tell what a function needs to run without reading all of it.
A plain function placed by its users shows who depends on it: the tasks folder holds nothing of the UI, so the
business actions can move to another UI with it. Two concerns in one piece of stateful logic change for different
reasons, so each change means reading both, and neither can be reused without the other. A store is data, not
logic: kept apart and reached only through its own API, it can be replaced — data kept in memory by a database —
without touching the logic around it, and the few kinds of code that reach it show who depends on it.

**How to check.**

- A store is data that lives longer than one call and is shared by the code that reads it, on a client or on a
  server: the state several UI units read, a cache or an in-memory table on a server. A store is a kind of its own,
  not stateful logic; the code that subscribes to it to show its data is stateful logic.
- A store file holds the data and its own API — reading and changing that data — and nothing else. A server call,
  a step of a business action, a subscription to show the data, or a computation for one of its users in a store
  file is a violation: it goes to a task, to stateful logic or to a plain function.
- A store that a task of the app's tasks folder reads or changes lives in the app's stores folder (default
  `stores/`); any other store lives in the stores folder (default `_stores/`) of the lowest level that covers all
  its users ([Levels and placement](levels.md)). A store in a logic folder or a tasks folder is a violation, even
  with one user.
- Who reaches a store: a task and a plain function, through the store's own API, once, at the time they are called,
  on any app; on a client also a Presenter or stateful logic, which subscribe to it or call its API. Several store
  changes that together make one business action are a task, wherever they are written ([Tasks](tasks.md)). A
  View, another store or the entry of a unit with no UI reaching a store directly is a violation: a View takes the
  data from its Presenter, an entry calls a task.
- A plain function is not a task because it reaches a store: the kind is decided by meaning. A business action, or
  a step of one, is a task ([Tasks](tasks.md)); code with no business logic — a computation, a change of UI state
  in a store (which screen is shown, a flag for an animation), an act on the screen — is a plain function.
- A plain function that does I/O — calls the server or generic I/O — is a violation: a request in the app is a step
  of a business action, so it is a task. A plain function that calls a task or stateful logic is a violation: the
  order of the steps stays with its caller, and one that calls stateful logic is stateful logic. A plain function
  may call other plain functions, use types and constants, and use pure functions, error classes, types and
  constants of the pure zone.
- A plain function that subscribes to a store, or uses state or lifecycle, is a violation: it is stateful logic.
- The UI boundary follows from the users. A plain function that a task calls, directly or through other plain
  functions, has nothing from the UI: it does not act on the screen — read or change the focus, the selection, the
  elements on it, or start a screen transition — and imports nothing from the UI framework. One that does is a
  violation, of this rule and of [Tasks](tasks.md): the task would depend on the UI through it. A plain function
  that only the UI side uses — a Presenter, stateful logic, other such plain functions — may act on the screen and
  use the UI framework's API that is not stateful logic, as long as it keeps no state between calls. One that keeps
  state between calls or follows the screen's changes is stateful logic.
- Following the screen's changes means over time, across calls. A function that subscribes to a screen event and
  unsubscribes within the same call, keeping nothing between calls, is a plain function, not stateful logic — for
  example, one that waits once for the screen's next resize: it finishes on the first event or after a timeout,
  and removes its listener before it finishes. It acts on the screen, so only the UI side calls it. One whose
  listener outlives the call is stateful logic.
- Placement by users, as set by [Levels and placement](levels.md). Inside one unit: a plain function used only by
  the unit's tasks lives in its tasks folder — a file next to the tasks when two or more use it, a part in the entry
  folder of its one task otherwise; one used by a Presenter, stateful logic or the entry of a unit with no UI,
  whether or not tasks use it too, lives in the logic folder outside the tasks folder — a part in the entry folder
  of its one user when that user is an entry of the logic folder, a file there otherwise (a Presenter is never an
  entry folder). A plain function used only by tasks that lies in the logic folder outside the tasks folder, or one
  used by a Presenter, stateful logic or the entry of a unit with no UI that lies in the tasks folder, is a
  violation. A plain function that works on the app's data — converts it, validates it, builds a request — and is
  used by tasks of the app's tasks folder, or by two or more units, lies next to the tasks in the app's tasks
  folder; a Presenter may import it. Code that knows nothing of the app goes to the pure zone
  ([Pure zone](pure-zone.md)). A plain function of the UI side that two units need has no shared place: the
  behaviour goes into a component that holds it.
- Generic I/O ([Pure zone](pure-zone.md)) is neither a task nor a plain function: it does I/O and knows nothing of
  the app, and it lives only in the pure zone. Only a task, and other generic I/O, calls it. A Presenter, stateful
  logic, a plain function, a View, a store or the entry of a unit with no UI that calls it is a violation, as
  reaching the server outside a task is. In the app, a function that does I/O is a task, whatever it calls to do it.
- Stateful logic, a task or a plain function with parts only it uses is an entry folder: a folder named as it,
  with the entry and its parts, and in a unit's logic folder those parts lying next to it outside the folder are a
  violation (in the app's tasks folder an entry folder is allowed, not required). A part with parts only it uses is
  an entry folder of its own inside it, at any depth ([Levels and placement](levels.md)). A part keeps its own kind,
  and every check here applies to it as to any file of the logic folder: a part of stateful logic is stateful logic
  or a plain function, a part of a task a plain function, a part of a plain function a plain function. A task is
  never a part — of stateful logic, of a plain function or of another task: it lies in a tasks folder as a task of
  its own. A part that does I/O or is a step of a business action is a task, so it goes to a tasks folder.
- A function marked as stateful logic by the stack's convention that uses no state, lifecycle or subscription and
  calls no stateful logic is a violation: it is a task or a plain function, by meaning.
- A function in the logic folder, outside its tasks folder, that uses no state, lifecycle or subscription but
  reaches the server, calls generic I/O or carries out a business action is a violation: it is a task and goes to
  the tasks folder. A file in the tasks folder that uses state, lifecycle or a subscription, or calls stateful
  logic, is a violation: it is stateful logic and goes to the logic folder.
- Stateful logic called from a plain function or a task is a violation; a store is not stateful logic, so a task or
  a plain function that reaches one through its API calls none. Stateful logic called from a View is a violation of
  [View and Presenter](view-presenter.md).
- Stateful logic calls a task from a handler it returns or runs, or once on start or mount. Stateful logic that
  watches a value — state, props, a store — and calls a task when it changes is a violation, and so is a
  "request follows its params" piece that rebuilds a request whenever its input changes: the handler that changed
  the data calls the task itself ([Tasks](tasks.md)).
- A function that wraps another to delay or thin out its calls — a debounce, a throttle — and keeps its timer in the
  closure of the function it returns is a plain function, not stateful logic: it uses no state or lifecycle of the
  UI. The caller makes the wrapped function once and keeps it for as long as it needs it; the handler calls it. A
  delay before a task's call is such a wrapper around the call, not stateful logic that follows a value until it
  settles.
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
  _logic/
    orderFilters        stateful logic: keeps the filter state
    currentUser         stateful logic: subscribes to _stores/userStore
    statusFilter        stateful logic: options computed from the orders, the selected status, the filtered
                        orders — one concern: the options have no state of their own
    formatPrice         a plain function: number -> text — used by the presenter and by cancelOrder
    _tasks/
      cancelOrder       server call, then _stores/ordersStore: remove the order — once, no subscription
      cancelOrders      cancels the selected orders in one call
      toCancelRequest   a plain function: order -> request body — used by cancelOrder and cancelOrders, only
                        tasks, so in _tasks/
  _stores/
    ordersStore         a store: the orders and its API — read, set, remove
    userStore           a store: the current user and its API
  Checkout/
    Checkout            View
    _logic/
      presenter         steps = checkoutSteps(cart)
      checkoutSteps/    an entry folder: stateful logic with the parts only it uses — not a unit
        checkoutSteps   stateful logic: the current step, next, back; imports stepOrder and canLeaveStep
        stepOrder       a plain function: the steps for a cart, in order — used only by checkoutSteps
        canLeaveStep    a plain function: whether a step's fields are filled — used only by checkoutSteps
        tests/          tests of checkoutSteps, stepOrder and canLeaveStep
  OrderSearch/
    _logic/
      presenter         query = searchQuery(); orders = ordersRequest()
                        onChange(text): query.change(text); orders.search(text) — the handler calls the request
      searchQuery       the field: value, change, clear
      ordersRequest     the request: search(text) calls the task searchOrders through a debounce made once; keeps
                        loading, the result and the error; cancels, retries
      _tasks/
        searchOrders    the server call for a query
SearchPage/
  _logic/
    presenter           onSubmit: showResults(query)
    showResults         a plain function: screen store: show the results; search store: set the query — inside
                        a screen transition, then it redraws the caret. UI state, not a business action
    waitForResize       a plain function: waits once for the screen's next resize, or a timeout, and removes its
                        listener before it finishes — keeps nothing between calls; called by the presenter
```

A server keeps its stores the same way:

```
orders/
  orders                the entry: builds the routes of /orders, calls _logic/_tasks/loadOrder
  _logic/
    _tasks/
      loadOrder         reads _stores/ordersCache; on a miss, loads the order and puts it there
  _stores/
    ordersCache         a store: orders by id in memory, with get, put and clear
```

**Bad.**

```
OrdersPage/
  _logic/
    orderFilters        keeps the filter state
    formatPrice         called by a task as a plain function, but follows the currency in the store — stateful
                        logic
    cancelOrder         server call, then a store change — a task outside _tasks/
    toOrderLines        a plain function that loads the products with lib/http/fetchJson — I/O in the app is a task
    toCancelRequest     used only by tasks — a plain function of tasks: it belongs in _tasks/
    ordersStore         a store in _logic/ — it belongs in _stores/
    _tasks/
      currentUser       subscribes to the store — stateful logic, not a task
      orderTitle        used by the presenter — a plain function of the UI side: it belongs in _logic/
      focusFirstError   called by placeOrder, moves the focus — a task acting on the screen through it
  _stores/
    cartStore           the cart and its API, and loadCart, which calls the server — a task inside a store
  Checkout/
    _logic/
      checkoutSteps/
        checkoutSteps   stateful logic: the current step, next, back
        saveDraft       a part that sends the draft to the server — a task: it belongs in Checkout/_logic/_tasks/
  OrderSearch/
    _logic/
      presenter         search = orderSearch()
      orderSearch       the field and the request in one — two concerns
      ordersRequest     watches the query it is given and calls searchOrders whenever it changes — stateful logic
                        that follows a value: the change handler calls the request
SearchPage/
  _logic/
    watchResize         a plain function that adds a resize listener and returns, leaving it in place — it follows
                        the screen's changes: stateful logic
```

**Stack notes.**

- [react/stateful-logic-and-functions.md](../stack/react/stateful-logic-and-functions.md) — stateful logic in React
  is a hook.
- [react/tasks.md](../stack/react/tasks.md) — a task in React.
- [zustand/stateful-logic-and-functions.md](../stack/zustand/stateful-logic-and-functions.md) — a Zustand store
  and who may use it.
