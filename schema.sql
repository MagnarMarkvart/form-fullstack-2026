CREATE TABLE sectors (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  parentId TEXT
);

CREATE TABLE users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  agreeToTerms INTEGER NOT NULL CHECK (agreeToTerms IN (0, 1)),
  createdAt    TEXT NOT NULL
);

CREATE TABLE user_sectors (
  userId   TEXT NOT NULL,
  sectorId TEXT NOT NULL,
  PRIMARY KEY (userId, sectorId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sectorId) REFERENCES sectors(id)
);
