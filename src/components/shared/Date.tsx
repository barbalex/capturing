import React, { useCallback, useState, useEffect } from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import dayjs from 'dayjs'
import DatePicker from 'react-datepicker'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

const StyledFormControl = styled(FormControl)`
  margin-bottom: 19px !important;
  width: 100%;
  .react-datepicker-popper {
    z-index: 2;
  }
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__header {
    background-color: rgba(74, 20, 140, 0.1) !important;
  }
`
const Label = styled(InputLabel)`
  font-size: 12px !important;
  color: rgb(0, 0, 0, 0.54);
  position: relative !important;
  transform: none !important;
`
const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 0.25rem 0;
  color: #495057;
  font-size: 1em;
  background-color: #fff;
  background-clip: padding-box;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 0;
  min-height: 36px !important;
  height: 36px !important;
  background-color: transparent;
  &:focus {
    color: #495057;
    background-color: #fff;
    outline: 0;
    border-bottom: 2px solid #4a148c;
    box-shadow: none;
    background-color: transparent;
  }
`
const dateFormat = [
  'dd.MM.yyyy',
  'd.MM.yyyy',
  'd.M.yyyy',
  'dd.M.yyyy',
  'dd.MM.yy',
  'd.MM.yy',
  'd.M.yy',
  'dd.M.yy',
  'd.M',
  'd.MM',
  'dd.M',
  'dd.MM',
  'd',
  'dd',
]
const timeFormat = [
  'dd.MM.yyyy HH:mm',
  'd.MM.yyyy HH:mm',
  'd.M.yyyy HH:mm',
  'dd.M.yyyy HH:mm',
  'dd.MM.yy HH:mm',
  'd.MM.yy HH:mm',
  'd.M.yy HH:mm',
  'dd.M.yy HH:mm',
  'd.M HH:mm',
  'd.MM HH:mm',
  'dd.M HH:mm',
  'dd.MM HH:mm',
  'd HH:mm',
  'dd HH:mm',
]

const DateField = ({
  value: valuePassed,
  name,
  label,
  saveToDb,
  error,
  popperPlacement = 'auto',
  showTimeSelect = false,
}) => {
  const [stateValue, setStateValue] = useState(valuePassed)
  useEffect(() => {
    setStateValue(valuePassed)
  }, [valuePassed])

  const onChangeDatePicker = useCallback(
    (date) => {
      const newValue =
        date === null
          ? null
          : dayjs(date).format(
              showTimeSelect ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
            )
      setStateValue(newValue)
      saveToDb({
        target: {
          value: newValue,
          name,
        },
      })
    },
    [name, saveToDb, showTimeSelect],
  )

  const isValid = dayjs(stateValue).isValid()
  const selected = isValid ? dayjs(stateValue).toDate() : null

  // for popperPlacement see https://github.com/Hacker0x01/react-datepicker/issues/1246#issuecomment-361833919
  return (
    <StyledFormControl variant="standard">
      <Label htmlFor={name}>{label}</Label>
      <StyledDatePicker
        id={name}
        selected={selected}
        onChange={onChangeDatePicker}
        dateFormat={showTimeSelect ? timeFormat : dateFormat}
        showTimeSelect={showTimeSelect}
        timeCaption="Zeit"
        popperPlacement={popperPlacement}
      />
      {!!error && <FormHelperText>{error}</FormHelperText>}
    </StyledFormControl>
  )
}

export default observer(DateField)
