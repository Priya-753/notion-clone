import { create } from "zustand";

type CoverImageStore = {
    isOpen: boolean;
    documentId: string | null;
    onOpen: (documentId: string) => void;
    onClose: () => void;
}

export const useCoverImage = create<CoverImageStore>((set) => ({
    isOpen: false,
    documentId: null,
    onOpen: (documentId: string) => set({ isOpen: true, documentId }),
    onClose: () => set({ isOpen: false, documentId: null }),
}));