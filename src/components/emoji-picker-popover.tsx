'use client'

import { useState } from 'react'
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Smile } from 'lucide-react'
import { useTheme } from 'next-themes'

interface EmojiPickerPopoverProps {
  onEmojiSelect: (emoji: string) => void
  children?: React.ReactNode
}

export const EmojiPickerPopover = ({ 
  onEmojiSelect, 
  children 
}: EmojiPickerPopoverProps) => {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            type="button"
          >
            <Smile className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 border-none shadow-lg" 
        align="start"
        side="bottom"
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
          width={350}
          height={400}
          searchPlaceHolder="Search emojis..."
          previewConfig={{
            showPreview: false
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

