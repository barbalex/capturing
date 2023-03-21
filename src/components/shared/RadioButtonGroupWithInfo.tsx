import React from 'react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import RadioButtonGroup from './RadioButtonGroup'
import InfoWithPopover from './InfoWithPopover'
import { Option } from '../../dexieClient'

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  break-inside: avoid;
`

interface Props {
  label: string
  name: string
  value: any
  error?: string
  dataSource: Option[]
  onBlur: (event: React.ChangeEvent<HTMLInputElement>) => void
  popover: React.ReactNode
}

const RadioButtonGroupWithInfo = ({
  label,
  name,
  value,
  error,
  dataSource,
  onBlur,
  popover,
}: Props) => (
  <Container>
    <RadioButtonGroup
      value={value}
      name={name}
      dataSource={dataSource}
      onBlur={onBlur}
      label={label}
      error={error}
    />
    <InfoWithPopover>{popover}</InfoWithPopover>
  </Container>
)

RadioButtonGroupWithInfo.defaultProps = {
  value: '',
}

export default observer(RadioButtonGroupWithInfo)
