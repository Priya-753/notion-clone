"use client";

import { useQuery } from "@tanstack/react-query";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Title } from "./title";
import { Banner } from "./banner";
import { useTRPC } from "@/trpc/client";
import { useState, useEffect, useCallback } from "react";
import { useUpdateDocument } from "@/hooks/use-update-document";


interface NavbarProps {
    isCollapsed: boolean;
    onResetSidebar: () => void;
}

export const Navbar = ({ isCollapsed, onResetSidebar }: NavbarProps) => {
    const trpc = useTRPC();
    const params = useParams();
    const { updateDocument } = useUpdateDocument({
        id: params.documentId as string,
    });
    
    // Auto-save state
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    const { data: document } = useQuery({
        ...trpc.document.getById.queryOptions({
            id: params.documentId as string,
        }),
    });

    // Auto-save functionality
    const saveContent = useCallback(async (newContent: string) => {
        if (!document || newContent === document.content) return;
        
        setIsSaving(true);
        try {
            await updateDocument({ id: document.id, content: newContent });
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to save document:', error);
        } finally {
            setIsSaving(false);
        }
    }, [document, updateDocument]);

    // Listen for content changes from the editor
    useEffect(() => {
        const handleContentChange = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { content } = customEvent.detail;
            setHasUnsavedChanges(true);
            
            // Debounced auto-save
            const timeoutId = setTimeout(() => {
                saveContent(content);
            }, 2000);

            return () => clearTimeout(timeoutId);
        };

        window.addEventListener('document-content-change', handleContentChange);
        return () => window.removeEventListener('document-content-change', handleContentChange);
    }, [saveContent]);

    if (!document) {
        return null;
    }


    return (
        <>
        <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
            {isCollapsed && 
            <MenuIcon onClick={() => onResetSidebar()} role="button" className="h-6 w-6 text-muted-foreground" />}
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-x-2">
                    {document.icon && (
                        <div className="text-2xl">
                            {document.icon}
                        </div>
                    )}
                    <Title initialTitle={document.title} documentId={document.id} />
                </div>
                
                {/* Save status indicator */}
                {(isSaving || hasUnsavedChanges || lastSaved) && (
                    <div className="flex items-center gap-2">
                        {isSaving ? (
                            <>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-muted-foreground">Saving...</span>
                            </>
                        ) : hasUnsavedChanges ? (
                            <>
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-muted-foreground">Unsaved</span>
                            </>
                        ) : (
                            <>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-muted-foreground">
                                    Saved {lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
        {document.isArchived && (
            <Banner documentId={document.id} />
        )}
        </>
    );
};
