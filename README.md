# Sector Registration

A small full-stack application for entering a name, selecting sectors from a
hierarchy, accepting the terms, and returning later to view or update the saved
data.

This solution addresses all four requirements from the technical task:
(1) replaces the static index.html with an Angular SPA,
(2) loads sectors from the database,
(3) validates and persists user data with full CRUD,
(4) supports session-based editing.

The repository contains:

- `angular-front` — Angular frontend
- `graphql-yoga-back` — GraphQL Yoga API with SQLite persistence
- `dump.sql` — a complete, restorable demo database at the repo root (also
  under `graphql-yoga-back/`); `schema.sql` is the schema-only companion

## Table of contents

- [Running the project](#running-the-project)
- [Technical decisions](#technical-decisions)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Sector tree](#sector-tree)
  - [Profile view](#profile-view)
  - [Data clearance](#data-clearance)
- [Tests](#tests)
- [Production considerations](#production-considerations)

## Running the project

### From the repo root (recommended)

Install dependencies for the root helper scripts, backend, and frontend:

```bash
npm run install:all
```

Copy the frontend env file once (if you have not already):

```bash
cp angular-front/.env.example angular-front/.env
```

Start backend and frontend together:

```bash
npm run dev
```

I added a minimal root `package.json` so the project can be started, tested,
and dumped from one place. This does create a small root `node_modules` folder,
but it is only for helper tooling (`concurrently`) and does not duplicate the
main Angular or backend dependencies. I felt this was worth it because it makes
the project easier to run and review.

The root commands are:

- `npm run install:all` — installs root, backend, and frontend dependencies
- `npm run dev` / `npm start` — starts backend and frontend together
- `npm run dev:back` — starts only the backend
- `npm run dev:front` — starts only the frontend
- `npm test` — runs Angular tests without the backend
- `npm run dump` — regenerates the schema and complete deterministic demo dump

Open `http://localhost:4200`. The GraphQL API URL comes from
`NG_APP_GRAPHQL_URL` in `angular-front/.env` (see `.env.example`).

### Packages individually

Backend:

```bash
cd graphql-yoga-back
npm install
npm run dev
```

Frontend:

```bash
cd angular-front
cp .env.example .env
npm install
npm start
```

The backend creates and seeds `app.db` when it starts. It preserves the supplied
sector IDs and stores selected sectors in the normalized `user_sectors` join
table. `dump.sql` contains the schema, all sector data, and two deterministic
demo registrations (one single-sector, one
multi-sector); restore it with `sqlite3 app.db < dump.sql`.

## Technical decisions

### Backend

The backend is intentionally small. This assignment focuses on a frontend
developer position, and I have previously demonstrated more layered backend
architecture and data management to Helmes. For this project, GraphQL Yoga
provides only the API needed by the UI, while SQLite provides straightforward
persistence and makes it easy to include the requested database dump.

GraphQL is not required for an application of this size; a small REST API would
also be a suitable, and possibly simpler, choice. I chose GraphQL because it is
used by the team and I wanted to demonstrate that I can learn and integrate a
less familiar API style without adding a large framework.

Input validation exists on both sides. The Angular form gives immediate UX
feedback (including rejecting whitespace-only names). The backend re-checks the
same domain rules before writing to the database: non-empty name after trim,
terms accepted, at least one sector, sectors must exist, and only leaf sectors
are allowed. Frontend validation alone is not enough — anyone can send a
request with Postman or a custom HTTP client and bypass the form. Invalid input
is rejected with a GraphQL error (`BAD_USER_INPUT`).

Authentication and authorization are outside the scope of this exercise. There
is no real login and the app does not use cookies or a server-managed session.
After a successful save, the frontend stores the generated user ID in
`localStorage` and uses it to reload that user's data from the API. That ID can
be copied or stolen from the browser, so anyone who knows it can load the same
record. This is only a lightweight persistence demo, not a secure identity
mechanism. The summary view can also permanently delete the registration via
`deleteUserData` (see [Data clearance](#data-clearance)).

### Frontend

Most of the UI already lived in signals: search, loading, selected-sector chips,
and validation messages all needed the in-progress form values. Angular's newer
signal forms API works directly with signals, so the form model stayed reactive
without wiring classic ReactiveForms `valueChanges` subscriptions. That matched
the signal-first style of the rest of the app.

Apollo would have been excessive here. The app has one GraphQL endpoint and only
a few fixed operations against a small schema. Apollo's value shows up with many
queries/mutations, caching, and more complex client policies. For this size,
Angular's `HttpClient` is enough to POST the queries and mutations directly, and
it keeps the dependency set smaller. The GraphQL endpoint URL is read from
`NG_APP_GRAPHQL_URL` in `.env` (via `@ngx-env/builder`) instead of being
hardcoded.

A shared layout provides navigation and a reactive welcome state. It is not
strictly necessary for a one-form application, but it demonstrates basic page
composition, routing, and shared reactive UI state.

Most styling is expressed with Tailwind utility classes. With no supplied design
system or complex reusable visual language, this keeps the styling close to the
markup and avoids unnecessary custom CSS.

### Sector tree

The API returns a flat, potentially unsorted list of sectors. The frontend turns
it into a tree, recursively sorts each level, and filters it while keeping the
ancestor path of every match visible. This work could be performed by the
backend, but keeping it in the frontend demonstrates handling and presenting
unstructured hierarchical input.

Branches are listed before leaves and each group is sorted alphabetically. Only
leaf sectors are selectable. Parent sectors describe broad groups that already
contain more specific choices; selecting both a parent and one of its children
would be ambiguous, particularly for groups containing an `Other` leaf.

Angular Material's tree component is used for rendering because it provides
established tree behavior such as nested nodes, expansion, and collapse. It also
demonstrates integrating an external component library instead of reimplementing
those interactions from scratch. The trade-off is coupling: a few styles in
`sector-tree.css` target Material/MDC implementation classes
(`.mat-nested-tree-node`, `.mat-mdc-checkbox`) via `::ng-deep`. That is not fully
plug-and-play — a library upgrade or a switch to another tree UI would likely
require rewriting those styles or the tree component. I accepted that because the
built-in tree behavior was worth the dependency for this project.

### Profile view

The profile view presents the saved values in a clearer read-only format. For
each selected sector, the frontend creates an ID lookup and follows `parentId`
references from the selected leaf to the root. The collected names are then
reversed into a complete root-to-leaf path.

### Data clearance

I added a clear-all action on the summary view as a small GDPR-minded
extension: users should have a clear, simple way to remove their personal data.
Saving an empty form was not an option — the form validators correctly require
a name, at least one sector, and accepted terms — so deletion is a dedicated
API path instead of a “blank save.”

Confirming clearance opens an Angular Material dialog (already used for the
sector tree), deletes the server record, clears the local session, and returns
the user to the form. The control and dialog follow the same accessibility
patterns as the rest of the UI (`aria-label`, `aria-describedby`,
`aria-haspopup`, and dialog labelling via Material’s config).

## Tests

From the repo root:

```bash
npm test
```

Or from the frontend package:

```bash
cd angular-front
npm test
```

I added unit tests for the vital business rules in the frontend. For this
project it was not necessary to test components themselves; the important logic
lives in pure methods that implement the business rules:

- `build-sector-tree.spec.ts` — flat sector list → tree, parent/leaf handling,
  sorting
- `filter-sector-tree.spec.ts` — search keeps ancestor paths and matching
  subtrees
- `get-sector-path.spec.ts` — selected leaf → root-to-leaf path for chips and
  profile view

I also added one integration-style happy-flow test in `session-flow.spec.ts`:
save user data → store the id in `localStorage` → reload session and get the
same user back. That covers the main persistence promise of the assignment.

HTTP is mocked with Angular's `HttpTestingController`, so tests do not require
the backend server to be running. The test intercepts the GraphQL requests and
returns controlled responses instead.

I did not add tests for backend validation (`validateSaveUserData`), since I am
applying for a frontend role and kept the test scope on the client side.

## Production considerations

If this prototype were developed further, the main next steps would be:

- implement real authentication and authorization (instead of a `localStorage`
  user ID);
- replace SQLite with a more production-oriented database where needed;
- add backend unit tests for `validateSaveUserData`;
- expand frontend coverage (for example form validation edge cases).
