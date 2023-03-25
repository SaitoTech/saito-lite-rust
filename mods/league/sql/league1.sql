CREATE TABLE IF NOT EXISTS leagues (
  id TEXT PRIMARY KEY,
  game TEXT,
  name TEXT,
  admin TEXT DEFAULT "",
  contact TEXT DEFAULT "",
  status TEXT,
  description TEXT,
  ranking_algorithm TEXT,
  default_score INTEGER,
  UNIQUE (id)
);

