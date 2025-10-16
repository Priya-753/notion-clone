"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface BannerProps {
    documentId: string;
}

export const Banner = ({ documentId }: BannerProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();

    const archiveMutation = useMutation(trpc.document.archive.mutationOptions({
        onSuccess: () => {
            toast.success("Document restored!");
            queryClient.invalidateQueries({
                queryKey: trpc.document.getById.queryKey({ id: documentId })
            });
            queryClient.invalidateQueries({
                queryKey: trpc.document.getMany.queryKey()
            });
        },
        onError: () => {
            toast.error("Failed to restore document.");
        },
    }));

    const deleteMutation = useMutation(trpc.document.delete.mutationOptions({
        onSuccess: () => {
            toast.success("Document permanently deleted!");
            router.push("/documents");
        },
        onError: () => {
            toast.error("Failed to delete document.");
        },
    }));

    const handleRestore = () => {
        archiveMutation.mutate({
            id: documentId,
            isArchived: false,
        });
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to permanently delete this document? This action cannot be undone.")) {
            deleteMutation.mutate({
                id: documentId,
            });
        }
    };

    return (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Trash2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            This document is in the trash. You can restore it or permanently delete it.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={handleRestore}
                        disabled={archiveMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:text-yellow-200 dark:border-yellow-600 dark:hover:bg-yellow-800"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        variant="destructive"
                        size="sm"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Forever
                    </Button>
                </div>
            </div>
        </div>
    );
};
