## Stateful logic and plain functions

**Rule.** Split non-UI code into stateful logic (it uses state, lifecycle or a store subscription, or calls other
stateful logic), tasks ([Tasks](tasks.md)) and plain functions (no business logic, no I/O, no call of stateful
logic, nor of a task unless only the UI side uses them), keep shared data apart in stores, and let each kind be
called only by the kinds listed below. Give one piece of stateful logic one concern.

**Why.** A plain function keeps nothing between calls and needs nothing set up around it, so it can be moved, reused
and tested anywhere its users are; it holds no order of business steps, so the action stays in its task. Stateful
logic is tied to the life of a UI unit; mixed into a plain function, it adds a hidden dependency on that life cycle.
Two concerns in one piece of stateful logic change for different reasons, and neither can be reused without the
other. A store kept apart and reached only through its own API can be replaced — data in memory by a database —
without touching the logic around it, and the few kinds that reach it show who depends on it.

**How to check.**

- Who calls whom:
  - stateful logic: only a Presenter or other stateful logic. Called from a plain function or a task it is a
    violation; from a View, a violation of [View and Presenter](view-presenter.md);
  - a task: an event, as [Tasks](tasks.md) sets;
  - a plain function: a Presenter, stateful logic, a task, another plain function, the entry of a unit with no UI,
    or a store when the plain function reaches no store;
  - a store: a task and a plain function through the store's own API, at any moment they run, on any app — a task
    after its own `await` too, such as a check that the answer still fits the store. A task does not subscribe; it may
    read again. On a client also a Presenter or stateful logic, which subscribe to it or call its API. A View,
    another store
    or the entry of a unit with no UI that reaches a store directly is a violation: a View takes the data from its
    Presenter, an entry calls a task. A store is not stateful logic, so reaching one calls none. Who reaches a store
    of the pure zone: [Pure zone](pure-zone.md);
  - generic I/O: only a task and other generic I/O ([Pure zone](pure-zone.md)).
- Stores:
  - a store is data that lives longer than one call and is shared by the code that reads it — state several UI
    units read, each itself ([View and Presenter](view-presenter.md)), a cache or an in-memory table on a server.
    It is a kind of its own; code that subscribes to it to show its data is stateful logic. State the pure zone
    keeps, such as a library's queue of messages, is a store too;
  - a store file holds the data and its own API — reading and changing that data — and nothing else. A reading may
    be a subscription the file exports for a Presenter or stateful logic — whether a user is signed in — when it
    means the same to every user: it is part of the store, not a unit's stateful logic. A server call, a step of a
    business action or a computation for one of its users — one page's title — in it is a violation: the
    computation is that user's own logic;
  - on a server, a store's API may read and write its own database through the database's client: that is the
    store's own data, not a business action. A store that calls generic I/O, another service or another store's
    database is a violation;
  - a store may have several implementations behind one API, picked by the environment, in a store entry folder
    ([Entry folders](entry-folders.md));
  - where a store lives: [Levels](levels.md), [Placement by users](placement.md),
    [The app's tasks and stores folders](app-folders.md), [Pure zone](pure-zone.md).
- Plain functions:
  - the kind is decided by meaning, not by reaching a store: a business action, or a step of one, is a task; a
    computation, a change of UI state in a store or an act on the screen is a plain function;
  - a plain function that does I/O — calls the server, reads or writes a storage directly (the platform's key-value
    storage, a file), calls generic I/O — is a violation: it is a task. One that calls stateful logic,
    subscribes to a store or uses state or lifecycle is stateful logic;
  - what a plain function may import: [Imports](imports.md);
  - a plain function that a task calls, directly or through other plain functions, has nothing from the UI: it does
    not read or change the focus, the selection or the elements on the screen, starts no screen transition,
    imports nothing from the UI framework and calls no task. One that does is a violation, also of [Tasks](tasks.md).
    One that only the UI side uses — a Presenter, stateful logic, other such plain functions — may act on the screen,
    use the UI framework's API that is not stateful logic, and call a task as a Presenter does: await it and decide
    what the screen shows. It keeps no state between calls;
  - following the screen's changes means across calls. A function that subscribes to a screen event and removes its
    listener within the same call — it waits once for the next resize — is a plain function of the UI side; one
    whose listener outlives the call is stateful logic;
  - a wrapper that delays or thins out calls — a debounce, a throttle — and keeps its timer in the closure of the
    function it returns is a plain function. The caller makes it once and keeps it; the handler calls it;
  - a runtime schema — a value that describes a data shape and checks data against it — is a plain function written
    as data, not a constant: it holds logic and is called. It is placed and imported as a plain function, with no
    rule of its own: in its unit's logic folder or tasks folder, the app's tasks folder, the pure zone or the shared
    package. A View imports none; one in a constants file is a violation. Its file:
    [One thing per file](one-thing-per-file.md);
  - where a plain function lives: [Placement by users](placement.md).
- Stateful logic:
  - a function marked as stateful logic by the stack's convention that uses no state, lifecycle or subscription and
    calls no stateful logic is a violation: it is a task or a plain function, by meaning;
  - a function in the logic folder outside its tasks folder that uses none of them but reaches the server or a
    storage, calls generic I/O or carries out a business action is a violation: it is a task, for the tasks folder.
    A file in the tasks folder that uses state, lifecycle or a subscription, or calls stateful logic, is a
    violation: it is stateful logic, for the logic folder;
  - when stateful logic may call a task: [Tasks](tasks.md);
  - two concerns in one piece is a violation: its state and results fall into two groups, and one needs from the
    other at most a plain value it could take as an argument — the value of a field and the request made with it.
    Split it and join the two, passing that value, in the Presenter or in other stateful logic. Steps of one job —
    waiting, cancelling and retrying one request — are one concern;
  - the groups are formed by state and lifecycle, not by results: a value computed only from the input forms no
    group and stays with the state it is returned next to — a filter's options, its selected option and the filtered
    list are one concern. A request or a subscription has its own state and can form a second group; a reference to
    an element only one inline handler uses, to move the focus, forms none.

**Good.**

```
OrdersPage/
  _logic/
    orderFilters        stateful logic: keeps the filter state
    currentUser         stateful logic: subscribes to _stores/userStore
    statusFilter        stateful logic: options computed from the orders, the selected status, the filtered
                        orders — one concern
    formatPrice         a plain function: number -> text
    filtersSchema       a schema: the presenter checks the filters read from the URL by it — a plain function
    _tasks/
      cancelOrder       server call, then _stores/ordersStore: remove the order — no subscription
  _stores/
    ordersStore         a store: the orders and its API — read, set, remove
  OrderSearch/
    _logic/
      presenter         query = searchQuery(); orders = ordersRequest()
                        onChange(text): query.change(text); orders.search(text) — the handler calls the request
      searchQuery       the field: value, change, clear
      ordersRequest     search(text) calls the task searchOrders through a debounce made once; keeps loading,
                        the result and the error; cancels, retries
SearchPage/
  _logic/
    showResults         a plain function: screen store and search store changed inside a screen transition,
                        then the caret redrawn — UI state
    waitForResize       a plain function: waits once for the next resize or a timeout, removing its listener
    goHome              a plain function: calls the task clearSearch inside a screen transition
BookmarkButton/
  _logic/
    toggle/             a plain function the presenter calls
      toggle            a toast; awaits the task toggleBookmark; on failure an error toast
      undo              a part: the toast's Undo — awaits the task addBookmark, with toasts around it
```

On a server:

```
tasks/
  payments/
    paymentAnswerSchema the payment service's answer, checked only by the payment tasks: in their topic folder
    chargeCard
orders/
  _logic/
    _tasks/
      loadOrder         reads _stores/ordersCache; on a miss, loads the order and puts it there
  _stores/
    ordersCache         orders by id in memory, with get, put and clear
    favoritesStore      the API over the app's own database, through its client — the store's own I/O
```

**Bad.**

```
OrdersPage/
  constants             orderSchema — a schema is a plain function, not a constant
  _logic/
    formatPrice         called by a task, but follows the currency in the store — stateful logic
    cancelOrder         server call, then a store change — a task outside _tasks/
    toOrderLines        loads the products with lib/http/fetchJson — I/O in the app is a task
    _tasks/
      currentUser       subscribes to the store — stateful logic, not a task
      focusFirstError   called by placeOrder, moves the focus — a task acting on the screen through it
      orderLines        called by placeOrder, calls the task loadPrices — it is a task
  _stores/
    cartStore           the cart and loadCart, which calls the server — a task inside a store
  OrderSearch/
    _logic/
      orderSearch       the field and the request in one — two concerns
SearchPage/
  _logic/
    watchResize         adds a resize listener and returns, leaving it in place — stateful logic
    getClientId         reads and writes the platform's storage — I/O: a task
prices/
  _stores/
    pricesStore         its get calls a price service with lib/http/fetchJson — not its own database
```

**Stack notes.**

- [react/stateful-logic-and-functions.md](../stack/react/stateful-logic-and-functions.md) — stateful logic in React
  is a hook.
- [react/tasks.md](../stack/react/tasks.md) — a task in React.
- [zustand/stateful-logic-and-functions.md](../stack/zustand/stateful-logic-and-functions.md) — a Zustand store
  and who may use it.
