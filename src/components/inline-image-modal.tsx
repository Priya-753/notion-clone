"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useInlineImage } from "@/hooks/use-inline-image";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export const InlineImageModal = () => {
    const inlineImage = useInlineImage();
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [alt, setAlt] = useState("");
    const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pre-fill with existing image URL when changing an image
    useEffect(() => {
        if (inlineImage.existingImageUrl) {
            setImageUrl(inlineImage.existingImageUrl);
            setUploadMode("url");
        }
    }, [inlineImage.existingImageUrl]);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

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
            
            // If changing an existing image, delete the old one first
            if (inlineImage.onDeleteOld) {
                inlineImage.onDeleteOld();
            }
            
            // Insert image into editor
            if (inlineImage.editor) {
                inlineImage.editor.chain().focus().setImage({ 
                    src: result.url,
                    alt: alt || undefined
                }).run();
            }

            toast.success(inlineImage.existingImageUrl ? "Image changed successfully!" : "Image added successfully!");
            handleClose();
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleInsertUrl = () => {
        if (!imageUrl.trim()) {
            toast.error("Please enter an image URL");
            return;
        }

        // If changing an existing image, delete the old one first
        if (inlineImage.onDeleteOld) {
            inlineImage.onDeleteOld();
        }

        // Insert image into editor
        if (inlineImage.editor) {
            inlineImage.editor.chain().focus().setImage({ 
                src: imageUrl,
                alt: alt || undefined
            }).run();
        }

        toast.success(inlineImage.existingImageUrl ? "Image changed successfully!" : "Image added successfully!");
        handleClose();
    };

    const handleClose = () => {
        setPreview(null);
        setImageUrl("");
        setAlt("");
        setUploadMode("upload");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        inlineImage.onClose();
    };

    return (
        <Dialog open={inlineImage.isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{inlineImage.existingImageUrl ? "Change Image" : "Add Image"}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={uploadMode === "upload" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUploadMode("upload")}
                            className="flex-1"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                        </Button>
                        <Button
                            variant={uploadMode === "url" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUploadMode("url")}
                            className="flex-1"
                        >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            URL
                        </Button>
                    </div>

                    {uploadMode === "upload" ? (
                        <>
                            {/* File Input */}
                            <div className="space-y-2">
                                <Label htmlFor="image-upload">Choose Image</Label>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                    className="cursor-pointer"
                                />
                            </div>

                            {/* Preview */}
                            {preview && (
                                <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <div className="relative">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg border"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6"
                                            onClick={() => {
                                                setPreview(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Alt Text */}
                            <div className="space-y-2">
                                <Label htmlFor="alt-text">Alt Text (optional)</Label>
                                <Input
                                    id="alt-text"
                                    placeholder="Describe the image for accessibility"
                                    value={alt || ""}
                                    onChange={(e) => setAlt(e.target.value)}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleUpload} 
                                    disabled={!preview || isUploading}
                                    className="gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Add Image
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* URL Input */}
                            <div className="space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input
                                    id="image-url"
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl || ""}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>

                            {/* URL Preview */}
                            {imageUrl && (
                                <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <div className="relative">
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg border"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                toast.error("Failed to load image from URL");
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Alt Text */}
                            <div className="space-y-2">
                                <Label htmlFor="alt-text-url">Alt Text (optional)</Label>
                                <Input
                                    id="alt-text-url"
                                    placeholder="Describe the image for accessibility"
                                    value={alt || ""}
                                    onChange={(e) => setAlt(e.target.value)}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleInsertUrl} 
                                    disabled={!imageUrl.trim()}
                                    className="gap-2"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    Add Image
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

