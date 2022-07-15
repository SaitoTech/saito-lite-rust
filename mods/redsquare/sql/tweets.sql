CREATE TABLE IF NOT EXISTS tweets9 (
  id INTEGER,
  tx TEXT,
  sig VARCHAR(99),
  parent_id VARCHAR(99), 
  thread_id VARCHAR(99), 
  publickey VARCHAR(99),
  flagged INT ,
  moderated INT,
  img TEXT,
  content TEXT,
  created_at TEXT,
  updated_at TEXT,
  UNIQUE (id),
  UNIQUE (sig),
  PRIMARY KEY (id ASC)
);

  
