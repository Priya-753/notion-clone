'use client'

import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { SuggestionOptions, SuggestionKeyDownProps } from '@tiptap/suggestion'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { emojis } from '@tiptap/extension-emoji'

interface EmojiListProps {
  items: typeof emojis
  command: (item: typeof emojis[0]) => void
}

interface EmojiListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

const EmojiList = forwardRef<EmojiListRef, EmojiListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="emoji-suggestion-list bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto">
      {props.items.length > 0 ? (
        props.items.map((item, index) => (
          <button
            key={item.name}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => selectItem(index)}
            type="button"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              :{item.shortcodes[0]}:
            </span>
          </button>
        ))
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
          No emojis found
        </div>
      )}
    </div>
  )
})

EmojiList.displayName = 'EmojiList'

export const emojiSuggestion: Omit<SuggestionOptions, 'editor'> = {
  items: ({ query }) => {
    return emojis
      .filter(({ shortcodes, tags }) => {
        const searchQuery = query.toLowerCase()
        return (
          shortcodes.some(shortcode => shortcode.toLowerCase().startsWith(searchQuery)) ||
          tags.some(tag => tag.toLowerCase().includes(searchQuery))
        )
      })
      .slice(0, 10)
  },

  render: () => {
    let component: ReactRenderer
    let popup: any

    return {
      onStart: (props) => {
        component = new ReactRenderer(EmojiList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect as any,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()
          return true
        }

        return (component.ref as EmojiListRef | null)?.onKeyDown(props) ?? false
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}

