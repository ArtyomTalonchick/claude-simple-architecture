## Tasks in React

**Rule.** A task is a business action ([Tasks](../../core/tasks.md)) written as a function, usually `async`, whose
name is a verb without `use`; it imports nothing from React, React DOM or the router and calls no hook. The
Presenter (or a hook) calls it in a handler, awaits it, keeps `isLoading` and `error` in its own state, and the
Presenter navigates after it.

**Why.** A task that calls no hook can run anywhere — in a handler, a test, another app — and the rules of hooks do
not apply to it. Keeping the state of the call in the Presenter leaves the task free of React and lets each unit
show the call its own way.

**How to check.**

- A task file that imports from `react`, `react-dom`, a router or a UI library, or calls a hook (`use…()`), is a
  violation.
- A task named `use…` is a violation: it is not a hook
  ([Stateful logic in React is a hook](stateful-logic-and-functions.md)).
- A task that uses the DOM — `document`, `focus()`, `setSelectionRange` — or calls a plain function that does, or
  that imports from `react-dom` (`flushSync`), directly or through other plain functions, is a violation: acting on
  the screen is the UI's part.
- `navigate`, `router.push` or a redirect in a task is a violation: the Presenter navigates.
- A Presenter or hook that writes the steps of a business action inline — server calls and store changes that
  together make the action, in a handler or an effect — is a violation: the steps go into a task. A change of UI
  state — which screen is shown — is not a business action: the Presenter may make it or call a plain function.
- A function is a task by meaning, not because it reaches a store: a function that only changes UI state in stores
  is a plain function ([Stateful logic in React is a hook](stateful-logic-and-functions.md)).
- A task that catches an error only to return it (`return { error }`) is a violation: it throws, and the Presenter
  catches it in `try` / `catch`.

**Good.**

```ts
// _logic/_tasks/logout.ts
export const logout = async () => {
  await unsubscribePush();
  await api.logout();
  useSessionStore.setState({ user: null });
};

// LogoutButton/_logic/usePresenter.ts
export const usePresenter = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const onClick = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate('/');
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };
  return { isLoading, hasError: error !== null, onClick };
};
```

**Bad.**

```ts
// _logic/_tasks/logout.ts — a hook, navigation and the error as a value
export const useLogout = () => {
  const navigate = useNavigate();
  return async () => {
    try {
      await api.logout();
      navigate('/');
    } catch (e) {
      return { error: e };
    }
  };
};
```

**Stack notes.** Carries out the core rule [Tasks](../../core/tasks.md).
