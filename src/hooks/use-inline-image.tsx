import { create } from "zustand";

type InlineImageStore = {
    isOpen: boolean;
    editor: any | null;
    existingImageUrl?: string;
    onDeleteOld?: () => void;
    onOpen: (editor: any, existingImageUrl?: string, onDeleteOld?: () => void) => void;
    onClose: () => void;
}

export const useInlineImage = create<InlineImageStore>((set) => ({
    isOpen: false,
    editor: null,
    existingImageUrl: undefined,
    onDeleteOld: undefined,
    onOpen: (editor: any, existingImageUrl?: string, onDeleteOld?: () => void) => 
        set({ isOpen: true, editor, existingImageUrl, onDeleteOld }),
    onClose: () => set({ isOpen: false, editor: null, existingImageUrl: undefined, onDeleteOld: undefined }),
}));

