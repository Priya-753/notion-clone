"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { usePathname } from "next/navigation";
import { SearchCommand } from "@/components/search-command";
import { SettingsDialog } from "@/components/settings-dialog";
import { CoverImageModal } from "@/components/cover-image-modal";
import { useEffect } from "react";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoaded } = useUser();
    const { onOpen } = useSearch();
    const { onOpen: onOpenSettings } = useSettings();
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                onOpen();
            }
            if ((event.metaKey || event.ctrlKey) && event.key === ',') {
                event.preventDefault();
                onOpenSettings();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onOpen, onOpenSettings]);
    
    if (!isLoaded) {
        return (
            <div className="h-full dark:bg-[#1F1F1F] flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }
    
    if (!user) {
        return redirect("/");
    }

    return (
        <div className="h-screen dark:bg-[#1F1F1F] flex">
            <div className="w-60 bg-secondary flex-shrink-0 h-full">
                <Navigation />
            </div>
            <main className="flex-1 h-screen overflow-y-auto">
                {children}
            </main>
            <SearchCommand />
            <SettingsDialog />
            <CoverImageModal />
        </div>
    );
};

export default MainLayout;