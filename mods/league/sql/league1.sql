CREATE TABLE IF NOT EXISTS leagues (
  id TEXT PRIMARY KEY,
  game TEXT,
  name TEXT,
  admin TEXT DEFAULT "",
  contact TEXT DEFAULT "",
  status TEXT,
  description TEXT,
  welcome TEXT DEFAULT "",
  ranking_algorithm TEXT,
  default_score INTEGER,
  deleted INTEGER DEFAULT 0,
  UNIQUE (id)
);

