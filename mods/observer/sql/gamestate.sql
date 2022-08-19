CREATE TABLE IF NOT EXISTS gamestate (
  step INTEGER,
  game_id TEXT,
  status TEXT,
  player TEXT,
  players_array TEXT,
  module TEXT,
  ts INTEGER,
  game_state TEXT,
  tx TEXT,
  UNIQUE (game_id, step)
);
