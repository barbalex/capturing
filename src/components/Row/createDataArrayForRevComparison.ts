import { dexie, Field, Row } from '../../dexieClient'
import textFromLexical from '../../utils/textFromLexical'

interface Props {
  row: Row
  revRow: any
}
export interface DataForRevComparison {
  valueInRow: any
  valueInRev: any
  label: string
}

const createDataArrayForRevComparison = async ({
  row,
  revRow,
}: Props): DataForRevComparison[] => {
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
    if (field.field_type === 'boolean') {
      valueInRow =
        row.data?.[key] === 1 ? true : row.data?.[key] === 0 ? false : undefined
      valueInRev =
        revRow.data?.[key] === 1
          ? true
          : revRow.data?.[key] === 0
          ? false
          : undefined
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
      valueInRow:
        row._deleted === 1 ? true : revRow.deleted === 0 ? false : undefined,
      valueInRev:
        revRow._deleted === 1 ? true : revRow.deleted === 0 ? false : undefined,
      label: 'gelöscht',
    },
  ]
}

export default createDataArrayForRevComparison
