## Closed store access in Zustand

**Rule.** With `storeAccess` set to `"closed"`, the store object of a closed store is made with `createStore` of
`zustand/vanilla` and named without `use` (`ordersStore`); a read hook subscribes with `useStore(store, getter)`,
and a read function and a write use `getState()` and `setState()`. Outside the store folder, the store object's
`getState()`, `setState()`, `subscribe()` and a `useStore` on it are a violation.

**Why.** A store made with `createStore` is a plain object, not a hook, so nothing outside its folder can subscribe
to it by calling it, and its name carries no `use`. The read hook and the read function share one getter, so the
reading is written once.

**How to check.** Under `"direct"` nothing below is checked. Under `"closed"` it holds for the stores the core rule
covers and takes the place of [A Zustand store](stateful-logic-and-functions.md) for them; a store of the pure zone
and the others the core rule leaves out follow that rule in both modes.

- The store file holds `createStore<State>()(() => ({ … }))` with the state only. A store made with `create`, a
  `use…` name on it, or an action in its state is a violation.
- In `reads`, a getter is a constant that is not exported, `(state) => value`, or a function that returns one for a
  read with an argument. Its read function is `getter(store.getState())`; its read hook, named `use…`, is
  `useStore(store, getter)`. A read hook or a read function that writes the reading again inline, instead of the
  getter, is a violation.
- In `writes`, a write calls `store.setState(…)` and may read `store.getState()`.
- A read hook is called only from a Presenter or another hook; a read function and a write call no hook, so a task
  or a plain function calls them, and using them does not make a function a task.
- A value of a read hook watched by a `useEffect` that calls a task is a violation
  ([Tasks](../../core/tasks.md)).
- A task may write the status of its call through a write when units that did not call it show it. The store may
  keep the `AbortController` of the ongoing call next to that status: only tasks read it, through its read
  function, call `abort()` and write it, through a write. A Presenter, stateful logic or a View that calls its read
  hook or aborts it is a violation.

**Good.**

```ts
// stores/ordersStore/ordersStore.ts — the store object: data only; Order comes from the app's types folder
export type OrdersState = { orders: Order[] };
export const ordersStore = createStore<OrdersState>()(() => ({ orders: [] }));

// stores/ordersStore/reads.ts — one block per read: the getter, the read function, the read hook
const orders = (s: OrdersState) => s.orders;
export const getOrders = () => orders(ordersStore.getState());
export const useOrders = () => useStore(ordersStore, orders);

// one order, undefined when it is not loaded
const orderById = (id: string) => (s: OrdersState) => s.orders.find((o) => o.id === id);
export const getOrderById = (id: string) => orderById(id)(ordersStore.getState());
export const useOrderById = (id: string) => useStore(ordersStore, orderById(id));

// stores/ordersStore/writes.ts
export const setOrdersInStore = (orders: Order[]) => ordersStore.setState({ orders });
export const removeOrderInStore = (id: string) =>
  ordersStore.setState((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));

// stores/ordersStore/index.ts
export * from './reads';
export * from './writes';

// tasks/cancelOrder.ts — a task calls a read function and a write
export const cancelOrder = async (id: string) => {
  if (!getOrderById(id)) return;
  await api.cancelOrder(id);
  removeOrderInStore(id);
};

// OrderList/_logic/usePresenter.ts — the Presenter calls a read hook
export const usePresenter = () => ({ orders: useOrders(), onCancel: cancelOrder });
```

**Bad.**

```ts
// stores/useOrdersStore.ts — one file, made with create, named use…, with an action
export const useOrdersStore = create<OrdersState>()((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
}));

// stores/ordersStore/reads.ts — an exported getter, and a read hook that repeats the reading
export const orders = (s: OrdersState) => s.orders;
export const getOrders = () => orders(ordersStore.getState());
export const useOrders = () => useStore(ordersStore, (s) => s.orders);

// tasks/cancelOrder.ts — the store object's API outside its folder
export const cancelOrder = async (id: string) => {
  await api.cancelOrder(id);
  ordersStore.setState((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
};

// OrderList/_logic/usePresenter.ts — imports the store file and subscribes by itself
export const usePresenter = () => ({ orders: useStore(ordersStore, (s) => s.orders) });
```

**Stack notes.** Carries out the core rule [Closed store access](../../core/closed-store-access.md).
