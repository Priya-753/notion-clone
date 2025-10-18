import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMath: {
      /**
       * Insert an inline math node
       */
      insertInlineMath: (attributes?: { latex: string }) => ReturnType
      /**
       * Update an inline math node
       */
      updateInlineMath: (attributes: { latex: string }) => ReturnType
      /**
       * Delete an inline math node
       */
      deleteInlineMath: () => ReturnType
    }
    blockMath: {
      /**
       * Insert a block math node
       */
      insertBlockMath: (attributes?: { latex: string }) => ReturnType
      /**
       * Update a block math node
       */
      updateBlockMath: (attributes: { latex: string }) => ReturnType
      /**
       * Delete a block math node
       */
      deleteBlockMath: () => ReturnType
    }
  }
}

