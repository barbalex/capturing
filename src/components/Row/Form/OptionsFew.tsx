import { useLiveQuery } from 'dexie-react-hooks'
import sortBy from 'lodash/sortBy'

import RadioButtonGroup from '../../shared/RadioButtonGroup'

import { dexie, Row, Field, Table } from '../../../dexieClient'

type Props = {
  field: Field
  rowState: any
  onBlur: () => void
  error: string
  disabled: boolean
}
type DataType = {
  optionRows: Row[]
  optionTable: Table
}

const OptionsFew = ({ field, rowState, onBlur, error, disabled }: Props) => {
  const data: DataType = useLiveQuery(async () => {
    const [optionRows, optionTable] = await Promise.all(
      dexie.rows
        .filter((r) => r.table_id === field.options_table && !!r.data)
        .toArray(),
      dexie.ttables.get(field.options_table),
    )
    return { optionRows, optionTable }
  })
  const optionRowsData = data?.optionRows?.map((r) => r.data) ?? []
  const optionTable: Table = data?.optionTable
  const isIdValueList = optionTable?.type === 'id_value_list'
  const optionValues = optionRowsData.map((d) => ({
    value: isIdValueList ? d.id : d.value,
    label: d.value,
  }))
  const optionValuesSorted = sortBy(optionValues, 'label')

  return (
    <RadioButtonGroup
      key={field.id}
      name={field.name}
      value={rowState?.data?.[field.name] ?? ''}
      field={field.name}
      label={field.label ?? field.name}
      dataSource={optionValuesSorted}
      onBlur={onBlur}
      error={error}
      disabled={disabled}
    />
  )
}

export default OptionsFew
