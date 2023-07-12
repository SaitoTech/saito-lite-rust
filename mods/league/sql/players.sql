CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id TEXT,
  publickey TEXT,
  email TEXT DEFAULT NULL,
  score INTEGER,
  games_started INTEGER DEFAULT 0,
  games_finished INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_tied INTEGER DEFAULT 0,
  ts INTEGER,
  deleted INTEGER DEFAULT 0,
  UNIQUE (league_id, publickey)
);
