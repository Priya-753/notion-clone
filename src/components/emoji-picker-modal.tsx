'use client'

import { Dialog, DialogContent } from './ui/dialog'
import { useEmojiPicker } from '@/hooks/use-emoji-picker'
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react'
import { useTheme } from 'next-themes'

export const EmojiPickerModal = () => {
  const { isOpen, onClose, editor } = useEmojiPicker()
  const { theme } = useTheme()

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiData.emoji).run()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-fit">
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
          width={400}
          height={450}
          searchPlaceHolder="Search emojis..."
          previewConfig={{
            showPreview: true
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

