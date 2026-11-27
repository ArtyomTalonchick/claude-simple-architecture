## Types and constants

**Rule.** Keep a type or a constant in the one file that uses it; put one that two or more files use in the types
file or the constants file of the lowest level that covers them or of the innermost entry folder that holds them
all, in the app's types folder, or in the constants file of the app's tasks folder — never export it from one of
its users. A type or a constant that is part of an API — a props type, the type of a function's parameters or
result, a pure-zone module's type, a store's data, the type inferred from a schema, a constant a schema or a
function is built on and its callers need — stays with that API.

**Why.** A type exported from one of its users makes that user look like its owner, and a type in a shared file
with one user looks shared while it is not. What belongs to an API is found where the API is.

**How to check.**

- A file uses a type when it names it. A file that derives a type from another file's value or type — the type of
  a function, of its parameters or of its result — without naming the type it reaches does not use it and is not
  counted among its users.
- The users of a type in a types file are the files outside it. A type another type of the same types file is
  built from stays there with it, whatever the number of its other users. The app's types folder counts here as
  one types file.
- The users are files — of the own unit, of its child units, or both — and a level's types file and constants file
  lie at its root. Which types and constants the app's folders and an entry folder keep:
  [The app's folders](app-folders.md), [Entry folders](entry-folders.md).
- A violation: a type or a constant in a types file or a constants file with only one user file (it belongs in that
  file); one exported from one of its users to the others (it belongs in the shared file).
- A props type, the types that are part of it and the type of a key the Presenter returns are placed by
  [View and Presenter](view-presenter.md), however many files use them; one that several logic files need lies in
  the types file. None of these is a violation here.
- A pure-zone module's type stays in the module ([Pure zone](pure-zone.md)); the type of a store's data is declared
  in the store file and imported from there — for a closed store, where
  [Closed store access](closed-store-access.md) says; the type inferred from a schema is declared in the schema's
  file and imported from there, however many files use it.
- A runtime schema — a value that describes a data shape and checks data against it — is a data shape written as a
  value, not a constant: it lies where a type with the same users goes, and whatever may import that type may
  import it. Its one difference: a schema takes a file of its own ([One thing per file](one-thing-per-file.md)),
  which lies:
  - with one user, beside that user;
  - with two or more users within a level, at the level's root, beside its types file;
  - with two or more users, one of them in the app's tasks folder or stores folder, in the app's types folder
    ([The app's folders](app-folders.md));
  - with users in two apps, in the shared package, by its subject; in the pure zone, in its module.

  A schema in a constants file is a violation.
- The type of a function's parameters or of its result — the type written for its options or its return value
  (`OpenOrderOptions`, `OrderFiltersResult`) — is declared in the function's file; a file that may import the
  function imports it from there by name, however many files do, and that is no violation. A type the function only
  uses, which other files use without it — a domain type such as `OrderFilter` — goes to the types file.
- A constant a schema or a function is built on — one it uses in its own code — and that its callers need (a
  length limit a form names in its hint) is part of its API: declared in its file, and a file that may
  import the schema or function imports it from there by name, however many files do — no violation. A constant
  the schema or function does not use itself is not part of its API: it goes to the constants file by its users.

**Good.**

```
OrdersPage/
  types                 OrderFilter — used by the presenter and by _logic/orderFilters
                        FilterGroup — built into OrderFilter; one user outside the file, still it stays
  filtersSchema         a schema; declares FiltersInput, inferred from it — the presenter and orderFilters import
                        both from here: two users
                        declares MAX_FILTERS, the limit it checks by — the presenter imports it for a hint
  _logic/
    presenter           derives the type of openOrder's parameters without naming it
    orderFilters        declares OrderFiltersResult, the type of its result; the presenter and orderSummary
                        import it from here
    orderSummary
    sortOrders          declares OrderSort, the type of a prop; the presenter imports it for the props type
    openOrder           declares OpenOrderOptions, the type of its parameters
  _stores/
    filtersStore        declares Filters, the type of its data; its users import it from here
```

**Bad.**

```
OrdersPage/
  constants             orderSchema — a schema is not a constant: it takes a file of its own
  types                 OpenOrderOptions — the presenter only derives it from openOrder's parameters, which is no
                        use: it belongs in openOrder
                        SortKey — used only by orderFilters: it belongs in orderFilters
                        OrderFiltersResult — the type of orderFilters' result: it belongs in orderFilters
  _logic/
    orderFilters        exports OrderFilter, which the presenter imports — it belongs in OrdersPage/types
                        exports PAGE_SIZE, which it does not use itself — it belongs in OrdersPage/constants
    pageSchema          a schema the presenter and orderFilters use — it belongs at OrdersPage's root
```

**Stack notes.** [react/types-and-constants.md](../stack/react/types-and-constants.md) — a derived type is not used
by the file that derives it.
