import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = '/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      isDrawerOpen: false,

      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      closeDrawer: () => set({ isDrawerOpen: false }),
      openDrawer: () => set({ isDrawerOpen: true }),

      // ─── Called after login to overwrite local cart with DB data ────────
      setCart: (items) => set({ cartItems: items }),

      // ─── Persist current cart state to DB (fire-and-forget) ────────────
      _persistToDb: async (items) => {
        const { useAuthStore } = await import('./useAuthStore');
        const token = useAuthStore.getState().token;
        if (!token) return;
        try {
          await fetch(`${API_BASE}/cart`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: items.map(i => ({
                productId: i._id,
                name: i.name,
                price: i.price,
                image: i.images ? i.images[0] : i.image,
                size: i.size,
                color: i.color,
                quantity: i.quantity,
              })),
            }),
          });
        } catch (_) { /* silent — local state is already correct */ }
      },

      addToCart: (product, quantity = 1, size = 'M', color = 'Default') => {
        set((state) => {
          const existingItem = state.cartItems.find(
            item => item._id === product._id && item.size === size && item.color === color
          );
          let newItems;
          if (existingItem) {
            newItems = state.cartItems.map(item =>
              item._id === product._id && item.size === size && item.color === color
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.cartItems, { ...product, quantity, size, color }];
          }
          get()._persistToDb(newItems);
          return { cartItems: newItems };
        });
        get().openDrawer();
      },

      removeFromCart: (productId, size, color) => {
        set((state) => {
          const newItems = state.cartItems.filter(
            item => !(item._id === productId && item.size === size && item.color === color)
          );
          get()._persistToDb(newItems);
          return { cartItems: newItems };
        });
      },

      updateQuantity: (productId, size, color, newQuantity) => {
        if (newQuantity < 1) return;
        set((state) => {
          const newItems = state.cartItems.map(item =>
            item._id === productId && item.size === size && item.color === color
              ? { ...item, quantity: newQuantity }
              : item
          );
          get()._persistToDb(newItems);
          return { cartItems: newItems };
        });
      },

      clearCart: () => set({ cartItems: [] }),

      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getCartCount: () => {
        return get().cartItems.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'onebuy-cart-storage',
    }
  )
);

export default useCartStore;
