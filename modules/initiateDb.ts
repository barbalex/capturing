import Dexie, { Table } from 'dexie'

export interface IAccount {
  id: string
  service_id?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}
export class Account implements IAccount {
  id: string
  service_id?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean

  constructor(
    id?: string,
    service_id?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    if (id) this.id = id
    if (service_id) this.service_id = id
    if (client_rev_at) this.client_rev_at = id
    if (client_rev_by) this.client_rev_by = id
    if (server_rev_at) this.server_rev_at = id
    if (deleted) this.deleted = id
  }
  // TODO: add methods, see: https://dexie.org/docs/Typescript#storing-real-classes-instead-of-just-interfaces
  // TODO: method for related datasets
  // TODO: method for labels if helpful
  // TODO: methode for edit, delete
}

// TODO: build classes for all interfaces
export interface IFieldType {
  id: string
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}
export class FieldType implements IFieldType {
  id: string
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
  constructor(
    id?: string,
    value: string,
    sort?: number,
    comment?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    if (id) this.id = id
    this.value = value
    if (sort) this.sort = sort
    if (comment) this.comment = comment
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}
export interface IField {
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
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}
export class Field implements IField {
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
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean

  constructor(
    id?: string,
    table_id?: string,
    name?: string,
    label?: string,
    sort?: number,
    is_internal_id?: boolean,
    field_type?: string,
    widget_type?: string,
    options_table?: string,
    standard_value?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    if (id) this.id = id
    if (table_id) this.table_id = table_id
    if (name) this.name = name
    if (label) this.label = label
    if (sort) this.sort = sort
    if (is_internal_id) this.is_internal_id = is_internal_id
    if (field_type) this.field_type = field_type
    if (widget_type) this.widget_type = widget_type
    if (options_table) this.options_table = options_table
    if (standard_value) this.standard_value = standard_value
    if (client_rev_at) this.client_rev_at = client_rev_at
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}

export interface IFile {
  id: string
  row_id?: string
  field_id?: string
  filename?: string
  url?: string
  version?: number
  deleted?: boolean
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
  conflicts?: string[]
}
export class File implements IFile {
  id: string
  row_id?: string
  field_id?: string
  filename?: string
  url?: string
  version?: number
  deleted?: boolean
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
  conflicts?: string[]

  constructor(
    id: string,
    row_id?: string,
    field_id?: string,
    filename?: string,
    url?: string,
    version?: number,
    deleted?: boolean,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    rev?: string,
    parent_rev?: string,
    revisions?: string[],
    depth?: number,
    conflicts?: string[],
  ) {
    if (id) this.id = id
    if (row_id) this.row_id = row_id
    if (field_id) this.field_id = field_id
    if (filename) this.filename = filename
    if (url) this.url = url
    if (version) this.version = version
    if (deleted) this.deleted = deleted
    if (client_rev_at) this.client_rev_at = client_rev_at
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (rev) this.rev = rev
    if (parent_rev) this.parent_rev = parent_rev
    if (revisions) this.revisions = revisions
    if (depth) this.depth = depth
    if (conflicts) this.conflicts = conflicts
  }
}

export interface INew {
  id: string
  time?: Date
  version_type?: string
  version?: string
  message?: string
  server_rev_at?: Date
  deleted?: boolean
}
export class New implements INew {
  id: string
  time?: Date
  version_type?: string
  version?: string
  message?: string
  server_rev_at?: Date
  deleted?: boolean

  constructor(
    id: string,
    time?: Date,
    version_type?: string,
    version?: string,
    message?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    if (id) this.id = id
    if (time) this.time = time
    if (version_type) this.version_type = version_type
    if (version) this.version = version
    if (message) this.message = message
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}

export interface INewsDelivery {
  id: string
  news_id?: string
  user_id?: string
  server_rev_at?: Date
  deleted?: boolean
}
export class NewsDelivery implements INewsDelivery {
  id: string
  news_id?: string
  user_id?: string
  server_rev_at?: Date
  deleted?: boolean
  constructor(
    id: string,
    news_id?: string,
    user_id?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    if (id) this.id = id
    if (news_id) this.news_id = news_id
    if (user_id) this.user_id = user_id
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}

export interface IOptionType {
  id?: string
  value: string
  save_id?: boolean
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}
export class OptionType implements IOptionType {
  id?: string
  value: string
  save_id?: boolean
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
  constructor(
    id?: string,
    value: string,
    save_id?: boolean,
    sort?: number,
    comment?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    if (id) this.id = id
    this.value = value
    if (save_id) this.save_id = save_id
    if (sort) this.sort = sort
    if (comment) this.comment = comment
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}
export interface ProjectEditor {
  id?: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface ProjectManager {
  id?: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface ProjectReader {
  id?: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
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
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface ProjectUser {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface Project {
  id: string
  account_id?: string
  name?: string
  label?: string
  crs?: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface RelType {
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface RoleType {
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
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
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
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
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
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
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
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
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}
export interface User {
  id: string
  name?: string
  email?: string
  account_id?: string
  auth_user_id?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}
export interface VersionType {
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}
export interface WidgetType {
  value: string
  needs_list?: boolean
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}
export interface WidgetForField {
  field_value: string
  widget_value: string
  server_rev_at?: Date
}

export class db extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  accounts!: Table<Account, string>
  field_types!: Table<FieldType, string>
  fields!: Table<Field, string>
  files!: Table<File, string>
  news!: Table<New, string>
  news_delivery!: Table<NewsDelivery, string>
  option_types!: Table<OptionType, string>
  project_editors!: Table<ProjectEditor, string>
  project_managers!: Table<ProjectManager, string>
  project_readers!: Table<ProjectReader, string>
  project_tile_layers!: Table<ProjectTileLayer, string>
  project_users!: Table<ProjectTileLayer, string>
  projects!: Table<Project, string>
  rel_types!: Table<RelType, string>
  role_types!: Table<RoleType, string>
  rows!: Table<Row, string>
  tables!: Table<CTable, string>
  tile_layers!: Table<TileLayer, string>
  users!: Table<User, string>
  version_types!: Table<VersionType, string>
  widget_types!: Table<WidgetType, string>
  widgets_for_fields!: Table<WidgetForField, string>

  constructor() {
    super('capturing')
    this.version(1).stores({
      accounts: 'id, server_rev_at',
      field_types: 'id, &value, sort, server_rev_at',
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
      rows: 'id, server_rev_at',
      tables: 'id, label, sort, server_rev_at',
      tile_layers: 'id, label, server_rev_at',
      users: 'id, name, &email, server_rev_at',
      version_types: 'id, &value, sort, server_rev_at',
      widget_types: 'id, &value, sort, server_rev_at',
      widgets_for_fields: 'id, [field_value+widget_value], server_rev_at',
    })
    this.accounts.mapToClass(Account)
    this.field_types.mapToClass(FieldType)
    this.fields.mapToClass(Field)
    this.files.mapToClass(File)
    this.news.mapToClass(New)
    this.news_delivery.mapToClass(NewsDelivery)
    this.option_types.mapToClass(OptionType)
  }
}
