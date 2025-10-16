"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

interface ImageDisplayProps {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
  onRemove?: () => void;
  editable?: boolean;
}

export function ImageDisplay({ 
  src, 
  alt, 
  caption, 
  width, 
  height, 
  className,
  onRemove,
  editable = false 
}: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8",
        className
      )}>
        <div className="text-center text-muted-foreground">
          <p>Failed to load image</p>
          {editable && onRemove && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="mt-2"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group relative", className)}>
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-lg border">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-auto transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Overlay with actions - positioned at bottom right */}
        {editable && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-end p-4 gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogTitle className="sr-only">Image Preview</DialogTitle>
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                {caption && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {caption}
                  </p>
                )}
              </DialogContent>
            </Dialog>
            
            {onRemove && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          {caption}
        </p>
      )}
    </div>
  );
}