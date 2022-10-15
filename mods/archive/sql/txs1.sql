CREATE TABLE IF NOT EXISTS txs (
  id INTEGER,
  sig TEXT,
  publickey TEXT,
  tx TEXT,
  optional TEXT,
  ts INTEGER,
  type TEXT,
  UNIQUE (publickey, tx),
  PRIMARY KEY(id ASC)
);
