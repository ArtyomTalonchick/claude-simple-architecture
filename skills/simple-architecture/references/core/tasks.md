## Tasks

**Rule.** Write each user action — log in, log out, place an order, publish a post — and each step of one that
reaches a store or the server as a task: a plain function named with a verb, with nothing from the UI framework. A
task reaches stores through their own API, may call other tasks, returns its result and fails by throwing. A
Presenter or stateful logic calls it, awaits it, keeps the state of the call (loading, error) and decides what
follows, navigation included.

**Why.** What a user action means does not depend on the UI: logging out is the same in a web app and in a mobile
app, in any UI framework. Written inside stateful logic, it is tied to the life of a component and can run only
inside one; written as a helper, it hides a dependency on app state where none is expected. A task keeps the action
in one place that survives a change of the UI layer, can be called and tested on its own, and leaves the UI only
the UI's part: showing the call and going somewhere after it.

**How to check.**

- A task is one action and one function from the outside; inside it may be split into smaller functions. Its name
  is a verb (`logout`, `addUser`, `publishPost`).
- A task uses nothing from the UI framework: no import from it, no call of stateful logic (a store is reached
  through its own API, below), no helper that acts on the screen, no navigation. Navigation depends on where the
  app runs, so it stays in the Presenter. Any of these in a task is a violation.
- A task reads and changes a store once, through the store's own API, at the time it is called; it does not
  subscribe. Code that follows a store's changes to show them is stateful logic
  ([Stateful logic and helpers](stateful-logic-and-helpers.md)).
- A task returns its result and fails by throwing. Catching an error only to return it as a value is a violation;
  catching an error the action itself handles (a failed step it may skip) is not.
- A large step that several actions need — unsubscribing from push notifications before logging out — is a task of
  its own, and the actions call it.
- Steps of one user action — a server call, store changes, other actions — written in a Presenter or in stateful
  logic are a violation: they are a task. One call of a store's action is not.
- Placement follows [Levels and placement](levels.md): in the tasks folder (default `tasks/`) inside the logic
  folder of its one unit, or in the tasks folder of the lowest level that covers all its users. A task is one file,
  or a folder named as the task when it needs several files to stay within the file limit: the file of the same
  name is its entry, and the rest are parts only it uses — a smaller task or a helper only it calls. Others import
  only the entry.
- Recommended, not checked: a task talks to the server through a small project module (`api.logout()`), not
  through the transport directly.

**Good.**

```
tasks/
  logout              await unsubscribePush(); await api.logout(); session store: clear
                      — called by LogoutButton and SessionExpired
  unsubscribePush     await api.unsubscribe(push token from the settings store) — called by logout and
                      deleteAccount
  deleteAccount
SessionExpired/
LogoutButton/
  LogoutButton        View
  logic/
    presenter         onClick: loading = true; try await logout(), go to the start page
                      catch error -> error; finally loading = false
```

**Bad.**

```
LogoutButton/
  logic/
    presenter         onClick: await api.unsubscribe(...); await api.logout(); session store: clear;
                      go to the start page — the action lives in the Presenter
tasks/
  logout              ...; navigate to the start page — navigation in a task
  publishPost         try await api.publish(post) catch e: return { error: e } — the error as a value
```

**Stack notes.**

- [react/tasks.md](../stack/react/tasks.md) — a task in React and the Presenter that calls it.
- [zustand/stateful-logic-and-helpers.md](../stack/zustand/stateful-logic-and-helpers.md) — `getState()` and
  `setState()` in a task.
