"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useUpdateDocument } from "@/hooks/use-update-document";
import { useParams } from "next/navigation";

interface CoverImageProps {
  url?: string;
  preview?: boolean;
}

export const Cover = ({ url, preview }: CoverImageProps) => {
  const coverImage = useCoverImage();
  const params = useParams();
  const documentId = params.documentId as string;
  const { updateDocument } = useUpdateDocument({
    id: documentId,
  });

  return (
    <div 
      className={cn(
        "relative w-full h-[35vh] group",
        !url && "h-[12vh]",
        url && "bg-muted"
      )}
    >
      {url && (
        <img 
          src={url} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      )}
      
      {!preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onOpen(documentId)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {url ? "Change cover" : "Add cover"}
          </Button>
          
          {url && (
            <Button
              onClick={async () => {
                await updateDocument({ coverImage: "" });
              }}
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Remove cover
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
