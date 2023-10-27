CREATE INDEX sig_search_idx ON archive (sig);
CREATE INDEX sig_owner_search_idx ON archive (owner, sig);
CREATE INDEX field_search_idx ON archive (field1, field2, field3, owner);
CREATE INDEX time_search_idx ON archive (created_at, updated_at, preserve, owner);
CREATE INDEX field1_search_idx on archive (field1, owner);
CREATE INDEX field2_search_idx on archive (field2, owner);
CREATE INDEX field3_search_idx on archive (field3, owner);

