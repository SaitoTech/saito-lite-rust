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
  time_finished INTEGER DEFAULT 0,
  step INTEGER DEFAULT 0,
  winner TEXT DEFAULT NULL,
  method VARCHAR(100) DEFAULT "",
  UNIQUE (game_id),
  PRIMARY KEY (id ASC)
);
