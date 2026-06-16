import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useCartStore from './useCartStore';
import useWishlistStore from './useWishlistStore';

const API_BASE = '/api';

// ─── Helpers ────────────────────────────────────────────────────────────────
// After login we: (1) sync guest data → DB, (2) set frontend state to DB result
const syncAndLoadCart = async (token) => {
  const guestItems = useCartStore.getState().cartItems;

  // Build the payload the backend expects
  const guestPayload = guestItems.map(i => ({
    productId: i._id,
    name: i.name,
    price: i.price,
    image: i.images ? i.images[0] : i.image,
    size: i.size  || 'M',
    color: i.color || 'Default',
    quantity: i.quantity,
  }));

  const res = await fetch(`${API_BASE}/cart/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: guestPayload }),
  });

  if (res.ok) {
    const dbItems = await res.json();
    // Convert DB items back to the shape the frontend cart expects
    const frontendItems = dbItems.map(i => ({
      _id:      String(i.productId),
      name:     i.name,
      price:    i.price,
      images:   [i.image],
      size:     i.size,
      color:    i.color,
      quantity: i.quantity,
    }));
    useCartStore.getState().setCart(frontendItems);
  }
};

const syncAndLoadWishlist = async (token) => {
  const guestItems = useWishlistStore.getState().wishlistItems;
  const guestIds   = guestItems.map(i => i._id);

  const res = await fetch(`${API_BASE}/wishlist/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productIds: guestIds }),
  });

  if (res.ok) {
    const dbItems = await res.json();
    useWishlistStore.getState().setWishlist(dbItems);
  }
};

// ─── Store ───────────────────────────────────────────────────────────────────
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      loginWithEmail: async (email, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        set({ user: { _id: data._id, name: data.name, email: data.email, avatar: data.avatar, isAdmin: data.isAdmin }, token: data.token });
        await Promise.all([
          syncAndLoadCart(data.token),
          syncAndLoadWishlist(data.token),
        ]);
        return data;
      },

      registerWithEmail: async (name, email, password) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        set({ user: { _id: data._id, name: data.name, email: data.email, avatar: data.avatar, isAdmin: data.isAdmin }, token: data.token });
        await Promise.all([
          syncAndLoadCart(data.token),
          syncAndLoadWishlist(data.token),
        ]);
        return data;
      },

      loginWithGoogle: async (access_token, googleUser) => {
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token, googleUser }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        set({ user: { _id: data._id, name: data.name, email: data.email, avatar: data.avatar, isAdmin: data.isAdmin }, token: data.token });
        await Promise.all([
          syncAndLoadCart(data.token),
          syncAndLoadWishlist(data.token),
        ]);
        return data;
      },

      loginWithApple: async (email, name) => {
        const res = await fetch(`${API_BASE}/auth/apple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        set({ user: { _id: data._id, name: data.name, email: data.email, avatar: data.avatar, isAdmin: data.isAdmin }, token: data.token });
        await Promise.all([
          syncAndLoadCart(data.token),
          syncAndLoadWishlist(data.token),
        ]);
        return data;
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            set({ user: { _id: data._id, name: data.name, email: data.email, avatar: data.avatar, isAdmin: data.isAdmin } });
            // Re-load the DB cart/wishlist on page refresh (no guest merge needed here)
            const [cartRes, wishlistRes] = await Promise.all([
              fetch(`${API_BASE}/cart`,     { headers: { Authorization: `Bearer ${token}` } }),
              fetch(`${API_BASE}/wishlist`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (cartRes.ok) {
              const dbItems = await cartRes.json();
              if (Array.isArray(dbItems)) {
                const frontendItems = dbItems.map(i => ({
                  _id:      String(i.productId),
                  name:     i.name,
                  price:    i.price,
                  images:   [i.image],
                  size:     i.size,
                  color:    i.color,
                  quantity: i.quantity,
                }));
                useCartStore.getState().setCart(frontendItems);
              }
            }
            if (wishlistRes.ok) {
              const dbWishlist = await wishlistRes.json();
              if (Array.isArray(dbWishlist)) {
                useWishlistStore.getState().setWishlist(dbWishlist);
              }
            }
          } else {
            set({ user: null, token: null });
            useCartStore.getState().clearCart();
            useWishlistStore.getState().clearWishlist();
          }
        } catch {
          set({ user: null, token: null });
        }
      },

      logout: () => {
        set({ user: null, token: null });
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();
      },

      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: 'onebuy-auth-storage',
    }
  )
);

export default useAuthStore;