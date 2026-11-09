## Levels and placement

**Rule.** Every folder with code is a level — the app root, a module, a child of a module — and every level has
the same shape. Put code at the lowest level that covers all its users: next to its one user, or in a shared
folder of the level that holds all its users. When a user appears outside that level, move the code up to the
level that covers them all.

**Why.** Code that sits next to its only user can be changed without checking anyone else; code that sits higher
than needed looks shared, so every change to it needs a search for users that do not exist. One shape on every
level means one set of rules to know: a module reads the same way as the app, at any depth.

**How to check.**

- The shape of a level, every part optional:
  - its own unit — the View (named as the folder), the Presenter, and files only they use, such as stateful
    logic only the Presenter calls;
  - child folders — units used only by this level, with the same shape inside;
  - shared folders, for code used by two or more units of this level: the components folder (default
    `components/`), the stateful logic folder (default `hooks/`), the helpers folder (default `helpers/`);
  - a types file and a constants file (default `types` and `constants`) for types and constants shared by two or
    more units of this level.
- A file in a shared folder, a types file or a constants file of a level with only one user is a violation: it
  belongs next to that user.
- A child folder or a file used by two or more siblings, or from outside its parent level, is a violation: it
  belongs in a shared folder of the lowest level that covers all its users.
- A type or a constant used by one file lives in that file.
- An empty shared folder is a violation: a shared folder exists only when it has content.
- A child folder is named so its name is clear on its own; it does not need the parent's name as a prefix.

**Good.**

```
OrdersPage/
  OrdersPage            View
  presenter             Presenter
  orderFilters          used only by the presenter
  constants             PAGE_SIZE — used by the presenter and by OrderTable
  components/
    StatusBadge/        used by OrderTable and OrderFilters
  OrderTable/           used only by OrdersPage
    OrderTable
    presenter
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
```

**Stack notes.** [react.md](../stack/react.md) — the View and Presenter files of a level.
