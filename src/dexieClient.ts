import { IQueuedUpdate } from './dexieClient'
import Dexie, { DexieTable } from 'dexie'
import { v1 as uuidv1 } from 'uuid'
import { Session } from '@supabase/supabase-js'
import sortBy from 'lodash/sortBy'
import getBbox from '@turf/bbox'
import SparkMD5 from 'spark-md5'

window.Dexie = Dexie

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
    dexie.fields.update(this.id, { deleted: 1 })
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
    dexie.files_meta.update(this.id, { deleted: 1 })
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
  wms = 'wms',
  wmts = 'wmts',
  // tms = 'tms',
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

type dataBounds = {
  size: number
  bounds: string
}
export interface ITileLayer {
  id: string
  label?: string
  sort?: number
  active?: number
  project_id?: string
  type?: TileLayerTypeEnum
  wmts_url_template?: string
  wmts_subdomains?: string[]
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
  wms_info_format?: string
  wms_queryable?: number
  _wmsLegends?: blob[] // only local!
  _wmsFormatOptions?: optionsList[] // local
  _layerOptions?: optionsList[] // local
  _legendUrls?: legendUrlList[] // local
  _infoFormatOptions?: optionsList[] // local
  grayscale?: number
  local_data_size?: number
  local_data_bounds?: dataBounds[]
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

type optionsList = {
  label: string | number
  value: string | number
}
type legendUrlList = {
  title: string
  url: string
  name: string
}

type TileLayerUpdateProps = { row: ITileLayer; session: Session }
export class TileLayer implements ITileLayer {
  id: string
  label?: string
  sort?: number
  active?: number
  project_id?: string
  type?: TileLayerTypeEnum
  wmts_url_template?: string
  wmts_subdomains?: string[]
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
  _wmsLegends?: blob[] // local
  _wmsFormatOptions?: optionsList[] // local
  _layerOptions?: optionsList[] // local
  _legendUrls?: legendUrlList[] // local
  _infoFormatOptions?: optionsList[] // local
  grayscale?: number
  local_data_size?: number
  local_data_bounds?: dataBounds[]
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
    wmts_url_template?: string,
    wmts_subdomains?: string[],
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
    _wmsLegends?: blob[],
    _wmsFormatOptions?: optionsList[],
    _layerOptions?: optionsList[],
    _legendUrls?: legendUrlList[],
    _infoFormatOptions?: optionsList[],
    grayscale?: number,
    local_data_size?: number,
    local_data_bounds?: dataBounds[],
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
    if (wmts_url_template) this.wmts_url_template = wmts_url_template
    if (wmts_subdomains) this.wmts_subdomains = wmts_subdomains
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
    if (_wmsLegends) this._wmsLegends = _wmsLegends
    if (_wmsFormatOptions) this._wmsFormatOptions = _wmsFormatOptions
    if (_layerOptions) this._layerOptions = _layerOptions
    if (_legendUrls) this._legendUrls = _legendUrls
    if (_infoFormatOptions) this._infoFormatOptions = _infoFormatOptions
    this.grayscale = grayscale ?? 0
    if (local_data_size) this.local_data_size = local_data_size
    if (local_data_bounds) this.local_data_bounds = local_data_bounds
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }

  async updateOnServer({ was, is, session }: TileLayerUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    // _wmsLegends exists only client side
    delete isReved._wmsLegends
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'tile_layers',
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
    dexie.tile_layers.update(this.id, { deleted: 1 })
    return this.updateOnServer({ was, is: this, session })
  }
}

export enum VectorLayerTypeEnum {
  wfs = 'wfs',
  upload = 'upload',
}
export interface IVectorLayer {
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
  _layerOptions?: optionsList[]
  wfs_version?: string
  output_format?: string
  _outputFormatOptions?: optionsList[]
  max_features?: number
  feature_count?: number
  point_count?: number
  line_count?: number
  polygon_count?: number
  client_rev_at?: Date
  client_rev_by?: string
  server_rev_at?: Date
  deleted: number
}

type VectorLayerUpdateProps = {
  row: IVectorLayer
  session: Session
}
export class VectorLayer implements IVectorLayer {
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
  _layerOptions?: optionsList[]
  wfs_version?: string
  output_format?: string
  _outputFormatOptions?: optionsList[]
  max_features?: number
  feature_count?: number
  point_count?: number
  line_count?: number
  polygon_count?: number
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
    _layerOptions?: optionsList[],
    wfs_version?: string,
    output_format?: string,
    _outputFormatOptions?: optionsList[],
    max_features?: number,
    feature_count?: number,
    point_count?: number,
    line_count?: number,
    polygon_count?: number,
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
    if (_layerOptions) this._layerOptions = _layerOptions
    if (wfs_version) this.wfs_version = wfs_version
    if (output_format) this.output_format = output_format
    if (_outputFormatOptions) this._outputFormatOptions = _outputFormatOptions
    this.max_features = max_features ?? 1000
    if (feature_count) this.feature_count = feature_count
    if (point_count) this.point_count = point_count
    if (line_count) this.line_count = line_count
    if (polygon_count) this.polygon_count = polygon_count
    this.client_rev_at = new window.Date().toISOString()
    if (client_rev_by) this.client_rev_by = client_rev_by
    if (server_rev_at) this.server_rev_at = server_rev_at
    this.deleted = deleted ?? 0
  }

  async updateOnServer({ was, is, session }: VectorLayerUpdateProps) {
    const isReved = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'vector_layers',
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
    dexie.vector_layers.update(this.id, { deleted: 1 })
    this.updateOnServer({ was, is: this, session })

    // if layer_style exists, also delete
    const layerStyle = await dexie.layer_styles.get({
      vector_layer_id: this.id,
    })
    if (layerStyle) await layerStyle.deleteOnServerAndClient({ session })
    return
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
    const bbox = geometry ? getBbox(geometry) : []
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
    dexie.pvl_geoms.update(this.id, { deleted: 1 })
    return this.updateOnServer({ was, is: this, session })
  }
}

export enum MarkerTypeEnum {
  circle = 'circle',
  marker = 'marker',
}

export interface ILayerStyle {
  id: string
  table_id?: string
  vector_layer_id?: string
  marker_type?: MarkerTypeEnum
  circle_marker_radius?: number
  marker_symbol?: string
  marker_size?: number
  marker_weight?: number
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
  vector_layer_id?: string
  marker_type?: MarkerTypeEnum
  circle_marker_radius?: number
  marker_symbol?: string
  marker_size?: number
  marker_weight?: number
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
    vector_layer_id?: string,
    marker_type?: MarkerTypeEnum,
    circle_marker_radius?: number,
    marker_symbol?: string,
    marker_size?: number,
    marker_weight?: number,
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
    if (vector_layer_id) this.vector_layer_id = vector_layer_id
    this.marker_type = marker_type ?? 'circle'
    this.circle_marker_radius = circle_marker_radius ?? 8
    if (marker_symbol) this.marker_symbol = marker_symbol
    this.marker_size = marker_size ?? 16
    if (marker_weight) this.marker_weight = marker_weight
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
    dexie.layer_styles.update(this.id, { deleted: 1 })
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
    dexie.project_users.update(this.id, { deleted: 1 })
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
    dexie.projects.update(this.id, { deleted: 1 })
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
    const client_rev_at = new window.Date().toISOString()
    const client_rev_by = session.user?.email ?? session.user?.id
    const depth = is.depth + 1
    // need to revision here instead of in processQueuedUpdate!
    const revData = {
      row_id: is.id,
      table_id: is.table_id,
      parent_id: is.parent_id,
      geometry: is.geometry,
      data: is.data,
      depth,
      parent_rev: is.rev,
      deleted: is.deleted,
      client_rev_at,
      client_rev_by,
    }
    const rev = `${depth}-${SparkMD5.hash(JSON.stringify(revData))}`
    const isReved = {
      ...is,
      ...revData,
      rev,
      depth,
      revisions: [rev, ...(is.revisions ?? [])],
      client_rev_at,
      client_rev_by,
    }
    // console.log('dexie Row, updateOnServer', { is, isReved, row: this })
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'rows', // processQueuedUpdate writes this into row_revs
      JSON.stringify(isReved),
      undefined,
      was.id,
      JSON.stringify(was),
    )
    dexie.queued_updates.add(update)
    return dexie.rows.update(this.id, {
      rev,
      depth,
      revisions: [rev, ...(is.revisions ?? [])],
      client_rev_at,
      client_rev_by,
    })
  }

  async deleteOnServerAndClient({ session }: DeleteOnServerAndClientProps) {
    const was = { ...this }
    this.deleted = 1
    dexie.rows.update(this.id, { deleted: 1 })
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
  singular_label?: string
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
  singular_label?: string
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
    singular_label?: string,
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
    if (singular_label) this.singular_label = singular_label
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
    dexie.ttables.update(this.id, { deleted: 1 })
    return this.updateOnServer({ was, is: this, session })
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
  tile_layers!: DexieTable<TileLayer, string>
  vector_layers!: DexieTable<VectorLayer, string>
  pvl_geoms!: DexieTable<PVLGeom, string>
  project_users!: DexieTable<ProjectUser, string>
  layer_styles!: DexieTable<LayerStyle, string>
  projects!: DexieTable<Project, string>
  rows!: DexieTable<Row, string>
  ttables!: DexieTable<Table, string>
  users!: DexieTable<User, string>
  version_types!: DexieTable<IVersionType, string>
  widget_types!: DexieTable<IWidgetType, string>
  widgets_for_fields!: DexieTable<WidgetForField, string>
  stores!: DexieTable<IStore, string>
  queued_updates!: DexieTable<QueuedUpdate, number>

  constructor() {
    super('capturing')
    this.version(54).stores({
      accounts: 'id, server_rev_at, deleted',
      field_types: 'id, &value, sort, server_rev_at, deleted',
      fields:
        'id, table_id, label, name, field_type, widget_type, options_table, sort, server_rev_at, deleted, [deleted+table_id], [deleted+table_id+widget_type]',
      // files:
      //   'id, field_id, row_id, [row_id+field_id+deleted+name], [row_id+field_id+deleted], name, server_rev_at, deleted',
      files_meta: 'id, [row_id+field_id+deleted], server_rev_at',
      files: 'id',
      news: 'id, time, server_rev_at, deleted',
      news_delivery: 'id, server_rev_at, deleted',
      tile_layers:
        'id, label, sort, active, server_rev_at, deleted, [deleted+project_id], [deleted+project_id+active], [deleted+active]',
      vector_layers:
        'id, label, sort, active, server_rev_at, deleted, [deleted+project_id], [deleted+active], [deleted+active+project_id]',
      pvl_geoms:
        'id, pvl_id, bbox_sw_lng, bbox_sw_lat, bbox_ne_lng, bbox_ne_lat, server_rev_at, deleted',
      project_users:
        'id, user_email, [project_id+user_email], [deleted+project_id], project_id, server_rev_at, deleted',
      layer_styles: 'id, &table_id, &vector_layer_id, server_rev_at, deleted',
      projects:
        'id, label, name, server_rev_at, deleted, use_labels, [deleted+id]',
      rows: 'id, server_rev_at, deleted, [deleted+table_id], [deleted+parent_id]',
      // name tables causes error because used internally, see: https://github.com/dexie/Dexie.js/issues/1537
      ttables:
        'id, label, name, sort, project_id, parent_id, rel_type, type, server_rev_at, deleted, [deleted+project_id], [deleted+project_id+type], [deleted+parent_id]',
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
    this.tile_layers.mapToClass(TileLayer)
    this.vector_layers.mapToClass(VectorLayer)
    this.pvl_geoms.mapToClass(PVLGeom)
    this.projects.mapToClass(Project)
    this.project_users.mapToClass(ProjectUser)
    this.layer_styles.mapToClass(LayerStyle)
    this.rows.mapToClass(Row)
    this.ttables.mapToClass(Table)
    this.users.mapToClass(User)
    this.widgets_for_fields.mapToClass(WidgetForField)
  }
}

export const dexie = new MySubClassedDexie()
