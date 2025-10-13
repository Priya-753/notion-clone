"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const Heading = () => {
    const router = useRouter();
    return (
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text5xl md:text-6xl font-bold">
                Your Ideas, Documents, & Plans. Unified. Welcome to <span className="underline">Notion</span>
                </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                Notion is the all-in-one workspace <br/>
                you can use to write, plan, collaborate, and get organized.
            </h3>
            <Button onClick={() => router.push("/documents")}>
                Enter Notion
                <ArrowRightIcon className="w-4 h-4 ml-2" /> 
            </Button>
        </div>
    );
};