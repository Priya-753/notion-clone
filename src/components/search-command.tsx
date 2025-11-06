"use client";

import { useSearch } from "@/hooks/use-search";
import { useEffect, useState } from "react";
import { FileIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
    CommandDialog, 
    CommandInput, 
    CommandList, 
    CommandEmpty, 
    CommandGroup, 
    CommandItem 
} from "@/components/ui/command";

export const SearchCommand = () => {
    const { user } = useClerk();
    const trpc = useTRPC();
    const router = useRouter();
    const { isOpen, onClose } = useSearch();
    const [isMounted, setIsMounted] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { data: documents = [] } = useQuery({
        ...trpc.document.searchDocuments.queryOptions({
            query: search,
        }),
        enabled: !!user?.id && !!search && search.length > 0,
    });

    const onSelect = (id: string) => {
        router.push(`/documents/${id}`);
        onClose();
    };

    if (!isMounted) {
        return null;
    }

    return (
        <CommandDialog open={isOpen} onOpenChange={onClose}>
            <CommandInput 
                placeholder="Search for documents..." 
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                <CommandEmpty>No documents found.</CommandEmpty>
                <CommandGroup heading="Documents">
                    {documents.map((document) => (
                        <CommandItem
                            key={document.id}
                            value={document.title}
                            onSelect={() => onSelect(document.id)}
                        >
                            <FileIcon className="mr-2 h-4 w-4" />
                            <span>{document.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
};