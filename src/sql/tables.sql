START TRANSACTION;

SET CONSTRAINTS ALL DEFERRED;

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
  -- email needs to be unique
  -- project manager can list project users by email without knowing if this user already exists
  -- then user can create a login (= row in users table) and work in the project
  email text UNIQUE DEFAULT NULL,
  account_id uuid DEFAULT NULL,
  -- references accounts (id) on delete no action on update cascade,
  auth_user_id uuid DEFAULT NULL REFERENCES auth.users (id) ON DELETE NO action ON UPDATE CASCADE,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
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
  deleted integer DEFAULT 0 -- any more?:
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
  deleted integer DEFAULT 0, -- geometry?
  use_labels integer DEFAULT 0
  -- data?
);

CREATE UNIQUE INDEX account_name_idx ON projects (account_id, name)
WHERE
  deleted = 0;

CREATE INDEX ON projects USING btree (id);

CREATE INDEX ON projects USING btree (account_id);

CREATE INDEX ON projects USING btree (name);

CREATE INDEX ON projects USING btree (label);

CREATE INDEX ON projects USING btree (deleted);

CREATE INDEX ON projects USING btree (use_labels);

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
DROP TYPE IF EXISTS table_type CASCADE;

CREATE TYPE table_type AS enum (
  'standard',
  'value_list',
  'id_value_list'
);

DROP TYPE IF EXISTS table_rel_types_enum CASCADE;

CREATE TYPE table_rel_types_enum AS enum (
  '1',
  'n'
);

CREATE TYPE role_types_enum AS enum (
  'project_reader',
  'project_editor',
  'project_manager',
  'account_manager'
);

--
DROP TABLE IF EXISTS project_users CASCADE;

CREATE TABLE project_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE NO action ON UPDATE CASCADE,
  --user_id uuid default null references users (id) on delete no action on update cascade,
  user_email text NOT NULL,
  -- NO reference so project_user can be created before registering,
  ROLE role_types_enum DEFAULT 'project_reader',
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
);

CREATE UNIQUE INDEX project_users_project_email_idx ON project_users (project_id, user_email)
WHERE
  deleted = 0;

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

ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE project_users;

--
DROP TYPE IF EXISTS table_types_enum CASCADE;

CREATE TYPE table_types_enum AS enum (
  'standard',
  'value_list',
  'id_value_list'
);

--
DROP TABLE IF EXISTS tables CASCADE;

CREATE TABLE tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  -- project_id needs to exist for policies to work
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE NO action ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES tables (id) ON DELETE NO action ON UPDATE CASCADE,
  rel_type table_rel_types_enum DEFAULT 'n',
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  singular_label text DEFAULT NULL,
  row_label jsonb DEFAULT NULL,
  sort smallint DEFAULT NULL,
  type table_types_enum DEFAULT 'standard',
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
);

CREATE UNIQUE INDEX tables_project_name_idx ON tables (project_id, name)
WHERE
  deleted = 0;

CREATE INDEX ON tables USING btree (id);

CREATE INDEX ON tables USING btree (project_id);

CREATE INDEX ON tables USING btree (parent_id);

CREATE INDEX ON tables USING btree (name);

CREATE INDEX ON tables USING btree (label);

CREATE INDEX ON tables USING btree (sort);

CREATE INDEX ON tables USING btree (type);

CREATE INDEX ON tables USING btree (deleted);

COMMENT ON TABLE tables IS 'Goal: Define tables used per project. Rows and files depend on it. Not versioned (not recorded and only added by manager)';

COMMENT ON COLUMN tables.id IS 'primary key';

COMMENT ON COLUMN tables.project_id IS 'associated project';

COMMENT ON COLUMN tables.parent_id IS 'parent table';

COMMENT ON COLUMN tables.rel_type IS 'releation with parent table: 1:1 or 1:n';

COMMENT ON COLUMN tables.name IS 'name for use in db and url (lowercase, no special characters)';

COMMENT ON COLUMN tables.label IS 'name for use when labeling this table';

COMMENT ON COLUMN tables.sort IS 'enables ordering the tables of a project';

COMMENT ON COLUMN tables.row_label IS 'Array of objects with: 1. field id (to represent the value contained in that field) 2. text (as character separators) 3. index (representing the position in the label). Concatenated to label rows. Example value: {field: field_id, text: text, index: 1}';

COMMENT ON COLUMN tables.type IS 'What type of table will this be?';

COMMENT ON COLUMN tables.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN tables.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN tables.server_rev_at IS 'time of last edit on server';

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE tables;

--
--
--
DROP TABLE IF EXISTS field_types CASCADE;

CREATE TABLE field_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  sort smallint DEFAULT NULL,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
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

ALTER publication supabase_realtime
  ADD TABLE field_types;

--
DROP TABLE IF EXISTS widget_types CASCADE;

CREATE TABLE widget_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  needs_list integer DEFAULT 0,
  sort smallint DEFAULT NULL,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
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

INSERT INTO widget_types (value, needs_list, sort, comment)
  VALUES ('text', 0, 1, 'Short field accepting text'), ('textarea', 0, 2, 'Field accepting text, lines can break'), ('markdown', 0, 3, 'Field accepting text, expressing markdown'), ('options-2', 0, 4, 'single boolean field showing one option for true (active) and false (not active)'), ('options-3', 0, 5, 'single boolean field showing true, false and null'), ('options-few', 1, 7, 'short list, showing every entry'), ('options-many', 1, 8, 'long dropdown-list'), ('datepicker', 0, 9, 'enables choosing a date'), ('filepicker', 0, 10, 'enables choosing a file'), ('jes-no', 0, 6, 'boolean field presenting one option for true and false each'), ('datetimepicker', 0, 10, 'enables choosing a date-time'), ('timepicker', 0, 11, 'enables choosing time of day'), ('rich-text', 0, 12, 'enables rich formatting of text')
ON CONFLICT ON CONSTRAINT widget_types_value_key
  DO UPDATE SET
    comment = excluded.comment, sort = excluded.sort, needs_list = excluded.needs_list;

ALTER TABLE widget_types ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE widget_types;

--
DROP TABLE IF EXISTS widgets_for_fields CASCADE;

CREATE TABLE widgets_for_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  field_value text REFERENCES field_types (value) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_value text REFERENCES widget_types (value) ON DELETE CASCADE ON UPDATE CASCADE,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0,
  UNIQUE (field_value, widget_value)
);

CREATE INDEX ON widgets_for_fields USING btree (field_value);

CREATE INDEX ON widgets_for_fields USING btree (widget_value);

CREATE INDEX ON widgets_for_fields USING btree (server_rev_at);

CREATE INDEX ON widgets_for_fields USING btree (deleted);

COMMENT ON TABLE widgets_for_fields IS 'Goal: know what widgets can be choosen for what field_types';

COMMENT ON COLUMN widgets_for_fields.server_rev_at IS 'time of last edit on server';

INSERT INTO field_types (value, sort, comment)
  VALUES ('text', 1, 'Example: text'), ('boolean', 2, 'true or false'), ('integer', 3, 'Example: 1'), ('decimal', 4, 'Example: 1.1'), ('date', 5, 'Example: 2021-03-08'), ('date-time', 6, 'Timestamp with time zone. Example: 2021-03-08 10:23:54+01'), ('time', 7, 'Time of day. Example: 10:23'), ('file-reference', 8, 'the id of the file')
ON CONFLICT ON CONSTRAINT field_types_pkey
  DO UPDATE SET
    comment = excluded.comment;

ALTER TABLE widgets_for_fields ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE widgets_for_fields;

INSERT INTO widgets_for_fields (field_value, widget_value)
  VALUES ('text', 'text'), ('text', 'markdown'), ('boolean', 'options-2'), ('boolean', 'options-3'), ('integer', 'text'), ('decimal', 'text'), ('decimal', 'options-few'), ('decimal', 'options-many'), ('text', 'options-many'), ('integer', 'options-many'), ('text', 'options-few'), ('integer', 'options-few'), ('date', 'datepicker'), ('text', 'textarea'), ('file-reference', 'filepicker'), ('boolean', 'jes-no'), ('date-time', 'datetimepicker'), ('time', 'timepicker'), ('text', 'rich-text')
ON CONFLICT ON CONSTRAINT widgets_for_fields_field_value_widget_value_key
  DO NOTHING;

--
DROP TABLE IF EXISTS fields CASCADE;

CREATE TABLE fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  -- need table_id for policies
  table_id uuid NOT NULL REFERENCES tables (id) ON DELETE NO action ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  sort smallint DEFAULT 0,
  is_internal_id integer DEFAULT 0,
  field_type text DEFAULT NULL REFERENCES field_types (value) ON DELETE NO action ON UPDATE CASCADE,
  widget_type text DEFAULT NULL REFERENCES widget_types (value) ON DELETE NO action ON UPDATE CASCADE,
  options_table uuid REFERENCES tables (id) ON DELETE NO action ON UPDATE CASCADE,
  standard_value text DEFAULT NULL,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
);

ALTER TABLE fields
  ALTER COLUMN field_type SET DEFAULT NULL;

ALTER TABLE fields
  ALTER COLUMN widget_type SET DEFAULT NULL;

CREATE UNIQUE INDEX fields_table_name_idx ON fields (table_id, name)
WHERE
  deleted = 0;

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

COMMENT ON COLUMN fields.is_internal_id IS 'is this field used as an id in the users own system?';

COMMENT ON COLUMN fields.field_type IS 'what type of data will populate this field?';

COMMENT ON COLUMN fields.widget_type IS 'what type of widget shall be used to enter data?';

COMMENT ON COLUMN fields.options_table IS 'for fields with field_type options-few and options-many: what table contains the options?';

COMMENT ON COLUMN fields.standard_value IS 'Goal: Project-admin can pre-set standard values. These are either real values (that have to be converted from string when used and field_type is not a string). Or instructions like: last(), now()...';

COMMENT ON COLUMN fields.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN fields.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN fields.server_rev_at IS 'time of last edit on server';

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE fields;

--
DROP TABLE IF EXISTS ROWS CASCADE;

CREATE TABLE ROWS (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  table_id uuid NOT NULL REFERENCES tables (id) ON DELETE NO action ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES ROWS (id) ON DELETE NO action ON UPDATE CASCADE,
  geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  bbox jsonb DEFAULT NULL,
  data jsonb,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  rev text DEFAULT NULL,
  parent_rev text DEFAULT NULL,
  revisions text[] DEFAULT NULL,
  depth integer DEFAULT 0,
  deleted integer DEFAULT 0,
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

COMMENT ON COLUMN rows.bbox IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side';

COMMENT ON COLUMN rows.data IS 'fields (keys) and data (values) according to the related fields table';

COMMENT ON COLUMN rows.deleted IS 'marks if the row is deleted';

COMMENT ON COLUMN rows.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN rows.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN rows.server_rev_at IS 'time of last edit on server';

ALTER TABLE ROWS ENABLE ROW LEVEL SECURITY;

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
  bbox jsonb DEFAULT NULL,
  data jsonb,
  deleted integer DEFAULT 0,
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

--
CREATE TYPE line_cap_enum AS enum (
  'butt',
  'round',
  'square'
);

CREATE TYPE line_join_enum AS enum (
  'arcs',
  'bevel',
  'miter',
  'miter-clip',
  'round'
);

CREATE TYPE fill_rule_enum AS enum (
  'nonzero',
  'evenodd'
);

CREATE TYPE tile_layer_type_enum AS enum (
  'wms',
  'wmts'
  -- 'tms'
);

CREATE TYPE wms_version_enum AS enum (
  '1.1.1',
  '1.3.0'
);

--
--
DROP TABLE IF EXISTS tile_layers CASCADE;

CREATE TABLE tile_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  label text DEFAULT NULL,
  sort smallint DEFAULT 0,
  active integer DEFAULT 0,
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  type tile_layer_type_enum DEFAULT 'wmts',
  wmts_url_template text DEFAULT NULL,
  wmts_subdomains text[] DEFAULT NULL,
  max_zoom decimal DEFAULT 19,
  min_zoom decimal DEFAULT 0,
  opacity decimal DEFAULT 1,
  wms_base_url text DEFAULT NULL,
  wms_format text DEFAULT NULL,
  wms_layers text DEFAULT NULL,
  wms_parameters jsonb DEFAULT NULL,
  wms_styles text[] DEFAULT NULL,
  wms_transparent integer DEFAULT 0,
  wms_version wms_version_enum DEFAULT NULL,
  wms_info_format text DEFAULT NULL,
  wms_queryable integer DEFAULT NULL,
  greyscale integer DEFAULT 0,
  local_data_size integer DEFAULT NULL,
  local_data_bounds jsonb DEFAULT NULL,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
);

ALTER TABLE tile_layers
  ADD COLUMN local_data_size integer DEFAULT NULL;

ALTER TABLE tile_layers
  ADD COLUMN local_data_bounds jsonb DEFAULT NULL;

CREATE INDEX ON tile_layers USING btree (id);

CREATE INDEX ON tile_layers USING btree (sort);

CREATE INDEX ON tile_layers USING btree (deleted);

COMMENT ON TABLE tile_layers IS 'Goal: Bring your own tile layers. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN tile_layers.local_data_size IS 'Size of locally saved image data';

COMMENT ON COLUMN tile_layers.local_data_bounds IS 'Array of bounds and their size of locally saved image data';

ALTER TABLE tile_layers ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE tile_layers;

--
CREATE TYPE vector_layer_type_enum AS enum (
  'wfs',
  'upload'
);

DROP TABLE IF EXISTS vector_layers CASCADE;

CREATE TABLE vector_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  label text DEFAULT NULL,
  sort smallint DEFAULT 0,
  active integer DEFAULT 0,
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  type vector_layer_type_enum DEFAULT 'wfs',
  url text DEFAULT NULL, -- WFS url, for example https://maps.zh.ch/wfs/OGDZHWFS
  max_zoom decimal DEFAULT 19,
  min_zoom decimal DEFAULT 0,
  type_name text DEFAULT NULL, -- type name, for example ms:ogd-0119_giszhpub_feuchtgebietinv_79_90_beob_p
  wfs_version text DEFAULT NULL, -- often: 1.1.0 or 2.0.0
  output_format text DEFAULT NULL, -- need some form of json. TODO: Convert others?
  opacity integer DEFAULT 1,
  max_features integer DEFAULT 1000,
  feature_count integer DEFAULT NULL,
  point_count integer DEFAULT NULL,
  line_count integer DEFAULT NULL,
  polygon_count integer DEFAULT NULL,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
);

CREATE INDEX ON vector_layers USING btree (id);

CREATE INDEX ON vector_layers USING btree (sort);

CREATE INDEX ON vector_layers USING btree (deleted);

COMMENT ON TABLE vector_layers IS 'Goal: Bring your own tile layers. Either from wfs or importing GeoJSON. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN vector_layers.max_features IS 'maximum number of features to be loaded into a map';

COMMENT ON COLUMN vector_layers.feature_count IS 'Number of features. Set when downloaded features';

COMMENT ON COLUMN vector_layers.point_count IS 'Number of point features. Used to show styling for points - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.line_count IS 'Number of line features. Used to show styling for lines - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.polygon_count IS 'Number of polygon features. Used to show styling for polygons - or not. Set when downloaded features';

ALTER TABLE vector_layers ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE vector_layers;

--
CREATE TYPE marker_type_enum AS enum (
  'circle',
  'marker'
);

--
DROP TABLE IF EXISTS layer_styles CASCADE;

CREATE TABLE layer_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  table_id uuid UNIQUE DEFAULT NULL REFERENCES tables (id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid UNIQUE DEFAULT NULL REFERENCES vector_layers (id) ON DELETE CASCADE ON UPDATE CASCADE,
  marker_type marker_type_enum DEFAULT 'circle',
  circle_marker_radius integer DEFAULT 8,
  marker_symbol text DEFAULT NULL,
  marker_size integer DEFAULT 16,
  marker_weight integer DEFAULT NULL,
  stroke integer DEFAULT 1,
  color text DEFAULT '#3388ff',
  weight integer DEFAULT 3,
  opacity numeric(2, 1) DEFAULT 1.0,
  line_cap line_cap_enum DEFAULT 'round',
  line_join line_join_enum DEFAULT 'round',
  dash_array text DEFAULT NULL,
  dash_offset text DEFAULT NULL,
  fill integer DEFAULT 1,
  fill_color text DEFAULT NULL,
  fill_opacity numeric(2, 1) DEFAULT 0.2,
  fill_rule fill_rule_enum DEFAULT 'evenodd',
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
);

CREATE INDEX ON layer_styles USING btree (id);

CREATE INDEX ON layer_styles USING btree (table_id);

CREATE INDEX ON layer_styles USING btree (deleted);

COMMENT ON TABLE layer_styles IS 'Goal: style table layers, project tile layers and project vector layers';

COMMENT ON COLUMN layer_styles.id IS 'primary key';

COMMENT ON COLUMN layer_styles.table_id IS 'associated table';

COMMENT ON COLUMN layer_styles.marker_symbol IS 'Name of the symbol used for the marker';

COMMENT ON COLUMN layer_styles.marker_size IS 'Size in pixels of the symbol used for the marker. Defaults to 16';

COMMENT ON COLUMN layer_styles.stroke IS 'Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles. https://leafletjs.com/reference.html#path-stroke';

COMMENT ON COLUMN layer_styles.color IS 'Stroke color. https://leafletjs.com/reference.html#path-color';

COMMENT ON COLUMN layer_styles.weight IS 'Stroke width in pixels. https://leafletjs.com/reference.html#path-weight';

COMMENT ON COLUMN layer_styles.opacity IS 'Stroke opacity. https://leafletjs.com/reference.html#path-opacity';

COMMENT ON COLUMN layer_styles.line_cap IS 'A string that defines shape to be used at the end of the stroke. https://leafletjs.com/reference.html#path-linecap. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap';

COMMENT ON COLUMN layer_styles.line_join IS 'A string that defines shape to be used at the corners of the stroke. https://leafletjs.com/reference.html#path-linejoin, https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin#usage_context';

COMMENT ON COLUMN layer_styles.dash_array IS 'A string that defines the stroke dash pattern. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dasharray. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray';

COMMENT ON COLUMN layer_styles.dash_offset IS 'A string that defines the distance into the dash pattern to start the dash. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dashoffset. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset';

COMMENT ON COLUMN layer_styles.fill IS 'Whether to fill the path with color. Set it to false to disable filling on polygons or circles. https://leafletjs.com/reference.html#path-fill';

COMMENT ON COLUMN layer_styles.fill_color IS 'Fill color. Defaults to the value of the color option. https://leafletjs.com/reference.html#path-fillcolor';

COMMENT ON COLUMN layer_styles.fill_opacity IS 'Fill opacity. https://leafletjs.com/reference.html#path-fillopacity';

COMMENT ON COLUMN layer_styles.fill_rule IS 'A string that defines how the inside of a shape is determined. https://leafletjs.com/reference.html#path-fillrule. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule';

COMMENT ON COLUMN layer_styles.deleted IS 'marks if the row is deleted';

COMMENT ON COLUMN layer_styles.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN layer_styles.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN layer_styles.server_rev_at IS 'time of last edit on server';

ALTER TABLE layer_styles ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE layer_styles;

--
DROP TABLE IF EXISTS files_meta CASCADE;

CREATE TABLE files_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  row_id uuid NOT NULL REFERENCES ROWS (id) ON DELETE NO action ON UPDATE CASCADE,
  field_id uuid DEFAULT NULL REFERENCES fields (id) ON DELETE NO action ON UPDATE CASCADE,
  name text DEFAULT NULL,
  type text DEFAULT NULL, -- https://en.wikipedia.org/wiki/Media_type
  deleted integer DEFAULT 0,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  rev text DEFAULT NULL,
  parent_rev text DEFAULT NULL,
  revisions text[] DEFAULT NULL,
  depth integer DEFAULT 0,
  conflicts text[] DEFAULT NULL
);

CREATE INDEX ON files_meta USING btree (id);

CREATE INDEX ON files_meta USING btree (row_id);

CREATE INDEX ON files_meta USING btree (field_id);

CREATE INDEX ON files_meta USING btree (name);

CREATE INDEX ON files_meta USING btree (type);

-- enables listing images
CREATE INDEX ON ROWS USING btree (deleted);

COMMENT ON TABLE files_meta IS 'Goal: Collect data. Versioned in db. Files managed following db data';

COMMENT ON COLUMN files_meta.id IS 'primary key. This is used to name the file in storage';

COMMENT ON COLUMN files_meta.row_id IS 'associated row';

COMMENT ON COLUMN files_meta.field_id IS 'associated field';

COMMENT ON COLUMN files_meta.name IS 'filename is set to this when exporting files';

COMMENT ON COLUMN files_meta.type IS '(media) type of the file. See: https://en.wikipedia.org/wiki/Media_type';

COMMENT ON COLUMN files_meta.deleted IS 'marks if the file is deleted';

COMMENT ON COLUMN files_meta.client_rev_at IS 'time of last edit on client';

COMMENT ON COLUMN files_meta.client_rev_by IS 'user editing last on client';

COMMENT ON COLUMN files_meta.server_rev_at IS 'time of last edit on server';

ALTER TABLE files_meta ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE files_meta;

--
DROP TABLE IF EXISTS files_meta_revs CASCADE;

CREATE TABLE files_meta_revs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  row_id uuid DEFAULT NULL,
  file_id uuid DEFAULT NULL,
  field_id uuid DEFAULT NULL,
  name text DEFAULT NULL,
  type text DEFAULT NULL,
  deleted integer DEFAULT 0,
  client_rev_at timestamp with time zone DEFAULT NULL,
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  rev text DEFAULT NULL,
  parent_rev text DEFAULT NULL,
  revisions text[] DEFAULT NULL,
  depth integer DEFAULT 0
);

CREATE INDEX ON files_meta_revs USING btree (id);

CREATE INDEX ON files_meta_revs USING btree (row_id);

CREATE INDEX ON files_meta_revs USING btree (file_id);

CREATE INDEX ON files_meta_revs USING btree (server_rev_at);

CREATE INDEX ON files_meta_revs USING btree (rev);

CREATE INDEX ON files_meta_revs USING btree (parent_rev);

CREATE INDEX ON files_meta_revs USING btree (depth);

CREATE INDEX ON files_meta_revs USING btree (deleted);

COMMENT ON TABLE files_meta_revs IS 'Goal: Sync files and handle conflicts';

COMMENT ON COLUMN files_meta_revs.id IS 'primary key';

COMMENT ON COLUMN files_meta_revs.file_id IS 'key of table files_meta';

COMMENT ON COLUMN files_meta_revs.rev IS 'hashed value the fields: file_id, field_id, name, hash, version, deleted';

COMMENT ON COLUMN files_meta_revs.parent_rev IS 'hash of the previous revision';

COMMENT ON COLUMN files_meta_revs.revisions IS 'array of hashes of all previous revisions';

COMMENT ON COLUMN files_meta_revs.depth IS 'depth of the revision tree';

ALTER TABLE files_meta_revs ENABLE ROW LEVEL SECURITY;

--
DROP TABLE IF EXISTS version_types CASCADE;

CREATE TABLE version_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  value text UNIQUE,
  sort smallint DEFAULT NULL,
  comment text,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
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
  deleted integer DEFAULT 0
);

CREATE INDEX ON news USING btree (id);

CREATE INDEX ON news USING btree (time);

CREATE INDEX ON news USING btree (version_type);

CREATE INDEX ON news USING btree (deleted);

COMMENT ON TABLE news IS 'Goal: Inform users about changes to the app. Not versioned';

COMMENT ON COLUMN news.id IS 'primary key';

COMMENT ON COLUMN news.time IS 'time the news was created';

COMMENT ON COLUMN news.version_type IS 'associated version_type';

COMMENT ON COLUMN news.version IS 'version the news refers to';

COMMENT ON COLUMN news.message IS 'this is the news';

COMMENT ON COLUMN news.server_rev_at IS 'time of last edit on server';

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE news;

--
DROP TABLE IF EXISTS news_delivery CASCADE;

CREATE TABLE news_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  news_id uuid DEFAULT NULL REFERENCES news (id) ON DELETE NO action ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users (id) ON DELETE NO action ON UPDATE CASCADE,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
);

CREATE INDEX ON news_delivery USING btree (id);

CREATE INDEX ON news_delivery USING btree (news_id);

CREATE INDEX ON news_delivery USING btree (user_id);

CREATE INDEX ON news_delivery USING btree (deleted);

COMMENT ON TABLE news_delivery IS 'Goal: Show new messages only once. Not versioned';

COMMENT ON COLUMN news_delivery.id IS 'primary key';

COMMENT ON COLUMN news_delivery.news_id IS 'associated news';

COMMENT ON COLUMN news_delivery.user_id IS 'associated user';

COMMENT ON COLUMN news_delivery.server_rev_at IS 'time of last edit on server';

ALTER TABLE news_delivery ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE news_delivery;

--
-- seperate from vector_layers because pvl : pvl_geoms = 1 : n
-- this way bbox can be used to load only what is in view
DROP TABLE IF EXISTS pvl_geoms CASCADE;

CREATE TABLE pvl_geoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  pvl_id uuid DEFAULT NULL REFERENCES vector_layers (id) ON DELETE CASCADE ON UPDATE CASCADE,
  geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  properties jsonb DEFAULT NULL,
  bbox_sw_lng real DEFAULT NULL,
  bbox_sw_lat real DEFAULT NULL,
  bbox_ne_lng real DEFAULT NULL,
  bbox_ne_lat real DEFAULT NULL,
  client_rev_at timestamp with time zone DEFAULT now(),
  client_rev_by text DEFAULT NULL,
  server_rev_at timestamp with time zone DEFAULT now(),
  deleted integer DEFAULT 0
);

CREATE INDEX ON pvl_geoms USING btree (id);

CREATE INDEX ON pvl_geoms USING btree (pvl_id);

COMMENT ON TABLE pvl_geoms IS 'Goal: Save vector layers client side for 1. offline usage 2. better filtering (to viewport). Data is downloaded when manager configures vector layer. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN pvl_geoms.pvl_id IS 'related vector_layers row';

COMMENT ON COLUMN pvl_geoms.geometry IS 'geometry-collection of this row';

COMMENT ON COLUMN pvl_geoms.properties IS 'properties of this row';

COMMENT ON COLUMN pvl_geoms.bbox_sw_lng IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN pvl_geoms.bbox_sw_lat IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN pvl_geoms.bbox_ne_lng IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN pvl_geoms.bbox_ne_lat IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

ALTER TABLE pvl_geoms ENABLE ROW LEVEL SECURITY;

ALTER publication supabase_realtime
  ADD TABLE pvl_geoms;

-- not needed because only used client side:
-- CREATE INDEX ON pvl_geoms USING gist (geometry);
-- CREATE INDEX ON pvl_geoms USING gin (properties);
--+--
-- IMPORTANT: create functions at end but before policies
-- to ensure they never reference a structur not yet created
--
--
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_own_account (_auth_user_id uuid, _account_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users au
        INNER JOIN public.users pu ON au.id = pu.auth_user_id
      WHERE
        pu.account_id = _account_id
        AND au.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
--
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_account_owner_by_project_user (_auth_user_id uuid, _project_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users au
        INNER JOIN public.users pu ON au.id = pu.auth_user_id
        INNER JOIN project_users ON project_users.user_email = pu.email
        INNER JOIN projects ON projects.id = project_users.project_id
      WHERE
        au.id = _auth_user_id
        AND projects.account_id = pu.account_id
        AND projects.id = _project_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
-- is_project_user is in tables to guarantee correct series of events when creating policies
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_user (_auth_user_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
-- is_news_delivery_user is in tables to guarantee correct series of events when creating policies
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_news_delivery_user (_auth_user_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users au
        INNER JOIN public.users pu ON pu.auth_user_id = au.id
        INNER JOIN news_delivery ON pu.id = news_delivery.user_id
      WHERE
        au.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
-- is_project_user_by_project is in tables to guarantee correct series of events when creating policies
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_user_by_project (_auth_user_id uuid, _project_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        project_users.project_id = _project_id
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
-- is_project_user_by_table is in tables to guarantee correct series of events when creating policies
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_user_by_table (_auth_user_id uuid, _table_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tables ON tables.project_id = projects.id
      WHERE
        tables.id = _table_id
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
CREATE OR REPLACE FUNCTION is_project_user_by_tile_layer (_auth_user_id uuid, _tile_layer_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tile_layers ON tile_layers.project_id = projects.id
      WHERE
        tile_layers.id = _tile_layer_id
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_project_manager_by_tile_layer (_auth_user_id uuid, _tile_layer_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tile_layers ON tile_layers.project_id = projects.id
      WHERE
        tile_layers.id = _tile_layer_id
        AND project_users.role IN ('account_manager', 'project_manager')
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

--
CREATE OR REPLACE FUNCTION is_project_user_by_vector_layer (_auth_user_id uuid, _vector_layer_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN vector_layers ON vector_layers.project_id = projects.id
      WHERE
        vector_layers.id = _vector_layer_id
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_project_manager_by_vector_layer (_auth_user_id uuid, _vector_layer_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN vector_layers ON vector_layers.project_id = projects.id
      WHERE
        vector_layers.id = _vector_layer_id
        AND project_users.role IN ('account_manager', 'project_manager')
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

--
-- is_project_user_by_row is in tables to guarantee correct series of events when creating policies
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_user_by_row (_auth_user_id uuid, _row_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tables ON tables.project_id = projects.id
        INNER JOIN ROWS ON rows.table_id = tables.id
      WHERE
        rows.id = _row_id
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_editor_or_manager_by_project (_auth_user_id uuid, _project_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        project_users.project_id = _project_id
        AND project_users.role IN ('account_manager', 'project_manager', 'project_editor')
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_project_user_by_file_meta (_auth_user_id uuid, _file_meta_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tables ON tables.project_id = projects.id
        INNER JOIN ROWS ON rows.table_id = tables.id
        INNER JOIN files_meta ON files_meta.row_id = rows.id
      WHERE
        files_meta.id = _file_meta_id
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_project_editor_or_manager_by_file_meta (_auth_user_id uuid, _file_meta_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tables ON tables.project_id = projects.id
        INNER JOIN ROWS ON rows.table_id = tables.id
        INNER JOIN files_meta ON files_meta.row_id = rows.id
      WHERE
        files_meta.id = _file_meta_id
        AND project_users.role IN ('account_manager', 'project_manager', 'project_editor')
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
--
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_editor_or_manager_by_table (_auth_user_id uuid, _table_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tables ON tables.project_id = projects.id
      WHERE
        tables.id = _table_id
        AND project_users.role IN ('account_manager', 'project_manager', 'project_editor')
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
--
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_editor_or_manager_by_row (_auth_user_id uuid, _row_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tables ON tables.project_id = projects.id
        INNER JOIN ROWS ON rows.table_id = tables.id
      WHERE
        rows.id = _row_id
        AND project_users.role IN ('account_manager', 'project_manager', 'project_editor')
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_manager (_auth_user_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        project_users.role IN ('account_manager', 'project_manager')
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
--
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_manager_by_project (_auth_user_id uuid, _project_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
      WHERE
        project_users.project_id = _project_id
        AND project_users.role IN ('account_manager', 'project_manager')
        AND users.id = _auth_user_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
--
-- Parameters need to be prefixed because the name clashes with column names
CREATE OR REPLACE FUNCTION is_project_manager_by_project_by_table (_auth_user_id uuid, _table_id uuid)
  RETURNS bool
  AS $$
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        auth.users users
        INNER JOIN project_users ON users.email = project_users.user_email
        INNER JOIN projects ON projects.id = project_users.project_id
        INNER JOIN tables ON tables.project_id = projects.id
      WHERE
        project_users.role IN ('account_manager', 'project_manager')
        AND users.id = _auth_user_id
        AND tables.id = _table_id);

$$
LANGUAGE sql
SECURITY DEFINER;

-- Function is owned by postgres which bypasses RLS
--
--
-- IMPORTANT: create policies the end
-- to ensure they never reference a structur not yet created
--
--
INSERT INTO storage.buckets (id, name)
  VALUES ('files', 'files');

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restricted Access" ON storage.objects
  FOR SELECT
  -- USING (is_project_user_by_file_meta (auth.uid (), id));
    USING (auth.role () = 'authenticated');

CREATE POLICY "Restricted insert" ON storage.objects
  FOR INSERT
  -- WITH CHECK (is_project_editor_or_manager_by_file_meta (auth.uid (), id));
    WITH CHECK (auth.role () = 'authenticated');

--
-- TODO: remove after next new creation
DROP POLICY IF EXISTS "project owners and same user can view project_users" ON project_users;

DROP POLICY IF EXISTS "account owners and same user can view project_users" ON project_users;

CREATE POLICY "account owners and same user can view project_users" ON project_users
  FOR SELECT
    USING (is_account_owner_by_project_user (auth.uid (), project_id)
      OR auth.uid () IN (
      -- same user
        SELECT
          users.auth_user_id FROM users
          WHERE
            email = user_email));

-- TODO: remove after next new creation
DROP POLICY IF EXISTS "project owners can insert project_users" ON project_users;

DROP POLICY IF EXISTS "account owners can insert project_users" ON project_users;

CREATE POLICY "account owners can insert project_users" ON project_users
  FOR INSERT
    WITH CHECK (is_account_owner_by_project_user (auth.uid (), project_id));

DROP POLICY IF EXISTS "project owners can update project_users" ON project_users;

CREATE POLICY "project owners can update project_users" ON project_users
  FOR UPDATE
    USING (is_account_owner_by_project_user (auth.uid (), project_id)
      OR auth.uid () IN (
      -- same user
      SELECT users.auth_user_id FROM users
      WHERE
        email = user_email))
    WITH CHECK (is_account_owner_by_project_user (auth.uid (), project_id));

DROP POLICY IF EXISTS "project owners can delete project_users" ON project_users;

CREATE POLICY "project owners can delete project_users" ON project_users
  FOR DELETE
    USING (is_account_owner_by_project_user (auth.uid (), project_id));

---
--
-- now that project_users is created, can define policies for projects as they reference project_users
DROP POLICY IF EXISTS "Users can view assigned projects and projects of own accounts" ON projects;

CREATE POLICY "Users can view assigned projects and projects of own accounts" ON projects
  FOR SELECT
    USING (is_project_user_by_project (auth.uid (), id)
      OR is_own_account (auth.uid (), account_id));

-- CREATE POLICY "Users can view assigned projects and projects of own accounts" ON projects
--   FOR SELECT
--     USING (TRUE);
DROP POLICY IF EXISTS "account owners can insert projects for own account" ON projects;

CREATE POLICY "account owners can insert projects for own account" ON projects
  FOR INSERT
    WITH CHECK (is_own_account (auth.uid (), account_id));

DROP POLICY IF EXISTS "Users can update projects assigned and of own accounts" ON projects;

CREATE POLICY "Users can update projects assigned and of own accounts" ON projects
  FOR UPDATE
    USING (is_project_user_by_project (auth.uid (), id)
      OR is_own_account (auth.uid (), account_id))
      WITH CHECK (is_project_editor_or_manager_by_project (auth.uid (), id)
      OR is_own_account (auth.uid (), account_id));

DROP POLICY IF EXISTS "account owners can delete own projects" ON projects;

CREATE POLICY "account owners can delete own projects" ON projects
  FOR DELETE
    USING (is_own_account (auth.uid (), account_id));

DROP POLICY IF EXISTS "project readers, editors and managers can view tables" ON tables;

CREATE POLICY "project readers, editors and managers can view tables" ON tables
  FOR SELECT
    USING (is_project_user_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can insert tables" ON tables;

CREATE POLICY "project managers can insert tables" ON tables
  FOR INSERT
    WITH CHECK (is_project_manager_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can update tables" ON tables;

CREATE POLICY "project managers can update tables" ON tables
  FOR UPDATE
    USING (is_project_user_by_project (auth.uid (), project_id))
    WITH CHECK (is_project_manager_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can delete tables" ON tables;

CREATE POLICY "project managers can delete tables" ON tables
  FOR DELETE
    USING (is_project_manager_by_project (auth.uid (), project_id));

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
    USING (auth.uid () = users.auth_user_id)
    WITH CHECK (auth.uid () = users.auth_user_id);

DROP POLICY IF EXISTS "Users can view own account" ON accounts;

CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT
    USING (is_own_account (auth.uid (), id));

DROP POLICY IF EXISTS "Users can insert own account" ON accounts;

CREATE POLICY "Users can insert own account" ON accounts
  FOR INSERT
    WITH CHECK (is_own_account (auth.uid (), id));

DROP POLICY IF EXISTS "Users can update own account" ON accounts;

CREATE POLICY "Users can update own account" ON accounts
  FOR UPDATE
    USING (is_own_account (auth.uid (), id))
    WITH CHECK (is_own_account (auth.uid (), id));

DROP POLICY IF EXISTS "Users cant delete accounts" ON accounts;

CREATE POLICY "Users cant delete accounts" ON accounts
  FOR DELETE
    USING (FALSE);

DROP POLICY IF EXISTS "Users can view layer styles" ON layer_styles;

-- TODO: add OR is_project_user_by_vector_layer
CREATE POLICY "Users can view layer styles" ON layer_styles
  FOR SELECT
    USING (is_project_user_by_table (auth.uid (), table_id)
      OR is_project_user_by_vector_layer (auth.uid (), vector_layer_id));

-- TODO: add OR is_project_user_by_vector_layer
DROP POLICY IF EXISTS "Managers can insert layer styles" ON layer_styles;

CREATE POLICY "Managers can insert layer styles" ON layer_styles
  FOR INSERT
    WITH CHECK (is_project_manager_by_project_by_table (auth.uid (), table_id)
    OR is_project_manager_by_vector_layer (auth.uid (), vector_layer_id));

-- TODO: add OR is_project_user_by_vector_layer
DROP POLICY IF EXISTS "Managers can update insert layer styles" ON layer_styles;

CREATE POLICY "Managers can update insert layer styles" ON layer_styles
  FOR UPDATE
    USING (is_project_user_by_table (auth.uid (), table_id)
      OR is_project_user_by_vector_layer (auth.uid (), vector_layer_id))
      WITH CHECK (is_project_manager_by_project_by_table (auth.uid (), table_id)
      OR is_project_manager_by_vector_layer (auth.uid (), vector_layer_id));

-- TODO: add OR is_project_user_by_vector_layer
DROP POLICY IF EXISTS "Managers can delete layer styles" ON layer_styles;

CREATE POLICY "Managers can delete layer styles" ON layer_styles
  FOR DELETE
    USING (is_project_manager_by_project_by_table (auth.uid (), table_id)
      OR is_project_manager_by_vector_layer (auth.uid (), vector_layer_id));

DROP POLICY IF EXISTS "Users can view field types" ON field_types;

CREATE POLICY "Users can view field types" ON field_types
  FOR SELECT
    USING (is_project_user (auth.uid ()));

DROP POLICY IF EXISTS "Users can view widget types" ON widget_types;

CREATE POLICY "Users can view widget types" ON widget_types
  FOR SELECT
    USING (is_project_user (auth.uid ()));

DROP POLICY IF EXISTS "Users can view widgets for fields" ON widgets_for_fields;

CREATE POLICY "Users can view widgets for fields" ON widgets_for_fields
  FOR SELECT
    USING (is_project_user (auth.uid ()));

DROP POLICY IF EXISTS "project readers, editors and managers can view fields" ON fields;

CREATE POLICY "project readers, editors and managers can view fields" ON fields
  FOR SELECT
    USING (is_project_user_by_table (auth.uid (), table_id));

DROP POLICY IF EXISTS "project managers can insert fields" ON fields;

CREATE POLICY "project managers can insert fields" ON fields
  FOR INSERT
    WITH CHECK (is_project_manager_by_project_by_table (auth.uid (), table_id));

DROP POLICY IF EXISTS "project managers can update fields" ON fields;

CREATE POLICY "project managers can update fields" ON fields
  FOR UPDATE
    USING (is_project_user_by_table (auth.uid (), table_id))
    WITH CHECK (is_project_manager_by_project_by_table (auth.uid (), table_id));

DROP POLICY IF EXISTS "project managers can delete fields" ON fields;

CREATE POLICY "project managers can delete fields" ON fields
  FOR DELETE
    USING (is_project_manager_by_project_by_table (auth.uid (), table_id));

DROP POLICY IF EXISTS "project readers, editors and managers can view rows" ON ROWS;

CREATE POLICY "project readers, editors and managers can view rows" ON ROWS
  FOR SELECT
    USING (is_project_user_by_table (auth.uid (), table_id));

DROP POLICY IF EXISTS "project managers and editors can insert rows" ON ROWS;

CREATE POLICY "project managers and editors can insert rows" ON ROWS
  FOR INSERT
    WITH CHECK (is_project_editor_or_manager_by_table (auth.uid (), table_id));

DROP POLICY IF EXISTS "project managers and editors can update rows" ON ROWS;

CREATE POLICY "project managers and editors can update rows" ON ROWS
  FOR UPDATE
    USING (is_project_user_by_table (auth.uid (), table_id))
    WITH CHECK (is_project_editor_or_manager_by_table (auth.uid (), table_id));

DROP POLICY IF EXISTS "project managers and editors can delete rows" ON ROWS;

CREATE POLICY "project managers and editors can delete rows" ON ROWS
  FOR DELETE
    USING (is_project_editor_or_manager_by_table (auth.uid (), table_id));

-- this is problematic
-- but there is no way to ensure references inside revs
-- so project and user's roles can not be found
-- TODO: find better solution
-- maybe: allow only users who are editor or manager in any project to read? Fetch this via auth.email()
DROP POLICY IF EXISTS "authenticated users can view row_revs" ON row_revs;

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

DROP POLICY IF EXISTS "project readers, editors and managers can view files" ON files_meta;

CREATE POLICY "project readers, editors and managers can view files" ON files_meta
  FOR SELECT
    USING (is_project_user_by_row (auth.uid (), row_id));

DROP POLICY IF EXISTS "project managers and editors can insert files" ON files_meta;

CREATE POLICY "project managers and editors can insert files" ON files_meta
  FOR INSERT
    WITH CHECK (is_project_editor_or_manager_by_row (auth.uid (), row_id));

DROP POLICY IF EXISTS "project managers and editors can update files" ON files_meta;

CREATE POLICY "project managers and editors can update files" ON files_meta
  FOR UPDATE
    USING (is_project_user_by_row (auth.uid (), row_id))
    WITH CHECK (is_project_editor_or_manager_by_row (auth.uid (), row_id));

DROP POLICY IF EXISTS "project managers and editors can delete files" ON files_meta;

CREATE POLICY "project managers and editors can delete files" ON files_meta
  FOR DELETE
    USING (is_project_editor_or_manager_by_row (auth.uid (), row_id));

DROP POLICY IF EXISTS "authenticated users can view files_meta_revs" ON files_meta_revs;

-- this is problematic
-- but there is no way to ensure references inside revs
-- so project and user's roles can not be found
-- TODO: find better solution
-- maybe: allow only users who are editor or manager in any project to read? Fetch this via auth.email()
CREATE POLICY "authenticated users can view files_meta_revs" ON files_meta_revs
  FOR SELECT
    USING (auth.role () = 'authenticated');

DROP POLICY IF EXISTS "authenticated users can insert files_meta_revs" ON files_meta_revs;

-- inserting possible BUT: revision trigger will fail depending on rls on files table
CREATE POLICY "authenticated users can insert files_meta_revs" ON files_meta_revs
  FOR INSERT
    WITH CHECK (auth.role () = 'authenticated');

DROP POLICY IF EXISTS "files_meta_revs can not be updated" ON files_meta_revs;

CREATE POLICY "files_meta_revs can not be updated" ON files_meta_revs
  FOR UPDATE
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "files_meta_revs can not be deleted" ON files_meta_revs;

CREATE POLICY "files_meta_revs can not be deleted" ON files_meta_revs
  FOR DELETE
    USING (FALSE);

DROP POLICY IF EXISTS "Users can view version types" ON version_types;

CREATE POLICY "Users can view version types" ON version_types
  FOR SELECT
    USING (is_project_user (auth.uid ()));

DROP POLICY IF EXISTS "Users can view news" ON news;

CREATE POLICY "Users can view news" ON news
  FOR SELECT
    USING (is_project_user (auth.uid ()));

DROP POLICY IF EXISTS "Users can view their own news delivery" ON news_delivery;

CREATE POLICY "Users can view their own news delivery" ON news_delivery
  FOR SELECT
    USING (is_news_delivery_user (auth.uid ()));

DROP POLICY IF EXISTS "project readers, editors and managers can view tile_layers" ON tile_layers;

CREATE POLICY "project readers, editors and managers can view tile_layers" ON tile_layers
  FOR SELECT
    USING (is_project_user_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can insert tile_layers" ON tile_layers;

CREATE POLICY "project managers can insert tile_layers" ON tile_layers
  FOR INSERT
    WITH CHECK (is_project_manager_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can update tile_layers" ON tile_layers;

CREATE POLICY "project managers can update tile_layers" ON tile_layers
  FOR UPDATE
    USING (is_project_user_by_project (auth.uid (), project_id))
    WITH CHECK (is_project_manager_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can delete tile_layers" ON tile_layers;

CREATE POLICY "project managers can delete tile_layers" ON tile_layers
  FOR DELETE
    USING (is_project_manager_by_project (auth.uid (), project_id));

--
DROP POLICY IF EXISTS "project readers, editors and managers can view vector_layers" ON vector_layers;

CREATE POLICY "project readers, editors and managers can view vector_layers" ON vector_layers
  FOR SELECT
    USING (is_project_user_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can insert vector_layers" ON vector_layers;

CREATE POLICY "project managers can insert vector_layers" ON vector_layers
  FOR INSERT
    WITH CHECK (is_project_manager_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can update vector_layers" ON vector_layers;

CREATE POLICY "project managers can update vector_layers" ON vector_layers
  FOR UPDATE
    USING (is_project_user_by_project (auth.uid (), project_id))
    WITH CHECK (is_project_manager_by_project (auth.uid (), project_id));

DROP POLICY IF EXISTS "project managers can delete vector_layers" ON vector_layers;

CREATE POLICY "project managers can delete vector_layers" ON vector_layers
  FOR DELETE
    USING (is_project_manager_by_project (auth.uid (), project_id));

--
DROP POLICY IF EXISTS "project readers, editors and managers can view vector_layers geometries" ON pvl_geoms;

CREATE POLICY "project readers, editors and managers can view vector_layers geometries" ON pvl_geoms
  FOR SELECT
    USING (is_project_user_by_tile_layer (auth.uid (), pvl_id));

DROP POLICY IF EXISTS "project managers can insert vector_layers geometries" ON pvl_geoms;

CREATE POLICY "project managers can insert vector_layers geometries" ON pvl_geoms
  FOR INSERT
    WITH CHECK (is_project_manager_by_tile_layer (auth.uid (), pvl_id));

DROP POLICY IF EXISTS "project managers can update vector_layers geometries" ON pvl_geoms;

CREATE POLICY "project managers can update vector_layers geometries" ON pvl_geoms
  FOR UPDATE
    USING (is_project_user_by_tile_layer (auth.uid (), pvl_id))
    WITH CHECK (is_project_manager_by_tile_layer (auth.uid (), pvl_id));

DROP POLICY IF EXISTS "project managers can delete vector_layers geometries" ON pvl_geoms;

CREATE POLICY "project managers can delete vector_layers geometries" ON pvl_geoms
  FOR DELETE
    USING (is_project_manager_by_tile_layer (auth.uid (), pvl_id));

COMMIT TRANSACTION;

-- add some triggers
-- ensure a project's owner is set as it's user
CREATE OR REPLACE FUNCTION projects_set_project_user ()
  RETURNS TRIGGER
  AS $$
BEGIN
  INSERT INTO project_users (project_id, user_email, ROLE)
  SELECT
    NEW.id AS project_id,
    users.email AS user_email,
    'account_manager' AS role
  FROM
    accounts
    INNER JOIN users ON accounts.id = users.account_id
  WHERE
    accounts.id = NEW.account_id;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER projects_set_project_user
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE PROCEDURE projects_set_project_user ();

-- ensure user has auth_user_id set
CREATE OR REPLACE FUNCTION users_set_auth_user_id ()
  RETURNS TRIGGER
  AS $$
BEGIN
  UPDATE
    public.users
  SET
    auth_user_id = NEW.id
  WHERE
    email = NEW.email;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER users_set_auth_user_id
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE users_set_auth_user_id ();

-- add test-data
-- 1. create new user with email alex.barbalex@gmail.com
INSERT INTO accounts (service_id)
  VALUES ('test');

INSERT INTO users (email, name, account_id, auth_user_id)
  VALUES ('alex.barbalex@gmail.com', 'test-user', (
      SELECT
        id
      FROM
        accounts
      WHERE
        service_id = 'test'), (
        SELECT
          id
        FROM
          auth.users
        WHERE
          email = 'alex.barbalex@gmail.com'));

INSERT INTO projects (name, label, account_id)
  VALUES ('test-project', 'test-project', (
      SELECT
        id
      FROM
        accounts
      WHERE
        service_id = 'test'));

-- INSERT INTO project_users (project_id, user_email, ROLE)
--   VALUES ((
--       SELECT
--         id
--       FROM
--         projects
--       WHERE
--         name = 'test-project'), 'alex.barbalex@gmail.com', 'account_manager');
--- test project policies
-- SELECT
--   is_project_user_by_project ((
--     SELECT
--       id
--     FROM auth.users
--     WHERE
--       email = 'alex.barbalex@gmail.com'), (
--     SELECT
--       id
--     FROM projects
--     WHERE
--       name = 'test-project'));
-- SELECT
--   is_project_user_by_project ('d4f6a987-6306-4da0-8ca6-3073ee5384aa', '20311e3f-791c-4e75-81ab-a55b309e85d7');
-- true
-- SELECT
--   is_own_account ((
--     SELECT
--       id
--     FROM auth.users
--     WHERE
--       email = 'alex.barbalex@gmail.com'), (
--     SELECT
--       id
--     FROM accounts
--     WHERE
--       service_id = 'test'));
-- SELECT
--   is_own_account ('d4f6a987-6306-4da0-8ca6-3073ee5384aa', '22e0f582-9095-4469-a872-cf86ceaa7514');
