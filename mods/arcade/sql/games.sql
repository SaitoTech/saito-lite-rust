CREATE TABLE IF NOT EXISTS games (
  id INTEGER,
  game_id TEXT,
  players_needed INTEGER,
  players_array TEXT,
  module TEXT,
  status TEXT,
  options TEXT,
  tx TEXT,
  start_bid INTEGER,
  created_at INTEGER,
  step INTEGER DEFAULT 0,
  winner TEXT,
  method VARCHAR(100) DEFAULT "",
  UNIQUE (game_id),
  PRIMARY KEY (id ASC)
);
