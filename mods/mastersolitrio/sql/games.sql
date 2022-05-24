CREATE TABLE IF NOT EXISTS games (
  id INTEGER,
  game_id TEXT,
  player TEXT,
  tx TEXT,
  crypto TEXT,
  winning_game INTEGER,
  received_payment INTEGER,
  received_payment_reference TEXT,
  PRIMARY KEY (id ASC)
);
