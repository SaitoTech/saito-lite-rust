CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT UNIQUE,
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
  profile_data TEXT DEFAULT ''
);
