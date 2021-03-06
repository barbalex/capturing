import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { motion, useAnimation } from 'framer-motion'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import { useLiveQuery } from 'dexie-react-hooks'
import { Session } from '@supabase/supabase-js'
import { useParams } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import constants from '../../../utils/constants'
import ProjectUsersComponent from './ProjectUsers'
import AddProjectUser from './AddProjectUser'
import { dexie } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding: 0 10px;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1;
  &:first-of-type {
    margin-top: -10px;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const ProjectUsersContainer = styled(List)`
  padding: 0 0 8px 0;
`
const AddButtonRow = styled.div`
  display: flex;
  margin: 0 8px;
`
const AddButton = styled(Button)``

const ProjectUsersIndex = () => {
  const session: Session = supabase.auth.session()
  const { projectId } = useParams()

  const [addNew, setAddNew] = useState(false)

  const [open, setOpen] = useState(false)
  const anim = useAnimation()
  const onClickToggle = useCallback(
    async (e) => {
      e.stopPropagation()
      if (open) {
        const was = open
        await anim.start({ opacity: 0 })
        await anim.start({ height: 0 })
        setOpen(!was)
      } else {
        setOpen(!open)
        setTimeout(async () => {
          await anim.start({ height: 'auto' })
          await anim.start({ opacity: 1 })
        })
      }
    },
    [anim, open],
  )

  const onClickAddUser = useCallback(() => {
    setAddNew(true)
  }, [])

  const data = useLiveQuery(async () => {
    // TODO:
    const [projectUsersCount, projectUser] = await Promise.all([
      dexie.project_users.where({ deleted: 0, project_id: projectId }).count(),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    const userMayEdit: boolean = [
      'account_manager',
      'project_manager',
    ].includes(projectUser?.role)

    return { projectUsersCount, userMayEdit }
  })

  const projectUsersCount = data?.projectUsersCount ?? 0
  const userMayEdit = data?.userMayEdit ?? false

  return (
    <ErrorBoundary>
      <TitleRow onClick={onClickToggle} title={open ? 'schliessen' : '??ffnen'}>
        <Title>{`Mitarbeitende Personen (${projectUsersCount})`}</Title>
        <div>
          <IconButton
            aria-label={open ? 'schliessen' : '??ffnen'}
            title={open ? 'schliessen' : '??ffnen'}
            onClick={onClickToggle}
            size="large"
          >
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </IconButton>
        </div>
      </TitleRow>
      <motion.div animate={anim} transition={{ type: 'just', duration: 0.2 }}>
        {open && (
          <>
            <ProjectUsersContainer>
              <ProjectUsersComponent />
            </ProjectUsersContainer>
            {userMayEdit && !addNew && (
              <AddButtonRow>
                <AddButton
                  title="Neue mitarbeitende Person hinzuf??gen"
                  variant="outlined"
                  onClick={onClickAddUser}
                >
                  Hinzuf??gen
                </AddButton>
              </AddButtonRow>
            )}
            {userMayEdit && addNew && <AddProjectUser setAddNew={setAddNew} />}
          </>
        )}
      </motion.div>
    </ErrorBoundary>
  )
}

export default ProjectUsersIndex
