import React, { useCallback, useState, useEffect, useRef } from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import dayjs from 'dayjs'
import DatePicker from 'react-datepicker'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'

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
  font-size: 0.8rem;
  color: rgb(0, 0, 0, 0.8);
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
const FocusCatcher = styled.input`
  width: 0;
  height: 0;
  outline: none;
  border: none;
`

interface Props {
  value: string | number | Date | dayjs.Dayjs | null | undefined
  name: string
  label: string
  saveToDb: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  popperPlacement?: string
}

const TimeField = ({
  value: valuePassed,
  name,
  label,
  saveToDb,
  error,
  popperPlacement = 'auto',
}: Props) => {
  const [stateValue, setStateValue] = useState(valuePassed)
  useEffect(() => {
    setStateValue(valuePassed)
  }, [valuePassed])

  const focusCatcherRef = useRef()

  const onChange = useCallback(
    (date: React.SyntheticEvent<any, Event>) => {
      const newValue =
        date === null ? null : dayjs(date).format('YYYY-MM-DD HH:mm')
      setStateValue(newValue)
      saveToDb({
        target: {
          value: newValue,
          name,
        },
      })
      // focus catcher input to garuantee focusleave event on form to garuantee saving
      focusCatcherRef.current.focus()
    },
    [name, saveToDb],
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
        onChange={onChange}
        dateFormat="HH:mm"
        showTimeSelect
        showTimeSelectOnly
        timeCaption="Zeit"
        popperPlacement={popperPlacement}
        timeIntervals={10}
      />
      <FocusCatcher ref={focusCatcherRef} />
      {!!error && <FormHelperText>{error}</FormHelperText>}
    </StyledFormControl>
  )
}

export default observer(TimeField)
