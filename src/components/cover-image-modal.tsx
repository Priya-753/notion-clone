"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/use-cover-image";
import { ImageUpload } from "./image-upload";
import { ImageDisplay } from "./image-display";
import { useEffect, useState } from "react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useUpdateDocument } from "@/hooks/use-update-document";

export const CoverImageModal = () => {
    const coverImage = useCoverImage();
    const [isMounted, setIsMounted] = useState(false);
    const [currentImage, setCurrentImage] = useState<string>("");
    const trpc = useTRPC();

    // Get the current document data
    const { data: document } = useQuery({
        ...trpc.document.getById.queryOptions({
            id: coverImage.documentId || "",
        }),
        enabled: !!coverImage.documentId,
    });

    const { uploadImage } = useImageUpload();
    const { updateDocument } = useUpdateDocument({
        id: coverImage.documentId || "",
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (document?.coverImage) {
            setCurrentImage(document.coverImage);
        }
    }, [document?.coverImage]);

    const handleImageUpload = async (file: File): Promise<string> => {
        try {
            const url = await uploadImage(file);
            setCurrentImage(url);
            updateDocument({ coverImage: url });
            coverImage.onClose();
            return url;
        } catch (error) {
            console.error("Image upload error:", error);
            throw error;
        }
    };

    const handleImageInsert = async (url: string) => {
        setCurrentImage(url);
        updateDocument({ coverImage: url });
        coverImage.onClose();
    };

    const handleImageRemove = () => {
        setCurrentImage("");
        updateDocument({ coverImage: "" });
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Cover Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <ImageUpload
                        onImageUpload={handleImageUpload}
                        onImageInsert={handleImageInsert}
                        className="w-full h-48"
                    />
                    
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Choose an image to set as your document's cover
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}