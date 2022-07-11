CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id TEXT,
  pkey TEXT,
  score INTEGER,
  ts INTEGER,
  UNIQUE (league_id, pkey)
);
