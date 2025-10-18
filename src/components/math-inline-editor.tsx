'use client'

import { NodeViewWrapper } from '@tiptap/react'
import { useState, useEffect, useRef } from 'react'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Editor } from '@tiptap/core'
import katex from 'katex'
import { Button } from './ui/button'
import { Check, X } from 'lucide-react'

interface InlineMathEditorProps {
  node: ProseMirrorNode
  updateAttributes: (attrs: Record<string, any>) => void
  deleteNode: () => void
  editor: Editor
}

export const InlineMathEditor = ({ 
  node, 
  updateAttributes, 
  deleteNode,
  editor
}: InlineMathEditorProps) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.latex || node.attrs.latex === '')
  const [latex, setLatex] = useState(node.attrs.latex || '')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const renderRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing && latex && renderRef.current) {
      try {
        katex.render(latex, renderRef.current, {
          throwOnError: false,
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
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <NodeViewWrapper as="span" className="inline-math-editor-wrapper">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
          <input
            ref={inputRef}
            type="text"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., E = mc^2"
            className="min-w-[200px] bg-transparent border-none outline-none text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={handleSave}
            type="button"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleCancel}
            type="button"
          >
            <X className="h-3 w-3" />
          </Button>
        </span>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className="inline-math-render-wrapper cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <span 
        ref={renderRef} 
        className="inline-block"
        data-latex={latex}
      />
      {error && (
        <span className="text-xs text-red-600 ml-1">
          (Invalid LaTeX)
        </span>
      )}
    </NodeViewWrapper>
  )
}

