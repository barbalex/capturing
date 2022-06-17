import React, { useRef, useCallback } from 'react'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'

import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'

import ToolbarPlugin from './ToolbarPlugin'
import AutoLinkPlugin from './AutoLinkPlugin'
import CodeHighlightPlugin from './CodeHighlightPlugin'
import theme from './theme'
import './styles.css'
import ErrorBoundary from '../ErrorBoundary'

const StyledFormControl = styled(FormControl)`
  padding-bottom: 19px !important;
  > div:before {
    border-bottom-color: rgba(0, 0, 0, 0.1) !important;
  }
`
const StyledInputLabel = styled(InputLabel)`
  font-weight: ${(props) => props['data-weight']} !important;
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.8rem;
`
const Container = styled.div``

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

  const state = useRef()
  const onBlurContainer = useCallback(() => {
    // console.log('RichText, bluring container, state:', {
    //   currentState: state.current,
    //   currentStateJsoned: state.current?.toJSON(),
    //   value,
    //   equal: isEqual(value, state.current?.toJSON()),
    // })
    const currentIsEqual = isEqual(value, state.current?.toJSON())
    if (currentIsEqual) return
    const fakeEvent = {
      target: {
        value: state.current?.toJSON() ?? null,
        name,
      },
    }
    onBlur(fakeEvent)
  }, [name, onBlur, value])

  const onChange = useCallback((newState) => {
    state.current = newState
  }, [])

  // console.log('RichText rendering', {
  //   state: state.current,
  //   value,
  // })

  // once schrink is set, need to manually control ist
  // schrink if value exists or schrinkLabel was passed
  const schrink = schrinkLabel || !!value || value === 0

  return (
    <ErrorBoundary>
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
        <Container onBlur={onBlurContainer}>
          <LexicalComposer
            initialConfig={editorConfig}
            // TODO: this is expected since 0.3.4 but does not work
            // see: https://github.com/facebook/lexical/issues/2461
            // initialEditorState={value ? JSON.stringify(value) : undefined}
          >
            <div className="editor-container">
              <ToolbarPlugin />
              <div className="editor-inner">
                <RichTextPlugin
                  contentEditable={<ContentEditable className="editor-input" />}
                  initialEditorState={value ? JSON.stringify(value) : undefined}
                />
                <HistoryPlugin />
                <AutoFocusPlugin />
                <ListPlugin />
                <TablePlugin />
                <LinkPlugin />
                <AutoLinkPlugin />
                <CodeHighlightPlugin />
                <MarkdownShortcutPlugin />
                <OnChangePlugin
                  onChange={onChange}
                  ignoreSelectionChange={true}
                  ignoreInitialChange={true}
                />
              </div>
            </div>
          </LexicalComposer>
        </Container>
        {!!error && (
          <FormHelperText id={`${label}ErrorText`}>{error}</FormHelperText>
        )}
        {!!helperText && (
          <FormHelperText id={`${label}HelperText`}>
            {helperText}
          </FormHelperText>
        )}
      </StyledFormControl>
    </ErrorBoundary>
  )
}

export default RichText
