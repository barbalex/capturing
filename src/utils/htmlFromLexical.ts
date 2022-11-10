import { createEditor } from 'lexical'
import { $generateHtmlFromNodes } from '@lexical/html'

import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'

const editorConfig = {
  onError: () => console.log(error),
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
}

const editor = createEditor(editorConfig)

const htmlFromLexical = (value) =>
  new Promise((resolve) => {
    if (!value) return

    editor.parseEditorState(value, () => {
      const html = $generateHtmlFromNodes(editor, null)
      resolve(html)
    })
  })

export default htmlFromLexical
