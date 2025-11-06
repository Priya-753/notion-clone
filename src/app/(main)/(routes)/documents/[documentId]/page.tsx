"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateDocument } from "@/hooks/use-update-document";
import { Cover } from "@/components/cover";
import NotionEditor from "@/components/editor";
import { useState, useEffect, useCallback, useRef } from "react";

const DocumentIdPage = () => {
    const trpc = useTRPC();
    const params = useParams();
    const { updateDocument } = useUpdateDocument({
        id: params.documentId as string,
    });
    
    // Content state - Initialize with undefined to distinguish from empty content
    const [content, setContent] = useState<string | undefined>(undefined);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data: document, isLoading } = useQuery({
        ...trpc.document.getById.queryOptions({
            id: params.documentId as string,
        }),
    });

    // Initialize content when document loads
    useEffect(() => {
        if (document) {
            // Set content from document, even if it's empty or undefined
            setContent(document.content || '');
        }
    }, [document?.id, document?.content]);

    // Auto-save content with debouncing
    useEffect(() => {
        // Only save if:
        // 1. Content is defined (not initial undefined state)
        // 2. Document is loaded
        // 3. Content has actually changed from what's in the database
        if (content !== undefined && document && document.content !== content) {
            setSaveStatus('unsaved');
            
            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Set new timeout to save after 1 second of no typing
            saveTimeoutRef.current = setTimeout(() => {
                setSaveStatus('saving');
                updateDocument({ 
                    id: params.documentId as string,
                    content 
                });
                
                // Set to saved after a brief moment
                setTimeout(() => {
                    setSaveStatus('saved');
                }, 500);
            }, 1000); // 1 second debounce
        }

        // Cleanup function
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [content, document, params.documentId, updateDocument]);

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
            
            {/* Save Status Indicator */}
            <div className="absolute top-2 right-4 z-10">
                {saveStatus === 'saving' && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </span>
                )}
                {saveStatus === 'saved' && (
                    <span className="text-xs text-muted-foreground">Saved</span>
                )}
            </div>
                        
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
