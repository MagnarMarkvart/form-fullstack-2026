# GraphQL backend — Sector Registration

Minimal GraphQL API that serves the sector hierarchy and persists user
registrations for the Angular frontend in `../angular-front`. Full-repo setup is
documented in the root `README.md`.

## Table of contents

- [Stack](#stack)
- [Run](#run)
- [Folder structure](#folder-structure)
- [Data model](#data-model)
- [GraphQL API](#graphql-api)
- [Request flow](#request-flow)
- [Business logic — what and where](#business-logic--what-and-where)
- [Design decisions](#design-decisions)
- [Database dump](#database-dump)

## Stack

- **Node.js** — runtime and process; hosts the HTTP server via the built-in
  `http` module.
- **GraphQL Yoga** — GraphQL server mounted on Node's HTTP server, exposing a
  single endpoint at `/graphql`.
- **graphql** — schema and type system (`createSchema`).
- **better-sqlite3** — synchronous SQLite driver for persistence (`app.db`).
- **uuid** — generates user IDs on first save.
- **tsx** / **TypeScript** — run and type-check the TypeScript source.

Node is the environment, Yoga is the framework on top of it, and SQLite is the
storage — there is no heavier framework like Nest or Express here on purpose.

## Run

```bash
npm install
npm run dev
```

Endpoint: `http://localhost:3001/graphql` (GraphiQL available in the browser).

Scripts:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with `tsx watch` (reloads on change) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run dump` | Write `schema.sql` and a complete, restorable demo `dump.sql` (backend dir + repo root) |

CORS is restricted to the frontend origin `http://localhost:4200`.

## Folder structure

```
src/
  index.ts              # create Yoga + HTTP server, listen on :3001
  schema.ts             # GraphQL type definitions (SDL)
  resolvers.ts          # query/mutation resolvers + row mapping
  validate-save-user.ts # server-side domain validation for saveUserData
  db.ts                 # SQLite connection, table creation, canonical seed
  data/sectors.ts       # seed sector hierarchy (flat id/name/parentId)
scripts/
  dump.ts               # export schema + data to .sql
```

## Data model

SQLite tables (created in `db.ts` if missing):

```
sectors( id TEXT PK, name TEXT, parentId TEXT NULL )
users( id TEXT PK, name TEXT, agreeToTerms INTEGER, createdAt TEXT )
user_sectors( userId TEXT FK, sectorId TEXT FK, PK(userId, sectorId) )
```

Notes:

- Sectors are stored **flat** (`parentId` references another sector). The tree
  shape is built on the frontend.
- `user_sectors` is a join table: it enforces one row per selected sector and
  avoids serializing relational data as JSON. `resolvers.ts` maps its rows back
  to the GraphQL `selectedSectorIds` array.
- The sector data keeps the original option values from the supplied select
  element.

## GraphQL API

Defined in `schema.ts`:

```graphql
type Sector   { id: ID!, name: String!, parentId: String }
type UserData { id: ID!, name: String!, selectedSectorIds: [String!]!, agreeToTerms: Boolean!, createdAt: String! }

type Query {
  sectors: [Sector!]!
  sessionUser(id: ID!): UserData
}

type Mutation {
  saveUserData(id: ID, name: String!, selectedSectorIds: [String!]!, agreeToTerms: Boolean!): UserData!
}
```

- `sectors` — full flat list for the tree.
- `sessionUser(id)` — a saved user by id, or `null` (used to restore a session).
- `saveUserData(...)` — upsert: updates when a known `id` is passed, otherwise
  inserts a new user with a generated UUID.

## Request flow

### Startup

1. `db.ts` opens `app.db`, creates `sectors`, `users`, and `user_sectors` if
   they do not exist.
2. If `sectors` is empty, it seeds the canonical hierarchy from
   `data/sectors.ts` inside a transaction.
3. `index.ts` builds the Yoga schema and starts the HTTP server on `:3001`.

### Load sectors

`Query.sectors` → `SELECT id, name, parentId FROM sectors` → flat list to the
client.

### Restore session

Frontend sends the stored id → `Query.sessionUser(id)` → row looked up and
mapped to `UserData`, or `null` if not found.

### Save / update

1. `Mutation.saveUserData` runs `validateSaveUserData(...)` first.
2. If validation passes and a matching `id` exists → **UPDATE** that row.
3. Otherwise → **INSERT** a new row with a fresh UUID and `createdAt`.
4. The saved `UserData` is returned to the client.

Invalid input never reaches the database — it is rejected with a GraphQL error
(`extensions.code = BAD_USER_INPUT`).

## Business logic — what and where

| Rule / behavior | Where |
|-----------------|--------|
| Create/seed tables on startup | `db.ts` |
| Read sectors / read session user | `resolvers.ts` (`Query`) |
| Upsert user (update by id or insert new UUID) | `resolvers.ts` (`Mutation.saveUserData`) |
| Join rows ↔ GraphQL sector IDs and boolean mapping | `resolvers.ts` (`toUserRecord`) |
| Trimmed non-empty name | `validate-save-user.ts` |
| Terms must be accepted | `validate-save-user.ts` |
| At least one sector; de-duplicated | `validate-save-user.ts` |
| Selected sector ids must exist | `validate-save-user.ts` |
| Only leaf sectors allowed (reject parents) | `validate-save-user.ts` |

The validation intentionally mirrors the frontend form rules, plus checks a
client cannot enforce (existing ids, leaf-only) because requests can bypass the
UI entirely.

## Design decisions

- **Kept intentionally small.** This is a frontend-focused assignment, so the
  backend does only what the UI needs: serve sectors and persist a
  registration.
- **GraphQL Yoga over Node HTTP, no Express/Nest.** One endpoint and a handful
  of operations do not justify a larger framework; Yoga on the native HTTP
  server is enough and shows working with GraphQL.
- **SQLite via better-sqlite3.** Simple, file-based, zero external service, and
  it makes providing the requested DB dump trivial. `better-sqlite3` is
  synchronous, which keeps the resolvers straightforward for this scale.
- **Flat sectors, tree on the client.** The API returns raw hierarchy data; the
  frontend demonstrates building and filtering the tree from an unsorted list.
- **Server-side validation added deliberately.** Frontend validation is for UX;
  the server re-checks the same rules so forged/Postman requests cannot store
  invalid data.
- **Upsert with generated UUID.** The client stores that id (in `localStorage`)
  to reload and edit later.
- **No auth.** There is no login, cookie, or server session. The id is a
  lightweight "remember me", not a security mechanism — noted as a production
  gap.

## Database dump

`npm run dump` writes `schema.sql` and a deterministic, single-file
`dump.sql` into both this package and the repo root. `dump.sql` contains drop
statements, schema, all canonical sectors, and two demo users; restore it with
`sqlite3 app.db < dump.sql`.
