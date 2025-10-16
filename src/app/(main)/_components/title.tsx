"use client";

import { useState, useEffect, useRef } from "react";
import { useUpdateDocument } from "@/hooks/use-update-document";
import { Input } from "@/components/ui/input";

interface TitleProps {
    initialTitle: string;
    documentId: string;
}

export const Title = ({ initialTitle, documentId }: TitleProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const { updateDocument, isPending } = useUpdateDocument({
        id: documentId,
        title: title,
    });

    // Update local state when initialTitle changes
    useEffect(() => {
        setTitle(initialTitle);
    }, [initialTitle]);

    // Debounced update function
    useEffect(() => {
        if (title !== initialTitle && !isEditing) {
            const timeoutId = setTimeout(() => {
                updateDocument({ id: documentId, title });
            }, 500); // 500ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [title, initialTitle, isEditing, documentId, updateDocument]);

    const handleClick = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (title !== initialTitle) {
            updateDocument({ id: documentId, title });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            setIsEditing(false);
            if (title !== initialTitle) {
                updateDocument({ id: documentId, title });
            }
        }
        if (e.key === "Escape") {
            setTitle(initialTitle);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
                disabled={isPending}
            />
        );
    }

    return (
        <div
            onClick={handleClick}
            className="text-3xl font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
        >
            {title || "Untitled"}
        </div>
    );
};