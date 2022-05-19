import { Session } from '@supabase/supabase-js'

import { dexie, ProjectVectorLayer } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import onMoveVectorLayers from './onMoveVectorLayers'

const onMove = async ({ idsMoved, folderDroppedIn, endIndex, rebuild }) => {
  const session: Session = supabase.auth.session()
  // do not know how multiple nodes can be mooved at once?
  const idMoved = idsMoved[0]
  if (folderDroppedIn.includes('vectorLayersFolder')) {
    await onMoveVectorLayers({ idMoved, folderDroppedIn, endIndex })
    rebuild()
  }
}

export default onMove
