import React from 'react'
import styled from '@emotion/styled'

const StyledLabel = styled.div`
  margin-top: 10px;
  cursor: text;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.8);
  pointer-events: none;
  user-select: none;
  padding-bottom: 8px;
`

const Label = ({ label }: { label: string }) => (
  <StyledLabel>{label}</StyledLabel>
)

export default Label
