const propertiesToRemove = [
  'client_rev_at',
  'client_rev_by',
  'depth',
  'revisions',
  'parent_rev',
  'rev',
  'row_id',
]

const extractPureData = (data) => {
  if (!data) return undefined
  for (const property of propertiesToRemove) {
    delete data[property]
  }
  return data
}

export default extractPureData
