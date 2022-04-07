-- is_project_user is in tables to guarantee correct series of events when creating policies
-- is_project_editor is in tables to guarantee correct series of events when creating policies
-- is_project_manager is in tables to guarantee correct series of events when creating policies
-- is_project_editor_or_manager is in tables to guarantee correct series of events when creating policies
-- Parameters need to be prefixed because the name clashes with column names
CREATE FUNCTION is_project_manager (_auth_user_id uuid, _project_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        project_users.project_id = _project_id
        AND project_users.role = 'project_manager'
        AND users.auth_user_id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
