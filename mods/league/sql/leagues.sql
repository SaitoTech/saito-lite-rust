CREATE TABLE IF NOT EXISTS leagues (
  id TEXT,
  game TEXT,
  type TEXT,
  admin TEXT,
  league_name TEXT,
  description TEXT,
  ranking TEXT,
  max_players INTEGER,
  UNIQUE (id),
  PRIMARY KEY (id)
);
