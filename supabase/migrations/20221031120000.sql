-- add ability to relate tables to each other:
ALTER TABLE fields
  ADD COLUMN table_ref uuid DEFAULT NULL REFERENCES tables (id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX ON fields USING btree (table_ref);
