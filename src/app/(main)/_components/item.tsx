import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, LucideIcon, MoreHorizontalIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateDocument } from "@/hooks/use-create-document";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ItemProps {
    id?: string;
    documentIcon?: string;
    isActive?: boolean;
    isExpanded?: boolean;
    level?: number;
    onExpand?: () => void;
    isSearch?: boolean;
    onClick?: () => void;
    label: string;
    icon: LucideIcon;
}


const Item = ({ onClick, label, icon: Icon, id, documentIcon, isActive, isExpanded, level = 0, onExpand, isSearch }: ItemProps) => {
    const { createDocument: handleCreateDocument } = useCreateDocument();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const user = useClerk();

    const archiveDocument = useMutation(trpc.document.archive.mutationOptions({
        onSuccess: () => {
            toast.success("Document archived successfully");
            // Invalidate relevant queries to refresh the document list
            queryClient.invalidateQueries({
                queryKey: trpc.document.getMany.queryKey()
            });
            queryClient.invalidateQueries({
                queryKey: trpc.document.getChildren.queryKey({ parentId: "root" })
            });
        },
        onError: (error: any) => {
            toast.error("Failed to archive document");
            console.error('Failed to archive document:', error);
        },
    }));
    
    const handleExpand = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onExpand?.();
    };
    
    const handleCreate = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!id) return;
        e.stopPropagation();
        handleCreateDocument({ parentDocument: id });
        if (!isExpanded) {
            onExpand?.();
        }
    };

    const handleArchive = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!id) return;
        e.stopPropagation();
        archiveDocument.mutate({ id, isArchived: true });
    };

    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
    return (
        <div className={cn("group min-h-[27px] text-sm py-1.5 pr-2 text-muted-foreground flex items-center hover:bg-primary/5", 
        isActive && "bg-primary/5 text-primary dark:text-primary-foreground",
        isSearch && "justify-center pl-0")} 
        onClick={onClick} role="button"
        style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}>
            {!!id && (
                <div className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1" role="button" onClick={handleExpand} >
                    <ChevronIcon className={cn("h-4 w-4 text-muted-foreground/50 shrink-0", 
                    isActive && "text-primary dark:text-primary-foreground")} />
                </div>
            )}
            {documentIcon ? (
                <div className="shrink-0 mr-2 text-[18px]">
                    {documentIcon}
                </div>
                ) : (
                <Icon
                    className={cn("shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground", 
                    isActive && "text-primary dark:text-primary-foreground")}
                />
                )}
            <span className="truncate">{label}</span>
            {isSearch && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs text-muted-foreground">⌘K</span>
                    </kbd>
            )}
            {!!id && (
                <div className="ml-auto flex items-center gap-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div role="button" className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                                <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="right" className="w-60" forceMount>
                            <DropdownMenuItem onClick={handleArchive} disabled={archiveDocument.isPending}>
                                <TrashIcon className="size-4 mr-2" />
                                {archiveDocument.isPending ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="text-xs text-muted-foreground p-2">
                                Last edited by {user.user?.fullName}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div 
                        className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
                        onClick={handleCreate}
                        role="button"
                    >
                        <PlusIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            )}
        </div>
    );
};

Item.Skeleton = function ItemSkeleton({ level, isSearch }: { level: number, isSearch: boolean }) {
    return (
        <div 
        className={cn("group min-h-[27px] text-sm py-1.5 pr-2 text-muted-foreground flex items-center hover:bg-primary/5", 
        isSearch && "justify-center pl-0")} 
        style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}>
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[30%]" />
        </div>
    );
};

export default Item;