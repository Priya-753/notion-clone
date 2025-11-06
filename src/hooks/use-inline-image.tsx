import { create } from "zustand";
import type { Editor } from "@tiptap/react";

type InlineImageStore = {
    isOpen: boolean;
    editor: Editor | null;
    existingImageUrl?: string;
    onDeleteOld?: () => void;
    onOpen: (editor: Editor, existingImageUrl?: string, onDeleteOld?: () => void) => void;
    onClose: () => void;
}

export const useInlineImage = create<InlineImageStore>((set) => ({
    isOpen: false,
    editor: null,
    existingImageUrl: undefined,
    onDeleteOld: undefined,
    onOpen: (editor: Editor, existingImageUrl?: string, onDeleteOld?: () => void) => 
        set({ isOpen: true, editor, existingImageUrl, onDeleteOld }),
    onClose: () => set({ isOpen: false, editor: null, existingImageUrl: undefined, onDeleteOld: undefined }),
}));

