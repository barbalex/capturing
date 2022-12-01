import { useCallback, useEffect, useState, useContext } from 'react'
import Dropzone from 'react-dropzone'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import List from '@mui/material/List'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'

import ErrorBoundary from '../../../shared/ErrorBoundary'
import { dexie, FileMeta, Field } from '../../../../dexieClient'
import FileComponent from './File'
import insertFile from '../../../../utils/insertFile'
import storeContext from '../../../../storeContext'

const Container = styled.div`
  padding: 0 8px;
`
const FilesContainer = styled.div`
  grid-area: areaLinks;
  display: grid;
  grid-template-columns: 1fr 220px;
  grid-template-areas: 'title dropzone' 'links dropzone';
  column-gap: 4px;
  row-gap: 4px;
  border-bottom: none;
  border-collapse: collapse;
`
const FileList = styled(List)`
  grid-area: links;
  display: block;
  grid-template-columns: none;
`
const DropzoneContainer = styled.div`
  grid-area: dropzone;
  cursor: pointer;
`
const StyledDropzone = styled(Dropzone)`
  border-color: transparent;
`
const DropzoneInnerDiv = styled.div`
  height: 100%;
  border-width: 2px;
  border-color: rgba(74, 20, 140, 0.4);
  border-style: dashed;
  border-radius: 5px;
  padding: 5px;
  font-size: small;
  color: rgb(0, 0, 0, 0.8);
`
const StyledFormLabel = styled(FormLabel)`
  padding-top: 1px !important;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.8);
  cursor: text;
  user-select: none;
  pointer-events: none;
  padding-bottom: 8px !important;
`

type Props = {
  field: Field
}

const Files = ({ field }: Props) => {
  const { session } = useContext(storeContext)
  const { rowId } = useParams()
  const filesMeta = useLiveQuery(
    async () =>
      await dexie.files_meta
        .where({ row_id: rowId, field_id: field.id, deleted: 0 })
        .sortBy('name'),
    [field, rowId],
  )

  const [error, setError] = useState()
  useEffect(() => {
    setError(undefined)
  }, [rowId])

  const onDrop = useCallback(
    (files) => {
      // TODO:
      // insert files into db
      for (const file of files) {
        // use file.name to create name if empty
        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = async () => {
          // Do whatever you want with the file contents
          const binaryStr = reader.result // seems to be ArrayBuffer

          // console.log('file content:', {
          //   name: file.name,
          //   content: binaryStr,
          //   file,
          //   fileType: file.type,
          // })

          const id = await insertFile({ file: binaryStr })

          const newFileMeta = new FileMeta(
            id,
            rowId,
            field.id,
            file.name,
            file.type,
          )
          console.log('Files, onDrop, newFileMeta:', newFileMeta)
          dexie.files_meta.put(newFileMeta)
          newFileMeta.updateOnServer({
            was: null,
            is: newFileMeta,
            session,
          })
          setError(undefined)
        }
        reader.readAsArrayBuffer(file)
      }
    },
    [field.id, rowId, session],
  )

  return (
    <ErrorBoundary>
      <StyledFormLabel>{field.name}</StyledFormLabel>
      <Container>
        <FilesContainer>
          <FileList dense>
            {(filesMeta ?? []).map((fileMeta) => (
              <FileComponent key={fileMeta.id} fileMeta={fileMeta} />
            ))}
          </FileList>
          <DropzoneContainer>
            <StyledDropzone onDrop={onDrop}>
              {({
                getRootProps,
                getInputProps,
                isDragActive,
                isDragReject,
              }) => {
                if (isDragActive) {
                  return (
                    <DropzoneInnerDiv {...getRootProps()}>
                      <div>jetzt fallen lassen...</div>
                    </DropzoneInnerDiv>
                  )
                }
                if (isDragReject) {
                  return (
                    <DropzoneInnerDiv {...getRootProps()}>
                      <div>Hm. Da ging etwas schief :-(</div>
                    </DropzoneInnerDiv>
                  )
                }
                return (
                  <DropzoneInnerDiv {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div>Neue Datei</div>
                    <div>(hier klicken oder fallen lassen)</div>
                  </DropzoneInnerDiv>
                )
              }}
            </StyledDropzone>
          </DropzoneContainer>
          {!!error && (
            <FormHelperText id="filesErrorText" error>
              {error}
            </FormHelperText>
          )}
        </FilesContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Files)
