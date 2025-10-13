"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";    
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useCreateDocument } from "@/hooks/use-create-document";

export default function DocumentsPage() {
    const { user } = useUser();
    const { createDocument, isPending } = useCreateDocument({
        redirectToDocument: true,
    });

    const handleCreateDocument = () => {
        createDocument();
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center space-y-4 p-6">
            <Image src="/empty.png" alt="Empty" width={300} height={300} className="dark:hidden" />
            <Image src="/empty-dark.png" alt="Empty" width={300} height={300} className="hidden dark:block" />
            <h2 className="text-2xl font-medium">
               Welcome to {user?.firstName}&apos;s Notion
            </h2>
            <Button 
                onClick={handleCreateDocument}
                disabled={isPending}
            >
                <PlusIcon className="w-4 h-4 mr-2" />
                {isPending ? "Creating..." : "Create a new note"}
            </Button>
        </div>
    );
}   