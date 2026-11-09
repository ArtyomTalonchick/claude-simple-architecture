## Levels and placement

**Rule.** The app root and every unit folder are levels, and every level has the same shape. Put code at the
lowest level that covers all its users: next to its one user, or in a shared folder of the level that holds all
its users. When a user appears outside that level, move the code up to the level that covers them all.

**Why.** Code that sits next to its only user can be changed without checking anyone else; code that sits higher
than needed looks shared, so every change to it needs a search for users that do not exist. One shape on every
level means one set of rules to know: a module reads the same way as the app, at any depth.

**How to check.**

- What a level is:
  - the app root (`root` in the config), and every unit folder — a folder named as the View it holds;
  - a shared folder and the files in it belong to the level that holds the folder; a unit folder inside a shared
    folder (`components/StatusBadge/`) is a level of its own;
  - the parent of a level is the nearest level above it; levels with the same parent are siblings; one level's
    subtree is a branch.
- The shape of a level, every part optional:
  - its own unit — the View (named as the folder), the Presenter, and files only they use, such as stateful
    logic only the Presenter calls;
  - child units — unit folders used only by this level, with the same shape inside;
  - shared folders, for code used by two or more units of this level: the components folder (default
    `components/`), the stateful logic folder (default `hooks/`), the helpers folder (default `helpers/`);
  - a types file and a constants file (default `types` and `constants`) for types and constants shared by two or
    more units of this level.
- The level's own unit counts as one of its units, next to its child units. Code used by the own unit and by one
  child unit has two users: it goes to a shared folder, the types file or the constants file of the level, and the
  child imports it from there, as code of a level above. Inside the child it would be a violation: the own unit
  would import from inside a child.
- A file in a shared folder, a types file or a constants file of a level with only one user is a violation: it
  belongs next to that user.
- A child unit or a file used by two or more siblings, or from outside its parent level, is a violation: it
  belongs in a shared folder of the lowest level that covers all its users.
- A type or a constant used by one file lives in that file.
- An empty shared folder is a violation: a shared folder exists only when it has content.
- A child unit does not need the parent's name as a prefix.
- The exception is the pure zone ([Pure zone](pure-zone.md)): pure code stays there whatever the number of its
  users, and the lib folder may hold other folders of pure code, such as the theme.
- Tests are not part of the shape. A test lives next to the code it tests — a test file beside it, or a tests
  folder in the folder that holds it, by the project's convention — and is not a unit, a shared folder or a level.
  A test is not a user: it does not count when deciding where code goes, and a file used by one unit and by tests
  still has one user.

**Good.**

```
OrdersPage/
  OrdersPage            View
  presenter             Presenter
  orderFilters          used only by the presenter
  constants             PAGE_SIZE — used by the presenter and by OrderTable
  types                 StatusCount — used by orderFilters (the own unit) and by OrderFilters
  components/
    StatusBadge/        used by OrderTable and OrderFilters
  OrderTable/           used only by OrdersPage
    OrderTable
    presenter
    tests/              tests of OrderTable and its presenter — not a level
  OrderFilters/         used only by OrdersPage
    OrderFilters
```

**Bad.**

```
OrdersPage/
  OrdersPage
  presenter
  hooks/
    orderFilters        only the presenter uses it — it belongs next to the presenter
  components/           empty
  OrderTable/
    StatusBadge/        OrderFilters uses it too — it belongs in OrdersPage/components/
  OrderFilters/
    types               StatusCount — orderFilters of OrdersPage uses it too, so OrdersPage would import from
                        inside a child — it belongs in OrdersPage/types
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — the View and Presenter files of a
level.
