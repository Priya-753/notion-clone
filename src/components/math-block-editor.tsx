'use client'

import { NodeViewWrapper } from '@tiptap/react'
import { useState, useEffect, useRef } from 'react'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Editor } from '@tiptap/core'
import katex from 'katex'
import { Button } from './ui/button'
import { Check, X } from 'lucide-react'

interface BlockMathEditorProps {
  node: ProseMirrorNode
  updateAttributes: (attrs: Record<string, any>) => void
  deleteNode: () => void
  editor: Editor
}

export const BlockMathEditor = ({ 
  node, 
  updateAttributes, 
  deleteNode,
  editor
}: BlockMathEditorProps) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.latex || node.attrs.latex === '')
  const [latex, setLatex] = useState(node.attrs.latex || '')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const renderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing && latex && renderRef.current) {
      try {
        katex.render(latex, renderRef.current, {
          throwOnError: false,
          displayMode: true,
          errorColor: '#cc0000',
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid LaTeX')
      }
    }
  }, [isEditing, latex])

  const handleSave = () => {
    if (!latex.trim()) {
      deleteNode()
      return
    }
    
    updateAttributes({ latex })
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (!node.attrs.latex) {
      deleteNode()
    } else {
      setLatex(node.attrs.latex)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLatex(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  if (isEditing) {
    return (
      <NodeViewWrapper className="block-math-editor-wrapper my-4">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <textarea
              ref={textareaRef}
              value={latex}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter LaTeX equation, e.g., \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400 resize-none min-h-[60px] outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Cmd/Ctrl + Enter</kbd> to save, <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to cancel
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleCancel}
                type="button"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
                type="button"
              >
                <Check className="h-4 w-4 mr-1" />
                Done
              </Button>
            </div>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      className="block-math-render-wrapper my-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
      onClick={() => setIsEditing(true)}
    >
      <div 
        ref={renderRef} 
        className="text-center"
        data-latex={latex}
      />
      {error && (
        <div className="text-sm text-red-600 text-center mt-2">
          Invalid LaTeX: {error}
        </div>
      )}
    </NodeViewWrapper>
  )
}

