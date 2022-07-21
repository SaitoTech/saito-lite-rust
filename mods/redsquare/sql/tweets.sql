CREATE TABLE IF NOT EXISTS tweets1 (
  id 			INTEGER,
  tx 			TEXT,
  sig 			VARCHAR(99),
  publickey 		VARCHAR(99),
  thread_id 		VARCHAR(99),
  parent_id 		VARCHAR(99),
  `text` 			TEXT,
  link			TEXT,
  link_data		TEXT,
  processed		INTEGER,
  flagged 		INTEGER,
  moderated 		INTEGER,
  num_likes 		INTEGER,
  num_retweets 		INTEGER,
  created_at 		INTEGER,
  updated_at 		INTEGER,
  UNIQUE 		(id),
  UNIQUE 		(sig),
  PRIMARY KEY 		(id ASC)
);

