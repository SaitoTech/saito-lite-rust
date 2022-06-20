CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER,
  game TEXT,
  type TEXT,
  UNIQUE (id),
  PRIMARY KEY (id ASC)
);
