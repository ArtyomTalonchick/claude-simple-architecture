## Types and constants

**Rule.** Keep a type or a constant in the one file that uses it; put one that two or more files use in the types
file or the constants file of the lowest level that covers them, of the app's tasks folder, or of the innermost
entry folder that holds them all — never export it from one of its users. A type that is part of an API — a props
type, a pure-zone module's type, a store's data — stays with that API.

**Why.** A type exported from one of its users makes that user look like its owner, and a type in a shared file
with one user looks shared while it is not. A type that belongs to an API is found where the API is.

**How to check.**

- A file uses a type when it names it. A file that derives a type from another file's value or type — the type of
  a function, of its parameters or of its result — without naming the type it reaches does not use it and is not
  counted among its users.
- The users of a type or a constant are files. Used by two or more files — of the own unit, of its child units, or
  both — it lies in the types file or the constants file at the root of the lowest level that covers them; used by
  a file of the app's tasks folder, in that folder's types file or constants file
  ([The app's tasks and stores folders](app-folders.md)); used only inside one entry folder, in a types file or a
  constants file in it ([Entry folders](entry-folders.md)).
- A violation: a type or a constant in a types file or a constants file with only one user file (it belongs in that
  file); one exported from one of its users to the others (it belongs in the shared file).
- A props type and the types that are part of it stay with the View ([View and Presenter](view-presenter.md)),
  however many files use them: that is not a type exported from one of its users.
- The pure zone has no types file: a pure-zone module's type stays in the module ([Pure zone](pure-zone.md)). The
  type of a store's data is declared in the store file and imported from there.

**Good.**

```
OrdersPage/
  types                 OrderFilter — used by the presenter and by _logic/orderFilters
  _logic/
    presenter           derives the type of openOrder's parameters without naming it
    orderFilters
    openOrder           declares OpenOrderOptions — its one user, so the type stays here
  _stores/
    filtersStore        declares Filters, the type of its data; its users import it from here
```

**Bad.**

```
OrdersPage/
  types                 OpenOrderOptions — moved out of openOrder because the presenter derives the type of
                        openOrder's parameters; that is no use: it belongs in openOrder
                        SortKey — used only by orderFilters: it belongs in orderFilters
  _logic/
    orderFilters        exports OrderFilter, which the presenter imports — it belongs in OrdersPage/types
```

**Stack notes.** [react/types-and-constants.md](../stack/react/types-and-constants.md) — a derived type is not used
by the file that derives it.
