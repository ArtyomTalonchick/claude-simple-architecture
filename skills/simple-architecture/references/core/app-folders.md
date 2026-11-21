## The app's tasks and stores folders

**Rule.** Put the tasks that two or more units call, and the stores those tasks reach, in the app's tasks folder and
stores folder (default `tasks/` and `stores/`, next to the pure zone), outside every level. A task that one unit
calls stays in that unit's tasks folder, and a store that no task of the app's tasks folder reaches stays in a
level's stores folder.

**Why.** Business actions do not depend on the UI, so they do not belong in the UI tree: spread over its levels, a
task moves each time a new caller appears; in the app's own folders it stays put, and the data those actions share
stays with them.

**How to check.**

- Their places are set per app by the config keys `tasks` and `stores` (see `SKILL.md`). By default they are named
  `tasks/` and `stores/`, with no prefix, next to the folder the `lib` key names, or, without it, at the root level
  next to its shape. They are not levels, belong to no level and do not move with their users.
- The users of a task are the units that call it and the tasks of the app's tasks folder that call it. The tasks
  folder holds the tasks with users in two or more units — a task only its other tasks call stays there — and the
  plain functions that work on the app's data (convert it, validate it, build a request) used by its tasks or by two
  or more units.
- When a second unit calls a task of a unit's tasks folder, the task moves to the app's tasks folder in one step,
  with the plain functions only it uses, and any store it reaches moves to the app's stores folder. Until it moves,
  a task in a unit's tasks folder that another unit calls — a child unit, a sibling — is a violation.
- The stores folder holds the stores that a task of the app's tasks folder reads or changes.
- A violation: a task in the app's tasks folder whose only user is one unit (it belongs in that unit's
  `_logic/_tasks/`); a store in the app's stores folder that no task of the app's tasks folder reaches (it belongs in
  the stores folder of the lowest level that covers its users); a store in a level's stores folder that such a task
  reaches (it belongs in the app's stores folder).
- Folders inside either are optional, grouped by topic (`tasks/orders/`); a folder named by the kind of code
  (`helpers/`, `utils/`, `hooks/`, a nested `tasks/`) is a violation. Entry folders there follow
  [Entry folders](entry-folders.md).
- The app's tasks folder may hold a types file and a constants file, for the types and constants that two or more
  of its files use, or that its files and the units use.
- What their files may import is set by [Imports](imports.md).

**Good.**

`root` is `src/App`, `lib` is `src/lib`:

```
src/
  main                  starts the app: runs App
  lib/                  the pure zone
  stores/
    ordersStore         read and changed by tasks/orders/cancelOrder and tasks/orders/loadOrders
  tasks/
    orders/             a folder by topic — optional
      cancelOrder       called by OrderTable and by OrderDetails — two units
      loadOrders        called by OrdersPage and by Dashboard — two units
      refreshOrders     called only by loadOrders, a task of this folder — it stays here
      toOrderRequest    a plain function on the app's data: used by cancelOrder and by OrderForm's presenter
  App/
    App
    OrdersPage/
```

**Bad.**

```
src/
  stores/
    selectionStore      UI state no task of tasks/ reaches — it belongs in the stores folder of the lowest level
                        that covers its users
  tasks/
    exportOrders        called only by OrdersPage — it belongs in OrdersPage/_logic/_tasks/
    helpers/            a folder named by the kind of code
  App/
    OrdersPage/
      _logic/
        _tasks/
          placeOrder    called by OrdersPage and by QuickBuy — it belongs in tasks/
      _stores/
        ordersStore     read by tasks/orders/cancelOrder — it belongs in src/stores/
```

**Stack notes.** None.
