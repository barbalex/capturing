import { useCallback, useEffect, useState } from 'react'
import { FaRegTimesCircle } from 'react-icons/fa'
import { MdFileDownload } from 'react-icons/md'
import styled from 'styled-components'
import { Session } from '@supabase/supabase-js'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import fileSaver from 'file-saver'

import ErrorBoundary from '../../../shared/ErrorBoundary'
import { FileMeta } from '../../../../dexieClient'
import { supabase } from '../../../../supabaseClient'

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
  cursor: pointer;
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
  file: FileMeta
}

const Files = ({ file }: Props) => {
  const session: Session = supabase.auth.session()

  // if (file.name === '2007-06-17_15.JPG') {
  // console.log('File, file:', file)
  // }

  const onClickItem = useCallback(() => {
    console.log('item clicked')
  }, [])

  const onClickRemove = useCallback(
    (e) => {
      e.stopPropagation()
      file.deleteOnServerAndClient({ session })
    },
    [file, session],
  )

  const [blob, setBlob] = useState()
  useEffect(() => {
    if (!file.file) return
    // const blob = new Blob([new Uint8Array(file.file)], {
    //   type: file.type,
    // })
    const blob = new Blob([file.file], {
      type: file.type,
    })
    setBlob(blob)
  }, [file.file, file.type])

  const onClickDownload = useCallback(
    async (e) => {
      e.stopPropagation()

      // if (file.name === '2007-06-17_15.JPG') {
      //   console.log('File, onClickDownload', { blob, file: file.file })
      // }
      fileSaver.saveAs(blob, file.name)
    },
    [blob, file.name],
  )

  const isImage = (file.type?.includes('image') && !!file.file) ?? false
  const [preview, setPreview] = useState()
  useEffect(() => {
    if (isImage && !!blob) {
      let objectUrl
      try {
        objectUrl = URL.createObjectURL(blob)
      } catch (error) {
        return console.log('Error creating object url:', error)
      }
      // console.log('File, setting preview', {
      //   file: file.file,
      //   blob,
      //   isImage,
      //   objectUrl,
      // })
      setPreview(objectUrl)
    }
    return () => URL.revokeObjectURL(blob)
  }, [blob, file, file.file, isImage])

  return (
    <ErrorBoundary>
      <StyledListItem divider onClick={onClickItem}>
        {!!preview && <Image height={55} src={preview} />}
        <StyledListItemText primary={file.name} secondary={file.type} />
        <IconContainer>
          <IconButton
            title={`${file.name ?? 'Datei'} herunterladen`}
            onClick={onClickDownload}
            size="medium"
          >
            <MdFileDownload />
          </IconButton>
          <IconButton
            title={`${file.name ?? 'Datei'} entfernen`}
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

export default Files
