import { create } from "zustand";
import { CartItem } from "../models/products.model";

type CartState = {
    cart: CartItem[];
    setCart: (val: CartItem[]) => void;
}

export const useCartStore = create<CartState>((set) => ({
    cart: [],
    setCart: (val: CartItem[]) => set({ cart: val })
}))