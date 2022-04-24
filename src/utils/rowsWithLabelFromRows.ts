import sortBy from 'lodash/sortBy'

const rowsWithLabelFromRows = async (rows) => {
  const rowPromises = rows.map((r) =>
    r.label.then((label) => ({ ...r, label })),
  )
  const rowsWithLabel = await Promise.all(rowPromises).then((rowsWithLabel) =>
    sortBy(rowsWithLabel, (r) => r.label),
  )
  return rowsWithLabel
}

export default rowsWithLabelFromRows
