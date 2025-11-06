"use client";

import { IconPicker } from "./icon-picker";
import { ImageUpload } from "./image-upload";
import { ImageIcon, Smile, X } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { useUpdateDocument } from "@/hooks/use-update-document";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useImageUpload } from "@/hooks/use-image-upload";
import TextareaAutosize from "react-textarea-autosize";

interface ToolbarProps {
    initialData: {
        id: string;
        title: string;
        icon?: string | null;
        coverImage?: string | null;
    };
    preview?: boolean;
}

export const Toolbar = ({ initialData, preview = false }: ToolbarProps) => {

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialData.title || "");
    const { updateDocument } = useUpdateDocument({
        id: initialData.id,
        title: value || undefined,
    });

    useEffect(() => {
        setValue(initialData.title);
    }, [initialData.title]);

    // Update local state when document data changes
    useEffect(() => {
        setValue(initialData.title);
    }, [initialData]);

    const enableInput = () => {
        if (preview) return;
        setIsEditing(true);
        setTimeout(() => {
            setValue(initialData.title);
            inputRef.current?.focus();
        }, 0);
    }
    
    const disableInput = () => {
        if (preview) return;
        setIsEditing(false);
    }

    const onInput = (value: string) => {
        setValue(value);
        updateDocument({ id: initialData.id, title: value });
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            disableInput();
        }
    }

    const handleIconChange = (icon: string) => {
        updateDocument({ id: initialData.id, icon });
    }

    const handleRemoveIcon = () => {
        updateDocument({ id: initialData.id, icon: "" });
    }

    const { onOpen: onOpenCoverImage } = useCoverImage();
    const { uploadImage, addImageToDocument } = useImageUpload();

    const handleCoverImageChange = () => {
        onOpenCoverImage(initialData.id);
    }

    const handleImageUpload = async (file: File) => {
        const url = await uploadImage(file);
        return url;
    }

    const handleImageInsert = async (url: string, alt?: string, caption?: string) => {
        await addImageToDocument(url, alt, caption);
    }

    return (
        <div className="pl-[54px] relative group">
            {!!initialData.icon && !preview && (
                <div className="flex items-center gap-x-2 group/icon pt-6">
                    <IconPicker onChange={handleIconChange}>
                        <div className="text-6xl hover:opacity-75 transition">
                            {initialData.icon}
                        </div>
                    </IconPicker>
                    <Button onClick={handleRemoveIcon} variant="outline" size="icon" className="opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs">
                        <X className="size-4" />
                    </Button>
                </div>
            )}
            {!!initialData.icon && preview && (
                <p className="text-6xl pt-6">
                    {initialData.icon}
                </p>
            )}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
                {!initialData.icon && !preview && (
                    <IconPicker onChange={handleIconChange} asChild>
                        <Button className="text-muted-foreground text-xs" variant="outline" size="sm">
                            <Smile className="size-4 mr-2" />
                            Add an icon
                        </Button>
                    </IconPicker>
                )}
                {!initialData.coverImage && !preview && (
                    <Button className="text-muted-foreground text-xs" variant="outline" size="sm" onClick={handleCoverImageChange}>
                        <ImageIcon className="size-4 mr-2" />
                        Add a cover image
                    </Button>
                )}
                {!preview && (
                    <ImageUpload 
                        onImageUpload={handleImageUpload}
                        onImageInsert={handleImageInsert}
                        className="text-muted-foreground text-xs"
                    />
                )}
            </div>
            {isEditing && !preview ? (
                <TextareaAutosize 
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={disableInput}
                    className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
                />
            ) : (
                <div 
                    onClick={enableInput}
                    className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
                >
                    {value || "Untitled"}
                </div>
            )}
        </div>
    );
};