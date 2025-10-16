"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/toolbar";
import { ImageDisplay } from "@/components/image-display";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useUpdateDocument } from "@/hooks/use-update-document";
import { useCoverImage } from "@/hooks/use-cover-image";
import { Cover } from "@/components/cover";

const DocumentIdPage = () => {
    const trpc = useTRPC();
    const params = useParams();
    const { getDocumentImages, deleteImage } = useImageUpload();
    const { updateDocument } = useUpdateDocument({
        id: params.documentId as string,
    });
    const { onOpen: onOpenCoverImage } = useCoverImage();

    const { data: document, isLoading } = useQuery({
        ...trpc.document.getById.queryOptions({
            id: params.documentId as string,
        }),
    });

    const { data: images = [] } = getDocumentImages() || { data: [] };

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
        <div className="h-full">
            {/* Cover Image - Full width at the very top */}
            <Cover url={document.coverImage || undefined} />
            
            {/* Title appears right below cover */}
            <div className="sm:max-w-3xl lg:max-w-4xl mx-auto">
                <Toolbar initialData={document} />
            </div>
            
            <div className="pb-40">
                <div className="p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose dark:prose-invert max-w-none">
                            {document.content ? (
                                <div 
                                    className="whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: document.content }}
                                />
                            ) : (
                                <div className="text-muted-foreground italic">
                                    Start writing your document...
                                </div>
                            )}
                        </div>

                        {/* Display uploaded images */}
                        {images.length > 0 && (
                            <div className="mt-8 space-y-6">
                                <h3 className="text-lg font-semibold">Images</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {images.map((image: any) => (
                                        <ImageDisplay
                                            key={image.id}
                                            src={image.url}
                                            alt={image.alt || undefined}
                                            caption={image.caption || undefined}
                                            width={image.width || undefined}
                                            height={image.height || undefined}
                                            editable={true}
                                            onRemove={() => deleteImage(image.id)}
                                            className="w-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentIdPage;
