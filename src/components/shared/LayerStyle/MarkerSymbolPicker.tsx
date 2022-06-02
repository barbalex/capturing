import React, { useMemo } from 'react'
import * as icons from 'react-icons/md'
import styled from 'styled-components'

const SymbolContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 500px;
  overflow: auto;
`

import Label from '../Label'

const MarkerSymbolPicker = () => {
  // console.log('MarkerSymbolPicker, images:', icons)
  const wantedIconKeys = useMemo(
    () =>
      Object.keys(icons)
        .filter((key) => !key.endsWith('Mp'))
        .filter((key) => !key.endsWith('K'))
        .filter((key) => !key.endsWith('KPlus')),
    [],
  )
  console.log('MarkerSymbolPicker, wantedIconKeys:', wantedIconKeys)

  return (
    <>
      <Label label="Symbol wählen" />
      <SymbolContainer>
        {wantedIconKeys.map((key) => {
          const Component = icons[key]

          return (
            <Component
              key={key}
              style={{ fontSize: 'x-large', padding: '3px', cursor: 'hand' }}
            />
          )
        })}
      </SymbolContainer>
    </>
  )
}

export default MarkerSymbolPicker
