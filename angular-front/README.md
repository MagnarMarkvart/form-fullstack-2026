# Angular frontend — Sector Registration

Angular SPA for registering a name, selecting hierarchical sectors, accepting
terms, and returning later to view or edit the saved data.

The API lives in `../graphql-yoga-back`. Full-repo setup is documented in the
root `README.md`.

## Table of contents

- [Run](#run)
- [Folder structure](#folder-structure)
- [How the application works](#how-the-application-works)
- [Business logic — what and where](#business-logic--what-and-where)
- [Important steps end to end](#important-steps-end-to-end)
- [Styling](#styling)
- [Tests](#tests)

## Run

```bash
cp .env.example .env
npm install
npm start
```

App: `http://localhost:4200`  
GraphQL URL: `NG_APP_GRAPHQL_URL` in `.env` (default `http://localhost:3001/graphql`)

The backend must be running for load/save. Unit tests mock HTTP and do not need
it.

```bash
npm test
```

## Folder structure

```
src/app/
  app.ts / app.config.ts / app.routes.ts   # bootstrap, providers, routes
  layouts/main-layout/                     # shell: header, nav, session bootstrap
  components/
    form/                                  # registration page (smart)
    sector-tree/                           # Material tree UI (presentational)
    profile-view/                          # read-only summary
  services/
    graphql.service.ts                     # GraphQL over HttpClient
    session.service.ts                     # localStorage user id + in-memory user
  models/                                  # Sector, SectorNode, User
  utils/                                   # pure business logic (tree/path)
```

## How the application works

### Bootstrap and routing

1. `main.ts` boots the app with `appConfig`.
2. `app.config.ts` provides the router and `HttpClient`.
3. `app.routes.ts` nests two pages under `MainLayout`:
   - `/` → `FormComponent` (register / edit)
   - `/view` → `ProfileViewComponent` (summary)

`App` itself is only a `<router-outlet />`.

### Layout and session bootstrap

On every visit, `MainLayout.ngOnInit` calls `SessionService.loadFromStorage()`:

1. Read `userId` from `localStorage`.
2. If present, query GraphQL `sessionUser(id)`.
3. If found, store the user in a signal; if not, clear the stored id.

The header shows `userName` from that session signal and toggles navigation
between form and profile based on the current URL.

This is **not** authentication — only a client-side reminder of which saved
record to reload.

### Registration form

`FormComponent` is the main screen.

1. **Load sectors** — `GraphqlService.getSectors()` returns a flat list
   (`id`, `name`, `parentId`).
2. **Build tree** — `buildSectorTree()` turns that list into a nested forest.
3. **Search** — `sectorSearch` drives `filterSectorTree()` via a `computed`.
   While searching, the tree expands all visible nodes.
4. **Select** — only leaf checkboxes are shown as selectable in
   `SectorTreeComponent`. Toggles update `registrationModel.selectedSectorIds`.
5. **Validate** — Angular signal forms enforce name (including non-whitespace),
   at least one sector, and terms accepted.
6. **Save** — `saveUserData` mutation; on success `SessionService.setUser`
   writes the id to `localStorage` and updates the session signal.
7. **Prefill** — an `effect` watches `session.user()` and copies saved values
   into the form when a session user arrives (e.g. after reload).

Selected sectors are also shown as chips with a parent path label, using
`getSectorPath()`.

### Sector tree UI

`SectorTreeComponent` is presentational:

- inputs: `nodes`, `selectedIds`, `expandAll`
- output: `selectionChange` (sector id)

It uses Angular Material nested tree for expand/collapse. Parent nodes are
labels only; leaves are checkboxes. Selection state is owned by the form, not
the tree.

### Profile view

`ProfileViewComponent` reads `session.user` and loads sectors again so it can
resolve each selected id to a full root → leaf path via `getSectorPath()`, then
renders a readable summary.

## Business logic — what and where

| Rule / behavior | Where |
|-----------------|--------|
| Flat sectors → nested tree; parents are non-leaves; branches before leaves, A–Z per group | `utils/build-sector-tree.ts` |
| Search filter keeps ancestor path; matching parent keeps full subtree | `utils/filter-sector-tree.ts` |
| Selected leaf → root-to-leaf name path | `utils/get-sector-path.ts` |
| Only leaves are selectable in the UI | `components/sector-tree/` (parents have no checkbox) |
| Name required / no whitespace-only; ≥1 sector; terms required | `components/form/form.ts` (signal form validators) |
| Toggle / remove sector ids in the form model | `FormComponent.onSectorToggle` / `removeSelectedSector` |
| Persist user id after save; restore user on load | `services/session.service.ts` |
| GraphQL queries/mutations; surface GraphQL `errors` | `services/graphql.service.ts` |
| Prefill form from session user | `FormComponent` constructor `effect` |
| Path chips / profile path list presentation | `FormComponent.selectedSectors` / `ProfileViewComponent.selectedSectorPaths` |

Server-side validation of the same save rules lives in the backend
(`validate-save-user.ts`). The frontend still validates for UX; the API rejects
invalid or forged input (e.g. Postman, unknown/parent sector ids).

## Important steps end to end

### First visit (new user)

1. Layout loads → no `userId` in storage → no session.
2. Form loads sectors → builds tree.
3. User enters name, picks leaf sectors, accepts terms, submits.
4. Backend validates and inserts a user with a new UUID.
5. Frontend stores that id in `localStorage` and sets the session signal.
6. User can open `/view` or reload and still see/edit their data.

### Return visit (existing user)

1. Layout loads → finds `userId` → fetches `sessionUser`.
2. Form `effect` prefills name, sectors, and terms.
3. User edits and saves again with the existing id → backend updates that row.

### Search and select

1. Typing in search updates `sectorSearch`.
2. `filterSectorTree` recomputes the visible tree.
3. Matching leaves stay under their parents; expand-all helps while searching.
4. Checking a leaf updates `selectedSectorIds`; chips show path labels.

## Styling

- Layout and form: mostly **Tailwind** utility classes in templates.
- Tree: small **component CSS** for Material/MDC internals (indent, checkbox
  font size) via `::ng-deep` in `sector-tree.css`.

## Tests

Focused on business rules and one persistence flow (not “component should
create”):

| File | Covers |
|------|--------|
| `utils/build-sector-tree.spec.ts` | Tree build, leaf/parent, sorting |
| `utils/filter-sector-tree.spec.ts` | Search / ancestor path behavior |
| `utils/get-sector-path.spec.ts` | Pathfinding |
| `services/session-flow.spec.ts` | Save → `localStorage` → reload session |

HTTP is mocked with `HttpTestingController`.
