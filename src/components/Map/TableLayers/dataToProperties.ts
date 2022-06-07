import { $generateHtmlFromNodes } from '@lexical/html'
import { createEditor } from 'lexical'

const dataToProperties = ({ row, richTextFields }) => {
  const richTextFieldNames = richTextFields.map((f) => f.name)
  const dat = {}
  Object.entries(row.data).forEach(([key, value]) => {
    console.log({ key, value })
    if (richTextFieldNames.includes(key)) {
      // const editor = createEditor({
      //   theme: {},
      //   onError: console.error,
      // })
      // console.log('editor:', editor)
      // console.log('value:', value)
      // console.log('value stringified:', JSON.stringify(value))
      // const parsedValue = editor.parseEditorState(value)
      // console.log('parsedValue:', parsedValue)
      // editor.update(() => parsedValue)
      // // editor.setEditorState(parsedValue)
      // console.log('editor with state:', editor)
      // $generateHtmlFromNodes(editor, null)
      dat[key] = JSON.stringify(value)
    } else {
      dat[key] = value
    }
  })
  return dat
}

export default dataToProperties
