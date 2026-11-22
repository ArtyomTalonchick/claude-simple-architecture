## Tasks

**Rule.** Write each business action — one that would stay the same action in another UI — as a task: a function
named with a verb, with nothing from the UI framework, that holds the action's steps and its conditions on the
app's data. Call it from an event — a handler or another task, an effect only on start or mount — and leave to the
caller only the state of the call and what follows, navigation included.

**Why.** What a business action means does not depend on the UI: logging out is the same in a web app and in a
mobile app. Written inside stateful logic, it can run only inside a component; spread over a Presenter as a row of
calls, it cannot be found as one action. A task keeps the action in one place that survives a change of the UI,
can be called and tested on its own, and leaves the UI only showing the call and going somewhere after it. When an
event calls the task, the link between what happened and the request is read top to bottom in one place; when a
handler only changes data and an effect elsewhere calls the task, a change to one side breaks the other unseen.

**How to check.**

- A task is decided by meaning: would it stay the same action in another UI, or in another app on another UI
  framework? Clearing the cart would — a task, even as one store change. Changing UI state in a store — which screen
  is shown, a flag for an animation — is not, and such code is a plain function
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)). In the app, a function that does I/O is
  a task, even when it calls generic I/O; the one exception is a server store reading and writing its own database.
- Borderline: a screen swap that changes two UI-state stores inside a screen transition and redraws the caret is a
  plain function, not a task. When a task has to run inside such a transition, the Presenter passes its call as a
  callback (`goHome(() => clearSearch())`). A plain function that redoes the task's store changes itself, to avoid
  calling it, is a violation: those changes are the task.
- From the outside a task is one action and one function; inside it may be split into smaller functions. Its name
  is a verb (`logout`, `addUser`).
- A violation in a task: an import from the UI framework, a call of stateful logic, a plain function that acts on the
  screen or imports from the UI framework — directly or through other plain functions — and navigation, which stays
  in the Presenter.
- A task reads and changes a store once, through the store's own API, when it is called; it does not subscribe.
- An event calls a task: a handler of a user action in a Presenter or stateful logic, of a request in the entry of a
  unit with no UI, or another task. An effect — code the UI framework runs after a render or a change — calls a task
  only on start or mount. An effect or stateful logic that watches state, props or a store and calls a task when
  they change is a violation: the handler that changed the data calls the task.
- A Presenter or stateful logic that reads the app's data to decide whether to call a task is a violation: "go to
  the next page" reads the page and the page count from the store itself and returns when there is no next page. A
  value computed to show — a flag that disables a button — is not such a condition, nor is what the event was
  about — the clicked item's id, the typed text, the chosen value — passed as an argument, wherever the caller got
  it. Advice, not checked: a value the event does not choose, such as the current page, the task reads itself.
- A delay before the call (debounce) is a plain function around the call, made once and called from the handler.
- The state of a call — loading, error — is kept by the caller around the call, or written by the task to a store
  (loading before the request, the result or the error after) when units that did not call it show it; such a task
  need not also report the failure to its caller. No check chooses between them, nor between a task that throws its
  failure and one that returns it.
- A task that makes "the latest call wins" may keep the handle that cancels its ongoing call in a store, next to the
  call's status. Only tasks use that handle; a Presenter, stateful logic or a View that reads or calls it is a
  violation.
- An optimistic update and its rollback are one task: on failure it undoes its change, then reports the failure or
  writes it to a store. Where changes may run in parallel, the rollback undoes the
  task's own change, not a snapshot of the whole state: advice, not checked.
- Steps of one business action — a server call, several store changes that together make the action, other
  actions — written in a Presenter, in stateful logic or in a plain function are a violation: they are a task. One
  call of a store's action is not, nor is a change of UI state.
- A large step that several actions need is a task of its own, and the actions call it.
- Where a task lives: [Levels](levels.md), [The app's tasks and stores folders](app-folders.md),
  [Entry folders](entry-folders.md).
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
  shows/
    loadShows         store: status = loading; shows = await api.shows(store.page, store.genre); store: shows,
                      status = done; on failure store: status = error, the error, and it throws
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
    presenter         onClick: loading = true; try await logout(), go to the start page
                      catch error -> error; finally loading = false
ShowsPage/
  _logic/
    presenter         on mount: loadShows()
                      onGenreClick(genre): selectGenre(genre)
                      onNext: nextPage() — hasNext, to disable the button, is computed for the View
                      onFavoriteClick(show): toggleFavorite(show.id) — what the event was about
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
      showResults     the screen swap with a screen transition — UI code as a task
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
