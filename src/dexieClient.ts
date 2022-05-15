import { IQueuedUpdate } from './dexieClient'
import Dexie, { DexieTable } from 'dexie'
import { v1 as uuidv1 } from 'uuid'
import { Session } from '@supabase/supabase-js'
import sortBy from 'lodash/sortBy'
import getBbox from '@turf/bbox'

export interface IAccount {
  id: string
  service_id?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}
export class Account implements IAccount {
  id: string
  service_id?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id?: string,
    service_id?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (service_id) this.service_id = id
    if (client_rev_at) this.client_rev_at = id
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = id
    this.deleted = deleted ?? 0
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
  deleted: number
}
export interface IField {
  id: string
  table_id?: string
  name?: string
  label?: string
  sort?: number
  is_internal_id?: number
  field_type?: string
  widget_type?: string
  options_table?: string
  standard_value?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

type FieldUpdateProps = { was: IField; is: IField; session: Session }
export class Field implements IField {
  id: string
  table_id?: string
  name?: string
  label?: string
  sort?: number
  is_internal_id?: number
  field_type?: string
  widget_type?: string
  options_table?: string
  standard_value?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id?: string,
    table_id?: string,
    name?: string,
    label?: string,
    sort?: number,
    is_internal_id?: number,
    field_type?: string,
    widget_type?: string,
    options_table?: string,
    standard_value?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (table_id) this.table_id = table_id
    if (name) this.name = name
    if (label) this.label = label
    if (sort !== undefined) this.sort = sort
    if (is_internal_id !== undefined) this.is_internal_id = is_internal_id
    if (field_type) this.field_type = field_type
    if (widget_type) this.widget_type = widget_type
    if (options_table) this.options_table = options_table
    if (standard_value) this.standard_value = standard_value
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }

  async updateOnServer({ was, is, session }: FieldUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'fields',
      JSON.stringify(isReved),
      undefined,
      this.id,
      JSON.stringify(was),
    )
    return dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.fields.put(this)
    return this.updateOnServer({ was, is: this, session })
  }
}

export interface IFileMeta {
  id: string
  row_id?: string
  field_id?: string
  name?: string
  type?: string
  deleted: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
  conflicts?: string[]
}

type FilesMetaUpdateProps = { was: IFileMeta; is: IFileMeta; session: Session }
/**
 * TODO:
 * Goals:
 * 1. Client:
 *    a. Save Files only once because only one index on id
 *    b. Easier and faster blob operations
 *    c. Possible to create/send links for files
 * 2. Server: Minimize File Storage for Revisions
 *    (keep only a month's worth of Files NOT referenced in winning FileMetas)
 *
 * Means:
 * create two file tables:
 * 1. FileMetas
 *    This table minus: file, hash?, description
 * 2. Files
 *    id, file
 *    No Revisions!
 *
 * Syncing works by:
 * 1. Sync FileMeta
 * 2. Fetch new linked Files from storage to dexie
 * 3. Remove no more referenced files from dexie
 *
 * FileMetas can be inserted, updated (excluding the file reference) and deleted
 * Files can only be inserted and deleted
 *
 * TO DECIDE:
 * Instead of Files, use file storage with files named by id?
 * In Supabase access would be ruled by policy depending on link to FileMeta
 *
 * Plus side: no files in db
 * Down side: removing no more needed files may be harder:
 *   - loop all files and remove where not referenced from FileMeta
 *   - or: loop all loosing FileMeta older than a month > remove file and FileMeta (or create new rev of FileMeta without file?)
 *
 * Idea: test this with tile_layers tiles?
 */
export class FileMeta implements IFileMeta {
  id: string
  row_id?: string
  field_id?: string
  name?: string
  type?: string
  deleted: number
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
    name?: string,
    type?: string,
    deleted: number,
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
    if (name) this.name = name
    if (type) this.type = type
    this.deleted = deleted ?? 0
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (rev) this.rev = rev
    if (parent_rev) this.parent_rev = parent_rev
    this.revisions = revisions ?? []
    this.depth = depth ?? 0
    if (conflicts) this.conflicts = conflicts
  }

  async updateOnServer({ was, is, session }: FilesMetaUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'files_meta', // processQueuedUpdate writes this into row_revs
      JSON.stringify(isReved),
      this.file, // TODO: add file not from this
      was?.id,
      was ? JSON.stringify(was) : null,
    )
    return dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.files_meta.put(this)
    return this.updateOnServer({ was, is: this, session })
  }
}

export interface IFile {
  id: string
  file?: blob
}
export class File implements IFile {
  id: string
  file: blob

  constructor(id?: string, file: blob) {
    this.id = id ?? uuidv1()
    this.file = file
  }
}

export interface INew {
  id: string
  time?: Date
  version_type?: string
  version?: string
  message?: string
  server_rev_at?: Date
  deleted: number
}
export class New implements INew {
  id: string
  time?: Date
  version_type?: string
  version?: string
  message?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id?: string,
    time?: Date,
    version_type?: string,
    version?: string,
    message?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (time) this.time = time
    if (version_type) this.version_type = version_type
    if (version) this.version = version
    if (message) this.message = message
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }
}

export interface INewsDelivery {
  id: string
  news_id?: string
  user_id?: string
  server_rev_at?: Date
  deleted: number
}
export class NewsDelivery implements INewsDelivery {
  id: string
  news_id?: string
  user_id?: string
  server_rev_at?: Date
  deleted: number
  constructor(
    id?: string,
    news_id?: string,
    user_id?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (news_id) this.news_id = news_id
    if (user_id) this.user_id = user_id
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }
}

export enum TableRelTypeEnum {
  '1' = '1',
  n = 'n',
}

export enum TileLayerTypeEnum {
  url_template = 'url_template',
  wms = 'wms',
}

export enum TableTypeEnum {
  none = 'standard',
  value_list = 'value_list',
  id_value_list = 'id_value_list',
}

export enum RoleTypeEnum {
  project_reader = 'project_reader',
  project_editor = 'project_editor',
  project_manager = 'project_manager',
  account_manager = 'account_manager',
}

export interface IProjectEditor {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

export interface IProjectManager {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

export interface IProjectReader {
  id: string
  project_id?: string
  user_email?: string
  role?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

export interface IProjectTileLayer {
  id: string
  label?: string
  sort?: number
  active?: number
  project_id?: string
  type?: TileLayerTypeEnum
  url_template?: string
  subdomains?: string[]
  max_zoom?: number
  min_zoom?: number
  opacity?: number
  wms_base_url?: string
  wms_format?: string
  wms_layers?: string[]
  wms_parameters?: string
  wms_styles?: string[]
  wms_transparent?: number
  wms_version?: WmsVersionEnum
  greyscale?: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

export enum WmsVersionEnum {
  '1.1.1' = '1.1.1',
  '1.3.0' = '1.3.0',
}

export enum LineCapEnum {
  butt = 'butt',
  round = 'round',
  square = 'square',
}

export enum LineJoinEnum {
  arcs = 'arcs',
  bevel = 'bevel',
  miter = 'miter',
  'miter-clip' = 'miter-clip',
  round = 'round',
}

export enum FillRuleEnum {
  nonzero = 'nonzero',
  evenodd = 'evenodd',
}

type ProjectTileLayerUpdateProps = { row: IProjectTileLayer; session: Session }
export class ProjectTileLayer implements IProjectTileLayer {
  id: string
  label?: string
  sort?: number
  active?: number
  project_id?: string
  type?: TileLayerTypeEnum
  url_template?: string
  subdomains?: string[]
  max_zoom?: number
  min_zoom?: number
  opacity?: number
  wms_base_url?: string
  wms_format?: string
  wms_layers?: string
  wms_parameters?: string
  wms_styles?: string[]
  wms_transparent?: number
  wms_version?: WmsVersionEnum
  wms_info_format?: string
  wms_queryable?: number
  wms_legends?: blob[]
  greyscale?: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id?: string,
    label?: string,
    sort?: number,
    active?: number,
    project_id?: string,
    type?: TileLayerTypeEnum,
    url_template?: string,
    subdomains?: string[],
    max_zoom?: number,
    min_zoom?: number,
    opacity?: number,
    wms_base_url?: string,
    wms_format?: string,
    wms_layers?: string,
    wms_parameters?: string,
    wms_styles?: string[],
    wms_transparent?: number,
    wms_version?: WmsVersionEnum,
    wms_info_format?: string,
    wms_queryable?: number,
    wms_legends?: blob[],
    greyscale?: number,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (label) this.label = label
    if (sort !== undefined) this.sort = sort
    this.active = active ?? 1
    if (project_id) this.project_id = project_id
    this.type = type ?? 'wms'
    if (url_template) this.url_template = url_template
    if (subdomains) this.subdomains = subdomains
    if (max_zoom !== undefined) this.max_zoom = max_zoom
    if (min_zoom !== undefined) this.min_zoom = min_zoom
    this.opacity = opacity ?? 1
    if (wms_base_url) this.wms_base_url = wms_base_url
    if (wms_format) this.wms_format = wms_format
    if (wms_layers) this.wms_layers = wms_layers
    if (wms_parameters) this.wms_parameters = wms_parameters
    if (wms_styles) this.wms_styles = wms_styles
    this.wms_transparent = wms_transparent ?? 1
    if (wms_version) this.wms_version = wms_version
    if (wms_info_format) this.wms_info_format = wms_info_format
    if (wms_queryable) this.wms_queryable = wms_queryable
    if (wms_legends) this.wms_legends = wms_legends
    this.greyscale = greyscale ?? 0
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }

  async updateOnServer({ was, is, session }: ProjectTileLayerUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    // wms_legends exists only client side
    delete isReved.wms_legends
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'project_tile_layers',
      JSON.stringify(isReved),
      undefined,
      this.id,
      JSON.stringify(was),
    )
    return await dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.project_tile_layers.put(this)
    return this.updateOnServer({ was, is: this, session })
  }
}

export enum VectorLayerTypeEnum {
  wfs = 'wfs',
  upload = 'upload',
}
export interface IProjectVectorLayer {
  id: string
  label?: string
  sort?: number
  active?: number
  project_id?: string
  type: VectorLayerTypeEnum
  url?: string
  max_zoom?: number
  min_zoom?: number
  opacity?: number
  type_name?: string
  wfs_version?: string
  output_format?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

type ProjectVectorLayerUpdateProps = {
  row: IProjectVectorLayer
  session: Session
}
export class ProjectVectorLayer implements IProjectVectorLayer {
  id: string
  label?: string
  sort?: number
  active?: number
  project_id?: string
  type: VectorLayerTypeEnum
  url?: string
  max_zoom?: number
  min_zoom?: number
  opacity?: number
  type_name?: string
  wfs_version?: string
  output_format?: stringum
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id?: string,
    label?: string,
    sort?: number,
    active?: number,
    project_id?: string,
    type: VectorLayerTypeEnum,
    url?: string,
    max_zoom?: number,
    min_zoom?: number,
    opacity?: number,
    type_name?: string,
    wfs_version?: string,
    output_format?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (label) this.label = label
    if (sort !== undefined) this.sort = sort
    this.active ?? 1
    if (project_id) this.project_id = project_id
    this.type = type ?? 'wfs'
    if (url) this.url = url
    if (max_zoom !== undefined) this.max_zoom = max_zoom
    if (min_zoom !== undefined) this.min_zoom = min_zoom
    if (opacity !== undefined) this.opacity = opacity
    if (type_name) this.type_name = type_name
    if (wfs_version) this.wfs_version = wfs_version
    if (output_format) this.output_format = output_format
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }

  async updateOnServer({ was, is, session }: ProjectVectorLayerUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'project_vector_layers',
      JSON.stringify(isReved),
      undefined,
      this.id,
      JSON.stringify(was),
    )
    return await dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.project_vector_layers.put(this)
    return this.updateOnServer({ was, is: this, session })
  }
}

export interface IPVLGeom {
  id: string
  pvl_id?: string
  geometry?: string
  properties?: string
  bbox_sw_lng?: number
  bbox_sw_lat?: number
  bbox_ne_lng?: number
  bbox_ne_lat?: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

type PVLGeomUpdateProps = {
  row: IPVLGeom
  session: Session
}
export class PVLGeom implements IPVLGeom {
  id: string
  pvl_id: string
  geometry?: string
  properties?: string
  bbox_sw_lng?: number
  bbox_sw_lat?: number
  bbox_ne_lng?: number
  bbox_ne_lat?: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id?: string,
    pvl_id: string,
    geometry: string,
    properties?: string,
    bbox_sw_lng?: number,
    bbox_sw_lat?: number,
    bbox_ne_lng?: number,
    bbox_ne_lat?: number,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    this.pvl_id = pvl_id
    this.geometry = geometry
    if (properties) this.properties = properties
    const bbox = getBbox(geometry)
    this.bbox_sw_lng = bbox[0]
    this.bbox_sw_lat = bbox[1]
    this.bbox_ne_lng = bbox[2]
    this.bbox_ne_lat = bbox[3]
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }

  async updateOnServer({ was, is, session }: PVLGeomUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'pvl_geoms',
      JSON.stringify(isReved),
      undefined,
      this.id,
      JSON.stringify(was),
    )
    return await dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.pvl_geoms.put(this)
    return this.updateOnServer({ was, is: this, session })
  }
}

export interface ILayerStyle {
  id: string
  table_id?: string
  project_tile_layer_id?: string
  project_vector_layer_id?: string
  icon_url?: string
  icon_retina_url?: string
  icon_size?: number
  stroke?: number
  color?: string
  weight?: number
  opacity?: number
  line_cap?: LineCapEnum
  line_join?: LineJoinEnum
  dash_array?: string
  dash_offset?: string
  fill?: number
  fill_color?: string
  fill_opacity?: number
  fill_rule?: FillRuleEnum
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

type LayerStyleUpdateProps = {
  was: ILayerStyle
  is: ILayerStyle
  session: Session
}
export class LayerStyle implements ILayerStyle {
  id: string
  table_id?: string
  project_tile_layer_id?: string
  project_vector_layer_id?: string
  icon_url?: string
  icon_retina_url?: string
  icon_size?: number
  stroke?: number
  color?: string
  weight?: number
  opacity?: number
  line_cap?: LineCapEnum
  line_join?: LineJoinEnum
  dash_array?: string
  dash_offset?: string
  fill?: number
  fill_color?: string
  fill_opacity?: number
  fill_rule?: FillRuleEnum
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id: string,
    table_id?: string,
    project_tile_layer_id?: string,
    project_vector_layer_id?: string,
    icon_url?: string,
    icon_retina_url?: string,
    icon_size?: number,
    stroke?: number,
    color?: string,
    weight?: number,
    opacity?: number,
    line_cap?: LineCapEnum,
    line_join?: LineJoinEnum,
    dash_array?: string,
    dash_offset?: string,
    fill?: number,
    fill_color?: string,
    fill_opacity?: number,
    fill_rule?: FillRuleEnum,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (table_id) this.table_id = table_id
    if (project_tile_layer_id)
      this.project_tile_layer_id = project_tile_layer_id
    if (project_vector_layer_id)
      this.project_vector_layer_id = project_vector_layer_id
    if (icon_url) this.icon_url = icon_url
    if (icon_retina_url) this.icon_retina_url = icon_retina_url
    if (icon_size) this.icon_size = icon_size
    this.stroke = stroke ?? 1
    this.color = color ?? '#ff0000'
    this.weight = weight ?? 3
    this.opacity = opacity ?? 1.0
    this.line_cap = line_cap ?? 'round'
    this.line_join = line_join ?? 'round'
    if (dash_array) this.dash_array = dash_array
    if (dash_offset) this.dash_offset = dash_offset
    this.fill = fill ?? 1
    this.fill_color = fill_color ?? color ?? '#ff0000'
    this.fill_opacity = fill_opacity ?? 0.2
    this.fill_rule = fill_rule ?? 'evenodd'
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }
  async updateOnServer({ was, is, session }: LayerStyleUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'layer_styles',
      JSON.stringify(isReved),
      undefined,
      this.id,
      JSON.stringify(was),
    )
    return dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.layer_styles.put(this)
    return this.updateOnServer({ was, is: this, session })
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
  deleted: number
}

type ProjectUserUpdateProps = {
  was: IProjectUser
  is: IProjectUser
  session: Session
}
export class ProjectUser implements IProjectUser {
  id: string
  project_id: string
  user_email: string
  role?: RoleTypeEnum
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id: string,
    project_id?: string,
    user_email?: string,
    role?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    this.project_id = project_id
    this.user_email = user_email
    this.role = role ?? RoleTypeEnum.project_reader
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }
  async updateOnServer({ was, is, session }: ProjectUserUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'projects',
      JSON.stringify(isReved),
      undefined,
      this.id,
      JSON.stringify(was),
    )
    return dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.project_users.put(this)
    return this.updateOnServer({ was, is: this, session })
  }
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
  deleted: number
  use_labels: number
}

type ProjectUpdateProps = { was: IProject; is: IProject; session: Session }
type DeleteOnServerAndClientProps = { session: Session }
export class Project implements IProject {
  id: string
  account_id?: string
  name?: string
  label?: string
  crs?: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
  use_labels: number

  constructor(
    id?: string,
    account_id?: string,
    name?: string,
    label?: string,
    crs?: number,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
    use_labels: number,
  ) {
    this.id = id ?? uuidv1()
    if (account_id) this.account_id = account_id
    if (name) this.name = name
    this.label = label ?? name ?? undefined // TODO: test
    if (crs !== undefined) this.crs = crs
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
    this.use_labels = use_labels ?? 0
  }

  async updateOnServer({ was, is, session }: ProjectUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'projects',
      JSON.stringify(isReved),
      undefined,
      this.id,
      JSON.stringify(was),
    )
    return dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.projects.put(this)
    return this.updateOnServer({ was, is: this, session })
  }
}

export interface IRoleType {
  id: string
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted: number
}

export interface IRow {
  id: string
  table_id?: string
  parent_id?: string
  geometry?: string
  bbox?: string
  data?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
  deleted: number
  conflicts?: string[]
}

type RowUpdateProps = { row: IRow; session: Session }
export class Row implements IRow {
  id: string
  table_id?: string
  parent_id?: string
  geometry?: string
  bbox?: string
  data?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
  deleted: number
  conflicts?: string[]

  constructor(
    id?: string,
    table_id: string,
    parent_id?: string,
    geometry?: string,
    bbox?: string,
    data?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    rev?: string,
    parent_rev?: string,
    revisions?: string[],
    depth?: number,
    deleted: number,
    conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.table_id = table_id
    if (parent_id) this.parent_id = parent_id
    if (geometry) this.geometry = geometry
    if (geometry) this.bbox = getBbox(geometry)
    if (data) this.data = data
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    if (rev) this.rev = rev
    if (parent_rev) this.parent_rev = parent_rev
    this.revisions = revisions ?? []
    this.depth = depth ?? 0
    this.deleted = deleted ?? 0
    if (conflicts) this.conflicts = conflicts
  }

  get label() {
    // TODO:
    // 1. fetch this row's table
    // 2. read table.row_label
    // 3. fetch all the field's labels
    // 4. return string concatenated from field labels and text's
    // need an iife because javascript has no async getters
    return (async () => {
      const table: Table = await dexie.ttables.get(this.table_id)
      const isOptionsTable = ['value_list', 'id_value_list'].includes(
        table.type,
      )
      if (isOptionsTable) {
        return this.data?.value ?? '(kein Wert)'
      }
      if (!table.row_label) {
        return `${this.id} (labels are not configured for '${table.name}')`
      }

      let label = ''
      const lASorted = sortBy(table.row_label, 'index')
      // array elements are: {field: field_id, text: 'field', index: 1}
      for (const el of lASorted) {
        // TODO:
        if (el.field) {
          const field: Field = await dexie.fields.get(el.field)
          label += this.data?.[field.name] ?? `('${field.name}' ist leer)`
        } else {
          label += el.text ?? ''
        }
      }
      return label
    })()
  }

  async updateOnServer({ was, is, session }: RowUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'rows', // processQueuedUpdate writes this into row_revs
      JSON.stringify(isReved),
      undefined,
      was.id,
      JSON.stringify(was),
    )
    return dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.rows.put(this)
    return this.updateOnServer({ was, is: this, session })
  }
}

export interface ITable {
  id: string
  project_id?: string
  parent_id?: string
  rel_type?: TableRelTypeEnum
  name?: string
  label?: string
  row_label?: string
  sort?: number
  type?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

type TableUpdateProps = { row: ITable; session: Session }

export class Table implements ITable {
  id: string
  project_id?: string
  parent_id?: string
  rel_type?: TableRelTypeEnum
  name?: string
  label?: string
  row_label?: string // stringified json
  sort?: number
  type?: string
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

  constructor(
    id?: string,
    project_id?: string,
    parent_id?: string,
    rel_type?: TableRelTypeEnum,
    name?: string,
    label?: string,
    row_label?: string,
    sort?: number,
    type?: TableTypeEnum,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (project_id) this.project_id = project_id
    if (parent_id) this.parent_id = parent_id
    this.rel_type = rel_type ?? 'n'
    if (name) this.name = name
    if (label) this.label = label
    if (row_label) this.row_label = row_label
    if (sort !== undefined) this.sort = sort
    this.type ?? 'standard'
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }

  async updateOnServer({ was, is, session }: TableUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'tables',
      JSON.stringify(isReved),
      undefined,
      this.id,
      JSON.stringify(was),
    )
    return await dexie.queued_updates.add(update)
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.ttables.put(this)
    return this.updateOnServer({ was, is: this, session })
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
  wms_layers?: string
  wms_parameters?: string
  wms_styles?: string[]
  wms_transparent?: number
  wms_version?: WmsVersionEnum
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
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
  wms_layers?: string
  wms_parameters?: string
  wms_styles?: string[]
  wms_transparent?: number
  wms_version?: WmsVersionEnum
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number

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
    wms_layers?: string,
    wms_parameters?: string,
    wms_styles?: string[],
    wms_transparent?: number,
    wms_version?: WmsVersionEnum,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (label) this.label = label
    if (url_template) this.url_template = url_template
    if (subdomains) this.subdomains = subdomains
    if (max_zoom !== undefined) this.max_zoom = max_zoom
    if (min_zoom !== undefined) this.min_zoom = min_zoom
    if (opacity !== undefined) this.opacity = opacity
    if (wms_base_url) this.wms_base_url = wms_base_url
    if (wms_format) this.wms_format = wms_format
    if (wms_layers) this.wms_layers = wms_layers
    if (wms_parameters) this.wms_parameters = wms_parameters
    if (wms_styles) this.wms_styles = wms_styles
    if (wms_transparent !== undefined) this.wms_transparent = wms_transparent
    if (wms_version) this.wms_version = wms_version
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
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
  deleted: number
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
  deleted: number

  constructor(
    id?: string,
    name?: string,
    email?: string,
    account_id?: string,
    auth_user_id?: string,
    client_rev_at?: Date,
    client_rev_by?: string,
    server_rev_at?: Date,
    deleted: number,
  ) {
    this.id = id ?? uuidv1()
    if (name) this.name = name
    if (email) this.email = email
    if (account_id) this.account_id = account_id
    if (auth_user_id) this.auth_user_id = auth_user_id
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }
}
export interface IVersionType {
  id: string
  value: string
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted: number
}
export interface IWidgetType {
  id: string
  value: string
  needs_list?: number
  sort?: number
  comment?: string
  server_rev_at?: Date
  deleted: number
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

// TODO: update on every change of store
export interface IStore {
  id: string // always: 'store'
  store: Record<string, unknown>
}

export interface IQueuedUpdate {
  id?: number
  time: Date
  table: string
  value: string // json of value
  revert_id?: string // only set on update, is undefined on insert
  revert_value?: string // json of previous value. Only set on update, is undefined on insert
}

// use a class to automatically set time
export class QueuedUpdate implements IQueuedUpdate {
  id?: number
  time?: Date
  table: string
  value: string
  file: Blob
  revert_id?: string
  revert_value?: string

  constructor(
    id?: number,
    time: Date,
    table: string,
    value: string,
    file: Blob,
    revert_id?: string,
    revert_value?: string,
  ) {
    if (id) this.id = id
    this.time = new Date().toISOString()
    this.table = table
    this.value = value
    this.file = file
    if (revert_id) this.revert_id = revert_id
    if (revert_value) this.revert_value = revert_value
  }
}

export class MySubClassedDexie extends Dexie {
  accounts!: DexieTable<Account, string>
  field_types!: DexieTable<IFieldType, string>
  fields!: DexieTable<Field, string>
  files_meta!: DexieTable<FileMeta, string>
  files!: DexieTable<File, string>
  news!: DexieTable<New, string>
  news_delivery!: DexieTable<NewsDelivery, string>
  project_tile_layers!: DexieTable<ProjectTileLayer, string>
  project_vector_layers!: DexieTable<ProjectVectorLayer, string>
  pvl_geoms!: DexieTable<PVLGeom, string>
  project_users!: DexieTable<ProjectUser, string>
  layer_styles!: DexieTable<LayerStyle, string>
  projects!: DexieTable<Project, string>
  rows!: DexieTable<Row, string>
  ttables!: DexieTable<Table, string>
  tile_layers!: DexieTable<TileLayer, string>
  users!: DexieTable<User, string>
  version_types!: DexieTable<IVersionType, string>
  widget_types!: DexieTable<IWidgetType, string>
  widgets_for_fields!: DexieTable<WidgetForField, string>
  stores!: DexieTable<IStore, string>
  queued_updates!: DexieTable<QueuedUpdate, number>

  constructor() {
    super('capturing')
    this.version(34).stores({
      accounts: 'id, server_rev_at, deleted',
      field_types: 'id, &value, sort, server_rev_at, deleted',
      fields:
        'id, table_id, label, name, field_type, widget_type, options_table, sort, server_rev_at, deleted, [deleted+table_id]',
      // files:
      //   'id, field_id, row_id, [row_id+field_id+deleted+name], [row_id+field_id+deleted], name, server_rev_at, deleted',
      files_meta: 'id, [row_id+field_id+deleted], server_rev_at',
      files: 'id',
      news: 'id, time, server_rev_at, deleted',
      news_delivery: 'id, server_rev_at, deleted',
      project_tile_layers: 'id, label, sort, active, server_rev_at, deleted',
      project_vector_layers: 'id, label, sort, active, server_rev_at, deleted',
      pvl_geoms:
        'id, pvl_id, bbox_sw_lng, bbox_sw_lat, bbox_ne_lng, bbox_ne_lat, server_rev_at, deleted',
      project_users:
        'id, user_email, [project_id+user_email], project_id, server_rev_at, deleted',
      layer_styles:
        'id, &table_id, &project_tile_layer_id, &project_vector_layer_id, server_rev_at, deleted',
      projects:
        'id, label, name, server_rev_at, deleted, use_labels, [deleted+id]',
      rows: 'id, server_rev_at, deleted, [deleted+table_id], [deleted+parent_id]',
      // name tables causes error because used internally, see: https://github.com/dexie/Dexie.js/issues/1537
      ttables:
        'id, label, name, sort, project_id, parent_id, rel_type, type, server_rev_at, deleted, [deleted+project_id], [deleted+project_id+type], [deleted+parent_id]',
      tile_layers: 'id, label, server_rev_at, deleted',
      users: 'id, name, &email, auth_user_id, server_rev_at, deleted',
      version_types: 'id, &value, sort, server_rev_at, deleted',
      widget_types: 'id, &value, sort, server_rev_at, deleted',
      widgets_for_fields:
        'id, [field_value+widget_value], server_rev_at, deleted, [deleted+field_value]',
      stores: 'id',
      queued_updates: '++id',
    })
    this.accounts.mapToClass(Account)
    this.fields.mapToClass(Field)
    this.files_meta.mapToClass(FileMeta)
    this.files.mapToClass(File)
    this.news.mapToClass(New)
    this.news_delivery.mapToClass(NewsDelivery)
    this.project_tile_layers.mapToClass(ProjectTileLayer)
    this.project_vector_layers.mapToClass(ProjectVectorLayer)
    this.pvl_geoms.mapToClass(PVLGeom)
    this.projects.mapToClass(Project)
    this.project_users.mapToClass(ProjectUser)
    this.layer_styles.mapToClass(LayerStyle)
    this.rows.mapToClass(Row)
    this.ttables.mapToClass(Table)
    this.tile_layers.mapToClass(TileLayer)
    this.users.mapToClass(User)
    this.widgets_for_fields.mapToClass(WidgetForField)
  }
}

export const dexie = new MySubClassedDexie()
