import { useLiveQuery } from 'dexie-react-hooks'

import Select from '../../shared/Select'

import { dexie, Row, Field, Table } from '../../../dexieClient'

type Props = {
  field: Field
  rowDataState: any
  onBlur: () => void
  error: string
  disabled: boolean
}
type DataType = {
  optionRows: Row[]
  optionTable: Table
}

const OptionsMany = ({
  field,
  rowDataState,
  onBlur,
  error,
  disabled,
}: Props) => {
  const data: DataType = useLiveQuery(async () => {
    const [optionRows, optionTable] = await Promise.all(
      dexie.rows
        .filter((r) => r.table_id === field.options_table && !!r.data)
        .sortBy('value'),
      dexie.ttables.get(field.options_table),
    )
    return { optionRows, optionTable }
  })
  const optionRowsData = data?.optionRows.map((r) => JSON.parse(r.data)) ?? []
  const optionTable: Table = data?.optionTable
  const isIdValueList = optionTable?.type === 'id_value_list'
  const optionValues = optionRowsData.map((d) => ({
    value: isIdValueList ? d.id : d.value,
    label: d.value,
  }))
  console.log('OptionsMany', {
    optionValues,
    isIdValueList,
    optionTable,
    optionRowsData,
    field,
    row,
  })

  return (
    <Select
      key={field.id}
      name={field.name}
      value={rowDataState.current?.[field.name] ?? ''}
      field={field.name}
      label={field.label ?? field.name}
      options={optionValues}
      saveToDb={onBlur}
      error={error}
      disabled={disabled}
    />
  )
}

export default OptionsMany
