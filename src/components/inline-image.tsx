"use client";

import { useState } from "react";
import { ImageUpload } from "./image-upload";
import { ImageDisplay } from "./image-display";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineImageProps {
  src?: string;
  alt?: string;
  onImageSelect?: (imageUrl: string) => void;
  onImageRemove?: () => void;
  className?: string;
  placeholder?: string;
  editable?: boolean;
  size?: "small" | "medium" | "large" | "full";
}

export const InlineImage = ({
  src,
  alt = "Image",
  onImageSelect,
  onImageRemove,
  className,
  placeholder = "Add an image",
  editable = true,
  size = "medium",
}: InlineImageProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: "max-w-xs",
    medium: "max-w-md",
    large: "max-w-lg",
    full: "w-full",
  };

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect?.(imageUrl);
  };

  const handleImageRemove = () => {
    onImageRemove?.();
  };

  // Handler for ImageUpload component - uploads file to server
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const result = await response.json();
    return result.url;
  };

  // Handler for ImageUpload component - calls onImageSelect with the URL
  const handleImageInsert = (url: string, alt?: string, caption?: string) => {
    handleImageSelect(url);
  };

  if (src) {
    return (
      <div
        className={cn(
          "relative group inline-block",
          sizeClasses[size],
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ImageDisplay
          src={src}
          alt={alt}
          className="w-full"
          editable={editable}
          onRemove={handleImageRemove}
        />
      </div>
    );
  }

  if (editable) {
    return (
      <div className={cn("inline-block", sizeClasses[size], className)}>
        <ImageUpload
          onImageUpload={handleImageUpload}
          onImageInsert={handleImageInsert}
          className="min-h-[120px]"
        />
      </div>
    );
  }

  return (
    <div className={cn("inline-block", sizeClasses[size], className)}>
      <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
        <div className="text-muted-foreground text-sm">
          {placeholder}
        </div>
      </div>
    </div>
  );
};
