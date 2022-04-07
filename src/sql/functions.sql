-- Parameters need to be prefixed because the name clashes with `users`'s columns
-- auth_user_id
CREATE FUNCTION is_account_owner (_auth_user_id uuid, _account_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        users
      WHERE
        users.account_id = _account_id
        AND users.auth_user_id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
