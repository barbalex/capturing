-- need to set server_rev_at on updates to non-revisioned tables
create or replace function set_server_rev_at ()
  returns trigger as $$
begin
  new.server_rev_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_set_server_rev_at
  before insert or update on users
  for each row
  execute procedure set_server_rev_at ();

-- accounts
create trigger accounts_set_server_rev_at
  before insert or update on accounts
  for each row
  execute procedure set_server_rev_at ();

-- projects
create trigger projects_set_server_rev_at
  before insert or update on projects
  for each row
  execute procedure set_server_rev_at ();









-- rel_types
create trigger rel_types_set_server_rev_at
  before insert or update on rel_types
  for each row
  execute procedure set_server_rev_at ();

-- tables
create trigger tables_set_server_rev_at
  before insert or update on tables
  for each row
  execute procedure set_server_rev_at ();

-- field_types
create trigger field_types_set_server_rev_at
  before insert or update on field_types
  for each row
  execute procedure set_server_rev_at ();

-- widget_types
create trigger widget_types_set_server_rev_at
  before insert or update on widget_types
  for each row
  execute procedure set_server_rev_at ();

-- fields
create trigger fields_set_server_rev_at
  before insert or update on fields
  for each row
  execute procedure set_server_rev_at ();

-- role_types
create trigger role_types_set_server_rev_at
  before insert or update on role_types
  for each row
  execute procedure set_server_rev_at ();

-- project_users
create trigger project_users_set_server_rev_at
  before insert or update on project_users
  for each row
  execute procedure set_server_rev_at ();

-- version_types
create trigger version_types_set_server_rev_at
  before insert or update on version_types
  for each row
  execute procedure set_server_rev_at ();

-- news
create trigger news_set_server_rev_at
  before insert or update on news
  for each row
  execute procedure set_server_rev_at ();

-- news_delivery
create trigger news_delivery_set_server_rev_at
  before insert or update on news_delivery
  for each row
  execute procedure set_server_rev_at ();

-- tile_layer
create trigger tile_layers_set_server_rev_at
  before insert or update on tile_layers
  for each row
  execute procedure set_server_rev_at ();

-- project_tile_layer
create trigger project_tile_layers_set_server_rev_at
  before insert or update on project_tile_layers
  for each row
  execute procedure set_server_rev_at ();