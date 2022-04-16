import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { FaArrowUp, FaArrowRight } from 'react-icons/fa'
import { Link, useParams, resolvePath } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Session } from '@supabase/supabase-js'

import StoreContext from '../../../storeContext'
import { dexie, IProjectUser } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const TableNavButtons = () => {
  const { projectId } = useParams()
  const session: Session = supabase.auth.session()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeOpenNode } = store

  const projectUser: IProjectUser = useLiveQuery(
    async () =>
      await dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    [projectId, session?.user?.email],
  )
  const userRole = projectUser?.role
  const userMayManage = userRole === 'project_manager'

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
  }, [activeNodeArray, removeOpenNode])

  return (
    <>
      <IconButton
        title="Zur Liste"
        component={Link}
        to={resolvePath(`..`, window.location.pathname)}
        onClick={onClickUp}
        size="large"
      >
        <FaArrowUp />
      </IconButton>
      {!!userMayManage && (
        <Button endIcon={<FaArrowRight />} component={Link} to="fields">
          Felder
        </Button>
      )}
      <Button endIcon={<FaArrowRight />} component={Link} to="rows">
        Datensätze
      </Button>
    </>
  )
}

export default observer(TableNavButtons)
