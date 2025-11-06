'use client'

import { useState, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from './ui/button'
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Image as ImageIcon, 
  Table as TableIcon,
  CheckSquare,
  Code,
  Type,
  Smile,
  Calculator,
  Play,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInlineImage } from '@/hooks/use-inline-image'
import { useEmojiPicker } from '@/hooks/use-emoji-picker'

interface SlashCommandProps {
  editor: Editor
  range: { from: number; to: number }
  query: string
  onClose: () => void
}

interface CommandItem {
  title: string
  description: string
  icon: React.ReactNode
  command: () => void
}

const SlashCommand = ({ editor, range, query, onClose }: SlashCommandProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const { onOpen: onOpenInlineImage } = useInlineImage()
  const { onOpen: onOpenEmojiPicker } = useEmojiPicker()

  const commands: CommandItem[] = [
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: <Heading1 className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
        onClose()
      }
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
        onClose()
      }
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
        onClose()
      }
    },
    {
      title: 'Text',
      description: 'Just start typing with plain text',
      icon: <Type className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).setParagraph().run()
        onClose()
      }
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: <List className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
        onClose()
      }
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering',
      icon: <ListOrdered className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        onClose()
      }
    },
    {
      title: 'Task List',
      description: 'Track tasks with a to-do list',
      icon: <CheckSquare className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
        onClose()
      }
    },
    {
      title: 'Quote',
      description: 'Capture a quote',
      icon: <Quote className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).setBlockquote().run()
        onClose()
      }
    },
    {
      title: 'Code Block',
      description: 'Create a code block',
      icon: <Code className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run()
        onClose()
      }
    },
    {
      title: 'Divider',
      description: 'Visually divide blocks',
      icon: <Minus className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
        onClose()
      }
    },
    {
      title: 'Table',
      description: 'Insert a table',
      icon: <TableIcon className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        onClose()
      }
    },
    {
      title: 'Image',
      description: 'Upload or embed an image',
      icon: <ImageIcon className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).run()
        onOpenInlineImage(editor)
        onClose()
      }
    },
    {
      title: 'Emoji',
      description: 'Insert an emoji',
      icon: <Smile className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).run()
        onOpenEmojiPicker(editor)
        onClose()
      }
    },
    {
      title: 'Inline Math',
      description: 'Insert an inline math equation',
      icon: <Calculator className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).insertInlineMath({ latex: '' }).run()
        onClose()
      }
    },
    {
      title: 'Block Math',
      description: 'Insert a block math equation',
      icon: <Calculator className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().deleteRange(range).insertBlockMath({ latex: '' }).run()
        onClose()
      }
    },
    {
      title: 'YouTube',
      description: 'Embed a YouTube video',
      icon: <Play className="h-4 w-4" />,
      command: () => {
        const url = window.prompt('Enter YouTube URL:')
        editor.chain().focus().deleteRange(range).run()
        if (url) {
          // YouTube extension command - may not be available in all editor configurations
          // @ts-ignore
          editor.chain().focus().setYoutubeVideo({ src: url }).run()
        }
        onClose()
      }
    },
    {
      title: 'Parse URL',
      description: 'Parse content from a URL',
      icon: <Globe className="h-4 w-4" />,
      command: async () => {
        const url = window.prompt('Enter URL to parse:')
        editor.chain().focus().deleteRange(range).run()
        if (url) {
          try {
            console.log('Parsing URL:', url)
            
            // Call our API route instead of using the parser directly
            const response = await fetch('/api/parse-url', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url }),
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to parse URL')
            }
            
            const result = data.data
            console.log('Parser result:', result)
            
            // Insert the parsed content into the editor
            if (result.content) {
              editor.chain().focus().insertContent(`<h2>Parsed from: ${url}</h2><div>${result.content}</div>`).run()
            } else {
              editor.chain().focus().insertContent(`<p>No content found for: ${url}</p>`).run()
            }
          } catch (error) {
            console.error('Parser error:', error)
            editor.chain().focus().insertContent(`<p>Error parsing URL: ${url}</p>`).run()
          }
        }
        onClose()
      }
    }
  ]

  const filteredCommands = query === '' 
    ? commands 
    : commands.filter(command => 
        command.title.toLowerCase().includes(query.toLowerCase()) ||
        command.description.toLowerCase().includes(query.toLowerCase())
      )

  // Debug logging
  console.log('SlashCommand - Query:', query)
  console.log('SlashCommand - All commands:', commands.length)
  console.log('SlashCommand - Filtered commands:', filteredCommands.length)
  console.log('SlashCommand - Commands:', filteredCommands.map(c => c.title))

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        filteredCommands[selectedIndex]?.command()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, filteredCommands, onClose])

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (filteredCommands.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
        <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
          No commands found for &quot;{query}&quot;
        </div>
        <div className="text-xs text-gray-400 px-3 py-1">
          Available commands: {commands.map(c => c.title).join(', ')}
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={listRef}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto"
    >
      {filteredCommands.map((command, index) => (
        <Button
          key={index}
          variant="ghost"
          className={cn(
            "w-full justify-start h-auto p-3 text-left",
            index === selectedIndex && "bg-gray-100 dark:bg-gray-700"
          )}
          onClick={command.command}
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400">
              {command.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {command.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {command.description}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}

export default SlashCommand
