import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { FaArrowUp, FaArrowRight } from 'react-icons/fa'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Session } from '@supabase/supabase-js'

import StoreContext from '../../../storeContext'
import { dexie, IProjectUser } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const ProjectNavButtons = () => {
  const { projectId } = useParams()
  const session: Session = supabase.auth.session()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeOpenNode } = store

  const projectUser: IProjectUser = useLiveQuery(
    async () =>
      await dexie.project_users
        .where({
          project_id: projectId,
          user_email: session?.user?.email,
        })
        .first(),
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
        to={`/${activeNodeArray.slice(0, -1).join('/')}`}
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

export default observer(ProjectNavButtons)
