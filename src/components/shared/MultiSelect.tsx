import React, { useCallback } from 'react'
import Select from 'react-select'
import FormHelperText from '@mui/material/FormHelperText'
import styled from '@emotion/styled'

import { Option } from '../../dexieClient'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 19px;
`
const Label = styled.div`
  font-size: 0.8rem;
  height: 12px !important;
  color: rgb(0, 0, 0, 0.8);
`
const Error = styled.div`
  font-size: 12px;
  color: red;
`
const StyledSelect = styled(Select)`
  .react-select__control {
    background-color: rgba(0, 0, 0, 0) !important;
    border-bottom-color: rgba(0, 0, 0, 0.1);
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0;
    min-height: 36px !important;
  }
  .react-select__control:hover {
    border-bottom-width: 2px;
  }
  .react-select__control:focus-within {
    border-bottom-color: #4a148c !important;
    box-shadow: none;
  }
  .react-select__value-container {
    padding-left: 0;
  }
  .react-select__indicators {
    @media print {
      display: none;
    }
  }
  .react-select__clear-indicator {
    /* ability to hide caret when not enough space */
    padding-right: ${(props) => (props.nocaret ? '0' : '8px')};
  }
  .react-select__dropdown-indicator {
    /* ability to hide caret when not enough space */
    display: ${(props) => (props.nocaret ? 'none' : 'flex')};
  }
  .react-select__indicator-separator {
    /* ability to hide caret when not enough space */
    width: ${(props) => (props.nocaret ? '0' : '1px')};
  }
  input {
    @media print {
      padding-top: 3px;
      padding-bottom: 0;
    }
  }
  .react-select__menu,
  .react-select__menu-list {
    height: 130px;
    height: ${(props) => (props.maxheight ? `${props.maxheight}px` : 'unset')};
    /* make it open over titlerow (which needs to have z-index 1 to hide text scolling below it)*/
    z-index: 2;
  }
  .react-select__multi-value {
    background-color: rgba(74, 20, 140, 0.1);
  }
  .react-select__multi-value__remove:hover {
    color: white;
    background-color: rgba(74, 20, 140, 0.2);
  }
`

interface Props {
  value: Option[]
  field?: string
  label?: string
  name: string
  error: string
  helperText?: string
  options: Option[]
  maxHeight?: number
  isClearable?: boolean
  noCaret?: boolean
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
}

const SharedMultiSelect = ({
  value,
  field = '',
  label,
  name,
  error,
  helperText,
  options,
  maxHeight = null,
  isClearable = true,
  noCaret = false,
  onBlur,
}: Props) => {
  const onChange = useCallback(
    (options) => {
      const fakeEvent = {
        target: {
          name,
          value: options.map((o) => o.value),
          type: 'array',
        },
      }
      onBlur(fakeEvent)
    },
    [name, onBlur],
  )

  return (
    <Container>
      {label && <Label>{label}</Label>}
      <StyledSelect
        id={field}
        name={field}
        value={value}
        options={options}
        onChange={onChange}
        hideSelectedOptions
        placeholder=""
        isClearable={isClearable}
        isSearchable
        noOptionsMessage={() => '(keine)'}
        maxheight={maxHeight}
        classNamePrefix="react-select"
        nocaret={noCaret}
        isMulti
      />
      {error && <Error>{error}</Error>}
      {!!helperText && <FormHelperText>{helperText}</FormHelperText>}
    </Container>
  )
}

export default SharedMultiSelect
