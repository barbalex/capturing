import { useCallback, useEffect, useState, useContext } from 'react'
import { FaRegTimesCircle } from 'react-icons/fa'
import { MdFileDownload } from 'react-icons/md'
import styled from '@emotion/styled'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import fileSaver from 'file-saver'
import { observer } from 'mobx-react-lite'

import ErrorBoundary from '../../../shared/ErrorBoundary'
import { dexie, FileMeta, File } from '../../../../dexieClient'
import storeContext from '../../../../storeContext'

const StyledListItem = styled(ListItem)`
  padding-left: 8px;
  padding-right: 8px;
  &:first-of-type {
    border-top: 1px solid rgba(74, 20, 140, 0.1);
  }
  &:hover {
    background-color: rgba(74, 20, 140, 0.1);
  }
  border-color: rgba(74, 20, 140, 0.1);
`
const RemoveIcon = styled(FaRegTimesCircle)``
const StyledListItemText = styled(ListItemText)`
  p {
    font-size: x-small;
  }
`
const IconContainer = styled.div`
  display: flex;
  flex-basis: 100px;
  justify-content: flex-end;
`
const Image = styled.img`
  padding-right: 8px;
  vertical-align: center;
  text-align: center;
  width: 80px;
`

type Props = {
  fileMeta: FileMeta
}

const Files = ({ fileMeta }: Props) => {
  const { session } = useContext(storeContext)

  const onClickRemove = useCallback(
    (e) => {
      e.stopPropagation()
      fileMeta.deleteOnServerAndClient({ session })
    },
    [fileMeta, session],
  )

  const [blob, setBlob] = useState<Blob>()
  useEffect(() => {
    dexie.files.get(fileMeta.id).then((file: File) => {
      if (!file) return
      const blob = new Blob([file.file], {
        type: fileMeta.type,
      })
      setBlob(blob)
    })
  }, [fileMeta.file, fileMeta.id, fileMeta.type])

  const onClickDownload = useCallback(
    async (e) => {
      e.stopPropagation()

      fileSaver.saveAs(blob, fileMeta.name)
    },
    [blob, fileMeta.name],
  )

  const isImage = fileMeta.type?.includes('image') ?? false
  const [preview, setPreview] = useState<string>()
  useEffect(() => {
    if (isImage && !!blob) {
      let objectUrl
      try {
        objectUrl = URL.createObjectURL(blob)
      } catch (error) {
        return console.error('Error creating object url:', error)
      }
      setPreview(objectUrl)
    }
    return () => URL.revokeObjectURL(blob)
  }, [blob, fileMeta, fileMeta.file, isImage])

  return (
    <ErrorBoundary>
      <StyledListItem divider>
        {!!preview && <Image height={55} src={preview} />}
        <StyledListItemText primary={fileMeta.name} secondary={fileMeta.type} />
        <IconContainer>
          <IconButton
            title={`${fileMeta.name ?? 'Datei'} herunterladen`}
            onClick={onClickDownload}
            size="medium"
          >
            <MdFileDownload />
          </IconButton>
          <IconButton
            title={`${fileMeta.name ?? 'Datei'} entfernen`}
            onClick={onClickRemove}
            size="medium"
          >
            <RemoveIcon />
          </IconButton>
        </IconContainer>
      </StyledListItem>
    </ErrorBoundary>
  )
}

export default observer(Files)
