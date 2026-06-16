import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = '/api';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlistItems: [],

      // ─── Called after login to overwrite local wishlist with DB data ────
      setWishlist: (items) => set({ wishlistItems: items }),

      // ─── Persist current wishlist state to DB (fire-and-forget) ─────────
      _persistToDb: async (items) => {
        const { useAuthStore } = await import('./useAuthStore');
        const token = useAuthStore.getState().token;
        if (!token) return;
        try {
          await fetch(`${API_BASE}/wishlist`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productIds: items.map(i => i._id) }),
          });
        } catch (_) { /* silent */ }
      },

      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.wishlistItems.find(item => item._id === product._id);
          const newItems = exists
            ? state.wishlistItems.filter(item => item._id !== product._id)
            : [...state.wishlistItems, product];
          get()._persistToDb(newItems);
          return { wishlistItems: newItems };
        });
      },

      isInWishlist: (productId) => {
        return get().wishlistItems.some(item => item._id === productId);
      },

      clearWishlist: () => set({ wishlistItems: [] }),
    }),
    {
      name: 'onebuy-wishlist-storage',
    }
  )
);

export default useWishlistStore;
