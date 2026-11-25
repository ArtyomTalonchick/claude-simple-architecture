## Tasks

**Rule.** Write each business action — one that would stay the same action in another UI — as a task: a function
named with a verb, with nothing from the UI framework, that holds the action's steps and its conditions on the
app's data. Call it from an event — a handler or another task, an effect only on start or mount — and leave to the
caller only the state of the call and what follows, navigation included.

**Why.** What a business action means does not depend on the UI: logging out is the same in a web app and a
mobile one. Written inside stateful logic, it can run only inside a component; spread over a Presenter as a row of
calls, it cannot be found as one action. A task keeps the action in one place that survives a change of the UI and
can be called and tested on its own. When an event calls the task, the link between what happened and the request
is read top to bottom; when a handler only changes data and an effect elsewhere calls the task, a
change to one side breaks the other unseen. The caller sets the interface: a task takes and returns what its caller
needs, so how it gets the data — a request, a cache — can change without the caller, and when the call starts
without the task.

**How to check.**

- A task is decided by meaning, by the Rule's test: clearing the cart is a task, even as one store change; changing
  UI state in a store — which screen is shown, a flag for an animation — is a plain function. A function of the
  app that does I/O is a task. Both, and how a task reaches a store — after its own `await` too:
  [Stateful logic and plain functions](stateful-logic-and-functions.md).
- A plain function of the UI side — a screen swap inside a screen transition — may call a task, or take its call
  as a callback; one that redoes a task's store changes itself is a violation: those changes are the task.
- From the outside a task is one action and one function. A function it is split into is a file of its own, a part
  of the task ([Entry folders](entry-folders.md)).
- A violation in a task: an import from the UI framework, a call of stateful logic, a plain function that acts on the
  screen or imports from the UI framework — directly or through other plain functions — and navigation. In an
  app with no UI, the framework that takes requests is not the UI framework: a task, a middleware included, may
  import it, as its database client.
- An event calls a task: a handler of a user action in a Presenter or stateful logic, directly or through a plain
  function of the UI side, of a request in the entry of a unit with no UI, or another task. An effect — code the UI
  framework runs after a render or a change — and stateful logic outside a handler it returns or runs call a task
  only on start or mount. One that watches state, props or a store and calls a task when they change is a
  violation — a "request follows its params" piece and a delay that follows a value until it settles included:
  the handler that changed the data calls the task, through a debounce made once when the call is delayed.
- A Presenter, stateful logic or a plain function of the UI side that reads the app's data to decide whether to
  call a task is a violation: the condition is the task's — "go to the next page" itself returns when there is no
  next page. A value computed to show — a flag that disables a button — is not such a
  condition, nor is what the event was about — the clicked item's id — passed as an argument,
  wherever the caller got it. Advice, not checked: a value the event does not choose, such as the current page, the
  task reads itself.
- The state of a call — loading, error — and its result are kept by the caller around the call, or written by the
  task to a store when units that did not call it show them; such a task need not also report the failure to its caller. No check chooses between them, nor between
  throwing a failure and returning it. Advice, not checked: what only the calling unit shows — the loaded list, its
  loading flag, its error — the task returns and the Presenter keeps; a store is for state several units need, a few
  units' UI state included.
- For "the latest call wins", a task may keep the handle that cancels its ongoing call in a store, next to the
  call's status. Only tasks use it; a Presenter, stateful logic or a View that reads or calls it is a violation.
- An optimistic update and its rollback are one task: on failure it undoes its change, then reports the failure or
  writes it to a store. Advice, not checked: where changes may run in parallel, the rollback undoes the task's own
  change, not a snapshot of the whole state.
- Steps of one business action — a server call, several store changes that together make the action, other
  actions — in a Presenter, stateful logic or a plain function are a violation: they are a task. The number of
  store actions a handler calls, or of stores, does not decide: changes of UI state stay in the handler or a plain
  function.
- A large step several actions need is a task of its own.
- Where a task lives: [Levels](levels.md), [The app's tasks and stores folders](app-folders.md).
- Advice, not checked: a task talks to the server through a small project module of tasks, one per request
  (`api.logout()`), which call the pure zone's generic I/O. The module is one file, placed by all the tasks that use
  it.

**Good.**

```
tasks/
  session/
    logout            await unsubscribePush(); await api.logout(); session store: clear
                      — called by LogoutButton and SessionExpired
    unsubscribePush   called by logout and deleteAccount
    restoreSession    token = store.token; session = await api.refresh(token); store: session — if the
                      store still holds that token: a second read, after the await
  shows/
    loadShows         store: status = loading; shows = await api.shows(store.page, store.genre); store: shows,
                      status = done; on failure store: status = error, the error, and it throws — several
                      units show them
    selectGenre       store: genre = genre, page = 1; await loadShows()
    goToPage          prev = store.page; store.page = next
                      try await loadShows() catch: store.page = prev — rolled back, error in the store: no rethrow
    nextPage          reads page and page count from the store; returns when there is no next page;
                      await goToPage(page + 1)
    searchShows       cancel store.request; store: request = a new handle, status = loading;
                      try store: shows = await api.search(text, request) catch: store: status = failed
  cart/
    clearCart         cart store: clear — one store change, yet a business action
LogoutButton/
  _logic/
    presenter         onClick: await logout(); go to the start page — navigation is the caller's
ShowsPage/
  _logic/
    presenter         on mount: loadShows()
                      onGenreClick(genre): selectGenre(genre)
                      onNext: nextPage() — hasNext, to disable the button, is computed for the View
                      onFavoriteClick(show): toggleFavorite(show.id) — what the event was about
                      onFiltersClick: draft store: reset; drawer store: open — UI state: no task
ShowDetails/
  _logic/
    presenter         on mount: loading = true; try show = await loadShow(props.id)
                      catch error -> error; finally loading = false — only this unit shows them: no store
    _tasks/
      loadShow        return await api.show(id)
SearchBox/
  _logic/
    presenter         search = debounce(searchShows, 300), made once; onChange(text): search(text)
```

**Bad.**

```
LogoutButton/
  _logic/
    presenter         onClick: await api.unsubscribe(...); await api.logout(); session store: clear — the action
                      lives in the Presenter
ShowsPage/
  _logic/
    presenter         onGenreClick(genre): genre = genre; an effect watches genre and calls loadShows
                      onNext: if page < pageCount: goToPage(page + 1) — a condition on the app's data
SearchBox/
  _logic/
    debouncedQuery    the text once typing stops; an effect calls searchShows when it changes
SearchPage/
  _logic/
    _tasks/
      showResults     a screen swap with its transition — UI code as a task
CartPage/
  _logic/
    clearCart         cart store: clear — a business action outside a tasks folder
tasks/
  logout              ...; navigate to the start page — navigation in a task
  checkout            await placeOrder(cart); ...; focusFirstError() — a plain function that acts on the screen
```

**Stack notes.**

- [react/tasks.md](../stack/react/tasks.md) — a task in React and the Presenter that calls it.
- [zustand/stateful-logic-and-functions.md](../stack/zustand/stateful-logic-and-functions.md) — `getState()` and
  `setState()` of a store in a task or a plain function.
