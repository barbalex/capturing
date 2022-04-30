-- 2. choose winner and upsert file
CREATE OR REPLACE FUNCTION files_meta_revs_children (file_id uuid, parent_rev text)
  RETURNS SETOF files_meta_revs
  AS $$
  SELECT
    *
  FROM
    files_meta_revs
  WHERE
    files_meta_revs.file_id = $1
    -- its parent is the file_rev, thus this is its child
    AND files_meta_revs.parent_rev = $2
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION files_meta_revs_leaves (file_id uuid, deleted integer DEFAULT 0)
  RETURNS SETOF files_meta_revs
  AS $$
  SELECT
    *
  FROM
    files_meta_revs
  WHERE
    -- of this record
    file_id = $1
    -- undeleted
    AND deleted = $2
    -- leaves
    AND NOT EXISTS (
      SELECT
        1
      FROM
        files_meta_revs_children ($1, files_meta_revs.rev));

$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION files_meta_revs_max_depth (file_id uuid, deleted integer DEFAULT 0)
  RETURNS int
  AS $$
  SELECT
    max(depth)
  FROM
    files_meta_revs_leaves ($1, $2);

$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION files_meta_revs_winner_rev_value (file_id uuid, deleted integer DEFAULT 0)
  RETURNS text
  AS $$
  SELECT
    -- here we choose the winning revision
    max(leaves.rev) AS rev
  FROM
    files_meta_revs_leaves ($1, $2) AS leaves
WHERE
  files_meta_revs_max_depth ($1, $2) = leaves.depth
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION files_meta_revs_winner (file_id uuid, deleted integer DEFAULT 0)
  RETURNS SETOF files_meta_revs
  AS $$
  SELECT
    *
  FROM
    files_meta_revs_leaves ($1, $2) AS leaves
WHERE
  leaves.rev = files_meta_revs_winner_rev_value ($1, $2)
  OR (leaves.rev IS NULL
    AND files_meta_revs_winner_rev_value ($1, $2) IS NULL)
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION file_conflicts_of_winner (file_id uuid, deleted integer DEFAULT 0)
  RETURNS text[]
  AS $$
  SELECT
    ARRAY (
      SELECT
        rev
      FROM
        files_meta_revs_leaves ($1, $2)
      WHERE
        rev <> files_meta_revs.rev)
  FROM
    files_meta_revs_winner ($1, $2) AS files_meta_revs
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION files_meta_revs_set_winning_revision ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF EXISTS (
    SELECT
      1
    FROM
      files_meta_revs_winner (NEW.file_id, 0))
  -- 1. if a winning undeleted leaf exists, use this
  --    (else pick a winner from the deleted leaves)
  THEN
  INSERT INTO files_meta (id, row_id, field_id, name, type, deleted, client_rev_at, client_rev_by, server_rev_at, rev, revisions, parent_rev, depth, conflicts)
  SELECT
    winner.file_id,
    row_id,
    winner.field_id,
    winner.name,
    winner.type,
    winner.deleted,
    winner.client_rev_at,
    winner.client_rev_by,
    now() AS server_rev_at,
  winner.rev,
  winner.revisions,
  winner.parent_rev,
  winner.depth,
  file_conflicts_of_winner (NEW.file_id) AS conflicts
FROM
  files_meta_revs_winner (NEW.file_id) AS winner
ON CONFLICT (id)
  DO UPDATE SET
    -- do not update the idrow_id,
    field_id = excluded.field_id,
    name = excluded.name,
    type = excluded.type,
    deleted = excluded.deleted,
    client_rev_at = excluded.client_rev_at,
    client_rev_by = excluded.client_rev_by,
    server_rev_at = excluded.server_rev_at,
    rev = excluded.rev,
    revisions = excluded.revisions,
    parent_rev = excluded.parent_rev,
    depth = excluded.depth,
    conflicts = excluded.conflicts;
ELSE
  -- 2. so there is no undeleted winning leaf
  --    choose winner from deleted leaves
  --    is necessary to set the winner deleted
  --    so the client can pick this up
  INSERT INTO files_meta (id, row_id, field_id, name, type, deleted, client_rev_at, client_rev_by, server_rev_at, rev, revisions, parent_rev, depth, conflicts)
  SELECT
    winner.file_id,
    row_id,
    winner.field_id,
    winner.name,
    winner.type,
    winner.deleted,
    winner.client_rev_at,
    winner.client_rev_by,
    now() AS server_rev_at,
    winner.rev,
    winner.revisions,
    winner.parent_rev,
    winner.depth,
    file_conflicts_of_winner (NEW.file_id, 1) AS conflicts
  FROM
    files_meta_revs_winner (NEW.file_id, 1) AS winner
ON CONFLICT (id)
  DO UPDATE SET
    -- do not update the row_id,
    field_id = excluded.field_id,
    name = excluded.name,
    type = excluded.type,
    deleted = excluded.deleted,
    client_rev_at = excluded.client_rev_at,
    client_rev_by = excluded.client_rev_by,
    server_rev_at = excluded.server_rev_at,
    rev = excluded.rev,
    revisions = excluded.revisions,
    parent_rev = excluded.parent_rev,
    depth = excluded.depth,
    conflicts = excluded.conflicts;
END IF;
  RETURN new;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_files_meta_revs_set_winning_revision
  AFTER INSERT ON files_meta_revs
  FOR EACH ROW
  EXECUTE PROCEDURE files_meta_revs_set_winning_revision ();

