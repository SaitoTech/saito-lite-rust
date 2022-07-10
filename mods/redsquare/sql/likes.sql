CREATE TABLE IF NOT EXISTS likes (
  id INTEGER,
  tweet_id TEXT,
  publickey TEXT,
  created_at TEXT,
  updated_at TEXT,
  UNIQUE (id),
  PRIMARY KEY (id ASC)
);
