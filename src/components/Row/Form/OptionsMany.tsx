import { useLiveQuery } from 'dexie-react-hooks'
import sortBy from 'lodash/sortBy'

import Select from '../../shared/Select'

import { dexie, Field } from '../../../dexieClient'

type Props = {
  field: Field
  rowState: any
  onBlur: () => void
  error: string
  disabled: boolean
}

const OptionsMany = ({ field, rowState, onBlur, error, disabled }: Props) => {
  const options = useLiveQuery(async () => {
    const optionRows = await dexie.rows
      .filter(
        (r) =>
          r.table_id === (field?.options_table ?? field?.table_rel) && !!r.data,
      )
      .toArray()

    const data = []
    for (const row of optionRows ?? []) {
      const label = await row.label
      data.push({ value: row.id, label })
    }

    return data
  })
  const optionValues = options ?? []
  const optionValuesSorted = sortBy(optionValues, 'label')
  // console.log('OptionsMany', {
  //   optionRows,
  //   field,
  //   data,
  // })

  return (
    <Select
      key={field.id}
      name={field.name}
      value={rowState?.data?.[field.name] ?? ''}
      field={field.name}
      label={field.label ?? field.name}
      options={optionValuesSorted}
      saveToDb={onBlur}
      error={error}
      disabled={disabled}
    />
  )
}

export default OptionsMany
