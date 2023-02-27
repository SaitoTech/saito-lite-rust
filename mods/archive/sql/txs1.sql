CREATE TABLE IF NOT EXISTS txs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sig TEXT,
  publickey TEXT,
  tx TEXT,
  optional TEXT,
  ts INTEGER,
  preserve INTEGER ,
  type TEXT,
  UNIQUE (publickey, tx)
);
