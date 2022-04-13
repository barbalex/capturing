-- need to set server_rev_at on updates to non-revisioned tables
CREATE OR REPLACE FUNCTION set_server_rev_at ()
  RETURNS TRIGGER
  AS $$
BEGIN
  NEW.server_rev_at = now();
  RETURN new;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER users_set_server_rev_at
  BEFORE INSERT OR UPDATE ON users FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- accounts
CREATE TRIGGER accounts_set_server_rev_at
  BEFORE INSERT OR UPDATE ON accounts FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- projects
CREATE TRIGGER projects_set_server_rev_at
  BEFORE INSERT OR UPDATE ON projects FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- tables
CREATE TRIGGER tables_set_server_rev_at
  BEFORE INSERT OR UPDATE ON tables FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- field_types
CREATE TRIGGER field_types_set_server_rev_at
  BEFORE INSERT OR UPDATE ON field_types FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- widget_types
CREATE TRIGGER widget_types_set_server_rev_at
  BEFORE INSERT OR UPDATE ON widget_types FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- fields
CREATE TRIGGER fields_set_server_rev_at
  BEFORE INSERT OR UPDATE ON fields FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- role_types
CREATE TRIGGER role_types_set_server_rev_at
  BEFORE INSERT OR UPDATE ON role_types FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- project_users
CREATE TRIGGER project_users_set_server_rev_at
  BEFORE INSERT OR UPDATE ON project_users FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- version_types
CREATE TRIGGER version_types_set_server_rev_at
  BEFORE INSERT OR UPDATE ON version_types FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- news
CREATE TRIGGER news_set_server_rev_at
  BEFORE INSERT OR UPDATE ON news FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- news_delivery
CREATE TRIGGER news_delivery_set_server_rev_at
  BEFORE INSERT OR UPDATE ON news_delivery FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- tile_layer
CREATE TRIGGER tile_layers_set_server_rev_at
  BEFORE INSERT OR UPDATE ON tile_layers FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

-- project_tile_layer
CREATE TRIGGER project_tile_layers_set_server_rev_at
  BEFORE INSERT OR UPDATE ON project_tile_layers FOR EACH ROW
  EXECUTE PROCEDURE set_server_rev_at ();

