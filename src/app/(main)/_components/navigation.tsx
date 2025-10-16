import { ChevronsLeft, MenuIcon, PlusCircleIcon, PlusIcon, SearchIcon, SettingsIcon, TrashIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { UserItem } from "./user-item";
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import { Suspense } from "react";
import Item from "./item";
import { DocumentList } from "./document-list";
import { useCreateDocument } from "@/hooks/use-create-document";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TrashList from "./trash-list";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";

export const Navigation = () => {
    const pathname = usePathname();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const trpc = useTRPC();
    const { user } = useClerk();
    const params = useParams();
    const queryClient = useQueryClient();

    const { data: documents = [] } = useQuery({
        ...trpc.document.getMany.queryOptions(),
        enabled: !!user?.id,
    });

    // Prefetch documents for better performance
    useEffect(() => {
        if (user?.id) {
            // Prefetch root documents
            queryClient.prefetchQuery({
                ...trpc.document.getChildren.queryOptions({
                    parentId: "root",
                }),
            });
        }
    }, [user?.id, queryClient, trpc.document.getChildren]);

    const isResizing = useRef(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLDivElement>(null);

    const [isCollapsed, setIsCollapsed] = useState(isMobile);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        if (isMobile) {
            collapseSidebar();
        } else {
            resetSidebar();
        }
    }, [isMobile]);

    useEffect(() => {
        if (isMobile) {
            collapseSidebar();
        }
    }, [pathname, isMobile]);

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        isResizing.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseUp = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isResizing.current) {
            let newWidth = e.clientX;
            if (newWidth < 240) newWidth = 240;
            if (newWidth > 480) newWidth = 480;
            if (sidebarRef.current && navbarRef.current) {
                sidebarRef.current.style.width = `${newWidth}px`;
                navbarRef.current.style.setProperty("left", `${newWidth}px`);
                navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
            }
        }
    };

    const resetSidebar = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsResetting(true);
            setIsCollapsed(false);

            sidebarRef.current.style.width = isMobile ? "100%" : "240px";
            navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
            navbarRef.current.style.setProperty("width", isMobile ? `0` : `calc(100% - 240px)`);

            setTimeout(() => {
                setIsResetting(false);
            }, 300);
        }
    };

    const collapseSidebar = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true);
            setIsResetting(true);

            sidebarRef.current.style.width = "0";
            navbarRef.current.style.setProperty("left", "0");
            navbarRef.current.style.setProperty("width", "100%");

            setTimeout(() => {
                setIsResetting(false);
            }, 300);
        }
    };

    const { createDocument: handleCreateDocument } = useCreateDocument();

    const { onOpen } = useSearch();
    const { onOpen: onOpenSettings } = useSettings();
    
    const handleSearch = () => {
        onOpen();
    };

    const handleSettings = () => {
        onOpenSettings();
    };

  return (
    <>
    <aside ref={sidebarRef} className={cn("group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]", 
    isResetting && "transition-all duration-300 ease-in-out",
    isMobile && "w-0")}>
        <div role="button" onClick={() => collapseSidebar()}  className={
            cn("h-6 w-6 absolute top-3 right-2 text-muted-foreground hover:bg-neutral-300 dark:hover:bg-neutral-600 opacity-0 group-hover/sidebar:opacity-100 transition",
        isMobile && "opacity-100")}>
            <ChevronsLeft className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
            <UserItem />
            <Item onClick={() => handleSearch()} label="Search" icon={SearchIcon} isSearch />
            <Item onClick={() => handleSettings()} label="Settings" icon={SettingsIcon} />
            <Item onClick={() => handleCreateDocument()} label="New Note" icon={PlusCircleIcon} />
        </div>
        <div className="mt-4">
            <Suspense fallback={<div className="p-2 text-sm text-muted-foreground">Loading documents...</div>}>
                <DocumentList parentDocumentId="root" />
            </Suspense>
            <Item onClick={() => handleCreateDocument()} label="Add a page" icon={PlusIcon} />
                <Popover>
                    <PopoverTrigger className="w-full mt-4">
                        <Item label="Trash" icon={TrashIcon} />
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-72" side={isMobile ? "bottom" : "right"}>
                        <TrashList />
                    </PopoverContent>
                </Popover>
        </div>
        <div 
        className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute top-0 right-0 w-1 h-full bg-primary/10"
        onMouseDown={(e) => handleMouseDown(e as unknown as MouseEvent)}
        onClick={() => resetSidebar()}
        onMouseUp={() => handleMouseUp()}
        onMouseMove={(e) => handleMouseMove(e as unknown as MouseEvent)}
        />
    </aside>
    <div ref={navbarRef} className={cn("absolute top-0 left-60 z-[99999] w-[calc(100%-240px)]",
         isResetting && "transition-all duration-300 ease-in-out",
         isMobile && "left-0 w-full")}>
            {!!params.documentId && (
                <Navbar
                    isCollapsed={isCollapsed}
                    onResetSidebar={resetSidebar}
                />
            )}
            <nav className="bg-transparent px-3 py-2 w-full">
                {isCollapsed && <MenuIcon onClick={() => resetSidebar()} role="button" className="h-6 w-6 text-muted-foreground" />}
                </nav>
        </div>
        </>
    );
}; 