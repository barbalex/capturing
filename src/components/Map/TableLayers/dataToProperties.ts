const dataToProperties = ({ row, richTextFields }) => {
  const richTextFieldNames = richTextFields.map((f) => f.name)
  const dat = {}
  Object.entries(row.data).forEach(([key, value]) => {
    if (richTextFieldNames.includes(key)) {
      dat[key] = `(rich-text kann hier nicht dargestellt werden)`
    } else {
      dat[key] = value
    }
  })
  return dat
}

export default dataToProperties
