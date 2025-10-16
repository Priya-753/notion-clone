"use client";

import { Input } from "./ui/input";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";

interface IconPickerProps {
    children: React.ReactNode;
    onChange: (value: string) => void;
    asChild?: boolean;
}

export const IconPicker = ({ children, onChange, asChild}: IconPickerProps) => {

    const { resolvedTheme } = useTheme();
    const currentTheme = (resolvedTheme || "light") as keyof typeof themeMap;

    const themeMap = {
        dark: Theme.DARK,
        light: Theme.LIGHT,
    };

    const [open, setOpen] = useState(false);

    const theme = themeMap[currentTheme];
    const [selection, setSelection] = useState<string>("");

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>{children}</PopoverTrigger>
                <PopoverContent className="p-0 w-full border-none shadow-none">
                    <EmojiPicker
                        height={300}
                        theme={theme}
                        onEmojiClick={(emoji) => onChange(emoji.emoji)}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};