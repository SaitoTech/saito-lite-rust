CREATE TABLE IF NOT EXISTS staff (
  id INTEGER,
  publickey TEXT,
  UNIQUE (publickey),
  PRIMARY KEY(id ASC)
);