import Dexie, { Table } from 'dexie'

export interface Account {
  id: string
  service_id?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface FieldType {
  value: string
  sort?: number
  comment?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface Field {
  id: string
  table_id?: string
  name?: string
  label?: string
  sort?: number
  is_internal_id?: boolean
  field_type?: string
  widget_type?: string
  options_table?: string
  standard_value?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface FileRev {
  id: string
  row_id?: string
  file_id?: string
  field_id?: string
  filename?: string
  url?: string
  version?: number
  deleted?: boolean
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
}

export interface File {
  id: string
  row_id?: string
  field_id?: string
  filename?: string
  url?: string
  version?: number
  deleted?: boolean
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
  conflicts?: string[]
}

export interface New {
  id: string
  time?: string
  version_type?: string
  version?: string
  message?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface NewsDelivery {
  id: string
  news_id?: string
  user_id?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface OptionType {
  id?: string
  value: string
  save_id?: boolean
  sort?: number
  comment?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface ProjectEditor {
  id?: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface ProjectManager {
  id?: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface ProjectReader {
  id?: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface ProjectTileLayer {
  id: string
  label?: string
  sort?: number
  active?: boolean
  project_id?: string
  url_template?: string
  subdomains?: string[]
  max_zoom?: number
  min_zoom?: number
  opacity?: number
  wms_base_url?: string
  wms_format?: string
  wms_layers?: string[]
  wms_parameters?: string
  wms_request?: string
  wms_service?: string
  wms_styles?: string[]
  wms_transparent?: boolean
  wms_version?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface ProjectUser {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface Project {
  id: string
  account_id?: string
  name?: string
  label?: string
  crs?: number
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface RelType {
  value: string
  sort?: number
  comment?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface RoleType {
  value: string
  sort?: number
  comment?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface RowRev {
  id: string
  row_id?: string
  table_id?: string
  parent_id?: string
  geometry?: string
  geometry_n?: number
  geometry_e?: number
  geometry_s?: number
  geometry_w?: number
  data?: string
  deleted?: boolean
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
}

export interface Row {
  id: string
  table_id?: string
  parent_id?: string
  geometry?: string
  geometry_n?: number
  geometry_e?: number
  geometry_s?: number
  geometry_w?: number
  data?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
  deleted?: boolean
  conflicts?: string[]
}

export interface CTable {
  id: string
  project_id?: string
  parent_id?: string
  rel_type?: string
  name?: string
  label?: string
  single_label?: string
  label_fields?: string[]
  label_fields_separator?: string
  sort?: number
  option_type?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}

export interface TileLayer {
  id: string
  label?: string
  url_template?: string
  subdomains?: string[]
  max_zoom?: number
  min_zoom?: number
  opacity?: number
  wms_base_url?: string
  wms_format?: string
  wms_layers?: string[]
  wms_parameters?: string
  wms_request?: string
  wms_service?: string
  wms_styles?: string[]
  wms_transparent?: boolean
  wms_version?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface User {
  id: string
  name?: string
  email?: string
  account_id?: string
  auth_user_id?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface VersionType {
  value: string
  sort?: number
  comment?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface WidgetType {
  value: string
  needs_list?: boolean
  sort?: number
  comment?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface WidgetForField {
  field_value: string
  widget_value: string
  server_rev_at?: string
}

export class db extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  accounts!: Table<Account>
  field_types!: Table<FieldType>
  fields!: Table<Field>
  file_revs!: Table<FileRev>
  files!: Table<File>
  news!: Table<New>
  news_delivery!: Table<Newsdelivery>
  option_types!: Table<OptionType>
  project_editors!: Table<ProjectEditor>
  project_managers!: Table<ProjectManager>
  project_readers!: Table<ProjectReader>
  project_tile_layers!: Table<ProjectTileLayer>
  project_users!: Table<ProjectTileLayer>
  projects!: Table<Project>
  rel_types!: Table<RelType>
  role_types!: Table<RoleType>
  row_revs!: Table<RowRev>
  rows!: Table<Row>
  tables!: Table<CTable>
  tile_layers!: Table<TileLayer>
  users!: Table<User>
  version_types!: Table<VersionType>
  widget_types!: Table<WidgetType>
  widgets_for_fields!: Table<WidgetForField>

  constructor() {
    super('capturing')
    this.version(1).stores({
      accounts: 'id, server_rev_at',
      field_types: 'id, &value, sort, server_rev_at',
      file_revs: 'id, filename, server_rev_at',
      files: 'id, filename, server_rev_at',
      news: 'id, time, server_rev_at',
      news_delivery: 'id, server_rev_at',
      option_types: 'id, &value, sort, server_rev_at',
      project_editors: 'id, user_email, server_rev_at',
      project_managers: 'id, user_email, server_rev_at',
      project_readers: 'id, user_email, server_rev_at',
      project_tile_layers: 'id, label, sort, active, server_rev_at',
      project_users: 'id, user_email, server_rev_at',
      projects: 'id, label, server_rev_at',
      rel_types: 'id, &value, sort, server_rev_at',
      role_types: 'id, &value, sort, server_rev_at',
      row_revs: 'id, server_rev_at',
      rows: 'id, server_rev_at',
      tables: 'id, label, sort, server_rev_at',
      tile_layers: 'id, label, server_rev_at',
      users: 'id, name, &email, server_rev_at',
      version_types: 'id, &value, sort, server_rev_at',
      widget_types: 'id, &value, sort, server_rev_at',
      widgets_for_fields: 'id, [field_value+widget_value], server_rev_at',
    })
  }
}
