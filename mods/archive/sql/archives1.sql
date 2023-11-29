CREATE TABLE IF NOT EXISTS archives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 0,
  publickey TEXT DEFAULT "",
  owner TEXT DEFAULT "",
  sig TEXT DEFAULT "",
  field1 TEXT DEFAULT "",
  field2 TEXT DEFAULT "",
  field3 TEXT DEFAULT "",
  field4 TEXT DEFAULT "",
  field5 TEXT DEFAULT "",
  block_id INTEGER DEFAULT 0,
  block_hash TEXT DEFAULT "",
  created_at INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT 0,
  tx TEXT DEFAULT "",
  tx_size INTEGER DEFAULT 0,
  flagged INTEGER DEFAULT 0,
  preserve INTEGER DEFAULT 0
);

