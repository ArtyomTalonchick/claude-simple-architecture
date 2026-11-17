## A Zustand store

**Rule.** A Zustand store (`useOrdersStore`, made by `create`) is a store: its file lives in the stores folder
(default `_stores/`) and holds `create(...)` with the state and its actions, nothing else. Call its hook only from a
Presenter or other stateful logic — never from a View, a task or a helper. A task reaches the store outside hooks
through `getState()` and `setState()`; a View and a helper never do.

**Why.** A store is shared data with a life of its own. When every subscription goes through a Presenter or a hook,
a reader can see from the Presenter what data a unit depends on, and a View or a helper stays free of hidden
dependencies on app state. A task carries out an action at one moment: it needs the current value and a way to
change it, not a subscription, and `getState()` / `setState()` give exactly that without React.

**How to check.**

- A store file — `create(...)` and its actions — goes to the stores folder of the lowest level that covers all
  its users ([Levels and placement](../../core/levels.md)). A store file in the logic folder or its tasks
  folder is a violation, even with one user. Its `use…` name is right even though its own code calls no hook.
- An action of the store that calls the server, calls a task, or does more than read and change the store's state is
  a violation: that part is a task ([Tasks](../../core/tasks.md)), and the action only sets the result.
- A store hook called in a component file (a View) is a violation — also of
  [View and Presenter](../../core/view-presenter.md).
- A store hook, `getState()` or `setState()` used in a helper is a violation: a function that reads or changes the
  store once is a task ([Tasks](../../core/tasks.md)), one that subscribes is stateful logic.
- `getState()` or `setState()` in a View is a violation; a store hook called as a hook in a task is a violation.
- In a task, `useOrdersStore.getState()` and `useOrdersStore.setState()`, or an action read through `getState()`,
  are allowed. No middleware such as thunks is needed for that.
- In a Presenter or other stateful logic, a store hook with a selector, and an action taken from it and called
  once in a handler, are allowed.

**Good.**

```ts
// _stores/useOrdersStore.ts — the store: its state and actions only
export const useOrdersStore = create<OrdersState>()((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
}));

// _logic/useOrderCount.ts — stateful logic subscribes to the store
export const useOrderCount = () => useOrdersStore((s) => s.orders.length);

// _logic/_tasks/cancelOrder.ts — a task changes the store once
export const cancelOrder = async (id: string) => {
  await api.cancelOrder(id);
  useOrdersStore.setState((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
};
```

**Bad.**

```tsx
// _logic/useOrdersStore.ts — a store in _logic/, and an action that calls the server
export const useOrdersStore = create<OrdersState>()((set) => ({
  orders: [],
  load: async () => set({ orders: await api.getOrders() }),
}));

// OrderList/OrderList.tsx — a View reads the store
export const OrderList = () => {
  const orders = useOrdersStore((s) => s.orders);
  return orders.map((o) => <OrderRow key={o.id} row={o} />);
};

// _logic/orderCount.ts — a helper reads the store
export const orderCount = () => useOrdersStore.getState().orders.length;
```

**Stack notes.** Carries out the core rules [Stateful logic and helpers](../../core/stateful-logic-and-helpers.md)
and [Tasks](../../core/tasks.md).
