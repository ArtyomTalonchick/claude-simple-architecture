## Closed store access

**Rule.** With `storeAccess` set to `"closed"` in the config, make every store of a stores folder a folder of plain
data behind named reads and writes, and reach it from outside that folder only through them. With `"direct"`, the
default, this rule does not apply.

**Why.** The rest of the app then depends on a small set of named functions and not on the store's shape: the
shape, or the way the data is kept, changes inside one folder. A name says what is read or changed, and a search
for a write finds every place that changes the data. It costs a folder of four files per store, so a project
chooses it.

**How to check.** Under `"direct"` nothing below is checked and nothing of it is reported. Under `"closed"`, for
the stores it covers, it takes the place of what the other rules say of a store's own API, of a store file and of
where the type of a store's data is declared; the rest of those rules holds — who may reach a store, where it
lives, what it may import.

- Covered: every store of a level's stores folder and of the app's stores folder. Not covered, the same in both
  modes: a store of the pure zone ([Pure zone](pure-zone.md)), a server store whose API reads and writes its own
  database, and a store with several implementations in a store entry folder ([Entry folders](entry-folders.md)).
- Shape. A store is a folder in a stores folder, named as its store (`ordersStore/`), with four files:
  - the store file, named as the folder — the store object. Data only: an action or a method in it is a violation;
  - `reads` — everything that reads the store. One read is a getter `(state) => value`, pure and private to the
    file; a read function (`getOrderById(id)`) that applies it to the current state; and, in an app with a UI, a
    read subscription that subscribes with it, for a Presenter or stateful logic. Both are always written and both
    use the same getter: one that repeats the reading is a violation;
  - `writes` — everything that changes the store: plain functions (`addOrderInStore(order)`,
    `resetOrdersInStore()`);
  - `index` — re-exports everything from `reads` and from `writes`, and nothing else.
- Inside the folder:
  - imports go one way, for code and for types alike: `index` → `reads`, `writes` → the store file. `reads` and
    `writes` importing each other, or the store file importing either, is a violation;
  - `reads` and `writes` export only read functions, read subscriptions and writes: an exported getter, type or
    store object in them is a violation;
  - no type leaves the folder. The types of the data the store keeps are declared in the types file of the level
    for a store of a level, in the app's types folder for a store of the app's stores folder, and the store imports
    them from there, a schema and its inferred type the same way ([Types and constants](types-and-constants.md));
    one declared in the store folder and used outside it is a violation. How the folder's own types — the shape of
    its state — are declared and shared between its files is not judged;
  - the names `reads`, `writes` and `index` are a default: not judged, only that every store of the project uses
    the same ones;
  - a `reads` or `writes` file over `maxFileLines` is split into several files of the same kind, and `index`
    re-exports all of them;
  - advice, not checked: the parts of one read — the getter, the read function, the read subscription, in this
    order — stand as one block with no empty line inside and one between blocks, under a comment that says what
    the data is where the name does not.
- Access:
  - code outside the folder imports only from `index`: an import of the store file, of `reads` or of `writes` from
    outside is a violation. A test may import the store file to set up and reset state ([Imports](imports.md));
  - outside the folder, the store object's own API — reading its state, setting it, subscribing to it — is a
    violation;
  - a Presenter or other stateful logic calls read subscriptions and writes; a task or a plain function calls read
    functions and writes. A read subscription called from a task or a plain function, or any of them from a View,
    is a violation.
- A write:
  - changes the data of its own store and nothing else: I/O, another store or a task in it is a violation. It is a
    plain function, never a task; what makes a business action a task does not change ([Tasks](tasks.md));
  - may compute over the store's data — keep a list ordered, replace or remove an item by id. That logic lives in
    the write, not in the store object;
  - ends with `InStore`, so a task and the write it calls share a verb: `addOrder` calls `addOrderInStore`.
- A read:
  - returns data of its own store, whole or picked by an argument. One that computes for one user is a violation:
    it is that unit's own logic, built from the store's reads;
  - a read function reads once, at the moment of the call; only a read subscription subscribes.
- Exceptions to other rules, inside a store folder only: `reads` and `writes` each hold several functions, and a
  read is a getter with its function and its subscription ([One thing per file](one-thing-per-file.md)); the folder
  has many entries, all through `index`, and its store file is not its entry ([Entry folders](entry-folders.md)).

**Good.**

```
src/
  types/
    order               Order — the data stores/ordersStore keeps, named by tasks and units too
  stores/
    ordersStore/
      ordersStore       the store object: the orders, an empty list at first — data only; imports types/order
      reads             imports ordersStore
                        // the orders, in the order they are shown
                        orders: the getter, private
                        getOrders(): applies orders to the current state
                        the read subscription: subscribes with orders

                        orderById(id): the getter, private
                        getOrderById(id), and its read subscription
      writes            imports ordersStore
                        addOrderInStore(order): puts the order in, keeping the list ordered
                        removeOrderInStore(id), resetOrdersInStore()
      index             re-exports reads and writes
  tasks/
    addOrder            server call, then addOrderInStore(order) — imports stores/ordersStore/index
    orderTotal          a plain function: getOrderById(id), then the sum
  App/
    OrdersPage/
      _logic/
        presenter       the read subscription of orders; its handler calls the task addOrder
```

**Bad.**

```
src/
  stores/
    ordersStore         a store as one file — under "closed" it is a folder of four files
    cartStore/
      cartStore         the cart and addItem, an action — data only: it is a write, addItemInStore
                        declares CartItem, which tasks name — it belongs in src/types/
      reads             imports writes — reads and writes do not import each other
                        exports the getter items — only read functions and read subscriptions leave it
                        getItems() repeats the reading instead of applying items
                        getCartTitle(): "Cart (3)" for one page — that page's own logic
      writes            addItem — its name does not end with InStore
                        clearCartInStore also resets ordersStore — another store
                        saveCartInStore calls the server — a task
      index             also re-exports cartStore — only reads and writes
  tasks/
    checkout            calls the read subscription of items — a task calls read functions
  App/
    CartPage/
      _logic/
        presenter       imports stores/cartStore/reads — from outside, only index
                        sets the state of the store object — the store's own API outside its folder
```

**Stack notes.**

- [zustand/closed-store-access.md](../stack/zustand/closed-store-access.md) — the store object, a read hook, a
  read function and a write in Zustand.
- [react/stateful-logic-and-functions.md](../stack/react/stateful-logic-and-functions.md) — a read subscription in
  React is a hook.
