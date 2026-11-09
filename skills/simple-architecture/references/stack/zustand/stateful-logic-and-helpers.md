## A store is stateful logic

**Rule.** A Zustand store hook (`useOrdersStore`, made by `create`) is stateful logic: call it only from a
Presenter or other stateful logic — never from a View or a helper. Do not reach the store outside hooks through
`getState()` or `setState()` to get around this.

**Why.** A store is shared data with a life of its own. When every read goes through a Presenter or a hook, a
reader can see from the Presenter what data a unit depends on, and a View or a helper stays free of hidden
dependencies on app state.

**How to check.**

- A store hook called in a component file (a View) is a violation — also of
  [View and Presenter](../../core/view-presenter.md).
- A store hook, `getState()` or `setState()` used in a helper is a violation: the function is stateful logic and
  belongs with stateful logic.
- A store file — `create(...)` and its actions — is stateful logic and is placed by
  [Levels and placement](../../core/levels.md): next to its one user, or in the stateful logic folder of the
  lowest level that covers all its users. Its `use…` name is right even though its own code calls no hook.

**Good.**

```ts
// OrderList/OrderList.tsx — the View takes data from its Presenter
export const OrderList = (props: OrderListProps) => {
  const { orders } = usePresenter(props);
  return orders.map((o) => <OrderRow key={o.id} row={o} />);
};

// hooks/useOrderCount.ts — stateful logic reads the store
export const useOrderCount = () => useOrdersStore((s) => s.orders.length);
```

**Bad.**

```tsx
// OrderList/OrderList.tsx — a View reads the store
export const OrderList = () => {
  const orders = useOrdersStore((s) => s.orders);
  return orders.map((o) => <OrderRow key={o.id} row={o} />);
};

// helpers/orderCount.ts — a helper reads the store
export const orderCount = () => useOrdersStore.getState().orders.length;
```

**Stack notes.** Carries out the core rule [Stateful logic and helpers](../../core/stateful-logic-and-helpers.md).
