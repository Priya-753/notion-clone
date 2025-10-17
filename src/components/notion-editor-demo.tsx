'use client'

import { useState } from 'react'
import NotionEditor from './editor'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

const NotionEditorDemo = () => {
  const [content, setContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  const sampleContent = `
    <h1>Welcome to Your Notion-like Editor</h1>
    <p>This is a powerful rich text editor built with Tiptap that mimics Notion's functionality.</p>
    
    <h2>Features</h2>
    <ul>
      <li>Rich text formatting (bold, italic, underline, strikethrough)</li>
      <li>Multiple heading levels</li>
      <li>Lists (bullet and numbered)</li>
      <li>Task lists with checkboxes</li>
      <li>Blockquotes</li>
      <li>Code blocks with syntax highlighting</li>
      <li>Tables</li>
      <li>Images</li>
      <li>Links</li>
      <li>Text alignment</li>
      <li>Slash commands (type "/" to see options)</li>
    </ul>

    <h3>Try These Slash Commands:</h3>
    <p>Type "/" followed by:</p>
    <ul>
      <li>/h1, /h2, /h3 for headings</li>
      <li>/bullet for bullet lists</li>
      <li>/number for numbered lists</li>
      <li>/task for task lists</li>
      <li>/quote for blockquotes</li>
      <li>/code for code blocks</li>
      <li>/table for tables</li>
      <li>/image for images</li>
    </ul>

    <blockquote>
      <p>This is a blockquote. Perfect for highlighting important information or quotes.</p>
    </blockquote>

    <h3>Code Example</h3>
    <pre><code>function hello() {
  console.log("Hello, Notion-like Editor!");
}</code></pre>

    <h3>Task List</h3>
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="false">
        <label>
          <input type="checkbox" />
          <div>Learn about Tiptap</div>
        </label>
      </li>
      <li data-type="taskItem" data-checked="true">
        <label>
          <input type="checkbox" checked />
          <div>Build a Notion-like editor</div>
        </label>
      </li>
      <li data-type="taskItem" data-checked="false">
        <label>
          <input type="checkbox" />
          <div>Deploy the application</div>
        </label>
      </li>
    </ul>

    <h3>Table Example</h3>
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Rich Text</td>
          <td>✅ Complete</td>
          <td>High</td>
        </tr>
        <tr>
          <td>Slash Commands</td>
          <td>✅ Complete</td>
          <td>High</td>
        </tr>
        <tr>
          <td>Collaboration</td>
          <td>🔄 In Progress</td>
          <td>Medium</td>
        </tr>
      </tbody>
    </table>

    <hr />

    <p><strong>That's it!</strong> You now have a fully functional Notion-like editor. Try typing "/" to see the slash command menu, or use the toolbar buttons to format your text.</p>
  `

  const handleLoadSample = () => {
    setContent(sampleContent)
  }

  const handleClear = () => {
    setContent('')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notion-like Editor Demo</CardTitle>
          <CardDescription>
            A powerful rich text editor built with Tiptap. Try the slash commands by typing "/" or use the toolbar buttons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleLoadSample} variant="outline">
              Load Sample Content
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear Editor
            </Button>
            <Button 
              onClick={() => setIsPreview(!isPreview)} 
              variant={isPreview ? "default" : "outline"}
            >
              {isPreview ? "Edit Mode" : "Preview Mode"}
            </Button>
          </div>
          
          {isPreview ? (
            <div 
              className="prose dark:prose-invert max-w-none p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <NotionEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your document... Try typing '/' for slash commands!"
              className="w-full"
            />
          )}
          
          {content && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold mb-2">HTML Output:</h4>
              <pre className="text-xs overflow-x-auto">
                <code>{content}</code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NotionEditorDemo
