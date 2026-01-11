import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
    id: number | string;
    title: string;
    description: string;
    price: string;
    duration: string;
    students: string;
    image: string;
}

interface CartState {
    items: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number | string) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            addToCart: (product) =>
                set((state) => {
                    // Check if item already exists
                    if (state.items.find(item => item.id === product.id)) {
                        return state;
                    }
                    return { items: [...state.items, product] };
                }),
            removeFromCart: (productId) =>
                set((state) => ({ items: state.items.filter((item) => item.id !== productId) })),
            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'cart-storage',
        }
    )
);
