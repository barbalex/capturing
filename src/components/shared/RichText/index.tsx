import React, { useState, useCallback, useEffect } from 'react'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { $getRoot, $getSelection } from 'lexical'

import LexicalComposer from '@lexical/react/LexicalComposer'
import RichTextPlugin from '@lexical/react/LexicalRichTextPlugin'
import ContentEditable from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import AutoFocusPlugin from '@lexical/react/LexicalAutoFocusPlugin'

import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import LinkPlugin from '@lexical/react/LexicalLinkPlugin'
import ListPlugin from '@lexical/react/LexicalListPlugin'
import TablePlugin from '@lexical/react/LexicalTablePlugin'
import LexicalMarkdownShortcutPlugin from '@lexical/react/LexicalMarkdownShortcutPlugin'
import LexicalOnChangePlugin from '@lexical/react/LexicalOnChangePlugin'

import ToolbarPlugin from './ToolbarPlugin'
import AutoLinkPlugin from './AutoLinkPlugin'
import CodeHighlightPlugin from './CodeHighlightPlugin'
import theme from './theme'
import './styles.css'

const StyledFormControl = styled(FormControl)`
  padding-bottom: 19px !important;
  > div:before {
    border-bottom-color: rgba(0, 0, 0, 0.1) !important;
  }
`
const StyledInputLabel = styled(InputLabel)`
  font-weight: ${(props) => props['data-weight']} !important;
`

type TextFieldProps = {
  value: string
  label: string
  labelWeight?: number
  name: string
  type?: string
  multiLine?: boolean
  disabled?: boolean
  hintText?: string
  helperText?: string
  error?: string
  onBlur: (any) => void
  schrinkLabel?: boolean
}

const RichText = ({
  value,
  label,
  labelWeight = 400,
  name,
  disabled,
  error,
  onBlur,
  schrinkLabel = true,
  helperText = '',
}: TextFieldProps) => {
  const editorConfig = {
    theme,
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

  const onChange = useCallback(
    (editorState) => {
      editorState.read(() => {
        // Read the contents of the EditorState here.
        const root = $getRoot()
        const selection = $getSelection()
        console.log('RichtText, onChange', { root, selection })

        const fakeEvent = {
          target: {
            value: root,
            name,
          },
        }
        onBlur(fakeEvent)
      })
    },
    [name, onBlur],
  )

  useEffect(() => {
    // TODO: load initial value
  }, [])

  // once schrink is set, need to manually control ist
  // schrink if value exists or schrinkLabel was passed
  const schrink = schrinkLabel || !!value || value === 0

  return (
    <StyledFormControl
      fullWidth
      disabled={disabled}
      error={!!error}
      aria-describedby={`${label}ErrorText`}
      variant="standard"
    >
      <StyledInputLabel
        htmlFor={label}
        shrink={schrink}
        data-weight={labelWeight}
      >
        {label}
      </StyledInputLabel>
      <LexicalComposer
        initialConfig={editorConfig}
        onBlur={console.log('lexical was blured')}
      >
        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              // placeholder={
              //   <div className="editor-placeholder">
              //     Enter some rich text...
              //   </div>
              // }
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <TablePlugin />
            <LinkPlugin />
            <AutoLinkPlugin />
            <CodeHighlightPlugin />
            <LexicalMarkdownShortcutPlugin />
            <LexicalOnChangePlugin
              onChange={onChange}
              ignoreSelectionChange={false}
            />
          </div>
        </div>
      </LexicalComposer>
      {!!error && (
        <FormHelperText id={`${label}ErrorText`}>{error}</FormHelperText>
      )}
      {!!helperText && (
        <FormHelperText id={`${label}HelperText`}>{helperText}</FormHelperText>
      )}
    </StyledFormControl>
  )
}

export default observer(RichText)
