CREATE EXTENSION IF NOT EXISTS postgis;

-- set up realtime
BEGIN;
DROP publication IF EXISTS supabase_realtime;
CREATE publication supabase_realtime;
COMMIT;

--
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  name text DEFAULT NULL,
  -- TODO: email needs to be unique
  -- project manager can list project users by email without knowing if this user already exists
  -- then user can create a login (= row in users table) and work in the project
  email text UNIQUE DEFAULT NULL,
  account_id uuid DEFAULT NULL,
  -- references accounts (id) on delete no action on update cascade,
  auth_user_id uuid DEFAULT NULL REFERENCES auth.users (id) ON DELETE NO action ON UPDATE CASCADE,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

-- TODO: errors on remote server: https://github.com/supabase/supabase/issues/6257
ALTER TABLE "public"."users"
  ADD FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users" ("id") ON DELETE NO action ON UPDATE CASCADE;

CREATE INDEX ON users USING btree (id);

CREATE INDEX ON users USING btree (name);

CREATE INDEX ON users USING btree (email);

CREATE INDEX ON users USING btree (account_id);

CREATE INDEX ON users USING btree (auth_user_id);

CREATE INDEX ON users USING btree (deleted);

COMMENT ON TABLE users IS 'Goal: authentication, authorization, communication, configuration. Not versioned (not recorded and only added by manager)';

COMMENT ON COLUMN users.id IS 'primary key';

COMMENT ON COLUMN users.name IS 'name';

COMMENT ON COLUMN users.email IS 'email';

COMMENT ON COLUMN users.account_id IS 'associated account';

COMMENT ON COLUMN users.auth_user_id IS 'associated auth';

COMMENT ON COLUMN users.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN users.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN users.server_rev_at IS 'time of last edit on server';

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own user" ON users;

CREATE POLICY "Users can view own user" ON users
  FOR SELECT
    USING (auth.uid () = users.auth_user_id);

DROP POLICY IF EXISTS "Users can insert own user" ON users;

CREATE POLICY "Users can insert own user" ON users
  FOR INSERT
    WITH CHECK (auth.uid () = users.auth_user_id);

DROP POLICY IF EXISTS "Users can update own user" ON users;

CREATE POLICY "Users can update own user" ON users
  FOR UPDATE
    USING (auth.uid () = users.auth_user_id);

ALTER publication supabase_realtime
  ADD TABLE users;

--
DROP TABLE IF EXISTS accounts CASCADE;

CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  -- service_id is not needed - TODO: remove
  service_id text DEFAULT NULL,
  -- uid of firebase
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE -- any more?:
  -- type
  -- from
  -- until
);

CREATE INDEX ON accounts USING btree (id);

CREATE INDEX ON accounts USING btree (service_id);

CREATE INDEX ON accounts USING btree (server_rev_at);

CREATE INDEX ON accounts USING btree (deleted);

COMMENT ON TABLE accounts IS 'Goal: earn money. Base table. Projects, tables, rows and files depend on it. Not versioned (not recorded and only added by manager)';

COMMENT ON COLUMN accounts.id IS 'primary key';

COMMENT ON COLUMN accounts.service_id IS 'id used by external service';

COMMENT ON COLUMN accounts.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN accounts.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN accounts.server_rev_at IS 'time of last edit on server';

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own account" ON accounts;

CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT
    USING (auth.uid () IN (
      SELECT
        auth_user_id
      FROM
        users
      WHERE
        account_id = accounts.id));

DROP POLICY IF EXISTS "Users can insert own account" ON accounts;

CREATE POLICY "Users can insert own account" ON accounts
  FOR INSERT
    WITH CHECK (auth.uid () IN (
      SELECT
        auth_user_id
      FROM
        users
      WHERE
        account_id = accounts.id));

DROP POLICY IF EXISTS "Users can update own account" ON accounts;

CREATE POLICY "Users can update own account" ON accounts
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
      SELECT
        auth_user_id
      FROM
        users
      WHERE
        account_id = accounts.id));

DROP POLICY IF EXISTS "Users cant delete accounts" ON accounts;

CREATE POLICY "Users cant delete accounts" ON accounts
  FOR UPDATE
    WITH CHECK (FALSE);

ALTER publication supabase_realtime
  ADD TABLE accounts;

-- need to wait to create this reference until accounts exists:
ALTER TABLE users
  ADD FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE NO action ON UPDATE CASCADE;

--drop table if exists account_managers cascade;
--
--create table account_managers (
--  id uuid primary key default gen_random_uuid (),
--  account_id uuid default null references accounts (id) on delete no action on update cascade,
--  user_id uuid default null references users (id) on delete no action on update cascade,
--);
--create index on account_managers using btree (id);
--create index on account_managers using btree (account_id);
--create index on account_managers using btree (user_id);
--comment on table account_managers IS 'Goal: enable having multiple account managers. Not versioned (not recorded and only added by manager)';
--comment on column account_managers.id IS 'primary key';
--comment on column account_managers.account_id IS 'associated account';
--comment on column account_managers.user_id IS 'associated user';
--
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  -- account_id may not be null: is needed for policies
  -- all account owners would see any project missing an account_id (or none)
  account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE NO action ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  crs integer DEFAULT 4326,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE -- geometry?
  -- data?
);

CREATE UNIQUE INDEX account_name_idx ON projects (account_id, name)
WHERE
  deleted IS FALSE;

CREATE INDEX ON projects USING btree (id);

CREATE INDEX ON projects USING btree (account_id);

CREATE INDEX ON projects USING btree (name);

CREATE INDEX ON projects USING btree (label);

CREATE INDEX ON projects USING btree (deleted);

COMMENT ON TABLE projects IS 'Goal: Define data structure per project. Tables, rows and files depend on it. Not versioned (not recorded and only added by manager)';

COMMENT ON COLUMN projects.id IS 'primary key';

COMMENT ON COLUMN projects.account_id IS 'associated account';

COMMENT ON COLUMN projects.name IS 'name for use in db and url (lowercase, no special characters)';

COMMENT ON COLUMN projects.label IS 'name for use when labeling';

COMMENT ON COLUMN projects.crs IS 'crs used in geometry fields';

COMMENT ON COLUMN projects.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN projects.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN projects.server_rev_at IS 'time of last edit on server';

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- policies defined after creating project_users because referencing them
ALTER publication supabase_realtime
  ADD TABLE projects;

--
DROP TABLE IF EXISTS rel_types CASCADE;

CREATE TABLE rel_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  sort smallint DEFAULT NULL,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON rel_types USING btree (value);

CREATE INDEX ON rel_types USING btree (sort);

CREATE INDEX ON rel_types USING btree (server_rev_at);

CREATE INDEX ON rel_types USING btree (deleted);

COMMENT ON TABLE rel_types IS 'Goal: list of rel_types';

COMMENT ON COLUMN rel_types.value IS 'the relation type';

COMMENT ON COLUMN rel_types.comment IS 'explains the version type';

COMMENT ON COLUMN rel_types.sort IS 'enables sorting at will';

COMMENT ON COLUMN rel_types.server_rev_at IS 'time of last edit on server';

INSERT INTO rel_types (value, sort, comment)
  VALUES ('1', 2, '1 to 1'), ('n', 1, '1 to n')
ON CONFLICT ON CONSTRAINT rel_types_pkey
  DO UPDATE SET
    comment = excluded.comment;

DROP TABLE IF EXISTS tables CASCADE;

DROP TABLE IF EXISTS option_types CASCADE;

ALTER TABLE rel_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view rel types" ON rel_types;

CREATE POLICY "Users can view rel types" ON rel_types
  FOR SELECT
    USING (TRUE);

ALTER publication supabase_realtime
  ADD TABLE rel_types;

--
DROP TABLE IF EXISTS role_types CASCADE;

CREATE TABLE role_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  sort smallint DEFAULT 1,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON role_types USING btree (value);

CREATE INDEX ON role_types USING btree (sort);

CREATE INDEX ON role_types USING btree (server_rev_at);

CREATE INDEX ON role_types USING btree (deleted);

COMMENT ON TABLE role_types IS 'Goal: list of roles';

COMMENT ON COLUMN role_types.value IS 'the role';

COMMENT ON COLUMN role_types.comment IS 'explains the role';

COMMENT ON COLUMN role_types.sort IS 'enables sorting at will';

COMMENT ON COLUMN role_types.server_rev_at IS 'time of last edit on server';

INSERT INTO role_types (value, sort, comment)
  VALUES ('account_manager', 1, 'Only role to: create project_users, give them roles, create projects'), ('project_manager', 2, 'Can edit projects and their structure'), ('project_editor', 3, 'Can edit rows and files'), ('project_reader', 4, 'Can read data')
ON CONFLICT ON CONSTRAINT role_types_pkey
  DO UPDATE SET
    comment = excluded.comment;

ALTER TABLE role_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view role types" ON role_types;

CREATE POLICY "Users can view role types" ON role_types
  FOR SELECT
    USING (TRUE);

ALTER publication supabase_realtime
  ADD TABLE role_types;

--
DROP TABLE IF EXISTS project_users CASCADE;

CREATE TABLE project_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE NO action ON UPDATE CASCADE,
  --user_id uuid default null references users (id) on delete no action on update cascade,
  user_email text NOT NULL,
  -- NO reference so project_user can be created before registering,
  role text DEFAULT 'project_reader' REFERENCES role_types (value) ON DELETE NO action ON UPDATE CASCADE,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE UNIQUE INDEX project_users_project_email_idx ON project_users (project_id, user_email)
WHERE
  deleted IS FALSE;

CREATE INDEX ON project_users USING btree (id);

CREATE INDEX ON project_users USING btree (project_id);

CREATE INDEX ON project_users USING btree (user_email);

CREATE INDEX ON project_users USING btree (ROLE);

CREATE INDEX ON project_users USING btree (deleted);

COMMENT ON TABLE project_users IS 'Goal: Project manager can list users that get this project synced. And give them roles. Not versioned (not recorded and only added by manager)';

COMMENT ON COLUMN project_users.id IS 'primary key';

COMMENT ON COLUMN project_users.project_id IS 'associated project';

COMMENT ON COLUMN project_users.user_email IS 'associated user';

COMMENT ON COLUMN project_users.role IS 'associated role';

COMMENT ON COLUMN project_users.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN project_users.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN project_users.server_rev_at IS 'time of last edit on server';

CREATE VIEW project_editors AS
SELECT
  *
FROM
  project_users
WHERE
  ROLE = 'project_editor';

CREATE VIEW project_readers AS
SELECT
  *
FROM
  project_users
WHERE
  ROLE = 'project_reader';

CREATE VIEW project_managers AS
SELECT
  *
FROM
  project_users
WHERE
  ROLE = 'project_manager';

ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project owners and same user can view project_users" ON project_users;

CREATE POLICY "project owners and same user can view project_users" ON project_users
  FOR SELECT
    USING (auth.uid () IN (
    -- project owner
      SELECT
        users.auth_user_id FROM users
        WHERE
          users.account_id = (
            SELECT
              projects.account_id
            FROM projects
            WHERE
              id = project_users.project_id)
            UNION
            -- same user
              SELECT
                users.auth_user_id
              FROM users
              WHERE
                email = project_users.user_email));

DROP POLICY IF EXISTS "project owners can insert project_users" ON project_users;

CREATE POLICY "project owners can insert project_users" ON project_users
  FOR INSERT
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        users
      WHERE
        users.account_id = (
          SELECT
            projects.account_id
          FROM
            projects
          WHERE
            id = project_users.project_id)));

DROP POLICY IF EXISTS "project owners can update project_users" ON project_users;

CREATE POLICY "project owners can update project_users" ON project_users
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        users
      WHERE
        users.account_id = (
          SELECT
            projects.account_id
          FROM
            projects
          WHERE
            id = project_users.project_id)));

DROP POLICY IF EXISTS "project owners can delete project_users" ON project_users;

CREATE POLICY "project owners can delete project_users" ON project_users
  FOR DELETE
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        users
      WHERE
        users.account_id = (
          SELECT
            projects.account_id
          FROM
            projects
          WHERE
            id = project_users.project_id)));

ALTER publication supabase_realtime
  ADD TABLE project_users;

--
-- now that project_users is created, can define policies for projects as they reference project_users
DROP POLICY IF EXISTS "Users can view assigned projects and projects of own accounts" ON projects;

CREATE POLICY "Users can view assigned projects and projects of own accounts" ON projects
  FOR SELECT
    USING (auth.uid () IN (
    -- users assigned to this project
      SELECT
        users.auth_user_id FROM users
        INNER JOIN project_users ON users.email = project_users.user_email
        WHERE
          project_users.project_id = projects.id
        UNION
        -- user owning the project's account
          SELECT
            users.auth_user_id FROM users
            WHERE
              users.account_id = projects.account_id));

DROP POLICY IF EXISTS "account owners can insert projects for own account" ON projects;

CREATE POLICY "account owners can insert projects for own account" ON projects
  FOR INSERT
    WITH CHECK (auth.uid () IN (
    -- user owning the project's account
    SELECT users.auth_user_id FROM users
    WHERE
      users.account_id = projects.account_id));

DROP POLICY IF EXISTS "Users can update projects assigned and of own accounts" ON projects;

CREATE POLICY "Users can update projects assigned and of own accounts" ON projects
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
    -- users assigned to this project as manager or editor
    SELECT users.auth_user_id FROM users
    INNER JOIN project_users ON users.email = project_users.user_email
    WHERE
      project_users.project_id = projects.id AND project_users.role IN ('project_manager', 'project_editor')
    UNION
    -- user owning the project's account
      SELECT
        users.auth_user_id FROM users
        WHERE
          users.account_id = projects.account_id));

DROP POLICY IF EXISTS "account owners can delete own projects" ON projects;

CREATE POLICY "account owners can delete own projects" ON projects
  FOR DELETE
    USING (auth.uid () IN (
    -- user owning the project's account
    SELECT users.auth_user_id FROM users
    WHERE
      users.account_id = projects.account_id));

--
CREATE TABLE option_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  save_id boolean DEFAULT FALSE,
  sort smallint DEFAULT NULL,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON option_types USING btree (value);

CREATE INDEX ON option_types USING btree (id);

CREATE INDEX ON option_types USING btree (sort);

CREATE INDEX ON option_types USING btree (server_rev_at);

CREATE INDEX ON option_types USING btree (deleted);

COMMENT ON TABLE option_types IS 'Goal: list of types of option tables';

COMMENT ON COLUMN option_types.value IS 'the option type';

COMMENT ON COLUMN option_types.save_id IS 'wether to save id instead of value';

COMMENT ON COLUMN option_types.id IS 'the id to use if id instead of value is to be saved';

COMMENT ON COLUMN option_types.value IS 'explains the option type';

COMMENT ON COLUMN option_types.sort IS 'enables sorting at will';

COMMENT ON COLUMN option_types.server_rev_at IS 'time of last edit on server';

ALTER TABLE option_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view option types" ON option_types;

CREATE POLICY "Users can view option types" ON option_types
  FOR SELECT
    USING (TRUE);

ALTER publication supabase_realtime
  ADD TABLE option_types;

--
DROP TABLE IF EXISTS tables;

CREATE TABLE tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  -- project_id needs to exist for policies to work
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE NO action ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES tables (id) ON DELETE NO action ON UPDATE CASCADE,
  rel_type text DEFAULT 'n' REFERENCES rel_types (value) ON DELETE NO action ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  single_label text DEFAULT NULL,
  label_fields text[] DEFAULT NULL,
  label_fields_separator text DEFAULT ', ',
  sort smallint DEFAULT NULL,
  option_type text REFERENCES option_types (value) ON DELETE NO action ON UPDATE CASCADE,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE UNIQUE INDEX tables_project_name_idx ON tables (project_id, name)
WHERE
  deleted IS FALSE;

CREATE INDEX ON tables USING btree (id);

CREATE INDEX ON tables USING btree (project_id);

CREATE INDEX ON tables USING btree (parent_id);

CREATE INDEX ON tables USING btree (name);

CREATE INDEX ON tables USING btree (label);

CREATE INDEX ON tables USING btree (sort);

CREATE INDEX ON tables USING btree (option_type);

CREATE INDEX ON tables USING btree (deleted);

COMMENT ON TABLE tables IS 'Goal: Define tables used per project. Rows and files depend on it. Not versioned (not recorded and only added by manager)';

COMMENT ON COLUMN tables.id IS 'primary key';

COMMENT ON COLUMN tables.project_id IS 'associated project';

COMMENT ON COLUMN tables.parent_id IS 'parent table';

COMMENT ON COLUMN tables.rel_type IS 'releation with parent table: 1:1 or 1:n';

COMMENT ON COLUMN tables.name IS 'name for use in db and url (lowercase, no special characters)';

COMMENT ON COLUMN tables.label IS 'name for use when labeling';

COMMENT ON COLUMN tables.sort IS 'enables ordering the tables of a project';

COMMENT ON COLUMN tables.label_fields IS 'fields used to label and sort rows';

COMMENT ON COLUMN tables.label_fields_separator IS 'characters used to separate fields when labelling rows';

COMMENT ON COLUMN tables.option_type IS 'What type of options list will this be?';

COMMENT ON COLUMN tables.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN tables.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN tables.server_rev_at IS 'time of last edit on server';

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project readers, editors and managers can view tables" ON tables;

CREATE POLICY "project readers, editors and managers can view tables" ON tables
  FOR SELECT
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        projects
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        projects.id = tables.project_id AND project_users.role IN ('project_manager', 'project_editor', 'project_reader')));

DROP POLICY IF EXISTS "project managers can insert tables" ON tables;

CREATE POLICY "project managers can insert tables" ON tables
  FOR INSERT
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        projects
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        projects.id = tables.project_id AND project_users.role = 'project_manager'));

DROP POLICY IF EXISTS "project managers can update tables" ON tables;

CREATE POLICY "project managers can update tables" ON tables
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        projects
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        projects.id = tables.project_id AND project_users.role = 'project_manager'));

DROP POLICY IF EXISTS "project managers can delete tables" ON tables;

CREATE POLICY "project managers can delete tables" ON tables
  FOR DELETE
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        projects
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        projects.id = tables.project_id AND project_users.role = 'project_manager'));

ALTER publication supabase_realtime
  ADD TABLE tables;

--
DROP TABLE IF EXISTS field_types CASCADE;

CREATE TABLE field_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  sort smallint DEFAULT NULL,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON field_types USING btree (value);

CREATE INDEX ON field_types USING btree (sort);

CREATE INDEX ON field_types USING btree (server_rev_at);

CREATE INDEX ON field_types USING btree (deleted);

COMMENT ON TABLE field_types IS 'Goal: list of field_types';

COMMENT ON COLUMN field_types.value IS 'the relation type';

COMMENT ON COLUMN field_types.value IS 'explains the version type';

COMMENT ON COLUMN field_types.sort IS 'enables sorting at will';

COMMENT ON COLUMN field_types.server_rev_at IS 'time of last edit on server';

ALTER TABLE field_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view field types" ON field_types;

CREATE POLICY "Users can view field types" ON field_types
  FOR SELECT
    USING (TRUE);

ALTER publication supabase_realtime
  ADD TABLE field_types;

--
DROP TABLE IF EXISTS widget_types CASCADE;

CREATE TABLE widget_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  needs_list boolean DEFAULT FALSE,
  sort smallint DEFAULT NULL,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON widget_types USING btree (value);

CREATE INDEX ON widget_types USING btree (sort);

CREATE INDEX ON widget_types USING btree (server_rev_at);

CREATE INDEX ON widget_types USING btree (deleted);

COMMENT ON TABLE widget_types IS 'Goal: list of widget_types';

COMMENT ON COLUMN widget_types.value IS 'the relation type';

COMMENT ON COLUMN widget_types.needs_list IS 'whether the widget needs an options list';

COMMENT ON COLUMN widget_types.comment IS 'explains the version type';

COMMENT ON COLUMN widget_types.sort IS 'enables sorting at will';

COMMENT ON COLUMN widget_types.server_rev_at IS 'time of last edit on server';

INSERT INTO widget_types (value, sort, comment)
  VALUES ('text', 1, 'Short field accepting text'), ('textarea', 2, 'Field accepting text, lines can break'), ('markdown', 3, 'Field accepting text, expressing markdown'), ('options-2', 4, 'boolean field showing true and false (not null)'), ('options-3', 5, 'boolean field showing true, false and null'), ('options-few', 6, 'short list, showing every entry'), ('options-many', 7, 'long dropdown-list'), ('datepicker', 8, 'enables choosing a date'), ('filepicker', 9, 'enables choosing a file')
ON CONFLICT ON CONSTRAINT widget_types_pkey
  DO UPDATE SET
    comment = excluded.comment;

ALTER TABLE widget_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view widget types" ON widget_types;

CREATE POLICY "Users can view widget types" ON widget_types
  FOR SELECT
    USING (TRUE);

ALTER publication supabase_realtime
  ADD TABLE widget_types;

--
DROP TABLE IF EXISTS widgets_for_fields;

CREATE TABLE widgets_for_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  field_value text REFERENCES field_types (value) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_value text REFERENCES widget_types (value) ON DELETE CASCADE ON UPDATE CASCADE,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE,
  UNIQUE (field_value, widget_value)
);

CREATE INDEX ON widgets_for_fields USING btree (field_value);

CREATE INDEX ON widgets_for_fields USING btree (widget_value);

CREATE INDEX ON widgets_for_fields USING btree (server_rev_at);

CREATE INDEX ON widgets_for_fields USING btree (deleted);

COMMENT ON TABLE widgets_for_fields IS 'Goal: know what widgets can be choosen for what field_types';

COMMENT ON COLUMN widgets_for_fields.server_rev_at IS 'time of last edit on server';

INSERT INTO field_types (value, sort, comment)
  VALUES ('text', 1, 'Example: text'), ('boolean', 2, 'true or false'), ('integer', 3, 'Example: 1'), ('decimal', 4, 'Example: 1.1'), ('date', 5, 'Example: 2021-03-08'), ('date-time', 6, 'Timestamp with time zone. Example: 2021-03-08 10:23:54+01'), ('file-reference', 7, 'the id of the file')
ON CONFLICT ON CONSTRAINT field_types_pkey
  DO UPDATE SET
    comment = excluded.comment;

ALTER TABLE widgets_for_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view widgets for fields" ON widgets_for_fields;

CREATE POLICY "Users can view widgets for fields" ON widgets_for_fields
  FOR SELECT
    USING (TRUE);

ALTER publication supabase_realtime
  ADD TABLE widgets_for_fields;

--
DROP TABLE IF EXISTS fields CASCADE;

CREATE TABLE fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  -- need table_id for policies
  table_id uuid NOT NULL REFERENCES tables (id) ON DELETE NO action ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  sort smallint DEFAULT 0,
  is_internal_id boolean DEFAULT FALSE,
  field_type text DEFAULT 'text' REFERENCES field_types (value) ON DELETE NO action ON UPDATE CASCADE,
  widget_type text DEFAULT 'text' REFERENCES widget_types (value) ON DELETE NO action ON UPDATE CASCADE,
  options_table uuid REFERENCES tables (id) ON DELETE NO action ON UPDATE CASCADE,
  standard_value text DEFAULT NULL,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE UNIQUE INDEX fields_table_name_idx ON fields (table_id, name)
WHERE
  deleted IS FALSE;

CREATE INDEX ON fields USING btree (id);

CREATE INDEX ON fields USING btree (table_id);

CREATE INDEX ON fields USING btree (name);

CREATE INDEX ON fields USING btree (label);

CREATE INDEX ON fields USING btree (sort);

CREATE INDEX ON fields USING btree (options_table);

CREATE INDEX ON fields USING btree (deleted);

COMMENT ON TABLE fields IS 'Goal: Define fields used per table. Defines structure and presentation of data column in rows. Not versioned (not recorded and only added by manager)';

COMMENT ON COLUMN fields.id IS 'primary key';

COMMENT ON COLUMN fields.table_id IS 'associated table';

COMMENT ON COLUMN fields.name IS 'name for use in db and url (lowercase, no special characters)';

COMMENT ON COLUMN fields.label IS 'name for use when labeling';

COMMENT ON COLUMN fields.sort IS 'enables ordering the field list of a table';

COMMENT ON COLUMN fields.is_internal_id IS 'is this table used as an id in the users own system?';

COMMENT ON COLUMN fields.field_type IS 'what type of data will populate this field?';

COMMENT ON COLUMN fields.widget_type IS 'what type of widget shall be used to enter data?';

COMMENT ON COLUMN fields.options_table IS 'for fields with field_type options-few and options-many: what table contains the options?';

COMMENT ON COLUMN fields.standard_value IS 'Goal: Project-admin can pre-set standard values. These are either real values (that have to be converted from string when used and field_type is not a string). Or instructions like: last(), now()...';

COMMENT ON COLUMN fields.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN fields.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN fields.server_rev_at IS 'time of last edit on server';

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project readers, editors and managers can view fields" ON fields;

CREATE POLICY "project readers, editors and managers can view fields" ON fields
  FOR SELECT
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        tables
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        tables.id = fields.table_id AND project_users.role IN ('project_manager', 'project_editor', 'project_reader')));

DROP POLICY IF EXISTS "project managers can insert fields" ON fields;

CREATE POLICY "project managers can insert fields" ON fields
  FOR INSERT
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        tables
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        tables.id = fields.table_id AND project_users.role = 'project_manager'));

DROP POLICY IF EXISTS "project managers can update fields" ON fields;

CREATE POLICY "project managers can update fields" ON fields
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        tables
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        tables.id = fields.table_id AND project_users.role = 'project_manager'));

DROP POLICY IF EXISTS "project managers can delete fields" ON fields;

CREATE POLICY "project managers can delete fields" ON fields
  FOR DELETE
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        tables
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        tables.id = fields.table_id AND project_users.role = 'project_manager'));

ALTER publication supabase_realtime
  ADD TABLE fields;

--
DROP TABLE IF EXISTS ROWS CASCADE;

CREATE TABLE ROWS (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  table_id uuid NOT NULL REFERENCES tables (id) ON DELETE NO action ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES ROWS (id) ON DELETE NO action ON UPDATE CASCADE,
  geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  geometry_n real DEFAULT NULL,
  geometry_e real DEFAULT NULL,
  geometry_s real DEFAULT NULL,
  geometry_w real DEFAULT NULL,
  data jsonb,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  rev text DEFAULT NULL,
  parent_rev text DEFAULT NULL,
  revisions text[] DEFAULT NULL,
  depth integer DEFAULT 0,
  deleted boolean DEFAULT FALSE,
  conflicts text[] DEFAULT NULL
);

CREATE INDEX ON ROWS USING btree (id);

CREATE INDEX ON ROWS USING btree (table_id);

CREATE INDEX ON ROWS USING btree (parent_id);

CREATE INDEX ON ROWS USING gist (geometry);

CREATE INDEX ON ROWS USING gin (data);

CREATE INDEX ON ROWS USING btree (deleted);

COMMENT ON TABLE ROWS IS 'Goal: Collect data. Versioned';

COMMENT ON COLUMN rows.id IS 'primary key';

COMMENT ON COLUMN rows.table_id IS 'associated table';

COMMENT ON COLUMN rows.parent_id IS 'associated row in the parent table (which means: this row is part of a child table)';

COMMENT ON COLUMN rows.geometry IS 'row geometry (GeometryCollection)';

COMMENT ON COLUMN rows.geometry_n IS 'Northernmost point of the geometry. Used to filter geometries for viewport client-side';

COMMENT ON COLUMN rows.geometry_e IS 'Easternmost point of the geometry. Used to filter geometries for viewport client-side';

COMMENT ON COLUMN rows.geometry_s IS 'Southernmost point of the geometry. Used to filter geometries for viewport client-side';

COMMENT ON COLUMN rows.geometry_w IS 'Westernmost point of the geometry. Used to filter geometries for viewport client-side';

COMMENT ON COLUMN rows.data IS 'fields (keys) and data (values) according to the related fields table';

COMMENT ON COLUMN rows.deleted IS 'marks if the row is deleted';

COMMENT ON COLUMN rows.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN rows.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN rows.server_rev_at IS 'time of last edit on server';

ALTER TABLE ROWS ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project readers, editors and managers can view rows" ON ROWS;

CREATE POLICY "project readers, editors and managers can view rows" ON ROWS
  FOR SELECT
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        tables
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        tables.id = rows.table_id AND project_users.role IN ('project_manager', 'project_editor', 'project_reader')));

DROP POLICY IF EXISTS "project managers and editors can insert rows" ON ROWS;

CREATE POLICY "project managers and editors can insert rows" ON ROWS
  FOR INSERT
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        tables
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        tables.id = rows.table_id AND project_users.role IN ('project_manager', 'project_editor')));

DROP POLICY IF EXISTS "project managers and editors can update rows" ON ROWS;

CREATE POLICY "project managers and editors can update rows" ON ROWS
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        tables
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        tables.id = rows.table_id AND project_users.role IN ('project_manager', 'project_editor')));

DROP POLICY IF EXISTS "project managers and editors can delete rows" ON ROWS;

CREATE POLICY "project managers and editors can delete rows" ON ROWS
  FOR DELETE
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        tables
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        tables.id = rows.table_id AND project_users.role IN ('project_manager', 'project_editor')));

ALTER publication supabase_realtime
  ADD TABLE ROWS;

--
DROP TABLE IF EXISTS row_revs CASCADE;

CREATE TABLE row_revs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  row_id uuid DEFAULT NULL,
  table_id uuid DEFAULT NULL,
  parent_id uuid DEFAULT NULL,
  geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  geometry_n real DEFAULT NULL,
  geometry_e real DEFAULT NULL,
  geometry_s real DEFAULT NULL,
  geometry_w real DEFAULT NULL,
  data jsonb,
  deleted boolean DEFAULT FALSE,
  client_rev_at timestamp with time zone DEFAULT NULL,
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  rev text DEFAULT NULL,
  parent_rev text DEFAULT NULL,
  revisions text[] DEFAULT NULL,
  depth integer DEFAULT 0
);

CREATE INDEX ON row_revs USING btree (id);

CREATE INDEX ON row_revs USING btree (row_id);

CREATE INDEX ON row_revs USING btree (parent_id);

CREATE INDEX ON row_revs USING btree (server_rev_at);

CREATE INDEX ON row_revs USING btree (rev);

CREATE INDEX ON row_revs USING btree (parent_rev);

CREATE INDEX ON row_revs USING btree (depth);

CREATE INDEX ON row_revs USING btree (deleted);

COMMENT ON TABLE row_revs IS 'Goal: Sync rows and handle conflicts';

COMMENT ON COLUMN row_revs.id IS 'primary key';

COMMENT ON COLUMN row_revs.row_id IS 'key of table rows';

COMMENT ON COLUMN row_revs.parent_id IS 'associated row in the parent table (which means: this row is part of a child table)';

COMMENT ON COLUMN row_revs.rev IS 'hashed value the fields: row_id, table_id, geometry, data, deleted';

COMMENT ON COLUMN row_revs.parent_rev IS 'hash of the previous revision';

COMMENT ON COLUMN row_revs.revisions IS 'array of hashes of all previous revisions';

COMMENT ON COLUMN row_revs.depth IS 'depth of the revision tree';

ALTER TABLE row_revs ENABLE ROW LEVEL SECURITY;

-- this is problematic
-- but there is no way to ensure references inside revs
-- so project and user's roles can not be found
-- TODO: find better solution
-- maybe: allow only users who are editor or manager in any project to read? Fetch this via auth.email()
CREATE POLICY "authenticated users can view row_revs" ON row_revs
  FOR SELECT
    USING (auth.role () = 'authenticated');

DROP POLICY IF EXISTS "authenticated users can insert row_revs" ON row_revs;

-- inserting possible BUT: revision trigger will fail depending on rls on files table
CREATE POLICY "authenticated users can insert row_revs" ON row_revs
  FOR INSERT
    WITH CHECK (auth.role () = 'authenticated');

DROP POLICY IF EXISTS "row_revs can not be updated" ON row_revs;

CREATE POLICY "row_revs can not be updated" ON row_revs
  FOR UPDATE
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "row_revs can not be deleted" ON row_revs;

CREATE POLICY "row_revs can not be deleted" ON row_revs
  FOR DELETE
    USING (FALSE);

ALTER publication supabase_realtime
  ADD TABLE row_revs;

--
DROP TABLE IF EXISTS files CASCADE;

CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  row_id uuid NOT NULL REFERENCES ROWS (id) ON DELETE NO action ON UPDATE CASCADE,
  field_id uuid DEFAULT NULL REFERENCES fields (id) ON DELETE NO action ON UPDATE CASCADE,
  filename text DEFAULT NULL,
  url text DEFAULT NULL,
  version integer DEFAULT 1,
  deleted boolean DEFAULT FALSE,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  rev text DEFAULT NULL,
  parent_rev text DEFAULT NULL,
  revisions text[] DEFAULT NULL,
  depth integer DEFAULT 0,
  conflicts text[] DEFAULT NULL
);

CREATE UNIQUE INDEX files_row_field_filename_idx ON files (row_id, field_id, filename)
WHERE
  deleted IS FALSE;

CREATE INDEX ON files USING btree (id);

CREATE INDEX ON files USING btree (row_id);

CREATE INDEX ON files USING btree (field_id);

CREATE INDEX ON files USING btree (filename);

CREATE INDEX ON ROWS USING btree (deleted);

COMMENT ON TABLE files IS 'Goal: Collect data. Versioned in db. Files managed following db data';

COMMENT ON COLUMN files.id IS 'primary key. used as filename in internal and cloud storage';

COMMENT ON COLUMN files.row_id IS 'associated row';

COMMENT ON COLUMN files.field_id IS 'associated field';

COMMENT ON COLUMN files.filename IS 'filename is set to this when exporting files';

COMMENT ON COLUMN files.url IS 'url to download the file at';

COMMENT ON COLUMN files.version IS 'is incremented on every edit of a pre-existing file. Enables clients to re-sync';

COMMENT ON COLUMN files.deleted IS 'marks if the file is deleted';

COMMENT ON COLUMN files.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN files.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN files.server_rev_at IS 'time of last edit on server';

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project readers, editors and managers can view files" ON files;

CREATE POLICY "project readers, editors and managers can view files" ON files
  FOR SELECT
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        rows
        INNER JOIN tables ON rows.table_id = tables.id
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        rows.id = files.row_id AND project_users.role IN ('project_manager', 'project_editor', 'project_reader')));

DROP POLICY IF EXISTS "project managers and editors can insert files" ON files;

CREATE POLICY "project managers and editors can insert files" ON files
  FOR INSERT
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        rows
        INNER JOIN tables ON rows.table_id = tables.id
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        rows.id = files.row_id AND project_users.role IN ('project_manager', 'project_editor')));

DROP POLICY IF EXISTS "project managers and editors can update files" ON files;

CREATE POLICY "project managers and editors can update files" ON files
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        rows
        INNER JOIN tables ON rows.table_id = tables.id
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        rows.id = files.row_id AND project_users.role IN ('project_manager', 'project_editor')));

DROP POLICY IF EXISTS "project managers and editors can delete files" ON files;

CREATE POLICY "project managers and editors can delete files" ON files
  FOR DELETE
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        rows
        INNER JOIN tables ON rows.table_id = tables.id
        INNER JOIN projects ON projects.id = tables.project_id
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        rows.id = files.row_id AND project_users.role IN ('project_manager', 'project_editor')));

ALTER publication supabase_realtime
  ADD TABLE files;

--
DROP TABLE IF EXISTS file_revs CASCADE;

CREATE TABLE file_revs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  row_id uuid DEFAULT NULL,
  file_id uuid DEFAULT NULL,
  field_id uuid DEFAULT NULL,
  filename text DEFAULT NULL,
  url text DEFAULT NULL,
  version integer DEFAULT NULL,
  deleted boolean DEFAULT FALSE,
  client_rev_at timestamp with time zone DEFAULT NULL,
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  rev text DEFAULT NULL,
  parent_rev text DEFAULT NULL,
  revisions text[] DEFAULT NULL,
  depth integer DEFAULT 0
);

CREATE INDEX ON file_revs USING btree (id);

CREATE INDEX ON file_revs USING btree (row_id);

CREATE INDEX ON file_revs USING btree (file_id);

CREATE INDEX ON file_revs USING btree (server_rev_at);

CREATE INDEX ON file_revs USING btree (rev);

CREATE INDEX ON file_revs USING btree (parent_rev);

CREATE INDEX ON file_revs USING btree (depth);

CREATE INDEX ON file_revs USING btree (deleted);

COMMENT ON TABLE file_revs IS 'Goal: Sync files and handle conflicts';

COMMENT ON COLUMN file_revs.id IS 'primary key';

COMMENT ON COLUMN file_revs.file_id IS 'key of table files';

COMMENT ON COLUMN file_revs.rev IS 'hashed value the fields: file_id, field_id, filename, hash, version, deleted';

COMMENT ON COLUMN file_revs.parent_rev IS 'hash of the previous revision';

COMMENT ON COLUMN file_revs.revisions IS 'array of hashes of all previous revisions';

COMMENT ON COLUMN file_revs.depth IS 'depth of the revision tree';

ALTER TABLE file_revs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated users can view file_revs" ON file_revs;

-- this is problematic
-- but there is no way to ensure references inside revs
-- so project and user's roles can not be found
-- TODO: find better solution
-- maybe: allow only users who are editor or manager in any project to read? Fetch this via auth.email()
CREATE POLICY "authenticated users can view file_revs" ON file_revs
  FOR SELECT
    USING (auth.role () = 'authenticated');

DROP POLICY IF EXISTS "authenticated users can insert file_revs" ON file_revs;

-- inserting possible BUT: revision trigger will fail depending on rls on files table
CREATE POLICY "authenticated users can insert file_revs" ON file_revs
  FOR INSERT
    WITH CHECK (auth.role () = 'authenticated');

DROP POLICY IF EXISTS "file_revs can not be updated" ON file_revs;

CREATE POLICY "file_revs can not be updated" ON file_revs
  FOR UPDATE
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "file_revs can not be deleted" ON file_revs;

CREATE POLICY "file_revs can not be deleted" ON file_revs
  FOR DELETE
    USING (FALSE);

ALTER publication supabase_realtime
  ADD TABLE file_revs;

--
DROP TABLE IF EXISTS version_types CASCADE;

CREATE TABLE version_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  sort smallint DEFAULT NULL,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON version_types USING btree (value);

CREATE INDEX ON version_types USING btree (sort);

CREATE INDEX ON version_types USING btree (server_rev_at);

CREATE INDEX ON version_types USING btree (deleted);

COMMENT ON TABLE version_types IS 'Goal: list of version_types';

COMMENT ON COLUMN version_types.value IS 'the version type. See: https://docs.npmjs.com/about-semantic-versioning';

COMMENT ON COLUMN version_types.value IS 'explains the version type';

COMMENT ON COLUMN version_types.sort IS 'enables sorting at will';

COMMENT ON COLUMN version_types.server_rev_at IS 'time of last edit on server';

INSERT INTO version_types (value, sort, comment)
  VALUES ('patch', 1, 'Backward compatible bug fixes'), ('minor', 2, 'Backward compatible new features'), ('major', 3, 'Changes that break backward compatibility')
ON CONFLICT ON CONSTRAINT version_types_pkey
  DO UPDATE SET
    comment = excluded.comment;

ALTER TABLE version_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view version types" ON version_types;

CREATE POLICY "Users can view version types" ON version_types
  FOR SELECT
    USING (TRUE);

ALTER publication supabase_realtime
  ADD TABLE version_types;

--
DROP TABLE IF EXISTS news CASCADE;

CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  time timestamp with time zone DEFAULT now(),
  version_type text DEFAULT 'minor' REFERENCES version_types (value) ON DELETE NO action ON UPDATE CASCADE,
  version text DEFAULT NULL,
  message text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON news USING btree (id);

CREATE INDEX ON news USING btree (time);

CREATE INDEX ON news USING btree (version_type);

CREATE INDEX ON news USING btree (deleted);

COMMENT ON TABLE project_users IS 'Goal: Inform users about changes to the app. Not versioned';

COMMENT ON COLUMN news.id IS 'primary key';

COMMENT ON COLUMN news.time IS 'time the news was created';

COMMENT ON COLUMN news.version_type IS 'associated version_type';

COMMENT ON COLUMN news.version IS 'version the news refers to';

COMMENT ON COLUMN news.message IS 'this is the news';

COMMENT ON COLUMN news.server_rev_at IS 'time of last edit on server';

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view news" ON news;

CREATE POLICY "Users can view news" ON news
  FOR SELECT
    USING (TRUE);

ALTER publication supabase_realtime
  ADD TABLE news;

--
DROP TABLE IF EXISTS news_delivery CASCADE;

CREATE TABLE news_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  news_id uuid DEFAULT NULL REFERENCES news (id) ON DELETE NO action ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users (id) ON DELETE NO action ON UPDATE CASCADE,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON news_delivery USING btree (id);

CREATE INDEX ON news_delivery USING btree (news_id);

CREATE INDEX ON news_delivery USING btree (user_id);

CREATE INDEX ON news_delivery USING btree (deleted);

COMMENT ON TABLE project_users IS 'Goal: Show new messages only once. Not versioned';

COMMENT ON COLUMN news_delivery.id IS 'primary key';

COMMENT ON COLUMN news_delivery.news_id IS 'associated news';

COMMENT ON COLUMN news_delivery.user_id IS 'associated user';

COMMENT ON COLUMN news_delivery.server_rev_at IS 'time of last edit on server';

ALTER TABLE news_delivery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own option types" ON news_delivery;

CREATE POLICY "Users can view their own option types" ON news_delivery
  FOR SELECT
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        users
        INNER JOIN news_delivery nd ON users.auth_user_id = nd.user_id
      WHERE
        nd.id = news_delivery.id));

ALTER publication supabase_realtime
  ADD TABLE news_delivery;

-- TODO: vector_layers
--comment on table vector_layers IS 'Goal: Bring your own vector layers. File and/or wms. Not versioned (not recorded and only added by manager)';
-- TODO: tile_layers
--comment on table tile_layers IS 'Goal: Bring your own raster layers. File and/or wms. Not versioned (not recorded and only added by manager)';
--
DROP TABLE IF EXISTS tile_layers CASCADE;

CREATE TABLE tile_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  label text DEFAULT NULL,
  url_template text DEFAULT NULL,
  subdomains text[] DEFAULT NULL,
  max_zoom decimal DEFAULT 19,
  min_zoom decimal DEFAULT 0,
  opacity decimal DEFAULT 1,
  wms_base_url text DEFAULT NULL,
  wms_format text DEFAULT NULL,
  wms_layers text[] DEFAULT NULL,
  wms_parameters jsonb DEFAULT NULL,
  wms_request text DEFAULT 'GetMap',
  wms_service text DEFAULT 'WMS',
  wms_styles text[] DEFAULT NULL,
  wms_transparent boolean DEFAULT FALSE,
  wms_version text DEFAULT NULL,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON tile_layers USING btree (id);

CREATE INDEX ON tile_layers USING btree (deleted);

COMMENT ON TABLE project_users IS 'Goal: Bring your own tile layers. Not versioned (not recorded and only added by manager). Field definitions, see: https://pub.dev/documentation/flutter_map/latest/flutter_map/flutter_map-library.html';

ALTER TABLE tile_layers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated users can view tile_layers" ON tile_layers;

CREATE POLICY "authenticated users can view tile_layers" ON tile_layers
  FOR SELECT
    USING (auth.role () = 'authenticated');

DROP POLICY IF EXISTS "project_managers can insert tile_layers" ON tile_layers;

-- inserting possible BUT: revision trigger will fail depending on rls on files table
CREATE POLICY "project_managers can insert tile_layers" ON tile_layers
  FOR INSERT
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        project_users.role = 'project_manager'));

DROP POLICY IF EXISTS "project_managers can update tile_layers" ON tile_layers;

CREATE POLICY "project_managers can update tile_layers" ON tile_layers
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        project_users.role = 'project_manager'));

DROP POLICY IF EXISTS "project_managers can delete tile_layers" ON tile_layers;

-- but: deletion restricted by reference in project_tile_layers
CREATE POLICY "project_managers can delete tile_layers" ON tile_layers
  FOR DELETE
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        project_users.role = 'project_manager'));

ALTER publication supabase_realtime
  ADD TABLE tile_layers;

--
DROP TABLE IF EXISTS project_tile_layers CASCADE;

CREATE TABLE project_tile_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  label text DEFAULT NULL,
  sort smallint DEFAULT 0,
  active boolean DEFAULT FALSE,
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  url_template text DEFAULT NULL,
  subdomains text[] DEFAULT NULL,
  max_zoom decimal DEFAULT 19,
  min_zoom decimal DEFAULT 0,
  opacity decimal DEFAULT 1,
  wms_base_url text DEFAULT NULL,
  wms_format text DEFAULT NULL,
  wms_layers text[] DEFAULT NULL,
  wms_parameters jsonb DEFAULT NULL,
  wms_request text DEFAULT 'GetMap',
  wms_service text DEFAULT 'WMS',
  wms_styles text[] DEFAULT NULL,
  wms_transparent boolean DEFAULT FALSE,
  wms_version text DEFAULT NULL,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON project_tile_layers USING btree (id);

CREATE INDEX ON project_tile_layers USING btree (sort);

CREATE INDEX ON project_tile_layers USING btree (deleted);

COMMENT ON TABLE project_users IS 'Goal: Bring your own tile layers. Not versioned (not recorded and only added by manager). Field definitions, see: https://pub.dev/documentation/flutter_map/latest/flutter_map/flutter_map-library.html';

ALTER TABLE project_tile_layers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project readers, editors and managers can view project_tile_layers" ON project_tile_layers;

CREATE POLICY "project readers, editors and managers can view project_tile_layers" ON project_tile_layers
  FOR SELECT
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        projects
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        projects.id = project_tile_layers.project_id AND project_users.role IN ('project_manager', 'project_editor', 'project_reader')));

DROP POLICY IF EXISTS "project managers can insert project_tile_layers" ON project_tile_layers;

CREATE POLICY "project managers can insert project_tile_layers" ON project_tile_layers
  FOR INSERT
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        projects
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        projects.id = project_tile_layers.project_id AND project_users.role = 'project_manager'));

DROP POLICY IF EXISTS "project managers can update project_tile_layers" ON project_tile_layers;

CREATE POLICY "project managers can update project_tile_layers" ON project_tile_layers
  FOR UPDATE
    WITH CHECK (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        projects
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        projects.id = project_tile_layers.project_id AND project_users.role = 'project_manager'));

DROP POLICY IF EXISTS "project managers can delete project_tile_layers" ON project_tile_layers;

CREATE POLICY "project managers can delete project_tile_layers" ON project_tile_layers
  FOR DELETE
    USING (auth.uid () IN (
      SELECT
        users.auth_user_id
      FROM
        projects
        INNER JOIN project_users ON projects.id = project_users.project_id
        INNER JOIN users ON users.email = project_users.user_email
      WHERE
        projects.id = project_tile_layers.project_id AND project_users.role = 'project_manager'));

ALTER publication supabase_realtime
  ADD TABLE project_tile_layers;

