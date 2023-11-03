CREATE INDEX sig_search_idx ON archives (sig);
CREATE INDEX sig_owner_search_idx ON archives (owner, sig);
CREATE INDEX field1_search_idx on archives (field1);
CREATE INDEX field2_search_idx on archives (field2);
CREATE INDEX field3_search_idx on archives (field3);
CREATE INDEX field1_time_search_idx on archives (field1, created_at);
CREATE INDEX field2_time_search_idx on archives (field2, created_at);
CREATE INDEX field3_time_search_idx on archives (field3, created_at);
CREATE INDEX field1_with_owner_search_idx on archives (field1, owner, created_at);
CREATE INDEX field2_with_owner_search_idx on archives (field2, owner, created_at);
CREATE INDEX field3_with_owner_search_idx on archives (field3, owner, created_at);

