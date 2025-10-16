"use client";

import { useQuery } from "@tanstack/react-query";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Title } from "./title";
import { Banner } from "./banner";
import { useTRPC } from "@/trpc/client";


interface NavbarProps {
    isCollapsed: boolean;
    onResetSidebar: () => void;
}

export const Navbar = ({ isCollapsed, onResetSidebar }: NavbarProps) => {
    const trpc = useTRPC();
    const params = useParams();
    const { data: document } = useQuery({
        ...trpc.document.getById.queryOptions({
            id: params.documentId as string,
        }),
    });
    if (!document) {
        return null;
    }


    return (
        <>
        <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
            {isCollapsed && 
            <MenuIcon onClick={() => onResetSidebar()} role="button" className="h-6 w-6 text-muted-foreground" />}
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-x-2">
                    {document.icon && (
                        <div className="text-2xl">
                            {document.icon}
                        </div>
                    )}
                    <Title initialTitle={document.title} documentId={document.id} />
                </div>
            </div>
        </nav>
        {document.isArchived && (
            <Banner documentId={document.id} />
        )}
        </>
    );
};
