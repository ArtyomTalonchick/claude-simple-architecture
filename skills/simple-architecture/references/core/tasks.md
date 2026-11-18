## Tasks

**Rule.** Write each business action as a task: a user action, or a step of one, that would stay the same action in
another UI, or in another app on another UI framework — log in, log out, place an order, clear the cart. A task is
a function named with a verb, with nothing from the UI framework. It reaches stores through their own API, the
server through generic I/O, may call other tasks and plain functions, returns its result and fails by throwing. A
Presenter, stateful logic, another task or the entry of a unit with no UI calls it; a Presenter or stateful logic
awaits it and keeps the state of the call (loading, error); the Presenter decides what follows, navigation
included.

**Why.** What a business action means does not depend on the UI: logging out is the same in a web app and in a
mobile app, in any UI framework. Written inside stateful logic, it is tied to the life of a component and can run
only inside one; spread over a Presenter as a row of calls, it is tied to one screen and cannot be found as one
action. A task keeps the action in one place that survives a change of the UI layer, can be called and tested on its
own, and leaves the UI only the UI's part: showing the call and going somewhere after it. The test is meaning, not
what the code touches: code that changes a store only to drive the screen is part of the UI, and calling it a task
would carry the UI into the business actions.

**How to check.**

- Whether a function is a task is decided by meaning: would it stay the same action in another UI, or in another
  app on another UI framework? Clearing the cart would — a task, even when it is one store change. Reaching a store
  does not make a function a task: changing UI state in a store — which screen is shown, a flag for an animation —
  is not a business action, and such code is a plain function
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)). In the app, a request to the server is
  always a step of a business action: a function that does I/O is a task.
- Borderline, decided by meaning: a screen swap that changes two UI-state stores inside a screen transition and then
  redraws the caret is a plain function in the logic folder, called by stateful logic or the Presenter — not a task;
  clearing the cart is a task, called by the Presenter of every unit that offers it.
- A task is one action and one function from the outside; inside it may be split into smaller functions. Its name
  is a verb (`logout`, `addUser`, `publishPost`).
- A task uses nothing from the UI framework: no import from it, no call of stateful logic (a store is reached
  through its own API, below), no plain function that acts on the screen or imports from the UI framework —
  directly or through other plain functions — and no navigation. Navigation depends on where the app runs, so it
  stays in the Presenter. Any of these in a task is a violation.
- A task reads and changes a store once, through the store's own API, at the time it is called; it does not
  subscribe. Code that follows a store's changes to show them is stateful logic
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)).
- A task returns its result and fails by throwing. Catching an error only to return it as a value is a violation;
  catching an error the action itself handles (a failed step it may skip) is not.
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
- Placement follows [Levels and placement](levels.md): in the tasks folder (default `_tasks/`) inside the logic
  folder (default `_logic/`) of the lowest level that covers all its users, next to the plain functions only tasks
  use. A task is one file, or, when it has parts only it uses — a smaller task or a plain function only it calls —
  an entry folder named as the task: the file of the same name is its entry, the parts sit next to it, and others
  import only the entry. The parts decide, not the line count: a small task with private parts is a folder, and
  a smaller task only it calls is always one of its parts, never a task of its own in the tasks folder. A part with
  parts only it uses — a smaller task with its own steps — is an entry folder of its own inside the task's folder,
  at any depth. A task whose parts lie flat next to it in the tasks folder is a violation. A task folder is not a
  unit ([Levels and placement](levels.md)).
- Recommended, not checked: a task talks to the server through a small project module of tasks, one per
  request (`api.logout()`), which call the pure zone's generic I/O — not through generic I/O directly.

**Good.**

```
_logic/
  _tasks/
    logout            await unsubscribePush(); await api.logout(); session store: clear
                      — called by LogoutButton and SessionExpired
    unsubscribePush   await api.unsubscribe(push token from the settings store) — called by logout and
                      deleteAccount
    deleteAccount
    clearCart         cart store: clear — one store change, yet a business action: the same in any UI;
                      called by CartPage and by placeOrder
    placeOrder/       an entry folder, 50 lines in all: a folder because it has parts only it uses
      placeOrder      await reserveItems(cart); await api.placeOrder(toOrderRequest(cart)); clearCart()
      reserveItems    a smaller task: reserves the cart's items on the server — called only by placeOrder
      toOrderRequest  a plain function: cart -> request body — called only by placeOrder
      tests/          tests of placeOrder and its parts
SessionExpired/
LogoutButton/
  LogoutButton        View
  _logic/
    presenter         onClick: loading = true; try await logout(), go to the start page
                      catch error -> error; finally loading = false
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
_logic/
  clearCart           cart store: clear — a business action outside _tasks/
  _tasks/
    logout            ...; navigate to the start page — navigation in a task
    publishPost       try await api.publish(post) catch e: return { error: e } — the error as a value
    placeOrder        await reserveItems(cart); ...; focusFirstError() — a plain function that acts on the screen
    reserveItems      called only by placeOrder — a part of it: it belongs in _tasks/placeOrder/
```

**Stack notes.**

- [react/tasks.md](../stack/react/tasks.md) — a task in React and the Presenter that calls it.
- [zustand/stateful-logic-and-functions.md](../stack/zustand/stateful-logic-and-functions.md) — `getState()` and
  `setState()` of a store in a task or a plain function.
