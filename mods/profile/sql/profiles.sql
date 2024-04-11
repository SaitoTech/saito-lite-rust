CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id INTEGER,
  bio TEXT DEFAULT '', 
  photo TEXT DEFAULT '', 
  profile_data TEXT DEFAULT '',
  UNIQUE (record_id),
  FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
);

