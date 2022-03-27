-- https://dbdiagram.io/d/6048d556fcdcb6230b237d7f

Table "users" {
  "id" uuid [pk, default: `uuid_generate_v1mc()`]
  "name" text [default: null]
  "email" text [default: null]
  "account_id" uuid [default: null]
  "auth_id" text
  "client_rev_at" timestamp [default: `now()`]
  "client_rev_by" uuid [default: null]
  "server_rev_at" timestamp [default: `now()`]
  "deleted" boolean [default: false]
}

Table "accounts" {
  "id" uuid [pk, default: `uuid_generate_v1mc()`]
  "service_id" text [default: null]
  "client_rev_at" timestamp [default: `now()`]
  "client_rev_by" uuid [default: null]
  "server_rev_at" timestamp [default: `now()`]
  "deleted" boolean [default: false]
}

Table "projects" {
  "id" uuid [pk, default: `uuid_generate_v1mc()`]
  "account_id" uuid [unique, default: null]
  "name" text [unique, default: null]
  "label" text [default: null]
  "crs" integer [default: 4326]
  "client_rev_at" timestamp [default: `now()`]
  "client_rev_by" uuid [default: null]
  "server_rev_at" timestamp [default: `now()`]
  "deleted" boolean [default: false]
}

Table "tables" {
  "id" uuid [pk, default: `uuid_generate_v1mc()`]
  "project_id" uuid [unique, default: null]
  "parent_id" uuid [default: null]
  "rel_type" text
  "name" text [unique, default: null]
  "label" text [default: null]
  "option_type" text
  "client_rev_at" timestamp [default: `now()`]
  "client_rev_by" uuid [default: null]
  "server_rev_at" timestamp [default: `now()`]
  "deleted" boolean [default: false]
}

Table "fields" {
  "id" uuid [pk, default: `uuid_generate_v1mc()`]
  "table_id" uuid [unique, default: null]
  "name" text [unique, default: null]
  "label" text [default: null]
  "is_internal_id" boolean [default: false]
  "field_type" text
  "widget_type" text
  "options_table" uuid
  "standard_value" text
  "client_rev_at" timestamp [default: `now()`]
  "client_rev_by" uuid [default: null]
  "server_rev_at" timestamp [default: `now()`]
}

Table "rows" {
  "id" uuid [pk, default: `uuid_generate_v1mc()`]
  "table_id" uuid [default: null]
  "parent_id" uuid [default: null]
  "geometry" "geometry(GeometryCollection, 4326)" [default: null]
  "geometry_n" real [default: null]
  "geometry_e" real [default: null]
  "geometry_s" real [default: null]
  "geometry_w" real [default: null]
  "crs" integer [default: 4326]
  "data" jsonb
  "client_rev_at" timestamp [default: `now()`]
  "client_rev_by" uuid [default: null]
  "server_rev_at" timestamp [default: `now()`]
  "rev" text [default: null]
  "parent_rev" text [default: null]
  "revisions" text [default: null]
  "depth" integer [default: 1]
  "deleted" boolean [default: false]
  "conflicts" text [default: null]
}

Table "files" {
  "id" uuid [pk, default: `uuid_generate_v1mc()`]
  "row_id" uuid [default: null]
  "field_id" uuid [default: null]
  "filename" text [default: null]
  "url" text [default: null]
  "version" integer [default: 1]
  "client_rev_at" timestamp [default: `now()`]
  "client_rev_by" uuid [default: null]
  "server_rev_at" timestamp [default: `now()`]
  "rev" text [default: null]
  "parent_rev" text [default: null]
  "revisions" text [default: null]
  "depth" integer [default: 1]
  "deleted" boolean [default: false]
  "conflicts" text [default: null]
}

Table "project_users" {
  "id" uuid [pk, default: `uuid_generate_v1mc()`]
  "project_id" uuid [default: null]
  "user_email" text [default: null]
  "role" text
  "client_rev_at" timestamp [default: `now()`]
  "client_rev_by" uuid [default: null]
  "server_rev_at" timestamp [default: `now()`]
  "deleted" boolean [default: false]
}

Ref:"accounts"."id" < "users"."account_id" [update: cascade, delete: no action]

Ref:"accounts"."id" < "projects"."account_id" [update: cascade, delete: no action]

Ref:"projects"."id" < "tables"."project_id" [update: cascade, delete: no action]

Ref:"tables"."id" < "tables"."parent_id" [update: cascade, delete: no action]

Ref:"tables"."id" < "fields"."table_id" [update: cascade, delete: no action]

Ref:"tables"."id" < "fields"."options_table" [update: cascade, delete: no action]

Ref:"tables"."id" < "rows"."table_id" [update: cascade, delete: no action]

Ref:"rows"."id" < "files"."row_id" [update: cascade, delete: no action]

Ref:"fields"."id" < "files"."field_id" [update: cascade, delete: no action]

Ref:"projects"."id" < "project_users"."project_id" [update: cascade, delete: no action]

Ref:"users"."email" < "project_users"."user_email" [update: cascade, delete: no action]
