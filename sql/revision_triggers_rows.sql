-- 1. first set the revision fields
--    assumption: client passed in values from the row
--    TODO: client needs to update it's own row though - so this does not make sense? DOES NOT!
-- CREATE OR REPLACE FUNCTION trigger_row_revs_set_revision_fields ()
--   RETURNS TRIGGER
--   AS $$
-- DECLARE
--   new_depth int := NEW.depth + 1;
--   new_rev text := concat(new_depth, '-', md5(concat('{', 'row_id:', NEW.row_id, 'table_id:', NEW.table_id, 'geometry:', NEW.geometry, 'data:', NEW.data, 'deleted:', NEW.deleted, 'parent_rev:', NEW.rev, '}')));
-- BEGIN
--   NEW.parent_rev := NEW.rev;
--   NEW.depth := new_depth;
--   NEW.rev := new_rev;
--   NEW.revisions := array_append(NEW.revisions, new_rev);
--   RETURN new;
-- END;
-- $$
-- LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_row_revs_set_revision_fields
--   BEFORE INSERT ON row_revs FOR EACH ROW
--   EXECUTE PROCEDURE trigger_row_revs_set_revision_fields ();

-- 2. now that the revision fields are set (either by client or before insert trigger),
--    choose winner and upsert row
CREATE OR REPLACE FUNCTION row_revs_children (row_id uuid, parent_rev text)
  RETURNS SETOF row_revs
  AS $$
  SELECT
    *
  FROM
    row_revs
  WHERE
    row_revs.row_id = $1
    -- its parent is the row_rev, thus this is its child
    AND row_revs.parent_rev = $2
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION row_revs_leaves (row_id uuid, deleted boolean DEFAULT FALSE)
  RETURNS SETOF row_revs
  AS $$
  SELECT
    *
  FROM
    row_revs
  WHERE
    -- of this record
    row_id = $1
    -- undeleted
    AND deleted = $2
    -- leaves
    AND NOT EXISTS (
      SELECT
        1
      FROM
        row_revs_children ($1, row_revs.rev));

$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION row_revs_max_depth (row_id uuid, deleted boolean DEFAULT FALSE)
  RETURNS int
  AS $$
  SELECT
    max(depth)
  FROM
    row_revs_leaves ($1, $2);

$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION row_revs_winner_rev_value (row_id uuid, deleted boolean DEFAULT FALSE)
  RETURNS text
  AS $$
  SELECT
    -- here we choose the winning revision
    max(leaves.rev) AS rev
  FROM
    row_revs_leaves ($1, $2) AS leaves
WHERE
  row_revs_max_depth ($1, $2) = leaves.depth
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION row_revs_winner (row_id uuid, deleted boolean DEFAULT FALSE)
  RETURNS SETOF row_revs
  AS $$
  SELECT
    *
  FROM
    row_revs_leaves ($1, $2) AS leaves
WHERE
  leaves.rev = row_revs_winner_rev_value ($1, $2)
  OR (leaves.rev IS NULL
    AND row_revs_winner_rev_value ($1, $2) IS NULL)
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION row_conflicts_of_winner (row_id uuid, deleted boolean DEFAULT FALSE)
  RETURNS text[]
  AS $$
  SELECT
    ARRAY (
      SELECT
        rev
      FROM
        row_revs_leaves ($1, $2)
      WHERE
        rev <> row_revs.rev)
  FROM
    row_revs_winner ($1, $2) AS row_revs
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION row_revs_set_winning_revision ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF EXISTS (
    SELECT
      1
    FROM
      row_revs_winner (NEW.row_id, FALSE))
  -- 1. if a winning undeleted leaf exists, use this
  --    (else pick a winner from the deleted leaves)
  THEN
  INSERT INTO ROWS (id, table_id, parent_id, geometry, geometry_n, geometry_e, geometry_s, geometry_w, data, deleted, client_rev_at, client_rev_by, server_rev_at, rev, revisions, parent_rev, depth, conflicts)
  SELECT
    winner.row_id,
    winner.table_id,
    winner.parent_id,
    winner.geometry,
    winner.geometry_n,
    winner.geometry_e,
    winner.geometry_s,
    winner.geometry_w,
    winner.data,
    winner.deleted,
    winner.client_rev_at,
    winner.client_rev_by,
    now() as server_rev_at,
    winner.rev,
    winner.revisions,
    winner.parent_rev,
    winner.depth,
    row_conflicts_of_winner (NEW.row_id) AS conflicts
FROM
  row_revs_winner (NEW.row_id) AS winner
ON CONFLICT (id)
  DO UPDATE SET
    -- do not update the id
    table_id = excluded.table_id,
    parent_id = excluded.parent_id,
    geometry = excluded.geometry,
    geometry_n = excluded.geometry_n,
    geometry_e = excluded.geometry_e,
    geometry_s = excluded.geometry_s,
    geometry_w = excluded.geometry_w,
    data = excluded.data,
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
  INSERT INTO ROWS (id, table_id, parent_id, geometry, geometry_n, geometry_e, geometry_s, geometry_w, data, deleted, client_rev_at, client_rev_by, server_rev_at, rev, revisions, parent_rev, depth, conflicts)
  SELECT
    winner.row_id,
    winner.table_id,
    winner.parent_id,
    winner.geometry,
    winner.geometry_n,
    winner.geometry_e,
    winner.geometry_s,
    winner.geometry_w,
    winner.data,
    winner.deleted,
    winner.client_rev_at,
    winner.client_rev_by,
    now() as server_rev_at,
    winner.rev,
    winner.revisions,
    winner.parent_rev,
    winner.depth,
    row_conflicts_of_winner (NEW.row_id, TRUE) AS conflicts
  FROM
    row_revs_winner (NEW.row_id, TRUE) AS winner
ON CONFLICT (id)
  DO UPDATE SET
    -- do not update the id
    table_id = excluded.table_id,
    parent_id = excluded.parent_id,
    geometry = excluded.geometry,
    geometry_n = excluded.geometry_n,
    geometry_e = excluded.geometry_e,
    geometry_s = excluded.geometry_s,
    geometry_w = excluded.geometry_w,
    data = excluded.data,
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

CREATE TRIGGER trigger_row_revs_set_winning_revision
  AFTER INSERT ON row_revs FOR EACH ROW
  EXECUTE PROCEDURE row_revs_set_winning_revision ();

