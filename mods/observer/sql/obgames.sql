CREATE TABLE IF NOT EXISTS obgames (
  game_id TEXT PRIMARY KEY,
  game_status TEXT,
  players_array TEXT,
  module TEXT,
  step INTEGER, 
  ts INTEGER,
  game_state TEXT
);
