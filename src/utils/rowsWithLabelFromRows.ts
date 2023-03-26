import sortBy from 'lodash/sortBy'

import { Row } from '../dexieClient'

export type RowWithLabel = Row & { label: string }

const rowsWithLabelFromRows = async (rows: Row[]): RowWithLabel[] => {
  const rowPromises = rows.map((r) =>
    r.label.then((label: string) => ({ ...r, label })),
  )
  const rowsWithLabel: RowWithLabel[] = await Promise.all(rowPromises).then(
    (rowsWithLabel) => sortBy(rowsWithLabel, (r) => r.label),
  )
  return rowsWithLabel
}

export default rowsWithLabelFromRows
