CREATE TABLE IF NOT EXISTS league (
  id TEXT PRIMARY KEY,
  game TEXT,
  name TEXT,
  admin TEXT,
  status TEXT,
  description TEXT,
  ranking_algorithm TEXT,
  default_score INTEGER,
);
