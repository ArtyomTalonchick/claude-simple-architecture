## View and Presenter in React

**Rule.** A component is a View: `MyComponent/MyComponent.tsx`, named as its folder. Its Presenter is the hook
`usePresenter.ts` next to it, which also exports the props type. The only hook a View calls is its own
`usePresenter`.

**Why.** One file name per role makes the pair easy to find, and a single hook call is easy to check: any other
hook in a component means logic has leaked into the View.

**How to check.**

- In a component file (`.tsx` that returns JSX): any hook call other than `usePresenter(props)` — `useState`,
  `useEffect`, `useMemo`, `useCallback`, a store or a query hook, a custom hook — is a violation.
- Allowed in JSX: `{flag && <A />}` and `{flag ? <A /> : <B />}` on a value from the Presenter;
  `{items.map((item) => <Row key={item.id} … />)}` on a ready array; `onClick={onSave}`;
  `onClick={() => onSelect(item.id)}`; style props, `className`, `style`.
- A violation in JSX: `.filter`, `.sort`, `.reduce`, `.find` on data; formatting such as `.toFixed`,
  `toLocaleString` or a template string built from data; a comparison on raw data (`a > b`, `status === 'paid'`);
  an arrow with more than one call or with a condition.
- `usePresenter.ts` with no hook call and no computation — it only returns its props — is a violation.
- The props type is exported from `usePresenter.ts`; a component without a Presenter declares its props type in
  its own file.

**Good.**

```tsx
// OrderList/usePresenter.ts
export type OrderListProps = { status: OrderStatus };

export const usePresenter = ({ status }: OrderListProps) => {
  const { orders, isLoading } = useOrders();
  const navigate = useNavigate();
  const rows = useMemo(
    () => orders.filter((o) => o.status === status).map((o) => ({ ...o, total: formatPrice(o.sum) })),
    [orders, status],
  );
  const open = (id: string) => navigate(`/orders/${id}`);
  return { rows, isLoading, open };
};

// OrderList/OrderList.tsx
export const OrderList = (props: OrderListProps) => {
  const { rows, isLoading, open } = usePresenter(props);
  if (isLoading) return <Spinner />;
  return rows.map((row) => <OrderRow key={row.id} row={row} onOpen={() => open(row.id)} />);
};
```

**Bad.**

```tsx
// OrderList/OrderList.tsx
export const OrderList = ({ status }: { status: OrderStatus }) => {
  const { orders, isLoading } = useOrders();
  if (isLoading) return <Spinner />;
  return orders
    .filter((o) => o.status === status)
    .map((o) => <OrderRow key={o.id} row={{ ...o, total: o.sum.toFixed(2) }} />);
};
```

**Stack notes.** Carries out the core rule [View and Presenter](../../core/view-presenter.md).
