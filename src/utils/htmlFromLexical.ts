import { createEditor } from 'lexical'
import { $generateHtmlFromNodes } from '@lexical/html'

const editor = createEditor()

const htmlFromLexical = (value) =>
  new Promise((resolve) => {
    if (!value) return
    editor.parseEditorState(value, () => {
      const html = $generateHtmlFromNodes(editor, null)
      resolve(html)
    })
  })

export default htmlFromLexical
