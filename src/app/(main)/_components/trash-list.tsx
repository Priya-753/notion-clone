"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileIcon, TrashIcon, MoreHorizontalIcon, RotateCcwIcon, ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";   
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TrashList = () => {
    const { user } = useClerk();
    const params = useParams();
    const router = useRouter();
    const trpc = useTRPC();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [search, setSearch] = useState("");
    const queryClient = useQueryClient();
    const { data: documents = [] } = useQuery({
        ...trpc.document.archived.queryOptions(),
        enabled: !!user?.id,
    });

    const onSearch = (query: string) => {
        setSearch(query);
    };

    const onClick = (id: string) => {
        router.push(`/documents/${id}`);
    };

    const restoreDocument = useMutation(trpc.document.archive.mutationOptions({
        onSuccess: () => {
            toast.success("Document restored successfully");
            // Invalidate queries to refresh the lists
            queryClient.invalidateQueries({
                queryKey: trpc.document.archived.queryKey(),
            });
            queryClient.invalidateQueries({
                queryKey: trpc.document.getMany.queryKey()
            });
            queryClient.invalidateQueries({
                queryKey: trpc.document.getChildren.queryKey({ parentId: "root" })
            });
        },
        onError: () => {
            toast.error("Failed to restore document");
        },
    }));

    const deleteDocument = useMutation(trpc.document.delete.mutationOptions({
        onSuccess: () => {
            toast.success("Document permanently deleted");
            // Invalidate queries to refresh the lists
            queryClient.invalidateQueries({
                queryKey: trpc.document.archived.queryKey(),
            });
        },
        onError: () => {
            toast.error("Failed to delete document");
        },
    }));

    const deleteAllDocuments = useMutation({
        mutationFn: async () => {
            // Delete all archived documents one by one
            const archivedDocs = documents;
            for (const doc of archivedDocs) {
                await deleteDocument.mutateAsync({ id: doc.id });
            }
        },
        onSuccess: () => {
            toast.success("All documents permanently deleted");
            queryClient.invalidateQueries({
                queryKey: trpc.document.archived.queryKey(),
            });
        },
        onError: () => {
            toast.error("Failed to delete all documents");
        },
    });

    const onRestore = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        id: string
    ) => {
        event.stopPropagation();
        restoreDocument.mutate({ id, isArchived: false });
    };

    const onDelete = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        id: string
    ) => {
        event.stopPropagation();
        deleteDocument.mutate({ id });
    };
    

    // Build hierarchical structure from flat list
    const buildHierarchy = (docs: any[]) => {
        const docMap = new Map();
        const roots: any[] = [];
        
        // Create a map of all documents
        docs.forEach(doc => {
            docMap.set(doc.id, { ...doc, children: [] });
        });
        
        // Build the hierarchy
        docs.forEach(doc => {
            if (doc.parentDocument && docMap.has(doc.parentDocument)) {
                docMap.get(doc.parentDocument).children.push(docMap.get(doc.id));
            } else {
                roots.push(docMap.get(doc.id));
            }
        });
        
        return roots;
    };

    const filteredDocuments = documents.filter((document) => 
        document.title.toLowerCase().includes(search.toLowerCase())
    );
    
    // Build hierarchy from filtered documents, but include parents of matching children
    const buildHierarchyWithSearch = (docs: any[], searchQuery: string) => {
        if (!searchQuery.trim()) {
            return buildHierarchy(docs);
        }
        
        const docMap = new Map();
        const roots: any[] = [];
        const includedIds = new Set();
        
        // First, find all documents that match the search
        const matchingDocs = docs.filter(doc => 
            doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Add all matching documents and their parents to includedIds
        const addParents = (docId: string) => {
            if (includedIds.has(docId)) return;
            includedIds.add(docId);
            
            const doc = docs.find(d => d.id === docId);
            if (doc && doc.parentDocument) {
                addParents(doc.parentDocument);
            }
        };
        
        matchingDocs.forEach(doc => {
            addParents(doc.id);
        });
        
        // Create a map of included documents
        const includedDocs = docs.filter(doc => includedIds.has(doc.id));
        includedDocs.forEach(doc => {
            docMap.set(doc.id, { ...doc, children: [] });
        });
        
        // Build the hierarchy
        includedDocs.forEach(doc => {
            if (doc.parentDocument && docMap.has(doc.parentDocument)) {
                docMap.get(doc.parentDocument).children.push(docMap.get(doc.id));
            } else {
                roots.push(docMap.get(doc.id));
            }
        });
        
        return roots;
    };
    
    const hierarchicalDocuments = buildHierarchyWithSearch(documents, search);

    const onExpandDocument = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const TrashItem = ({ document, level = 0 }: { document: any; level?: number }) => {
        const hasChildren = document.children && document.children.length > 0;
        const isExpanded = expanded[document.id];
        const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
        const isSearchMatch = search.trim() && document.title.toLowerCase().includes(search.toLowerCase());

        return (
            <>
                <div className={cn("group min-h-[27px] text-sm py-1.5 pr-2 text-muted-foreground flex items-center hover:bg-primary/5", 
                    params.documentId === document.id && "bg-primary/5 text-foreground",
                    isSearchMatch && "bg-yellow-50 dark:bg-yellow-900/20")} 
                    onClick={() => onClick(document.id)} 
                    role="button"
                    style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}>
                    {hasChildren && (
                        <div className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1" role="button" onClick={(e) => { e.stopPropagation(); onExpandDocument(document.id); }}>
                            <ChevronIcon className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        </div>
                    )}
                    {document.icon ? (
                        <div className="shrink-0 mr-2 text-[18px]">
                            {document.icon}
                        </div>
                    ) : (
                        <FileIcon className="shrink-0 h-[18px] mr-2 text-muted-foreground" />
                    )}
                    <span className={cn("truncate", isSearchMatch && "font-medium")}>{document.title}</span>
                    <div className="ml-auto flex items-center gap-x-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <div role="button" className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                                    <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="right" className="w-60" forceMount>
                                <DropdownMenuItem onClick={(e) => onRestore(e, document.id)} disabled={restoreDocument.isPending}>
                                    <RotateCcwIcon className="size-4 mr-2" />
                                    {restoreDocument.isPending ? 'Restoring...' : 'Restore'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => onDelete(e, document.id)} disabled={deleteDocument.isPending}>
                                    <TrashIcon className="size-4 mr-2" />
                                    {deleteDocument.isPending ? 'Deleting...' : 'Delete Forever'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <div className="text-xs text-muted-foreground p-2">
                                    Last edited by {user?.fullName}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {document.children.map((child: any) => (
                            <TrashItem key={child.id} document={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </>
        );
    };

    const handleDeleteAll = () => {
        if (window.confirm("Are you sure you want to permanently delete all documents in trash? This action cannot be undone.")) {
            deleteAllDocuments.mutate();
        }
    };

    return (
        <div className="min-h-[50px] flex flex-col">
            <div className="p-2">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input 
                        className="h-7 py-1 pl-7 pr-2 focus-visible:ring-transparent bg-secondary"
                        placeholder="Filter by page title" 
                        value={search} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)} 
                    />
                </div>
            </div>
                {hierarchicalDocuments.length > 0 && (
                    <div className="px-3 py-2 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {hierarchicalDocuments.length} document{hierarchicalDocuments.length !== 1 ? 's' : ''} in trash
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={handleDeleteAll}
                                disabled={deleteAllDocuments.isPending}
                                className="h-8 px-3 text-xs font-medium"
                            >
                                <TrashIcon className="h-3 w-3 mr-1" />
                                {deleteAllDocuments.isPending ? 'Deleting...' : 'Delete All'}
                            </Button>
                        </div>
                    </div>
                )}
            
            {hierarchicalDocuments.map((document) => (
                <TrashItem key={document.id} document={document} />
            ))}
            {hierarchicalDocuments.length === 0 && (
                <div className="flex items-center p-8 justify-center text-muted-foreground">
                    <div className="text-center">
                        {search.trim() ? (
                            <p className="text-xs">No documents found matching "{search}"</p>
                        ) : (
                            <p className="text-xs">No documents in trash</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TrashList;