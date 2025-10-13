import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateDocumentOptions {
    title?: string;
    parentDocument?: string;
    content?: string;
    coverImage?: string;
    icon?: string;
    isPublished?: boolean;
    isArchived?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    redirectToDocument?: boolean;
}

export const useCreateDocument = (options: CreateDocumentOptions = {}) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        title = "Untitled",
        parentDocument,
        content = "",
        coverImage = "",
        icon = "",
        isPublished = false,
        isArchived = false,
        onSuccess,
        onError,
        redirectToDocument = false,
    } = options;

    const createDocument = useMutation(trpc.document.create.mutationOptions({
        onSuccess: (data) => {
            toast.success("New note created!");
            
            // Invalidate relevant queries to refresh the sidebar
            queryClient.invalidateQueries({
                queryKey: trpc.document.getMany.queryKey()
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
            
            if (redirectToDocument) {
                // router.push(`/documents/${data.id}`);
            }
            onSuccess?.(data);
        },
        onError: (error) => {
            toast.error("Failed to create note.");
            onError?.(error);
        },
    }));

    const handleCreateDocument = (customOptions?: Partial<CreateDocumentOptions>) => {
        const finalOptions = {
            title: customOptions?.title ?? title,
            parentDocument: customOptions?.parentDocument ?? parentDocument,
            content: customOptions?.content ?? content,
            coverImage: customOptions?.coverImage ?? coverImage,
            icon: customOptions?.icon ?? icon,
            isPublished: customOptions?.isPublished ?? isPublished,
            isArchived: customOptions?.isArchived ?? isArchived,
        };

        createDocument.mutate(finalOptions);
    };

    return {
        createDocument: handleCreateDocument,
        isPending: createDocument.isPending,
        isError: createDocument.isError,
        error: createDocument.error,
        data: createDocument.data,
    };
};
