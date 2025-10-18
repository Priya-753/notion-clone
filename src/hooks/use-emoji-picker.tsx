import { create } from 'zustand'
import { Editor } from '@tiptap/core'

interface EmojiPickerStore {
  isOpen: boolean
  editor: Editor | null
  onOpen: (editor: Editor) => void
  onClose: () => void
}

export const useEmojiPicker = create<EmojiPickerStore>((set) => ({
  isOpen: false,
  editor: null,
  onOpen: (editor) => set({ isOpen: true, editor }),
  onClose: () => set({ isOpen: false, editor: null }),
}))

