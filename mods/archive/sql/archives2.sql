CREATE INDEX sig_search_idx ON archives (sig);
CREATE INDEX sig_owner_search_idx ON archives (owner, sig);
CREATE INDEX field_search_idx ON archives (field1, field2, field3, owner);
CREATE INDEX time_search_idx ON archives (created_at, updated_at, preserve, owner);
CREATE INDEX field1_search_idx on archives (field1, owner);
CREATE INDEX field2_search_idx on archives (field2, owner);
CREATE INDEX field3_search_idx on archives (field3, owner);

