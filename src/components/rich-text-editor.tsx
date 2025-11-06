"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { InlineImage } from "./inline-image";
import { ImageIcon, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
}

export const RichTextEditor = ({
  content = "",
  onChange,
  placeholder = "Start writing...",
  className,
  editable = true,
}: RichTextEditorProps) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Parse content into blocks
  useEffect(() => {
    if (content) {
      try {
        const parsedBlocks = JSON.parse(content);
        if (Array.isArray(parsedBlocks)) {
          setBlocks(parsedBlocks);
        } else {
          // Fallback to text block
          setBlocks([{ id: "1", type: "text", content }]);
        }
      } catch {
        // If content is not JSON, treat as plain text
        setBlocks([{ id: "1", type: "text", content }]);
      }
    } else {
      setBlocks([{ id: "1", type: "text", content: "" }]);
    }
  }, [content]);

  // Update content when blocks change
  useEffect(() => {
    if (onChange) {
      const serializedContent = JSON.stringify(blocks);
      onChange(serializedContent);
    }
  }, [blocks, onChange]);

  const addBlock = (type: "text" | "image", afterId?: string) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === "text" ? "" : "",
    };

    if (afterId) {
      const index = blocks.findIndex(block => block.id === afterId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }

    setFocusedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(block => block.id !== id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addBlock("text", blockId);
    } else if (e.key === "Backspace" && e.currentTarget.textContent === "") {
      e.preventDefault();
      removeBlock(blockId);
    }
  };

  const handleImageSelect = (blockId: string, imageUrl: string) => {
    updateBlock(blockId, imageUrl);
  };

  const handleImageRemove = (blockId: string) => {
    updateBlock(blockId, "");
  };

  const renderBlock = (block: ContentBlock) => {
    if (block.type === "image") {
      return (
        <div key={block.id} className="my-4">
          <InlineImage
            src={block.content}
            onImageSelect={editable ? (imageUrl) => handleImageSelect(block.id, imageUrl) : undefined}
            onImageRemove={editable ? () => handleImageRemove(block.id) : undefined}
            editable={editable}
            placeholder="Click to add an image"
            size="medium"
          />
        </div>
      );
    }

    return (
      <div key={block.id} className="group">
        <div
          contentEditable={editable}
          suppressContentEditableWarning
          className={cn(
            "min-h-[1.5rem] outline-none",
            !block.content && "text-muted-foreground",
            block.content && "text-foreground"
          )}
          onInput={(e) => updateBlock(block.id, e.currentTarget.textContent || "")}
          onKeyDown={(e) => handleKeyDown(e, block.id)}
          onFocus={() => setFocusedBlockId(block.id)}
          onBlur={() => setFocusedBlockId(null)}
          data-placeholder={!block.content ? placeholder : ""}
        >
          {block.content}
        </div>
        
        {/* Block actions */}
        {editable && focusedBlockId === block.id && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addBlock("image", block.id)}
              className="h-8 px-2"
            >
              <ImageIcon className="size-4 mr-1" />
              Image
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addBlock("text", block.id)}
              className="h-8 px-2"
            >
              <Type className="size-4 mr-1" />
              Text
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={editorRef}
      className={cn("space-y-2", className)}
    >
      {blocks.map(renderBlock)}
      
      {/* Add first block if empty */}
      {blocks.length === 0 && editable && (
        <div
          className="min-h-[1.5rem] text-muted-foreground cursor-text"
          onClick={() => addBlock("text")}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};
