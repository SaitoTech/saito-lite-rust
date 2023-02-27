CREATE TABLE IF NOT EXISTS gamestate (
  step INTEGER,
  game_id TEXT,
  player TEXT,
  ts INTEGER,
  tx TEXT,
  UNIQUE (game_id, step)
);
