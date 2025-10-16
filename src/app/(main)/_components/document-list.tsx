"use client";

import { useTRPC } from "@/trpc/client";
import { trpc } from "@/trpc/server";
import { useClerk } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Item from "./item";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface DocumentListProps {
    parentDocumentId?: string;
    level?: number;
    data?: any;
    isExpanded?: boolean;
}

export const DocumentList = ({
    parentDocumentId,
    level = 0,
    data,
    isExpanded = true
}: DocumentListProps) => {
    const { user } = useClerk();
    const params = useParams();
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    

    const onExpandDocument = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const { data: documents = [], isLoading } = useQuery({
        ...trpc.document.getChildren.queryOptions({
            parentId: parentDocumentId ?? "root",
        }),
        enabled: !!user?.id && !!parentDocumentId,
    });

    // Prefetch children documents when a document is expanded
    useEffect(() => {
        if (user?.id && documents.length > 0) {
            documents.forEach((document) => {
                if (expanded[document.id]) {
                    queryClient.prefetchQuery({
                        ...trpc.document.getChildren.queryOptions({
                            parentId: document.id,
                        }),
                    });
                }
            });
        }
    }, [user?.id, documents, expanded, queryClient, trpc.document.getChildren]);

    const onRedirect = (id: string) => {
        router.push(`/documents/${id}`);
    };

    if (isLoading) {
        return (
            <>
                <Item.Skeleton level={level} isSearch={false} />
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level} isSearch={false} />
                        <Item.Skeleton level={level} isSearch={false} />
                    </>
                )}
            </>
        );
    }

    return (
        <>
            {documents.map((document) => (
                <div key={document.id}>
                    <Item
                        id={document.id}
                        label={document.title}
                        icon={FileIcon}
                        onClick={() => onRedirect(document.id)}
                        level={level}
                        onExpand={() => onExpandDocument(document.id)}
                        isActive={params.documentId === document.id}
                        isExpanded={expanded[document.id]}
                        documentIcon={document.icon ?? undefined}
                        isSearch={false}
                    />
                    {expanded[document.id] && (
                        <Suspense fallback={<div className="p-2 text-sm text-muted-foreground">Loading...</div>}>
                            <DocumentList
                                parentDocumentId={document.id}
                                level={level + 1}
                                isExpanded={expanded[document.id]}
                            />
                        </Suspense>
                    )}
                </div>
            ))}
            {documents.length === 0 && level > 0 && isExpanded && (
                <p style={{ paddingLeft: `${level * 12 + 25}px` }} 
                className="text-sm text-muted-foreground font-medium">
                    No pages inside
                </p>
            )}
        </>
    );
}; 

