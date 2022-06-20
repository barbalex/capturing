import { createEditor } from 'lexical'
import { $generateHtmlFromNodes } from '@lexical/html'

const editor = createEditor()

const textFromLexical = (value) =>
  new Promise((resolve) => {
    editor.parseEditorState(value, () => {
      const html = $generateHtmlFromNodes(editor, null)
      resolve(html)
    })
  })

export default textFromLexical
