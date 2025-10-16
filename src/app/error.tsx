"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Error = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 p-6">
            <Image src="/error.png" alt="Error" width={300} height={300} className="dark:hidden" />
            <Image src="/error-dark.png" alt="Error" width={300} height={300} className="hidden dark:block" />
            <h2 className="text-2xl font-medium">
                Something went wrong
            </h2>
            <p className="text-muted-foreground">
                We couldn&apos;t find the page you were looking for.
            </p>
            <Button variant="outline" size="sm">
            <Link href="/" className="text-sm text-muted-foreground">
                Go back
            </Link>
            </Button>
            
        </div>
    );
};

export default Error;