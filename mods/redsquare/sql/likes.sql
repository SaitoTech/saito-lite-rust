CREATE TABLE IF NOT EXISTS likes (
  id INTEGER,
  tweet_id TEXT,
  publickey TEXT,
  UNIQUE (id),
  PRIMARY KEY (id ASC)
);
