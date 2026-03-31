import { create } from "zustand";

type AppState = {
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isLoading: false,
    setIsLoading: (val: boolean) => set({ isLoading: val })
}))