## Tasks in React

**Rule.** A task ([Tasks](../../core/tasks.md)) is a function, usually `async`, named with a verb without `use`,
that imports nothing from React, React DOM or the router and calls no hook. The Presenter or a hook calls it,
directly or through a plain function of the UI side, in an event handler or in a `useEffect` with an empty dependency
list, awaits it, keeps `isLoading` and `error` in its own state unless the task writes them to a store, and the
Presenter navigates after it.

**Why.** A task that calls no hook can run anywhere — in a handler, a test, another app — and the rules of hooks do
not apply to it. A task called from the handler of the event that needs it keeps the cause and the request in one
place; an effect that fetches when its dependencies change hides that link and needs resets during render.

**How to check.**

- A task file that imports from `react`, `react-dom`, a router or a UI library, or calls a hook (`use…()`), is a
  violation; so is a task named `use…`.
- A task that uses the DOM — `document`, `focus()`, `setSelectionRange` — or calls a plain function that does, or
  that imports from `react-dom` (`flushSync`), directly or through other plain functions, is a violation.
- `navigate`, `router.push` or a redirect in a task is a violation.
- A `useEffect` with dependencies that calls a task — `useEffect(() => { loadShows(genre) }, [genre])` — is a
  violation, in a Presenter or any hook, whatever the dependencies are (state, props, a store value, params built
  with `useMemo`); so is a generic hook that fetches whenever its params change — `useRequest(fn, params)`,
  `useShows(genre)`. Advice, not checked: a unit that loads by a prop that changes while it stays mounted can get
  `key` from its parent, so a new value is a new mount.
- A debounce before a task's call is made once — `const search = useMemo(() => debounce(searchShows, 300), [])`, or
  a ref — and called from the handler; `useDebouncedValue(text)` followed by an effect that calls the task is a
  violation.
- A condition on the app's data before a task's call — `if (page < pageCount) goToPage(page + 1)` in a Presenter —
  is a violation; `onFavoriteClick(show.id)` for the clicked item of a list read with a store hook is not.

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

// tasks/shows/nextPage.ts — the condition on the app's data is the task's
export const nextPage = async () => {
  const { page, pageCount } = useShowsStore.getState();
  if (page >= pageCount) return;
  await goToPage(page + 1);
};

// ShowsPage/_logic/usePresenter.ts
export const usePresenter = () => {
  useEffect(() => {
    loadShows();
  }, []); // on mount only
  const search = useMemo(() => debounce(searchShows, 300), []);
  const [query, setQuery] = useState('');
  const shows = useShowsStore((s) => s.shows);
  const onQueryChange = (text: string) => {
    setQuery(text);
    search(text);
  };
  // the View calls onFavoriteClick(show.id) for the clicked item: what the event was about
  return { query, shows, onQueryChange, onGenreClick: selectGenre, onNext: nextPage, onFavoriteClick: toggleFavorite };
};
```

**Bad.**

```ts
// tasks/logout.ts — a hook and navigation
export const useLogout = () => {
  const navigate = useNavigate();
  return async () => {
    await api.logout();
    navigate('/');
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
