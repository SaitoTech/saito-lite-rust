CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER,
  identifier TEXT,
  publickey TEXT,
  unixtime INTEGER,
  bid INTEGER,
  bsh TEXT,
  lock_block INTEGER DEFAULT 0,
  sig TEXT,
  signer TEXT,
  lc INTEGER,
  bio TEXT DEFAULT '', 
  photo TEXT DEFAULT '', 
  profile_data TEXT DEFAULT '', 
  UNIQUE (identifier),
  PRIMARY KEY(id ASC)
);

