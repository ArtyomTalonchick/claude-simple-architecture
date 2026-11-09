## Pure zone

**Rule.** Keep code that knows nothing of the app in the pure zone at the root level: the lib folder (default
`lib/`) with its own stateful logic and helpers folders, and the ui-kit (default `lib/components/`) as its
components folder. The design-system theme — tokens and the styles of ui-kit components — is pure too and lives
in the lib folder. Pure code depends on nothing from the app — no domain types, store, data access, app
components or app styles, by import or by key. Code that knows the app goes to the shared folders of the root
level. Pure code stays in the pure zone whatever the number of its users.

**Why.** Pure code is the base the rest of the app stands on. As long as it knows nothing of the app, it changes
only for its own reasons, can be reused anywhere in the app, and can move to another project as it is. Once it
picks up one app dependency, a change in the app can break the base, and the base can no longer be moved. It is
a base, not shared code, so it does not move down to its one user the way shared code does.

**How to check.**

- Find the pure zone from the config: the lib folder and the ui-kit folder under the root level. The ui-kit is
  the pure zone's components folder: when it is set outside the lib folder, the lib folder has no components
  folder of its own.
- The lib folder may hold other folders of pure code besides the stateful logic, helpers and components folders,
  named by the project — the theme (e.g. `lib/theme/`), icons, styles. They follow this rule like the rest.
- A file in the pure zone that imports from the app — any path under the root level outside the pure zone — is a
  violation. Imports from outside the project (packages), from elsewhere in the pure zone, and of files outside
  the root level that are not app code (design assets such as an icon sprite) are allowed.
- A dependency by key counts as an import: a style, a text or a service that pure code looks up by name must be
  defined in the pure zone. Pure code that looks up a key defined only outside the pure zone — a style in a theme
  under the root level, outside the lib folder — is a violation. The app mounting or extending what the pure zone
  defines (the root mounting the theme from `lib/`) is allowed: the app may depend on the pure zone.
- A pure zone folder below the root level (a module with its own lib folder) is a violation: the pure zone exists
  only at the root.
- A pure zone file with one user is not a violation of [Levels and placement](levels.md).
- [View and Presenter](view-presenter.md) and [Stateful logic and helpers](stateful-logic-and-helpers.md) hold
  inside the pure zone too.

**Good.**

```
src/
  lib/
    components/
      Button/             no app imports
      Modal/              uses lib/hooks/disclosure
      SearchField/        looks up the style "searchField", registered in lib/theme/
    hooks/
      disclosure          open / closed state, no app imports
    helpers/
      formatDate          no app imports
    theme/
      tokens              colors, spacing
      searchField         the style of SearchField
  App                     mounts the theme from lib/theme/
  components/
    UserAvatar/           its presenter reads the current user from the store — app code, so outside lib/
  hooks/
    currentUser           reads the store
```

**Bad.**

```
src/
  lib/
    components/
      Button/             no app imports
      UserAvatar/         its presenter reads the current user from the store — app code inside the pure zone
      SearchField/        looks up the style "searchField", registered in theme/ — an app dependency by key
    helpers/
      formatDate          imports the Order type from the app
  theme/
    searchField           the style of a ui-kit component outside the pure zone — it belongs in lib/theme/
  OrdersPage/
    lib/                  a pure zone below the root level
```

**Stack notes.** None.
