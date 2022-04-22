import { useCallback, useEffect, useState } from 'react'
import Dropzone from 'react-dropzone'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import SparkMD5 from 'spark-md5'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'
import List from '@mui/material/List'
import FormHelperText from '@mui/material/FormHelperText'

import ErrorBoundary from '../../../shared/ErrorBoundary'
import { dexie, File, Field } from '../../../../dexieClient'
import { supabase } from '../../../../supabaseClient'
import FileComponent from './File'

const Container = styled.div`
  grid-area: areaLinks;
  display: grid;
  grid-template-columns: 1fr 220px;
  grid-template-areas: 'title dropzone' 'links dropzone';
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  border-bottom: none;
  border-collapse: collapse;
`
const Title = styled.div`
  font-weight: 900;
  font-size: 16px;
  grid-area: title;
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
  border-color: #4a148c;
  border-style: dashed;
  border-radius: 5px;
  padding: 5px;
  font-size: small;
  color: rgb(0, 0, 0, 0.54);
`
type Props = {
  field: Field
}
const Files = ({ field }: Props) => {
  const session: Session = supabase.auth.session()
  const { rowId } = useParams()
  const files = useLiveQuery(
    async () =>
      await dexie.files
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
          // TODO: check that name is unique
          const nameCount = await dexie.files
            .where({
              row_id: rowId,
              field_id: field.id,
              deleted: 0,
              // eslint-disable-next-line no-useless-escape
              name: file.name.replace(/^.*[\\\/]/, ''),
            })
            .count()
          if (nameCount > 0) {
            return setError(
              'Dieser Dateiname existiert bereits. Ein Dateiname kann pro Datensatz und Feld nur ein mal vorkommen.',
            )
          }
          // Do whatever you want with the file contents
          const binaryStr = reader.result // seems to be ArrayBuffer
          console.log('file content:', {
            name: file.name,
            content: binaryStr,
            file,
            fileType: file.type,
          })

          const newFile = new File(
            undefined,
            rowId,
            field.id,
            // eslint-disable-next-line no-useless-escape
            file.name.replace(/^.*[\\\/]/, ''),
            file.type,
            undefined,
            binaryStr,
            SparkMD5.ArrayBuffer.hash(binaryStr, true),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
          )
          console.log('Files, onDrop, newFile:', newFile)
          dexie.files.put(newFile)
          // TODO:
          newFile.updateOnServer({
            was: null,
            is: newFile,
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
      <Container>
        <Title>Dateien</Title>
        <FileList dense>
          {(files ?? []).map((file) => (
            <FileComponent key={file.id} file={file} />
          ))}
        </FileList>
        <DropzoneContainer>
          <StyledDropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps, isDragActive, isDragReject }) => {
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
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Files)
