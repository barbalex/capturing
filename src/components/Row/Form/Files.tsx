import { useCallback } from 'react'
import Dropzone from 'react-dropzone'
import { FaRegTimesCircle } from 'react-icons/fa'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import SparkMD5 from 'spark-md5'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'

import ErrorBoundary from '../../shared/ErrorBoundary'
import { dexie, File, Field } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const Container = styled.div`
  grid-area: areaLinks;
  display: grid;
  grid-template-columns: calc(100% - 308px) 300px;
  grid-template-areas: 'title dropzone' 'links dropzone';
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  padding: 8px;
  border-bottom: none;
  border-collapse: collapse;
`
const Title = styled.div`
  font-weight: 900;
  font-size: 16px;
  grid-area: title;
`
const FileList = styled.div`
  grid-area: links;
  display: block;
  grid-template-columns: none;
`
const FileContainer = styled.div`
  grid-column: 1;
  display: grid;
  grid-template-columns: calc(100% - 20px) 20px;
  grid-gap: 0;
  border-bottom: thin solid #cecbcb;
  padding: 3px;
  align-items: center;
  min-height: 35px;
  &:first-of-type {
    border-top: thin solid #cecbcb;
  }
  &:hover {
    background-color: #ceffe5;
  }
`
const UrlDiv = styled.div`
  grid-column: 1 / span 1;
  grid-column: 1;
`
const RemoveIconContainer = styled.div`
  grid-column: 2 / span 1;
  margin-top: -2px;
`
const RemoveIcon = styled(FaRegTimesCircle)`
  color: red;
  font-size: 18px;
  cursor: pointer;
`
const DropzoneContainer = styled.div`
  grid-area: dropzone;
  width: 100%;
  height: 100%;
`
const StyledDropzone = styled(Dropzone)`
  width: 100%;
  height: 100%;
  border-color: transparent;
`
const DropzoneInnerDiv = styled.div`
  width: 100%;
  height: 100%;
  border-width: 2px;
  border-color: #666;
  border-style: dashed;
  border-radius: 5px;
  padding: 5px;
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
        .where({ row_id: rowId, field_id: field.id })
        .sortBy('name'),
  )

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
        <FileList>
          {(files ?? []).map((file) => (
            <FileContainer key={file.id}>
              <UrlDiv>
                <p
                  onClick={(event) => {
                    event.preventDefault()
                    // shell.open(link.url)  // TODO: adapt to browser
                  }}
                >
                  {file.name}
                </p>
              </UrlDiv>
              <RemoveIconContainer>
                <RemoveIcon
                  onClick={() => {
                    // TODO:
                    // remove file from db
                  }}
                  title="Link entfernen"
                />
              </RemoveIconContainer>
            </FileContainer>
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
                  <div>Datei hierhin ziehen...</div>
                  <div>...oder klicken, um sie zu wählen.</div>
                </DropzoneInnerDiv>
              )
            }}
          </StyledDropzone>
        </DropzoneContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Files)
