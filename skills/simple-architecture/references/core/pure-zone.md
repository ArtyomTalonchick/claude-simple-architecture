## Pure zone

**Rule.** Keep code that knows nothing of the app in the pure zone at the root level: the lib folder (default
`lib/`) with folders named by what they hold (such as `lib/http/` and `lib/theme/`), and the ui-kit (default
`lib/components/`) as its components folder. The design-system theme — tokens and the styles of ui-kit
components — is pure too and lives in the lib folder. Pure code depends on nothing from the app — no domain types,
store, data access, app components or app styles, by import or by key. Code that does I/O — a request, a storage
access — and knows nothing of the app is generic I/O, a kind of its own that lives only here and that only tasks
call. Code that knows the app goes to the logic folder, the stores folder or the components folder of the root
level. Pure code stays in the pure zone whatever the number of its users.

**Why.** Pure code is the base the rest of the app stands on. As long as it knows nothing of the app, it changes
only for its own reasons, can be reused anywhere in the app, and can move to another project as it is. Once it
picks up one app dependency, a change in the app can break the base, and the base can no longer be moved. It is
a base, not shared code, so it does not move down to its one user the way shared code does. Generic I/O is
neither a task nor a helper: it holds no business logic, so it is no task, and it reaches outside the program, so
it is no helper. Called only from tasks, it keeps the app's I/O where it already is — in the tasks.

**How to check.**

- Find the pure zone from the config: the lib folder and the ui-kit folder under the root level. The ui-kit is
  the pure zone's components folder: when it is set outside the lib folder, the lib folder has no components
  folder of its own. The ui-kit's name is set on its own (`folders.uiKit`, default `lib/components/`) and does not
  follow the name of a level's components folder (`folders.components`): the ui-kit is part of the pure zone, not a
  level's shared components folder.
- The lib folder holds folders named by what they hold — generic I/O (e.g. `lib/http/`), errors, the theme
  (e.g. `lib/theme/`), icons, styles, stateful logic, helpers — and the ui-kit when it is set inside it. They all
  follow this rule. A name such as `hooks/` or `helpers/` is a name by content too; what a function does decides
  its kind ([Stateful logic and helpers](stateful-logic-and-helpers.md)), not the folder it lies in.
- A tasks folder in the lib folder (`tasks/`, or named as the configured tasks folder, default `_tasks/`) is a
  violation: a task
  is the app's business logic, and the pure zone has none. Code in it that knows nothing of the app is generic I/O
  or a helper and goes to a folder named by what it holds; code that knows the app is a task and goes to the app.
- Generic I/O is a function in the pure zone that does I/O — a request, a storage access — and knows nothing of
  the app: no endpoint, key or data shape of the app, only what its caller passes in. Only a task and other
  generic I/O call it. A Presenter, stateful logic, a helper, a View, a store or the entry of a unit with no UI
  that calls it is a violation, as reaching the server outside a task is ([Tasks](tasks.md)). In the app, code
  that does I/O is a task, even when it calls generic I/O.
- A file in the pure zone that imports from the app — any path under the root level outside the pure zone — is a
  violation. Imports from outside the project (packages), from elsewhere in the pure zone, and of files outside
  the root level that are not app code (design assets such as an icon sprite) are allowed.
- A dependency by key counts as an import: a style, a text or a service that pure code looks up by name must be
  defined in the pure zone. Pure code that looks up a key defined only outside the pure zone — a style in a theme
  under the root level, outside the lib folder — is a violation. The app mounting or extending what the pure zone
  defines (the root mounting the theme from `lib/`) is allowed: the app may depend on the pure zone. So is pure
  stateful logic that takes a task as an argument and runs it: the app passes it in.
- A pure zone folder below the root level (a module with its own lib folder) is a violation: the pure zone exists
  only at the root.
- A pure zone file with one user is not a violation of [Levels and placement](levels.md).
- [View and Presenter](view-presenter.md) and [Stateful logic and helpers](stateful-logic-and-helpers.md) hold
  inside the pure zone too.

**Good.**

```
src/
  lib/
    components/
      Button/             no app imports
      Modal/              uses lib/hooks/disclosure
      SearchField/        looks up the style "searchField", registered in lib/theme/
    hooks/
      disclosure          open / closed state, no app imports
    helpers/
      formatDate          no app imports
    http/
      fetchJson           generic I/O: a request to the URL it is given, the body parsed; throws HttpError
    errors/
      HttpError           the error of a failed request
    theme/
      tokens              colors, spacing
      searchField         the style of SearchField
  App                     mounts the theme from lib/theme/
  _logic/
    currentUser           subscribes to _stores/userStore — app code, so outside lib/
    _tasks/
      loadUser            calls lib/http/fetchJson with the app's /user URL — a task, the step that reaches the
                          server
  _stores/
    userStore             the current user — app data, so outside lib/
  _components/
    UserAvatar/           its presenter reads the current user from the store — app code, so outside lib/
```

**Bad.**

```
src/
  lib/
    components/
      Button/             no app imports
      UserAvatar/         its presenter reads the current user from the store — app code inside the pure zone
      SearchField/        looks up the style "searchField", registered in theme/ — an app dependency by key
    helpers/
      formatDate          imports the Order type from the app
    _tasks/
      fetchJson           a tasks folder in the pure zone — generic I/O goes to lib/http/
  theme/
    searchField           the style of a ui-kit component outside the pure zone — it belongs in lib/theme/
  UserProfile/
    _logic/
      presenter           calls lib/http/fetchJson for the user — generic I/O outside a task
  OrdersPage/
    lib/                  a pure zone below the root level
```

**Stack notes.** None.
