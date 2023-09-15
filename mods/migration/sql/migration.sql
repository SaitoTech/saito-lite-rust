CREATE TABLE IF NOT EXISTS migration (
  id 			INTEGER,
  publickey 		VARCHAR(99),
  erc20		VARCHAR(99),
  erc20_tx_id	VARCHAR(99) DEFAULT "",
  email TEXT,
  saito_isssued INTEGER DEFAULT 0,
  issued_at 		INTEGER,
  created_at 		INTEGER,
  UNIQUE 		(id),
  PRIMARY KEY (id ASC)
);

