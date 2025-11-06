"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const params = useParams();
  const documentId = params.documentId as string;

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
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
    } finally {
      setIsUploading(false);
    }
  };

  const addImageMutation = useMutation(trpc.document.addImage.mutationOptions({
    onSuccess: () => {
      toast.success("Image added successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.document.getImages.queryKey({ documentId })
      });
    },
    onError: () => {
      toast.error("Failed to add image");
    },
  }));

  const deleteImageMutation = useMutation(trpc.document.deleteImage.mutationOptions({
    onSuccess: () => {
      toast.success("Image deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.document.getImages.queryKey({ documentId })
      });
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  }));

  const updateImageMutation = useMutation(trpc.document.updateImage.mutationOptions({
    onSuccess: () => {
      toast.success("Image updated successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.document.getImages.queryKey({ documentId })
      });
    },
    onError: () => {
      toast.error("Failed to update image");
    },
  }));

  const addImageToDocument = async (
    url: string,
    alt?: string,
    caption?: string,
    width?: number,
    height?: number
  ) => {
    if (!documentId) {
      throw new Error("Document ID is required");
    }

    return addImageMutation.mutate({
      documentId,
      url,
      alt,
      caption,
      width,
      height,
    });
  };

  // Use useQuery directly in the hook (at top level)
  const documentImagesQuery = useQuery({
    ...trpc.document.getImages.queryOptions({
      documentId,
    }),
    enabled: !!documentId, // Only run query if documentId exists
  });

  const deleteImage = async (imageId: string) => {
    return deleteImageMutation.mutate({
      id: imageId,
    });
  };

  const updateImage = async (
    imageId: string,
    alt?: string,
    caption?: string
  ) => {
    return updateImageMutation.mutate({
      id: imageId,
      alt,
      caption,
    });
  };

  return {
    uploadImage,
    addImageToDocument,
    getDocumentImages: () => documentImagesQuery, // Return query result for compatibility
    deleteImage,
    updateImage,
    isUploading,
  };
}