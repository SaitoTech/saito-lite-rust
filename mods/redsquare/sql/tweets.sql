CREATE TABLE IF NOT EXISTS tweets11 (
  id INTEGER,
  tx TEXT,
  sig VARCHAR(99),
  publickey VARCHAR(99),
  UNIQUE (id),
  UNIQUE (sig),
  PRIMARY KEY (id ASC)
);

  
