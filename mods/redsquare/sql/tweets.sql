CREATE TABLE IF NOT EXISTS tweets (
  id INTEGER,
  content TEXT,
  tweet_id TEXT,
  publickey TEXT,
  UNIQUE (tweet_id),
  PRIMARY KEY (id ASC)
);
