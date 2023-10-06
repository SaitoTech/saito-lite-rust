CREATE TABLE IF NOT EXISTS transactions (
	block_time INTEGER,
	block_id INTEGER,
	block_hash TEXT,
	tx_time INTEGER,
	tx_hash TEXT PRIMARY KEY,
	tx_from TEXT,
	tx_msg TEXT,
	tx_type INTEGER,
	tx_module TEXT
);