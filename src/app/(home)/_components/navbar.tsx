"use client";

import { useScrollTop } from "../../../../hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "./logo";

export const Navbar = () => {
    const scrolled = useScrollTop();
    return (
    <nav
            className={cn(
                "p-4 bg-transparent dark:bg-[#1F1F1F] items-center p-6 w-full fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
                "bg-background/50 backdrop-blur-sm",
                scrolled && "bg-background border-b border-border"
            )}

        >
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="logo" width={24} height={24} className="dark:hidden" />
                    <Image src="/logo-dark.png" alt="logo" width={24} height={24} className="hidden dark:block" />
                    <span className="font-semibold text-lg">Notion</span>
                </Link>
                <SignedOut>
                <div className="flex gap-2 items-center">
                    <ModeToggle />
                    <SignUpButton>
                        <Button variant="outline" size="sm">
                            Sign up
                        </Button>
                    </SignUpButton>
                    <SignInButton>
                        <Button size="sm">
                            Sign in
                        </Button>
                    </SignInButton>
                </div>
            </SignedOut> 
            <SignedIn>
                <div className="flex gap-2 items-center">
                    <ModeToggle />
                    <UserButton showName={true} />
                </div>
            </SignedIn>
            </div>
            
        </nav>
    )
};