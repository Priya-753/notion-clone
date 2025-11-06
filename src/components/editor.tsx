'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import SlashCommand from './slash-command'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Strike } from '@tiptap/extension-strike'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { ListItem } from '@tiptap/extension-list-item'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Heading } from '@tiptap/extension-heading'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Link } from '@tiptap/extension-link'
import { ImageNode } from './image-node'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Mention } from '@tiptap/extension-mention'
import { Typography } from '@tiptap/extension-typography'
import { FontFamily } from '@tiptap/extension-font-family'
import { FontSize } from '@tiptap/extension-font-size'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { InlineMath, BlockMath } from './math-nodes'
import Emoji from '@tiptap/extension-emoji'
import { emojiSuggestion } from './emoji-suggestion'
import { createLowlight } from 'lowlight'
import Youtube from '@tiptap/extension-youtube'
import 'katex/dist/katex.min.css'
import { Button } from './ui/button'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Table as TableIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Smile,
  Calculator,
  Play,
  Globe
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { IconPicker } from './icon-picker'
import { useCoverImage } from '@/hooks/use-cover-image'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useInlineImage } from '@/hooks/use-inline-image'
import { InlineImageModal } from './inline-image-modal'
import { EmojiPickerPopover } from './emoji-picker-popover'
import { EmojiPickerModal } from './emoji-picker-modal'

interface NotionEditorProps {
  content?: string
  onChange?: (content: string) => void
  onContentChange?: (content: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
  documentId?: string
  document?: any
  onUpdateDocument?: (data: any) => void
}

const NotionEditor = ({ 
  content = '', 
  onChange, 
  onContentChange,
  placeholder = 'Start writing...', 
  className,
  editable = true,
  documentId,
  document,
  onUpdateDocument
}: NotionEditorProps) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showSlashCommand, setShowSlashCommand] = useState(false)
  const [slashCommandRange, setSlashCommandRange] = useState<any>(null)
  const [slashCommandQuery, setSlashCommandQuery] = useState('')
  const [showHoverActions, setShowHoverActions] = useState(false)
  
  // Integrated hooks
  const { onOpen: onOpenCoverImage } = useCoverImage()
  const { uploadImage, addImageToDocument } = useImageUpload()
  const { onOpen: onOpenInlineImage } = useInlineImage()


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      HorizontalRule,
      ImageNode,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
      Mention.configure({
        HTMLAttributes: {
          class: 'bg-blue-100 text-blue-800 px-1 rounded',
        },
      }),
      Typography,
      FontFamily,
      FontSize,
      Dropcursor,
      Gapcursor,
      InlineMath,
      BlockMath,
      Emoji.configure({
        enableEmoticons: true,
        suggestion: emojiSuggestion,
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        controls: true,
        nocookie: true,
        allowFullscreen: true,
      }),
    ],
    content: content || (document?.title ? `<h1>${document.title}</h1><p></p>` : '<h1>Untitled</h1><p></p>'),
    editable,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML()
      
      // Extract title from first heading
      const firstHeading = editor.state.doc.firstChild
      let extractedTitle = ''
      if (firstHeading && firstHeading.type.name === 'heading') {
        extractedTitle = firstHeading.textContent || ''
      } else if (firstHeading && firstHeading.type.name === 'paragraph') {
        // If first element is a paragraph, use it as title
        extractedTitle = firstHeading.textContent || ''
      }
      
      // Update document title if it changed
      if (onUpdateDocument && document && extractedTitle !== document.title) {
        onUpdateDocument({ id: document.id, title: extractedTitle || 'Untitled' })
      }
      
      // Dispatch custom event for navbar to listen to
      const event = new CustomEvent('document-content-change', {
        detail: { content: htmlContent }
      })
      window.dispatchEvent(event)
      
      if (onChange) {
        onChange(htmlContent)
      }
      if (onContentChange) {
        onContentChange(htmlContent)
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state
      const { $from } = selection
      
      // Get the current line text
      const lineStart = $from.start()
      const lineEnd = $from.end()
      const lineText = editor.state.doc.textBetween(lineStart, lineEnd, ' ')
      const cursorPos = $from.pos - lineStart
      const textBeforeCursor = lineText.substring(0, cursorPos)
      
      // Check if we're at the start of a line with a slash
      if (textBeforeCursor === '/' && $from.parentOffset === 1) {
        console.log('Slash detected at start of line')
        if (!showSlashCommand) {
          setShowSlashCommand(true)
          setSlashCommandRange({
            from: $from.pos - 1,
            to: $from.pos
          })
          setSlashCommandQuery('')
        }
      } else if (textBeforeCursor.startsWith('/') && textBeforeCursor.length > 1) {
        console.log('Slash command query:', textBeforeCursor)
        if (!showSlashCommand) {
          setShowSlashCommand(true)
          setSlashCommandRange({
            from: $from.pos - textBeforeCursor.length,
            to: $from.pos
          })
        }
        const query = textBeforeCursor.substring(1)
        setSlashCommandQuery(query)
      } else if (showSlashCommand && !textBeforeCursor.startsWith('/')) {
        console.log('Hiding slash command')
        setShowSlashCommand(false)
      }
      
      // Also check for slash at any position (more flexible)
      if (textBeforeCursor.endsWith('/') && !showSlashCommand) {
        console.log('Slash detected anywhere in text')
        setShowSlashCommand(true)
        setSlashCommandRange({
          from: $from.pos - 1,
          to: $from.pos
        })
        setSlashCommandQuery('')
      }
    },
    immediatelyRender: false,
  })

  // Update editor content when the content prop changes (e.g., when loading from database)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      // Only update if the content is actually different to avoid cursor jumps
      // emitUpdate: false prevents triggering onChange during initial load
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [editor, content])

  const addImage = () => {
    if (editor) {
      onOpenInlineImage(editor)
    }
  }

  // Integrated functionality
  const handleIconChange = (icon: string) => {
    if (onUpdateDocument && document) {
      onUpdateDocument({ id: document.id, icon })
    }
  }

  const handleRemoveIcon = () => {
    if (onUpdateDocument && document) {
      onUpdateDocument({ id: document.id, icon: '' })
    }
  }

  const handleCoverImageChange = () => {
    if (document) {
      onOpenCoverImage(document.id)
    }
  }

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file)
    return url
  }

  const handleImageInsert = async (url: string, alt?: string, caption?: string) => {
    if (documentId) {
      await addImageToDocument(url, alt, caption)
    }
  }

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const insertEmoji = (emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run()
  }

  const insertInlineMath = () => {
    editor?.chain().focus().insertInlineMath({ latex: '' }).run()
  }

  const insertBlockMath = () => {
    editor?.chain().focus().insertBlockMath({ latex: '' }).run()
  }

  const insertYoutube = () => {
    const url = window.prompt('Enter YouTube URL:')
    if (url) {
      // @ts-ignore - YouTube extension command
      editor?.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const testParser = async () => {
    const url = window.prompt('Enter URL to parse:')
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
          editor?.chain().focus().insertContent(`<h2>Parsed from: ${url}</h2><div>${result.content}</div>`).run()
        } else {
          editor?.chain().focus().insertContent(`<p>No content found for: ${url}</p>`).run()
        }
      } catch (error) {
        console.error('Parser error:', error)
        editor?.chain().focus().insertContent(`<p>Error parsing URL: ${url}</p>`).run()
      }
    }
  }

  const closeSlashCommand = () => {
    setShowSlashCommand(false)
    setSlashCommandRange(null)
    setSlashCommandQuery('')
  }

  if (!editor) {
    return null
  }

  return (
    <div className={cn("notion-editor h-full flex flex-col", className)}>
      <InlineImageModal />
      <EmojiPickerModal />

      {/* Main Editor Content */}
      <div className="flex-1 prose prose-lg dark:prose-invert max-w-none focus:outline-none relative overflow-auto">
        <EditorContent 
          editor={editor} 
          className="h-full p-4 focus:outline-none"
        />
        
        {/* Slash Command Menu */}
        {showSlashCommand && (
          <div className="absolute z-50" style={{ 
            top: editor.view.coordsAtPos(slashCommandRange?.from || 0)?.top || 0,
            left: editor.view.coordsAtPos(slashCommandRange?.from || 0)?.left || 0
          }}>
            <SlashCommand
              editor={editor}
              range={slashCommandRange}
              query={slashCommandQuery}
              onClose={closeSlashCommand}
            />
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center gap-1 p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "h-8 px-2",
            editor.isActive('heading', { level: 1 }) && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <Heading1 className="h-4 w-4 mr-1" />
          H1
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "h-8 px-2",
            editor.isActive('heading', { level: 2 }) && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <Heading2 className="h-4 w-4 mr-1" />
          H2
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "h-8 px-2",
            editor.isActive('heading', { level: 3 }) && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <Heading3 className="h-4 w-4 mr-1" />
          H3
        </Button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('bulletList') && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('orderedList') && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('blockquote') && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('codeBlock') && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
          className="h-8 w-8 p-0"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        
        <EmojiPickerPopover onEmojiSelect={insertEmoji}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </EmojiPickerPopover>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={insertInlineMath}
          className="h-8 w-8 p-0"
          title="Insert inline math"
        >
          <Calculator className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={insertYoutube}
          className="h-8 w-8 p-0"
        >
          <Play className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={testParser}
          className="h-8 w-8 p-0"
          title="Parse URL content"
        >
          <Globe className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: 'left' }) && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: 'center' }) && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: 'right' }) && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: 'justify' }) && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default NotionEditor