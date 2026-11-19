## Tasks

**Rule.** Write each business action as a task: a user action, or a step of one, that would stay the same action in
another UI, or in another app on another UI framework — log in, log out, place an order, clear the cart. A task is
a function named with a verb, with nothing from the UI framework. It reaches stores through their own API, the
server through generic I/O, may call other tasks and plain functions, returns its result and fails by throwing. An
event calls it: a handler of a Presenter, of stateful logic or of the entry of a unit with no UI, or another task —
an effect calls it only on start or mount, never because data changed. The steps and the conditions around the
app's data belong to the task; the caller only calls it. The state of the call (loading, error) is kept by the
caller around the call, or written by the task to a store; the Presenter decides what follows, navigation
included.

**Why.** What a business action means does not depend on the UI: logging out is the same in a web app and in a
mobile app, in any UI framework. Written inside stateful logic, it is tied to the life of a component and can run
only inside one; spread over a Presenter as a row of calls, it is tied to one screen and cannot be found as one
action. A task keeps the action in one place that survives a change of the UI layer, can be called and tested on its
own, and leaves the UI only the UI's part: showing the call and going somewhere after it. A task used by several
units lives in the app's tasks folder, outside the UI tree, so it does not move when its callers do. When an event
calls the task, the link between what happened and the request is in one place, read top to bottom; when a handler
only changes data and an effect elsewhere watches it and calls the task, that link is in the code of neither, and a
change to one side breaks the other unseen. The test is meaning, not what the code touches: code that changes a
store only to drive the screen is part of the UI, and calling it a task would carry the UI into the business
actions.

**How to check.**

- Whether a function is a task is decided by meaning: would it stay the same action in another UI, or in another
  app on another UI framework? Clearing the cart would — a task, even when it is one store change. Reaching a store
  does not make a function a task: changing UI state in a store — which screen is shown, a flag for an animation —
  is not a business action, and such code is a plain function
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)). In the app, a request to the server is
  always a step of a business action: a function that does I/O is a task.
- Borderline, decided by meaning: a screen swap that changes two UI-state stores inside a screen transition and then
  redraws the caret is a plain function in the logic folder, called by stateful logic or the Presenter — not a task;
  clearing the cart is a task, in the app's tasks folder, called by the Presenter of every unit that offers it.
- A task is one action and one function from the outside; inside it may be split into smaller functions. Its name
  is a verb (`logout`, `addUser`, `publishPost`).
- A task uses nothing from the UI framework: no import from it, no call of stateful logic (a store is reached
  through its own API, below), no plain function that acts on the screen or imports from the UI framework —
  directly or through other plain functions — and no navigation. Navigation depends on where the app runs, so it
  stays in the Presenter. Any of these in a task is a violation.
- A task reads and changes a store once, through the store's own API, at the time it is called; it does not
  subscribe. Code that follows a store's changes to show them is stateful logic
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)).
- An event calls a task: a handler — of a user action in a Presenter or stateful logic, of a request in the entry
  of a unit with no UI — or another task. An effect, code the UI framework runs after a render or a change, calls a
  task only on start or mount. An effect or stateful logic that watches state, props or a store and calls a task
  when they change is a violation: the handler that changed the data calls the task itself. Tasks call each other
  as plain functions, so the order of an action is read in one place, top to bottom.
- The steps and the conditions around the app's data belong to the task, not to its caller: "go to the next page"
  reads the page and the page count from the store, returns when there is no next page, and calls "go to page". A
  Presenter or stateful logic that reads the app's data to decide whether to call a task, or to build the task's
  argument from a store's data, is a violation: that is the task's job. The Presenter only calls the task, and the
  store only keeps data. A value the Presenter computes to show — a flag that disables a button — is not such a
  condition.
- A delay before the call (debounce) is a plain function around the task call, made once and called from the
  handler — not stateful logic that follows a value until it settles and then calls the task.
- The state of a call may live in either place, and no check chooses between them: the caller keeps it around the
  call (loading is set, the task awaited, loading is cleared), or the task writes the status of its call to a store
  — loading before the request, the result or the error after — when units that did not call it show it.
- A task returns its result and fails by throwing. Catching an error only to return it as a value is a violation;
  catching an error the action itself handles is not: a failed step it may skip, or its own failure, when the task
  rolls back its change and writes the error to a store where the UI reads it — such a task need not rethrow.
- An optimistic update and its rollback are one task: it changes the store, makes the request, and on failure
  undoes its change. Where changes may run in parallel — two quick toggles of one item — the rollback undoes the
  task's own change, not a snapshot of the whole state taken before it, or it overwrites the other change. Advice,
  not checked.
- Generic I/O of the pure zone ([Pure zone](pure-zone.md)) — a request or a storage access that knows nothing of
  the app — is not a task, and only a task or other generic I/O calls it. A task that calls it is still the step
  that reaches the server. A Presenter, stateful logic or a plain function that calls it is a violation, as one
  that reaches the server directly is.
- A large step that several actions need — unsubscribing from push notifications before logging out — is a task of
  its own, and the actions call it.
- Steps of one business action — a server call, several store changes that together make the action, other
  actions — written in a Presenter, in stateful logic or in a plain function are a violation: they are a task. One
  call of a store's action is not, and neither is a change of UI state: a Presenter or stateful logic may make it
  itself or hand it to a plain function.
- Placement follows [Levels and placement](levels.md), by the units that call the task. A task one unit calls
  lives in the tasks folder (default `_tasks/`) inside that unit's logic folder (default `_logic/`). A task with
  users in two or more units lives in the app's tasks folder (default `tasks/`, next to the pure zone), and so does
  a task that tasks of that folder call; it moves there in one step when a second unit calls it, and a store it
  reaches moves to the app's stores folder (default `stores/`). A task in a level's tasks folder that another unit
  calls — a child unit, a sibling — is a violation.
- A task is one file. In a unit's tasks folder, a task with plain functions only it uses is an entry folder named
  as the task: the file of the same name is its entry, the parts sit next to it, and others import only the entry;
  the parts decide, not the line count, and those parts lying flat next to it are a violation. In the app's tasks
  folder such an entry folder is allowed, not required. A task is never a part of another task: tasks call each
  other freely, whoever calls them, and a task only one other task calls is a task of its own in the same tasks
  folder. A task folder is not a unit ([Levels and placement](levels.md)).
- Recommended, not checked: a task talks to the server through a small project module of tasks, one per
  request (`api.logout()`), which call the pure zone's generic I/O — not through generic I/O directly. The module
  is one file: its users are all the tasks that call any of its requests, so it lies in the app's tasks folder when
  tasks of two or more units use it.

**Good.**

```
tasks/                the app's tasks folder
  session/            a folder by topic — optional
    logout            await unsubscribePush(); await api.logout(); session store: clear
                      — called by LogoutButton and SessionExpired
    unsubscribePush   await api.unsubscribe(push token from the settings store) — called by logout and
                      deleteAccount, tasks of this folder
    deleteAccount
  shows/
    loadShows         store: status = loading; shows = await api.shows(store.page, store.genre); store: shows,
                      status = done; on failure store: status = error, the error, and it throws — the list, the
                      pager and the header show the status, though only one of them called it
    selectGenre       store: genre = genre, page = 1; await loadShows()
    goToPage          prev = store.page; store.page = next
                      try await loadShows() catch: store.page = prev — an optimistic update with its rollback in
                      one task; it rolled back and the error is in the store, so it need not rethrow
    nextPage          reads page and page count from the store; returns when there is no next page;
                      await goToPage(page + 1)
    toggleFavorite    store: flip the flag of id; try await api.toggleFavorite(id) catch: flip the flag of id
                      back — it undoes its own change, not a snapshot, so a second quick toggle is kept
  cart/
    clearCart         cart store: clear — one store change, yet a business action: the same in any UI;
                      called by CartPage and by placeOrder
    placeOrder        await reserveItems(cart); await api.placeOrder(toOrderRequest(cart)); clearCart()
                      — called by CartPage and by QuickBuy
    reserveItems      a task of its own: reserves the cart's items on the server — called only by placeOrder,
                      yet not a part of it
    toOrderRequest    a plain function on the app's data: cart -> request body — lies next to the tasks
stores/
  showsStore          shows, page, page count, genre, status, error
  sessionStore        cleared by logout
  cartStore           read by placeOrder, cleared by clearCart
SessionExpired/
LogoutButton/
  LogoutButton        View
  _logic/
    presenter         onClick: loading = true; try await logout(), go to the start page
                      catch error -> error; finally loading = false
ShowsPage/
  _logic/
    presenter         on mount: loadShows() — an effect on start only
                      onGenreClick(genre): selectGenre(genre) — the handler calls the task
                      onNext: nextPage() — the condition is the task's; hasNext, to disable the button, is
                      computed for the View
SearchBox/
  _logic/
    presenter         search = debounce(searchShows, 300), made once; onChange(text): keep text; search(text)
OrdersPage/
  _logic/
    _tasks/
      exportOrders/   a task only OrdersPage calls, with a plain function only it uses: an entry folder
        exportOrders
        toCsvRow
SearchPage/
  _logic/
    presenter         onSubmit: showResults(query)
    showResults       a plain function: screen store and search store changed inside a screen transition, then
                      the caret redrawn — UI state, not a business action
```

**Bad.**

```
LogoutButton/
  _logic/
    presenter         onClick: await api.unsubscribe(...); await api.logout(); session store: clear;
                      go to the start page — the action lives in the Presenter
UserMenu/
  _logic/
    presenter         onOpen: user = await fetchJson('/user') from lib/http/ — generic I/O outside a task
SearchPage/
  _logic/
    _tasks/
      showResults     the screen swap with a screen transition — UI code as a task, acting on the screen
ShowsPage/
  _logic/
    presenter         onGenreClick(genre): genre = genre; an effect watches genre and calls loadShows — the
                      handler only changes state, so the request is in the code of neither: it calls selectGenre
                      onNext: if page < pageCount: goToPage(page + 1) — a condition on the app's data in the
                      Presenter: it belongs in the task nextPage
    showsRequest      stateful logic: builds the params from the state and calls loadShows whenever they change —
                      a request that follows its params
SearchBox/
  _logic/
    debouncedQuery    stateful logic: the text once typing stops; an effect calls searchShows when it changes —
                      the delay belongs around the call: debounce(searchShows, 300)
CartPage/
  _logic/
    clearCart         cart store: clear — a business action outside a tasks folder
    _tasks/
      placeOrder      called by CartPage and by QuickBuy — two units: it belongs in the app's tasks folder
tasks/
  logout              ...; navigate to the start page — navigation in a task
  publishPost         try await api.publish(post) catch e: return { error: e } — the error as a value
  checkout            await placeOrder(cart); ...; focusFirstError() — a plain function that acts on the screen
```

**Stack notes.**

- [react/tasks.md](../stack/react/tasks.md) — a task in React and the Presenter that calls it.
- [zustand/stateful-logic-and-functions.md](../stack/zustand/stateful-logic-and-functions.md) — `getState()` and
  `setState()` of a store in a task or a plain function.
