## Placement by users

**Rule.** Put each child unit, store, type and constant at the lowest level that covers all its users, and move it
when its users change. A level shares only the units of its components folder, its stores, its types file and its
constants file — there is no shared logic at a level.

**Why.** Code that sits next to its only user can be changed without checking anyone else; code that sits higher
than needed looks shared, so every change to it needs a search for users that do not exist.

**How to check.**

- Users are counted by where they sit. The level's own unit — its entry and the files of its logic folder and
  stores folder — counts as one user; each child unit, with everything inside it, as one more. Code used by the own
  unit and one child unit has two users: it stays at the level, and the child imports it as code of a level above.
  A test is not a user: code used by one unit and its tests has one user.
- A level's stores folder holds the own unit's stores and the stores its units share — UI state, or data the tasks
  of two of its units reach, such as a server cache — when no task of the app's tasks folder reaches them
  ([The app's folders](app-folders.md)). Data two units need is a store, not shared stateful logic.
- A child unit or a file used by two or more siblings, or from outside its parent level, is a violation. It goes
  where its users are covered: a unit to the components folder of the lowest level that covers them, a store to its
  stores folder, a type or a constant to its types file or constants file; a task, a store a task of the app's tasks
  folder reaches, a plain function on the app's data, and a type that a file of the app's tasks folder or stores
  folder also uses, to the app's folders.
- One user below is a violation: a store in a level's stores folder whose only user is one child unit (it goes to
  that child's stores folder), a type or a constant in a level's types file or constants file whose only users sit
  in one child unit (it goes into that child), a unit in the components folder with only one user (it goes to that
  user's folder as its child unit).
- A file of a logic folder used from outside its unit ([Imports](imports.md)) goes where its kind says: a task or a
  plain function on the app's data used by two or more units — a middleware two route units share included — to
  the app's tasks folder; code that knows nothing of
  the app to the pure zone ([Pure zone](pure-zone.md)); a type or a constant to the types file or the constants file
  of the lowest level that covers its users; behaviour of the UI to a component; a file whose only user is one child
  unit to that child's logic folder.
- Behaviour of the UI that two units need — a plain function of the UI side included — is a component that holds it
  (a toggle with its own Presenter, a small component that formats what it shows), placed as any component.
- A plain function lies by its users. Inside a unit it lies in the tasks folder when only the unit's tasks use it,
  and in the logic folder outside the tasks folder when a Presenter, stateful logic or the entry of a unit with no UI
  uses it, with or without tasks — as a part of its one user when that user is an entry folder
  ([Entry folders](entry-folders.md)). One used only by tasks outside the tasks folder, or one used by a Presenter,
  stateful logic or such an entry inside the tasks folder, is a violation. One that works on the app's data and is
  used by tasks of the app's tasks folder or by two or more units lies in the app's tasks folder, and a Presenter
  may import it.
- The pure zone and the app's tasks folder, stores folder and types folder are not placed by this rule: their code
  stays there whatever the number of its users. Nor is what two apps use: [Imports](imports.md) says what the shared package
  holds.

**Good.**

```
OrdersPage/
  constants             PAGE_SIZE — used by the presenter and by OrderTable: two users
  _logic/
    presenter
    formatTotal         used only by the presenter
    _tasks/
      exportOrders
      toCsvRow          a plain function only exportOrders uses — in _tasks/
  _stores/
    filtersStore        UI state read by the presenter and by OrderFilters
  _components/
    StatusBadge/        used by OrderTable and OrderFilters
    StatusLabel/        a component that formats a status — the behaviour both units need
  OrderTable/
    _stores/
      selectionStore    used only inside OrderTable
  OrderFilters/
```

**Bad.**

```
OrdersPage/
  _logic/
    formatTotal         used only by OrderTable — it belongs in OrderTable/_logic/
    statusLabel         a plain function the presenter and OrderTable's presenter use — OrderTable imports from
                        its parent's logic folder: a StatusLabel component in _components/, or, if it only
                        converts the app's data, a plain function in the app's tasks folder
    toCsvRow            used only by tasks — it belongs in _tasks/
  _stores/
    selectionStore      used only by OrderTable — it belongs in OrderTable/_stores/
  _components/
    OrderSummary/       used only by OrderTable — it belongs in OrderTable/
  OrderTable/
    StatusBadge/        OrderFilters uses it too — it belongs in OrdersPage/_components/
  OrderFilters/
```

**Stack notes.** None.
