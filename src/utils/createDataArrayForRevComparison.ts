const createDataArrayForRevComparison = ({ row, revRow }) => {
  const rowData = row.data ?? {}
  const revRowData = revRow.data ?? {}
  const dataKeys = [...Object.keys(rowData), ...Object.keys(revRowData)]
  const uniqueDataKeys = [...new Set(dataKeys)]

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
    // TODO: map all data keys
    ...uniqueDataKeys.map((k) => ({
      valueInRow: row.data?.[k],
      valueInRev: revRow.data?.[k],
      label: k,
    })),
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
