## Pure zone

**Rule.** Keep code that knows nothing of the app in the pure zone at the root level: the lib folder (default
`lib/`) with its own components, stateful logic and helpers folders, and the ui-kit (default `lib/components/`).
Pure code imports nothing from the app — no domain types, store, data access or app components. Code that knows
the app goes to the shared folders of the root level.

**Why.** Pure code is the base the rest of the app stands on. As long as it knows nothing of the app, it changes
only for its own reasons, can be reused anywhere in the app, and can move to another project as it is. Once it
picks up one app dependency, a change in the app can break the base, and the base can no longer be moved.

**How to check.**

- Find the pure zone from the config: the lib folder and the ui-kit folder under the root level.
- A file in the pure zone that imports from the app — any path under the root level outside the pure zone — is a
  violation. Imports from outside the project (packages) and from elsewhere in the pure zone are allowed.
- A pure zone folder below the root level (a module with its own lib folder) is a violation: the pure zone exists
  only at the root.
- Within a level, the rules of [Levels and placement](levels.md) and
  [Stateful logic and helpers](stateful-logic-and-helpers.md) hold inside the pure zone too.

**Good.**

```
src/
  lib/
    components/
      Button/             no app imports
      Modal/              uses lib/hooks/disclosure
    hooks/
      debounce            no app imports
    helpers/
      formatDate          no app imports
  components/
    UserAvatar/           reads the current user from the store — app code, so outside lib/
  hooks/
    currentUser           reads the store
```

**Bad.**

```
src/
  lib/
    components/
      UserAvatar/         reads the current user from the store — app code inside the pure zone
    helpers/
      formatPrice         imports the Order type from the app
  OrdersPage/
    lib/                  a pure zone below the root level
```

**Stack notes.** None.
