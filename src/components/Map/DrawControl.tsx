import React, { useEffect, useCallback, useContext } from 'react'
import 'leaflet'
import 'leaflet-draw'
import { useMap } from 'react-leaflet'
import { useParams } from 'react-router-dom'
import getBbox from '@turf/bbox'
import { observer } from 'mobx-react-lite'

import { dexie, Row } from '../../dexieClient'
import storeContext from '../../storeContext'

const DrawControl = () => {
  const map = useMap()
  const { session } = useContext(storeContext)

  //console.log('DrawControl, map:', map)

  const { rowId } = useParams()
  const onEdit = useCallback(
    async (featureCollection) => {
      if (!rowId) return console.log('no row edited due to missing rowId')
      const geometry = {
        type: 'GeometryCollection',
        geometries: featureCollection.features
          .filter((f) => !!f.geometry)
          .map((f) => f.geometry),
      }
      const bbox = getBbox(geometry)
      const row: Row = await dexie.rows.get(rowId)
      const was = { ...row }
      const is = { ...row, geometry, bbox }
      dexie.rows.update(rowId, { geometry, bbox })
      row.updateOnServer({
        was,
        is,
        session,
      })
    },
    [rowId, session],
  )

  useEffect(() => {
    window.L.drawLocal.draw.toolbar.buttons.polygon =
      'Polygon(e) zeichnen, um zu filtern'
    window.L.drawLocal.draw.toolbar.buttons.rectangle =
      'Rechteck(e) zeichnen, um zu filtern'
    window.L.drawLocal.draw.toolbar.actions.title = 'Zeichnen rückgängig machen'
    window.L.drawLocal.draw.toolbar.actions.text = 'rückgängig machen'
    window.L.drawLocal.draw.toolbar.finish.title = 'Zeichnen beenden'
    window.L.drawLocal.draw.toolbar.finish.text = 'beenden'
    window.L.drawLocal.draw.toolbar.undo.title =
      'Zuletzt erfassten Punkt löschen'
    window.L.drawLocal.draw.toolbar.undo.text = 'letzten Punkt löschen'
    window.L.drawLocal.draw.handlers.polygon.tooltip.start =
      'Klicken um Polygon zu beginnen'
    window.L.drawLocal.draw.handlers.polygon.tooltip.cont =
      'Klicken um Polygon weiter zu zeichnen'
    window.L.drawLocal.draw.handlers.polygon.tooltip.end =
      'ersten Punkt klicken, um Polygon zu beenden'
    window.L.drawLocal.draw.handlers.rectangle.tooltip.start =
      'Klicken und ziehen, um Rechteck zu zeichnen'
    window.L.drawLocal.edit.toolbar.actions.save.title = 'Zeichnung speichern'
    window.L.drawLocal.edit.toolbar.actions.save.text = 'speichern'
    window.L.drawLocal.edit.toolbar.actions.cancel.title =
      'Zeichnung abbrechen und verwerfen'
    window.L.drawLocal.edit.toolbar.actions.cancel.text = 'abbrechen'
    // window.L.drawLocal.edit.toolbar.actions.clearAll.title = 'alle Umrisse löschen'
    // window.L.drawLocal.edit.toolbar.actions.clearAll.text = 'alle löschen'
    window.L.drawLocal.edit.toolbar.buttons.edit = 'Umriss(e) ändern'
    window.L.drawLocal.edit.toolbar.buttons.editDisabled =
      'Umriss(e) ändern (aktuell gibt es keine)'
    window.L.drawLocal.edit.toolbar.buttons.remove = 'Umriss(e) löschen'
    window.L.drawLocal.edit.toolbar.buttons.removeDisabled =
      'Umriss(e) löschen (aktuell gibt es keine)'
    window.L.drawLocal.edit.handlers.edit.tooltip.text = `dann auf 'speichern' klicken`
    window.L.drawLocal.edit.handlers.edit.tooltip.subtext =
      'Punkte ziehen, um Umriss(e) zu verändern'
    window.L.drawLocal.edit.handlers.remove.tooltip.text = `zum Löschen auf Umriss klicken, dann auf 'speichern'`

    // solution to allow only one geometry to be drawn
    // see: https://github.com/Leaflet/Leaflet.draw/issues/315#issuecomment-500246272
    const drawLayer = new window.L.FeatureGroup()
    map.addLayer(drawLayer)
    // TODO: if row has geometry, add it
    // like this?: drawLayer.addLayer(e.layer)
    const drawControlFull = new window.L.Control.Draw({
      draw: {
        marker: true,
        polyline: true,
        circle: true,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawLayer,
      },
    })

    map.addControl(drawControlFull)
    map.on('draw:created', (e) => {
      drawLayer.addLayer(e.layer)
      onEdit(drawLayer.toGeoJSON())
    })
    map.on('draw:edited', () => {
      onEdit(drawLayer.toGeoJSON())
    })
    map.on('draw:deleted', () => {
      onEdit(drawLayer.toGeoJSON())
    })

    return () => {
      map.removeLayer(drawLayer)
      map.removeControl(drawControlFull)
      // map.removeControl(drawControlEditOnly)
      map.off('draw:created')
      map.off('draw:edited')
      map.off('draw:deleted')
    }
  }, [map, onEdit, rowId])

  return <div style={{ display: 'none' }} />
}

export default observer(DrawControl)
