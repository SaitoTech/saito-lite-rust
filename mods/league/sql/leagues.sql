CREATE TABLE IF NOT EXISTS leagues (
  id TEXT PRIMARY KEY,
  game TEXT,
  type TEXT,
  admin TEXT,
  name TEXT,
  description TEXT,
  ranking TEXT,
  starting_score INTEGER,
  max_players INTEGER);
