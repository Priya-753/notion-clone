'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { InlineMathEditor } from './math-inline-editor'
import { BlockMathEditor } from './math-block-editor'

export const InlineMath = Node.create({
  name: 'inlineMath',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => ({
          'data-latex': attributes.latex,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-math"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-type': 'inline-math' }, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathEditor)
  },

  addCommands() {
    return {
      insertInlineMath: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        })
      },
      updateInlineMath: (attributes) => ({ commands }) => {
        return commands.updateAttributes(this.name, attributes)
      },
      deleteInlineMath: () => ({ commands }) => {
        return commands.deleteNode(this.name)
      },
    }
  },
})

export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => ({
          'data-latex': attributes.latex,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="block-math"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'block-math' }, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockMathEditor)
  },

  addCommands() {
    return {
      insertBlockMath: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        })
      },
      updateBlockMath: (attributes) => ({ commands }) => {
        return commands.updateAttributes(this.name, attributes)
      },
      deleteBlockMath: () => ({ commands }) => {
        return commands.deleteNode(this.name)
      },
    }
  },
})

