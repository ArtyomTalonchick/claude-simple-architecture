## A derived type in TypeScript

**Rule.** A file that derives a type with `typeof`, `Parameters<typeof fn>`, `ReturnType<typeof fn>` or an indexed
access on them, without importing the type it reaches by name, is not a user of that type: the type stays where it
is declared.

**Why.** The deriving file depends on the function, not on the type: it imports the function and nothing else.
Counting it as a user would move a type out of the one file that names it into a types file, where it would look
shared while only one file writes it.

**How to check.**

- For "a type used by two or more files" ([Levels and placement](../../core/levels.md)), count only the files that
  import the type by name, or that declare it. A file that writes `typeof openOrder`,
  `Parameters<typeof openOrder>[1]` or `ReturnType<typeof useOrderFilters>` does not use the types they reach.
- A type moved to a types file only because another file derives it this way is a violation: it has one user and
  belongs in the file that declares it.
- A file that imports the type by name is its user, as before, even when it also derives it.

**Good.**

```ts
// _logic/openOrder.ts — declares its options type; the only file that names it
type OpenOrderOptions = { replace: boolean };
export const openOrder = (id: string, options: OpenOrderOptions) => { /* … */ };

// _logic/usePresenter.ts — derives the type from openOrder, does not use OpenOrderOptions
type OpenOptions = Parameters<typeof openOrder>[1];
```

**Bad.**

```ts
// _logic/types.ts — moved here because usePresenter derives it: still one user, it belongs in openOrder.ts
export type OpenOrderOptions = { replace: boolean };

// _logic/openOrder.ts
import type { OpenOrderOptions } from './types';
export const openOrder = (id: string, options: OpenOrderOptions) => { /* … */ };

// _logic/usePresenter.ts
type OpenOptions = Parameters<typeof openOrder>[1];
```

**Stack notes.** Carries out the core rule [Levels and placement](../../core/levels.md).
