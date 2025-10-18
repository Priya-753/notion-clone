'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Button } from './ui/button';
import { ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useInlineImage } from '@/hooks/use-inline-image';

const ImageNodeView = ({ node, deleteNode, editor }: NodeViewProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { onOpen: onOpenInlineImage } = useInlineImage();

  const handleChangeImage = () => {
    onOpenInlineImage(editor, node.attrs.src, deleteNode);
  };

  const handleRemoveImage = () => {
    deleteNode();
  };

  return (
    <NodeViewWrapper className="relative inline-block max-w-full my-4">
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          className="max-w-full h-auto rounded-lg"
        />
        
        {isHovered && (
          <div className="absolute bottom-2 right-2 flex items-center gap-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={handleChangeImage}
              className="text-xs shadow-lg"
              variant="secondary"
              size="sm"
            >
              <ImageIcon className="h-3 w-3 mr-1" />
              Change image
            </Button>
            
            <Button
              onClick={handleRemoveImage}
              className="text-xs shadow-lg"
              variant="secondary"
              size="sm"
            >
              <X className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageNodeView;

