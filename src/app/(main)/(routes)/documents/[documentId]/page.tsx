"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ImageDisplay } from "@/components/image-display";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useUpdateDocument } from "@/hooks/use-update-document";
import { useCoverImage } from "@/hooks/use-cover-image";
import { Cover } from "@/components/cover";
import NotionEditor from "@/components/editor";
import { useState, useEffect, useCallback } from "react";

const DocumentIdPage = () => {
    const trpc = useTRPC();
    const params = useParams();
    const { getDocumentImages, deleteImage } = useImageUpload();
    const { updateDocument } = useUpdateDocument({
        id: params.documentId as string,
    });
    const { onOpen: onOpenCoverImage } = useCoverImage();
    
    // Content state
    const [content, setContent] = useState('');

    const { data: document, isLoading } = useQuery({
        ...trpc.document.getById.queryOptions({
            id: params.documentId as string,
        }),
    });

    const { data: images = [] } = getDocumentImages() || { data: [] };

    // Initialize content when document loads
    useEffect(() => {
        if (document?.content) {
            setContent(document.content);
        }
    }, [document?.content]);

    // Handle content changes
    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent);
    }, []);

    if (isLoading) {
        return (
            <div className="h-full">
                <div className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="p-6">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Document not found</h2>
                    <p className="text-muted-foreground">The document you're looking for doesn't exist or has been deleted.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative">
            {/* Cover Image - Full width at the very top */}
            <Cover url={document.coverImage || undefined} />
                        
            {/* Main Editor Content - Takes up the rest of the space */}
            <div className="flex-1 min-h-0">
                <NotionEditor 
                    content={content}
                    placeholder="Start writing your document..."
                    className="h-full"
                    documentId={document.id}
                    onContentChange={handleContentChange}
                    document={document}
                    onUpdateDocument={updateDocument}
                />
            </div>
        </div>
    );
};

export default DocumentIdPage;
