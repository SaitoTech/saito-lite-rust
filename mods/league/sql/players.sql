CREATE TABLE IF NOT EXISTS players (
  id INTEGER,
  league_id INTEGER,
  publickey TEXT,
  UNIQUE (id),
  PRIMARY KEY (id ASC)
);
