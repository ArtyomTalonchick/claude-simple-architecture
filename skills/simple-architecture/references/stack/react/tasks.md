## Tasks in React

**Rule.** A task is a business action ([Tasks](../../core/tasks.md)) written as a function, usually `async`, whose
name is a verb without `use`; it imports nothing from React, React DOM or the router and calls no hook. The
Presenter (or a hook) calls it in an event handler, or in a `useEffect` only on mount, awaits it, keeps
`isLoading` and `error` in its own state unless the task writes them to a store, and the Presenter navigates after
it. A `useEffect` whose dependencies change and that calls a task is a violation.

**Why.** A task that calls no hook can run anywhere — in a handler, a test, another app — and the rules of hooks do
not apply to it. Keeping the state of the call in the Presenter leaves the task free of React and lets each unit
show the call its own way. A task called from the handler of the event that needs it keeps the cause and the
request in one place; an effect that fetches when its dependencies change hides that link and needs resets during
render to keep it right.

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
  catches it in `try` / `catch`. A task that rolls back its own change and writes the error to a store need not
  rethrow.
- A task called in `useEffect` is allowed only with an empty dependency list — on mount. A `useEffect` with
  dependencies that calls a task — `useEffect(() => { loadShows(genre) }, [genre])` — is a violation, whatever the
  dependencies are (state, props, a store value, params built with `useMemo`): the handler that changed them calls
  the task. So is a generic hook that fetches whenever its params change. Advice, not checked: a unit that loads by
  a prop that changes while it stays mounted can get `key` from its parent, so a new value is a new mount.
- A debounce before a task's call is a plain function around the call, made once —
  `const search = useMemo(() => debounce(searchShows, 300), [])` — and called from the handler. A
  `useDebouncedValue(text)` followed by an effect that calls the task is a violation.
- A condition on the app's data before a task's call — `if (page < pageCount) goToPage(page + 1)` in a Presenter —
  is a violation: the task (`nextPage`) reads the store and decides.

**Good.**

```ts
// tasks/logout.ts — in the app's tasks folder: LogoutButton and SessionExpired call it
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

An event calls the task; the task holds the conditions and writes the status where every unit reads it:

```ts
// tasks/shows/nextPage.ts — the condition on the app's data is the task's
export const nextPage = async () => {
  const { page, pageCount } = useShowsStore.getState();
  if (page >= pageCount) return;
  await goToPage(page + 1);
};

// tasks/shows/goToPage.ts — an optimistic update with its rollback; loadShows wrote the error to the store
export const goToPage = async (next: number) => {
  const prev = useShowsStore.getState().page;
  useShowsStore.setState({ page: next });
  try {
    await loadShows();
  } catch {
    useShowsStore.setState({ page: prev });
  }
};

// ShowsPage/_logic/usePresenter.ts
export const usePresenter = () => {
  useEffect(() => {
    loadShows();
  }, []); // on mount only
  const search = useMemo(() => debounce(searchShows, 300), []);
  const [query, setQuery] = useState('');
  const onQueryChange = (text: string) => {
    setQuery(text);
    search(text);
  };
  return { query, onQueryChange, onGenreClick: selectGenre, onNext: nextPage };
};
```

**Bad.**

```ts
// tasks/logout.ts — a hook, navigation and the error as a value
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

// ShowsPage/_logic/usePresenter.ts — a reactive chain and a condition on the app's data
export const usePresenter = () => {
  const [genre, setGenre] = useState<Genre | null>(null);
  const page = useShowsStore((s) => s.page);
  const pageCount = useShowsStore((s) => s.pageCount);
  const params = useMemo(() => ({ genre, page }), [genre, page]);
  useEffect(() => {
    loadShows(params); // follows its params: the click handler calls selectGenre itself
  }, [params]);
  const onNext = () => {
    if (page < pageCount) goToPage(page + 1); // belongs in the task nextPage
  };
  return { onGenreClick: setGenre, onNext };
};
```

**Stack notes.** Carries out the core rule [Tasks](../../core/tasks.md).
