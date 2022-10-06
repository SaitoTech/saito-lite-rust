CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id CHAR(128),
  game_id CHAR(128),
  module VARCHAR(50),
  winner TEXT,
  players_array TEXT,
  rank INTEGER DEFAULT 0,
  time_started INTEGER,
  time_finished INTEGER,
  method VARCHAR(100) DEFAULT "",
  UNIQUE (league_id, game_id)
);
