import { dexie, PVLGeom, QueuedUpdate } from '../dexieClient'

type Props = {
  pvlId: string
}

const insertPVLGeom = async ({ pvlId }: Props) => {
  const newPVLGeom = new PVLGeom(
    undefined,
    pvlId,
    undefined,
    undefined,
    undefined, // bbox set by PVLGeom class
    undefined, // bbox set by PVLGeom class
    undefined, // bbox set by PVLGeom class
    undefined, // bbox set by PVLGeom class
    undefined,
    undefined,
    undefined,
    0,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'pvl_geoms',
    JSON.stringify(newPVLGeom),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.pvl_geoms.put(newPVLGeom),
    dexie.queued_updates.add(update),
  ])
  return newPVLGeom.id
}

export default insertPVLGeom
