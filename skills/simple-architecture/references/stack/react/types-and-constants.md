## A derived type in TypeScript

**Rule.** A file that derives a type with `typeof`, `Parameters<typeof fn>`, `ReturnType<typeof fn>` or an indexed
access on them, without importing the type it reaches by name, is not a user of that type: the type stays where it
is declared.

**Why.** The deriving file depends on the function, not on the type. Counting it as a user would move a type out of
the one file that names it into a types file, where it would look shared.

**How to check.**

- Count only the files that import the type by name or declare it. `typeof openOrder`,
  `Parameters<typeof openOrder>[1]` or `ReturnType<typeof useOrderFilters>` does not use the types they reach; a
  file that also imports the type by name is its user.
- A type moved to a types file only because another file derives it this way is a violation: it belongs in the
  file that declares it.

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
// types.ts at the level root — moved here because usePresenter derives it: still one user
export type OpenOrderOptions = { replace: boolean };

// _logic/openOrder.ts
import type { OpenOrderOptions } from '../types';
export const openOrder = (id: string, options: OpenOrderOptions) => { /* … */ };

// _logic/usePresenter.ts
type OpenOptions = Parameters<typeof openOrder>[1];
```

**Stack notes.** Carries out the core rule [Types and constants](../../core/types-and-constants.md).
