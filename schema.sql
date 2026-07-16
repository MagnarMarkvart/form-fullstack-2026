CREATE TABLE sectors (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parentId TEXT
  );

CREATE TABLE users (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    selectedSectorIds TEXT NOT NULL,
    agreeToTerms     INTEGER NOT NULL,
    createdAt        TEXT NOT NULL
  );
