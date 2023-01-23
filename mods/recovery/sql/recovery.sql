CREATE TABLE IF NOT EXISTS recovery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publickey TEXT,
  hash TEXT,
  email TEXT,
  tx TEXT,
  UNIQUE(hash)
);
