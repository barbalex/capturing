import React from 'react'
import * as icons from 'react-icons/md'
import styled from 'styled-components'

const SymbolContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`

import Label from '../Label'

const MarkerSymbolPicker = () => {
  console.log('MarkerSymbolPicker, images:', icons)

  return (
    <>
      <Label label="Symbol wählen" />
      <SymbolContainer>
        {Object.keys(icons).map((Icon) => React.createElement(icons[Icon], {}))}
      </SymbolContainer>
    </>
  )
}

export default MarkerSymbolPicker
