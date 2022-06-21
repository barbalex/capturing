import { dexie, Field } from '../../dexieClient'
import textFromLexical from '../../utils/textFromLexical'

const createDataArrayForRevComparison = async ({ row, revRow }) => {
  const rowData = row.data ?? {}
  const revRowData = revRow.data ?? {}
  const dataKeys = [...Object.keys(rowData), ...Object.keys(revRowData)]
  const uniqueDataKeys = [...new Set(dataKeys)]

  // build field/value for data field
  const data = []
  for (const key of uniqueDataKeys) {
    let valueInRow = row.data?.[key]
    let valueInRev = revRow.data?.[key]
    // rich-text fields: need to build a string value
    const field: Field = await dexie.fields.where({ name: key }).first()
    if (field.widget_type === 'rich-text') {
      valueInRow = await textFromLexical(row.data?.[key])
      valueInRev = await textFromLexical(revRow.data?.[key])
    }
    data.push({
      valueInRow,
      valueInRev,
      label: key,
    })
  }

  return [
    {
      valueInRow: row.table_id,
      valueInRev: revRow.table_id,
      label: 'Tabelle (id)',
    },
    {
      valueInRow: row?.geometry,
      valueInRev: revRow?.geometry,
      label: 'Geometrie',
    },
    ...data,
    {
      valueInRow: row.client_rev_at,
      valueInRev: revRow.client_rev_at,
      label: 'geändert',
    },
    {
      valueInRow: row.client_rev_by,
      valueInRev: revRow.client_rev_by,
      label: 'geändert von',
    },
    {
      valueInRow: row._deleted,
      valueInRev: revRow._deleted,
      label: 'gelöscht',
    },
  ]
}

export default createDataArrayForRevComparison
