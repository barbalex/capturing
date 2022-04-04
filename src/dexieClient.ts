import { ProjectUser } from './initiateDb'
import Dexie, { DexieTable } from 'dexie'
import { v1 as uuidv1 } from 'uuid'

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
    this.id = id ?? uuidv1()
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
    this.id = id ?? uuidv1()
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
    this.id = id ?? uuidv1()
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
    id?: string,
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
    this.id = id ?? uuidv1()
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
    id?: string,
    time?: Date,
    version_type?: string,
    version?: string,
    message?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    this.id = id ?? uuidv1()
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
    id?: string,
    news_id?: string,
    user_id?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    this.id = id ?? uuidv1()
    if (news_id) this.news_id = news_id
    if (user_id) this.user_id = user_id
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}

export interface IOptionType {
  id: string
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
    this.id = id ?? uuidv1()
    this.value = value
    if (save_id) this.save_id = save_id
    if (sort) this.sort = sort
    if (comment) this.comment = comment
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}
export interface IProjectEditor {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface IProjectManager {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface IProjectReader {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface IProjectTileLayer {
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

export class ProjectTileLayer implements IProjectTileLayer {
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

  constructor(
    id?: string,
    label?: string,
    sort?: number,
    active?: boolean,
    project_id?: string,
    url_template?: string,
    subdomains?: string[],
    max_zoom?: number,
    min_zoom?: number,
    opacity?: number,
    wms_base_url?: string,
    wms_format?: string,
    wms_layers?: string[],
    wms_parameters?: string,
    wms_request?: string,
    wms_service?: string,
    wms_styles?: string[],
    wms_transparent?: boolean,
    wms_version?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    this.id = id ?? uuidv1()
    if (label) this.label = label
    if (sort) this.sort = sort
    if (active) this.active = active
    if (project_id) this.project_id = project_id
    if (url_template) this.url_template = url_template
    if (subdomains) this.subdomains = subdomains
    if (max_zoom) this.max_zoom = max_zoom
    if (min_zoom) this.min_zoom = min_zoom
    if (opacity) this.opacity = opacity
    if (wms_base_url) this.wms_base_url = wms_base_url
    if (wms_format) this.wms_format = wms_format
    if (wms_layers) this.wms_layers = wms_layers
    if (wms_parameters) this.wms_parameters = wms_parameters
    if (wms_request) this.wms_request = wms_request
    if (wms_service) this.wms_service = wms_service
    if (wms_styles) this.wms_styles = wms_styles
    if (wms_transparent) this.wms_transparent = wms_transparent
    if (wms_version) this.wms_version = wms_version
    if (client_rev_at) this.client_rev_at = client_rev_at
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}

export interface IProjectUser {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface IProject {
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

export class Project implements IProject {
  id: string
  account_id?: string
  name?: string
  label?: string
  crs?: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean

  constructor(
    id?: string,
    account_id?: string,
    name?: string,
    label?: string,
    crs?: number,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    this.id = id ?? uuidv1()
    if (account_id) this.account_id = account_id
    if (name) this.name = name
    if (label) this.label = label
    if (crs) this.crs = crs
    if (client_rev_at) this.client_rev_at = client_rev_at
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}

export interface IRelType {
  id: string
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface IRoleType {
  id: string
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}

export interface IRow {
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

export class Row implements IRow {
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
  constructor(
    id?: string,
    table_id?: string,
    parent_id?: string,
    geometry?: string,
    geometry_n?: number,
    geometry_e?: number,
    geometry_s?: number,
    geometry_w?: number,
    data?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    rev?: string,
    parent_rev?: string,
    revisions?: string[],
    depth?: number,
    deleted?: boolean,
    conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    if (table_id) this.table_id = table_id
    if (parent_id) this.parent_id = parent_id
    if (geometry) this.geometry = geometry
    if (geometry_n) this.geometry_n = geometry_n
    if (geometry_e) this.geometry_e = geometry_e
    if (geometry_s) this.geometry_s = geometry_s
    if (geometry_w) this.geometry_w = geometry_w
    if (data) this.data = data
    if (client_rev_at) this.client_rev_at = client_rev_at
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (rev) this.rev = rev
    if (parent_rev) this.parent_rev = parent_rev
    if (revisions) this.revisions = revisions
    if (depth) this.depth = depth
    if (deleted) this.deleted = deleted
    if (conflicts) this.conflicts = conflicts
  }
}

export interface ITable {
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

export class Table implements ITable {
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

  constructor(
    id?: string,
    project_id?: string,
    parent_id?: string,
    rel_type?: string,
    name?: string,
    label?: string,
    single_label?: string,
    label_fields?: string[],
    label_fields_separator?: string,
    sort?: number,
    option_type?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    this.id = id ?? uuidv1()
    if (project_id) this.project_id = project_id
    if (parent_id) this.parent_id = parent_id
    if (rel_type) this.rel_type = rel_type
    if (name) this.name = name
    if (label) this.label = label
    if (single_label) this.single_label = single_label
    if (label_fields) this.label_fields = label_fields
    if (label_fields_separator)
      this.label_fields_separator = label_fields_separator
    if (sort) this.sort = sort
    if (option_type) this.option_type = option_type
    if (client_rev_at) this.client_rev_at = client_rev_at
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}

export interface ITileLayer {
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

export class TileLayer implements ITileLayer {
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

  constructor(
    id?: string,
    label?: string,
    url_template?: string,
    subdomains?: string[],
    max_zoom?: number,
    min_zoom?: number,
    opacity?: number,
    wms_base_url?: string,
    wms_format?: string,
    wms_layers?: string[],
    wms_parameters?: string,
    wms_request?: string,
    wms_service?: string,
    wms_styles?: string[],
    wms_transparent?: boolean,
    wms_version?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    this.id = id ?? uuidv1()
    if (label) this.label = label
    if (url_template) this.url_template = url_template
    if (subdomains) this.subdomains = subdomains
    if (max_zoom) this.max_zoom = max_zoom
    if (min_zoom) this.min_zoom = min_zoom
    if (opacity) this.opacity = opacity
    if (wms_base_url) this.wms_base_url = wms_base_url
    if (wms_format) this.wms_format = wms_format
    if (wms_layers) this.wms_layers = wms_layers
    if (wms_parameters) this.wms_parameters = wms_parameters
    if (wms_request) this.wms_request = wms_request
    if (wms_service) this.wms_service = wms_service
    if (wms_styles) this.wms_styles = wms_styles
    if (wms_transparent) this.wms_transparent = wms_transparent
    if (wms_version) this.wms_version = wms_version
    if (client_rev_at) this.client_rev_at = client_rev_at
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}

export interface IUser {
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

export class User implements IUser {
  id: string
  name?: string
  email?: string
  account_id?: string
  auth_user_id?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted?: boolean

  constructor(
    id?: string,
    name?: string,
    email?: string,
    account_id?: string,
    auth_user_id?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted?: boolean,
  ) {
    this.id = id ?? uuidv1()
    if (name) this.name = name
    if (email) this.email = email
    if (account_id) this.account_id = account_id
    if (auth_user_id) this.auth_user_id = auth_user_id
    if (client_rev_at) this.client_rev_at = client_rev_at
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (deleted) this.deleted = deleted
  }
}
export interface IVersionType {
  id: string
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}
export interface IWidgetType {
  id: string
  value: string
  needs_list?: boolean
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted?: boolean
}
export interface IWidgetForField {
  id: string
  field_value: string
  widget_value: string
  server_rev_at?: Date
}

export class WidgetForField implements IWidgetForField {
  id: string
  field_value: string
  widget_value: string
  server_rev_at?: Date

  constructor(
    id?: string,
    field_value: string,
    widget_value: string,
    server_rev_at?: Date,
  ) {
    this.id = id ?? uuidv1()
    if (field_value) this.field_value = field_value
    if (widget_value) this.widget_value = widget_value
    if (server_rev_at) this.server_rev_at = server_rev_at
  }
}

export class MySubClassedDexie extends Dexie {
  accounts!: DexieTable<Account, string>
  field_types!: DexieTable<FieldType, string>
  fields!: DexieTable<Field, string>
  files!: DexieTable<File, string>
  news!: DexieTable<New, string>
  news_delivery!: DexieTable<NewsDelivery, string>
  option_types!: DexieTable<OptionType, string>
  project_editors!: DexieTable<IProjectEditor, string>
  project_managers!: DexieTable<IProjectManager, string>
  project_readers!: DexieTable<IProjectReader, string>
  project_tile_layers!: DexieTable<ProjectTileLayer, string>
  project_users!: DexieTable<ProjectUser, string>
  projects!: DexieTable<Project, string>
  rel_types!: DexieTable<IRelType, string>
  role_types!: DexieTable<IRoleType, string>
  rows!: DexieTable<Row, string>
  ttables!: DexieTable<Table, string>
  tile_layers!: DexieTable<TileLayer, string>
  users!: DexieTable<User, string>
  version_types!: DexieTable<IVersionType, string>
  widget_types!: DexieTable<IWidgetType, string>
  widgets_for_fields!: DexieTable<WidgetForField, string>

  constructor() {
    super('capturing')
    this.version(1).stores({
      accounts: 'id, server_rev_at',
      field_types: 'id, &value, sort, server_rev_at',
      fields:
        'id, table_id, label, field_type, widget_type, options_table, sort, server_rev_at',
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
      // name tables causes error because used internally, see: https://github.com/dexie/Dexie.js/issues/1537
      ttables:
        'id, label, sort, project_id, parent_id, rel_type, option_type, server_rev_at',
      tile_layers: 'id, label, server_rev_at',
      users: 'id, name, &email, auth_user_id, server_rev_at',
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
    this.project_tile_layers.mapToClass(ProjectTileLayer)
    this.projects.mapToClass(Project)
    this.rows.mapToClass(Row)
    this.ttables.mapToClass(Table)
    this.tile_layers.mapToClass(TileLayer)
    this.users.mapToClass(User)
    this.widgets_for_fields.mapToClass(WidgetForField)
  }
}

export const db = new MySubClassedDexie()
