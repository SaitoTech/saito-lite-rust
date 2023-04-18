CREATE TABLE IF NOT EXISTS gamestate (
  game_id TEXT,
  step INTEGER,
  ts INTEGER,
  game_state TEXT,
  UNIQUE (game_id, step)
);
