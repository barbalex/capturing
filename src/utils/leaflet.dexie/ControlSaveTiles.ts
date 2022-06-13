import L from 'leaflet'
import countBy from 'lodash/countBy'

import { dexie } from '../../dexieClient'
import { supabase } from '../../supabaseClient'

/**
 * Status of ControlSaveTiles, keeps info about process during downloading and saving tiles. Used internal and as object for events.
 * @typedef {Object} ControlStatus
 * @property {number} storagesize total number of saved tiles.
 * @property {number} lengthToBeSaved number of tiles that will be saved in db during current process
 * @property {number} lengthSaved number of tiles saved during current process
 * @property {number} lengthLoaded number of tiles loaded during current process
 * @property {array} _tilesforSave tiles waiting for processing
 * @property {array} tnames names of all DB tables
 */

/**
 * Control to save tiles, invisible by default
 * @class ControlSaveTiles
 *
 * @property {ControlStatus} status
 * @property {TileLayerOffline} baseLayer TileLayer to control
 * @property {object} dtable DB table associated with baseLayer  {@link https://dexie.org/docs/Table/Table}
 *
 * @example
 * const controlSaveTiles = L.control.savetiles(myTileLayerOffline, {
 *   zoomlevels: [13, 16],   // optional zoomlevels to save, default current zoomlevel
 *   maxZoom: 17
 * });
 */

const ControlSaveTiles = L.Control.extend({
  options: {
    maxZoom: 20,
    minimalZoom: 8, // minimal zoom to prevent the user from saving the World (and freeze computer)
    zoomlevels: null, // zoomlevels have higher priority than maxZoom
    bounds: null, // LatLngBounds of map to save {@link https://leafletjs.com/reference-0.7.7.html#latlngbounds}
    confirmSave: null, // function to be called before confirm
  },
  status: {
    storagesize: null,
    lengthToBeSaved: null,
    lengthSaved: null,
    lengthLoaded: null,
    _tilesforSave: null,
    mapSize: null,
    currMinZoom: null,
    tnames: [], // all table names from DB
  },
  baseLayer: null, // current TileLayerOffline
  dtable: null, // current DB table
  _db: new Dexie('leaflet-maps'), // IndexedDB database
  _dbversion: 1, // current DB version
  _dterr: new Error('dtable not set'),

  initialize: function (baseLayer, options) {
    this.baseLayer = baseLayer
    L.setOptions(this, options)
  },

  onAdd: function () {
    const options = this.options
    if (options.visualUI) return options.visualUI // rem...
    return L.DomUtil.create('div') // 'invisible' by default
  },

  /**
   * Open database 'leaflet-maps' from IndexedDB storage
   * @return {boolean} result - false when not found or error
   */
  openDB: async function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    await this._db
      .open()
      .then(function () {
        // init all
        // console.log(
        //   'Found database: ' + self._db.name + ' version: ' + self._db.verno,
        // )
        self._dbversion = self._db.verno
        self.status.tnames = []
        self._db.tables.forEach(function (table) {
          self.status.tnames.push(table.name)
        })
        // console.log(self._db.name + ' tables: ' + self.status.tnames.join(' '))
        self.baseLayer.fire('tblevent', self.status)
        return true
      })
      .catch('NoSuchDatabaseError', function (e) {
        console.log('Database not found, will be created with first table.')
        return false
      })
      .catch(function (e) {
        console.log('Oh uh: ' + e)
        return false
      })
  },
  /**
   * Set a baseLayer, also this Control and its baseLayer to have the same DB table
   * @param  {TileLayerOffline} object TileLayerOffline
   * @return {none}
   */
  setLayer: function (layer) {
    this.baseLayer = layer
    this.baseLayer.dtable = this.dtable
  },
  /**
   * Sets the current DB table for Control and its TileLayer
   * @param  {string} table name
   */
  setTable: function (tblName) {
    this.dtable = this._db.table(tblName)
    this.baseLayer.dtable = this.dtable
  },
  /**
   * Delete a table from DB
   * @param  {string} table name
   * @return {Promise<void>} fires event 'tblevent' to refresh table list
   */
  deleteTable: function (tname) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    this._extendSchema(tname)
      .then(function () {
        console.log('dropped: ' + tname)
        self.baseLayer.fire('tblevent', tname)
      })
      .catch(function (rej) {
        console.log(rej)
      })
  },
  /**
   * Add/Update an item in DB table
   * @param  {string} table name
   * @return {Promise<void>} operation result
   */
  putItem: function (key, value) {
    // insert and update in one command
    if (this.dtable == null) throw this._dterr
    this.dtable.put(value, key)
  },
  /**
   * Get an item in DB table
   * @param  {string} table name
   * @return {Promise<void>} operation result
   */
  getItem: function (key) {
    if (this.dtable == null) throw this._dterr
    return this.dtable.get(key)
  },
  /**
   * Delete an item in DB table
   * @param  {string} table name
   * @return {Promise<void>} operation result
   */
  deleteItem: function (key) {
    if (this.dtable == null) throw this._dterr
    return this.dtable.delete(key)
  },

  /**
   * Set options zoomlevels
   * @param  {array} zoomlevels array of zoom values
   */
  setZoomlevels: function (zoomlevels) {
    this.options.zoomlevels = zoomlevels
  },

  /**
   * Set Lat/Lng bounds of map to save
   * @param  {LatLngBounds} bounds {@link https://leafletjs.com/reference-0.7.7.html#latlngbounds}
   */
  setBounds: function (bounds) {
    this.options.bounds = bounds
  },

  /**
   * Sets status.storagesize equal to count of table rows
   * @param  {callback} function to get the count
   */
  setStorageSize: function (callback) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    if (this.dtable == null) throw this._dterr
    this.dtable.count().then(
      function (numberOfKeys) {
        self.status.storagesize = numberOfKeys
        self.baseLayer.fire('storagesize', self.status)
        if (callback) {
          callback(numberOfKeys)
        }
      },
      function (err) {
        callback(0)
        throw err
      },
    )
  },

  _resetStatus: function (tiles) {
    this.status.lengthLoaded = 0
    this.status.lengthToBeSaved = tiles.length
    this.status.lengthSaved = 0
    this.status._tilesforSave = tiles
    this.status.mapSize = 0
  },

  /**
   * Prepare zoom levels to download and activate callback function to
   * save(async) all map tiles on table name confirmation'.
   */
  saveMap: function ({ store, layer }) {
    const {
      setLocalMapValues,
      setLocalMapLoadingFraction,
      setLocalMapLoading,
    } = store
    setLocalMapLoadingFraction(0)
    let zoomlevels = []
    if (this.options.zoomlevels) {
      // zoomlevels have higher priority than maxZoom
      zoomlevels = this.options.zoomlevels
    } else {
      const currentZoom = this._map.getZoom()
      if (currentZoom < this.options.minimalZoom) {
        throw new Error(
          'Not allowed to save with zoom level below ' +
            this.options.minimalZoom,
        )
      }
      const maxZoom =
        this.baseLayer.options.maxZoom ||
        this._map.options.maxZoom ||
        this.options.maxZoom ||
        currentZoom
      for (let zoom = currentZoom; zoom <= maxZoom; zoom++) {
        zoomlevels.push(zoom)
      }
    }

    const latlngBounds = this.options.bounds || this._map.getBounds()

    let bnds
    let tiles = []
    for (let i = 0; i < zoomlevels.length; i++) {
      if (zoomlevels[i] < this.options.minimalZoom) continue
      bnds = L.bounds(
        this._map.project(latlngBounds.getNorthWest(), zoomlevels[i]),
        this._map.project(latlngBounds.getSouthEast(), zoomlevels[i]),
      )
      tiles = tiles.concat(this.baseLayer.getTileUrls(bnds, zoomlevels[i]))
    }
    this._resetStatus(tiles)
    this.status.currMinZoom = zoomlevels[0]
    setLocalMapValues({
      id: layer.id,
      tilesCount: tiles.length,
    })

    const saveCallback = async (tblName = layer.id) => {
      if (this.status.tnames.indexOf(tblName) < 0) {
        // create new table on 1st tile and save all tiles into it
        await this._extendSchema('+' + tblName).catch((err) => console.log(err))
      } else {
        //overwrite existing table
        await this._db
          .table(tblName)
          .clear()
          .catch((err) => console.log(err))
      }
      this.setTable(tblName)

      const tilesLength = tiles.length
      setLocalMapLoadingFraction(0)
      const results = await Promise.allSettled(
        tiles.map(async (tile, index) => {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this
          await self._downloadTile(tile.url).then((blob) => {
            self._saveTile(tile.key, blob)
            self.status.mapSize += blob.size
            self.status.lengthLoaded += 1
            setLocalMapLoadingFraction((index + 1) / tilesLength)
          })
        }),
      )
      setLocalMapLoadingFraction(1)
      // set this in store / tile_layer?
      const res = countBy(results, 'status')
      const mapValues = {
        id: layer.id,
        fulfilled: res.fulfilled ?? 0,
        rejected: res.rejected ?? 0,
        size: this.status.mapSize,
      }
      setLocalMapLoading({
        fulfilled: res.fulfilled ?? 0,
        rejected: res.rejected ?? 0,
      })
      setLocalMapValues(mapValues)
      // set bounds and update size in dexie
      const tileLayer = await dexie.tile_layers.get(layer.id)
      const was = { ...tileLayer }
      const update = {
        local_data_size: (tileLayer.local_data_size ?? 0) + this.status.mapSize,
        local_data_bounds: [
          ...(tileLayer.local_data_bounds ?? []),
          latlngBounds,
        ],
      }
      dexie.tile_layers.update(layer.id, update)
      const is = await dexie.tile_layers.get(layer.id)
      const session = supabase.auth.session()
      tileLayer.updateOnServer({ was, is, session })
    }

    if (this.options.confirmSave) {
      this.options.confirmSave(this.status, saveCallback)
    }
  },

  _downloadTile: async (tileUrl) => {
    // download one tile by url
    const response = await fetch(tileUrl)
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`)
    }
    return response.blob()
  },

  _saveTile: function (tileUrl, blob) {
    // save one tile by URL key
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    if (this.dtable == null) return
    this.dtable
      .put(blob, tileUrl)
      .then(() => {
        // store the binary data
        self.status.lengthSaved++
        self.baseLayer.fire('saved1tile', self.status)
        if (self.status.lengthSaved === self.status.lengthToBeSaved) {
          self.baseLayer.fire('tblevent', self.status) // entire map saved
          self.setStorageSize()
        }
      })
      .catch((err) => console.log(err))
  },

  _extendSchema: async function (tbl) {
    // replace db schema in Dexie.js
    // add table: prefix name with "+", delete: table name only
    this._db.close()
    const currSchema = this.status.tnames.reduce(function (obj, v) {
      obj[v] = ''
      return obj
    }, {})
    let extendedSchema
    if (tbl.startsWith('+')) {
      //add
      tbl = tbl.substring(1)
      extendedSchema = { [tbl]: '' }
      this.status.tnames.push(tbl)
    } else {
      //delete
      extendedSchema = { [tbl]: null }
      this.status.tnames.splice(this.status.tnames.indexOf(tbl), 1)
    }
    this._db.version(this._dbversion).stores(currSchema)
    this._dbversion++
    this._db.version(Math.round(this._dbversion)).stores(extendedSchema)
    return await this._db.open()
  },
})

/**
 * @function L.control.savetiles
 * @param  {object} baseLayer     {@link http://leafletjs.com/reference-1.2.0.html#tilelayer}
 * @property {Object} options
 * @property {number} [options.maxZoom] maximum zoom level that will be reached when saving tiles
 * @property {function} [options.confirmSave] function called before confirm, default null.
 * @return {ControlSaveTiles}
 */
L.control.savetiles = function (baseLayer, options) {
  return new ControlSaveTiles(baseLayer, options)
}
