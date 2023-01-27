CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER,
  room_code TEXT,
  peers TEXT,
  peer_count INTEGER,
  is_max_capacity INTEGER,
  start_time INTEGER,
  created_at INTEGER,
  validity_period INTEGER,
  UNIQUE (room_code),
  PRIMARY KEY (id ASC)
);
