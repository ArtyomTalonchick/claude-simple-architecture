## Pure zone

**Rule.** Keep code that knows nothing of the app — by import, by key or by meaning — in the pure zone: the lib
folder (default `lib/`) at the root level, or where the app's `lib` key puts it, with the ui-kit and the
design-system theme, in folders named by what their code is about, never by the kind of code. Generic I/O, code
that does I/O and knows nothing of the app, is a kind of its own: it lives here, or in the shared package when two
or more apps use it, and only tasks call it.

**Why.** Pure code is the base the rest of the app stands on. As long as it knows nothing of the app, it changes
only for its own reasons, can be reused anywhere in the app and moved to another project as it is; it is a base,
not shared code, so it does not move down to its one user. A component can know the app without importing from it:
an order card that takes an order's number and total as plain strings still changes when orders change, and kept in
the ui-kit it makes the base change for the app's reasons and hides who uses it. A folder named by a kind of code
says how the code is written, not what it does, so anything fits under it and it grows into a drawer of unrelated
code. Generic I/O holds no business logic, so it is no task, and it reaches outside the program, so it is no plain
function; called only from tasks, it keeps the app's I/O in the tasks.

**How to check.**

- Where it is: the lib folder and the ui-kit folder (`folders.uiKit`, default `lib/ui-kit/`) under the root level,
  or, when the app sets `lib`, the folder it names, outside every level, with the ui-kit inside it; the root level
  then holds no pure zone, and a lib folder there is an ordinary folder at a level root ([Levels](levels.md)). The
  app's tasks folder and stores folder next to it are the app's code, not the pure zone.
- The ui-kit is the pure zone's components folder, not a level's: its name does not follow `folders.components`,
  and when it is set outside the lib folder, the lib folder has no components folder of its own.
- The lib folder holds folders named by what their code is about — generic I/O (`lib/http/`), errors, the theme
  (`lib/theme/`: tokens and the styles of ui-kit components), icons, styles, stateful logic (`lib/disclosure/`),
  pure functions (`lib/dates/`) — and the ui-kit when it is set inside it. What a function does decides its kind
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)), not its folder. A pure function is a
  plain function of the pure zone, so it reaches no store.
- A folder in the lib folder named by the kind of code — `hooks/`, `helpers/`, `utils/`, `functions/`, `services/`
  and the like — is a violation: each piece in it goes to a folder named by its subject (a debounce to
  `lib/debounce/`). The ui-kit, errors, the theme, icons and styles are not kinds.
- A tasks folder in the lib folder (`tasks/`, or the configured tasks folder name) is a violation: the pure zone has
  no business logic. Its code that knows nothing of the app is generic I/O or a pure function; code that knows the
  app is a task and goes to the app.
- Generic I/O does a request or a storage access with only what its caller passes in — no endpoint, key or data
  shape of the app. Only a task and other generic I/O call it, in the shared package too; a call from any other
  kind is a violation ([Imports](imports.md)).
- A pure-zone file that imports from the app is a violation: any path under the root level outside the pure zone,
  and the app's code outside the root level, such as the start file and the app's tasks folder and stores folder.
  Packages, other pure-zone files and files that are not app code (design assets such as an icon sprite) are
  allowed.
- A dependency by key counts as an import: a style, a text or a service that pure code looks up by name must be
  defined in the pure zone; one defined only outside it (a style in a theme under the root level, outside the lib
  folder) is a violation. The app may mount or extend what the pure zone defines (the root mounting the theme from
  `lib/`), and pure stateful logic may take a task as an argument and run it — from a handler it returns or once on
  start, never because a value changed ([Tasks](tasks.md)).
- A ui-kit component knows the app, and is a violation, when it has any of these signs, whatever its props:
  - it is named after or shaped by a domain entity — an order card, a user row — not a generic element; shaped
    means its props or layout follow one entity's fields, even under a generic name;
  - it holds the app's own text: a label, title or message that names the app's domain or screens ("My orders",
    "No orders yet"). Text its user passes in, and a generic default its user can replace ("Close" on a dialog's
    close button, an accessible label "Loading" on a spinner), are not the app's text;
  - it is a placeholder or a part of such a component — an order card's skeleton, an order row's actions; a generic
    placeholder, such as a skeleton block of a given size, is fine.

  Such a component is app code placed by [Placement by users](placement.md): with one user, as its child unit;
  with more, in the components folder of the lowest level that covers them. When the call is a judgement, say so.
- A pure zone below the root level (a module with its own lib folder) is a violation.
- Pure code two apps use may lie in the shared package ([Imports](imports.md)).
- The pure zone has no types file: a type a module exports — of its argument or its result, a ui-kit component's
  props type and the types that are part of it — is part of its API, and its users import it from that module.
- [View and Presenter](view-presenter.md) and
  [Stateful logic and plain functions](stateful-logic-and-functions.md) hold inside the pure zone too.

**Good.**

```
src/
  lib/
    ui-kit/
      Button/             its View passes on ButtonProps and ButtonVariant — no types file in lib/
      Card/               a generic card: title, image, children and onClick come from its user
      Skeleton/           a generic placeholder block of a given size
      Modal/              its close button's accessible label defaults to "Close", replaceable by its user
      SearchField/        looks up the style "searchField", registered in lib/theme/
    disclosure/
      disclosure          stateful logic: open / closed state
    dates/
      formatDate          a pure function; exports DateStyle, the type of its argument
    http/
      fetchJson           generic I/O: a request to the URL it is given; throws HttpError
    errors/
      HttpError
    theme/
      tokens
      searchField         the style of SearchField
  stores/
    userStore             app data, so outside lib/
  tasks/
    loadUser              calls lib/http/fetchJson with the app's /user URL — a task
  App                     mounts the theme from lib/theme/
  _components/
    OrderCard/            plain props, but a card of an order — app code, at the lowest level of its users
    OrderCardSkeleton/    the placeholder of OrderCard — app code with it
  CartPage/
    CheckoutButton/       holds the app's label "Go to checkout" — app code; one user, so its child
```

**Bad.**

```
src/
  lib/
    ui-kit/
      UserAvatar/         its presenter reads the current user from the store
      OrderCard/          plain props, no app imports — but a card of an order
      OrderCardSkeleton/  the placeholder of OrderCard
      CheckoutButton/     holds the app's label "Go to checkout"
      SearchField/        looks up the style "searchField", registered in theme/ — an app dependency by key
    dates/
      formatDate          imports the Order type from the app
    _tasks/
      fetchJson           a tasks folder in the pure zone — generic I/O goes to lib/http/
    hooks/                a folder named by the kind of code
      disclosure          belongs in lib/disclosure/
      pagination          belongs in lib/pagination/
  theme/
    searchField           the style of a ui-kit component outside the pure zone
  UserProfile/
    _logic/
      presenter           calls lib/http/fetchJson — generic I/O outside a task
  OrdersPage/
    lib/                  a pure zone below the root level
```

With `lib` set to `src/lib` and `root` to `src/App`:

```
src/
  lib/
    http/
      fetchJson           imports the base URL from src/main — app code outside the root level
  App/
    lib/                  a second pure zone at the root level
```

**Stack notes.** None.
