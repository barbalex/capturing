import { useLiveQuery } from 'dexie-react-hooks'

import Select from '../../shared/Select'

import { dexie, Row, Field, Table } from '../../../dexieClient'

type Props = {
  field: Field
  row: Row
}
type DataType = {
  optionRows: Row[]
  optionTable: Table
}

const OptionsMany = ({ field, row }: Props) => {
  const data: DataType = await useLiveQuery(async () => {
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
  const isIdValueList = optionTable.type === 'id_value_list'
  const optionValues = optionRowsData.map((d) => ({
    value: isIdValueList ? d.id : d.value,
    label: d.value,
  }))

  return (
    <Select
      key={f.id}
      name={f.name}
      value={row.data?.[f.name] ?? ''}
      field={f.name}
      label={f.label ?? f.name}
      options={optionValues}
      saveToDb={onBlur}
      error={errors?.row?.[f.name]}
      disabled={!userMayEdit}
    />
  )
}

export default OptionsMany
