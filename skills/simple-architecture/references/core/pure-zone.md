## Pure zone

**Rule.** Keep code that knows nothing of the app in the pure zone at the root level: the lib folder (default
`lib/`) with folders named by what they hold (such as `lib/http/` and `lib/theme/`), and the ui-kit (default
`lib/components/`) as its components folder. The design-system theme — tokens and the styles of ui-kit
components — is pure too and lives in the lib folder. Pure code depends on nothing from the app — no domain types,
store, data access, app components or app styles, by import or by key — and knows nothing of it by meaning: a
component named after or shaped by the app's domain, one that holds the app's own text, and a placeholder or a part
of such a component know the app even when their props are plain values and callbacks. Code that does I/O — a
request, a storage access — and knows nothing of the app is generic I/O, a kind of its own that lives only here and
that only tasks call. Code that knows the app goes to the app — its logic, stores or components — placed by
its users ([Levels and placement](levels.md)). Pure code stays in the pure zone whatever the number of its users.

**Why.** Pure code is the base the rest of the app stands on. As long as it knows nothing of the app, it changes
only for its own reasons, can be reused anywhere in the app, and can move to another project as it is. Once it
picks up one app dependency, a change in the app can break the base, and the base can no longer be moved. It is
a base, not shared code, so it does not move down to its one user the way shared code does. A component can know
the app without importing from it: the knowledge sits in its name, its props and its text. An order card that takes
an order's number and total as plain strings still changes when orders change and means nothing in another
project: it is app code that only looks pure. Kept in the ui-kit, it makes the base change for the app's reasons,
and it hides who uses it, so the levels no longer show where it belongs. Generic I/O is neither a task nor a plain
function: it holds no business logic, so it is no task, and it reaches outside the program, so it is no plain
function. Called only from tasks, it keeps the app's I/O where it already is — in the tasks.

**How to check.**

- Find the pure zone from the config: the lib folder and the ui-kit folder under the root level. The ui-kit is
  the pure zone's components folder: when it is set outside the lib folder, the lib folder has no components
  folder of its own. The ui-kit's name is set on its own (`folders.uiKit`, default `lib/components/`) and does not
  follow the name of a level's components folder (`folders.components`): the ui-kit is part of the pure zone, not a
  level's shared components folder.
- The lib folder holds folders named by what they hold — generic I/O (e.g. `lib/http/`), errors, the theme
  (e.g. `lib/theme/`), icons, styles, stateful logic, pure functions (e.g. `lib/dates/`) — and the ui-kit when it
  is set inside it. They all follow this rule. A name by kind, such as `hooks/`, is a name by content too; what a
  function does decides its kind ([Stateful logic and plain functions](stateful-logic-and-functions.md)), not the
  folder it lies in. A pure function is a plain function of the pure zone: it knows nothing of the app, so it
  reaches no store.
- A tasks folder in the lib folder (`tasks/`, or named as the configured tasks folder, default `_tasks/`) is a
  violation: a task is the app's business logic, and the pure zone has none. Code in it that knows nothing of the
  app is generic I/O or a pure function and goes to a folder named by what it holds; code that knows the app is a
  task and goes to the app.
- Generic I/O is a function in the pure zone that does I/O — a request, a storage access — and knows nothing of
  the app: no endpoint, key or data shape of the app, only what its caller passes in. Only a task and other
  generic I/O call it. A Presenter, stateful logic, a plain function, a View, a store or the entry of a unit with
  no UI that calls it is a violation, as reaching the server outside a task is ([Tasks](tasks.md)). In the app,
  code that does I/O is a task, even when it calls generic I/O.
- A file in the pure zone that imports from the app — any path under the root level outside the pure zone — is a
  violation. Imports from outside the project (packages), from elsewhere in the pure zone, and of files outside
  the root level that are not app code (design assets such as an icon sprite) are allowed.
- A dependency by key counts as an import: a style, a text or a service that pure code looks up by name must be
  defined in the pure zone. Pure code that looks up a key defined only outside the pure zone — a style in a theme
  under the root level, outside the lib folder — is a violation. The app mounting or extending what the pure zone
  defines (the root mounting the theme from `lib/`) is allowed: the app may depend on the pure zone. So is pure
  stateful logic that takes a task as an argument and runs it: the app passes it in.
- A ui-kit component is checked by meaning, not only by its imports: plain props — strings, numbers, flags,
  callbacks, children — do not make it pure. A ui-kit component with any of these signs knows the app and is a
  violation:
  - it is named after or shaped by a domain entity, not a generic element: an order card, a user row, a cart button
    — not a card, a list row, a button. Shaped means its props or layout follow one entity's fields (`number`,
    `total`, `status` laid out as an order), even under a generic name;
  - it holds the app's own text: a label, a title or a message that names the app's domain or screens ("Cart",
    "My orders", "No orders yet"). Text its user passes in is not its own. A generic default that any app shows for
    such an element and its user can replace — "Close" on a dialog's close button, an aria label "Loading" on a
    spinner — is not the app's text either;
  - it is a placeholder or a part of a component with a sign above: an order card's skeleton, an order row's
    actions. A generic placeholder, such as a skeleton block of a given size, is fine.

  Such a component is app code and is placed by [Levels and placement](levels.md), not in the ui-kit: with one
  user, in that user's folder as its child unit; with more, in the components folder of the lowest level that
  covers them all. When the call is a judgement, say so.
- A pure zone folder below the root level (a module with its own lib folder) is a violation: the pure zone exists
  only at the root.
- A pure zone file with one user is not a violation of [Levels and placement](levels.md).
- [View and Presenter](view-presenter.md) and
  [Stateful logic and plain functions](stateful-logic-and-functions.md) hold inside the pure zone too.

**Good.**

```
src/
  lib/
    components/
      Button/             no app imports
      Card/               a generic card: title, image, children and onClick come from its user
      Skeleton/           a generic placeholder block of a given width and height
      Modal/              uses lib/disclosure/disclosure; its close button's aria label defaults to "Close",
                          replaceable by its user
      SearchField/        looks up the style "searchField", registered in lib/theme/
    disclosure/
      disclosure          stateful logic: open / closed state, no app imports
    dates/
      formatDate          a pure function, no app imports
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
    OrderCard/            plain props (number, total, status, onOpen), but a card of an order — app code, so
                          outside lib/; used by two branches, so at their lowest common level
    OrderCardSkeleton/    the placeholder of OrderCard — app code with it
  CartPage/
    CheckoutButton/       holds the app's label "Go to checkout" — app code; used only by CartPage, so its child
```

**Bad.**

```
src/
  lib/
    components/
      Button/             no app imports
      UserAvatar/         its presenter reads the current user from the store — app code inside the pure zone
      OrderCard/          plain props (number, total, status, onOpen), no app imports — but a card of an order:
                          app code inside the pure zone
      OrderCardSkeleton/  the placeholder of OrderCard — app code inside the pure zone
      CheckoutButton/     plain props, but holds the app's label "Go to checkout" — app code inside the pure zone
      SearchField/        looks up the style "searchField", registered in theme/ — an app dependency by key
    dates/
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
