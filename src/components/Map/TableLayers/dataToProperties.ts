import textFromLexical from '../../../utils/textFromLexical'

const dataToProperties = async ({ row, richTextFields }) => {
  const richTextFieldNames = richTextFields.map((f) => f.name)
  const dat = {}
  for (const d of Object.entries(row.data)) {
    const [key, value] = d
    if (richTextFieldNames.includes(key)) {
      dat[key] = await textFromLexical(value)
    } else {
      dat[key] = value
    }
  }
  return dat
}

export default dataToProperties
