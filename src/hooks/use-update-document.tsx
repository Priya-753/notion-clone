import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

interface UpdateDocumentOptions {
    id: string;
    title?: string;
    content?: string;
    coverImage?: string;
    icon?: string;
    isPublished?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

export const useUpdateDocument = (options: UpdateDocumentOptions = {} as UpdateDocumentOptions) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const {
        id,
        title,
        content,
        coverImage,
        icon,
        isPublished,
        onSuccess,
        onError,
    } = options;

    const updateDocument = useMutation(trpc.document.update.mutationOptions({
        onSuccess: (data) => {
            toast.success("Document updated!");
            
            // Invalidate relevant queries to refresh the UI
            queryClient.invalidateQueries({
                queryKey: trpc.document.getMany.queryKey()
            });
            
            queryClient.invalidateQueries({
                queryKey: trpc.document.getById.queryKey({ id: data.id })
            });
            
            // If the document has a parent, also invalidate the parent's children query
            if (data.parentDocument) {
                queryClient.invalidateQueries({
                    queryKey: trpc.document.getChildren.queryKey({ parentId: data.parentDocument })
                });
            } else {
                // If it's a root document, invalidate the root children query
                queryClient.invalidateQueries({
                    queryKey: trpc.document.getChildren.queryKey({ parentId: "root" })
                });
            }
            
            onSuccess?.(data);
        },
        onError: (error) => {
            toast.error("Failed to update document.");
            onError?.(error);
        },
    }));

    const handleUpdateDocument = (customOptions?: Partial<UpdateDocumentOptions>) => {
        const finalOptions = {
            id: customOptions?.id ?? id,
            title: customOptions?.title ?? title,
            content: customOptions?.content ?? content,
            coverImage: customOptions?.coverImage ?? coverImage,
            icon: customOptions?.icon ?? icon,
            isPublished: customOptions?.isPublished ?? isPublished,
        };

        updateDocument.mutate(finalOptions);
    };

    return {
        updateDocument: handleUpdateDocument,
        isPending: updateDocument.isPending,
        isError: updateDocument.isError,
        error: updateDocument.error,
        data: updateDocument.data,
    };
};
