import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apolloClient } from '@/lib/apollo-client';
import { ADD_TO_CART, REMOVE_FROM_CART, CLEAR_CART, PLACE_ORDER } from '../lib/graphql/cart';
import { GUEST_SESSION } from '../lib/graphql/auth';
import { DEFAULT_DEMO_TABLE_ID } from '../lib/graphql/menu';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  tableId: string | null;
  isLoading: boolean;
  error: string | null;
  /** Whether a server-side guest session has been established */
  guestSessionReady: boolean;
  setTableId: (tableId: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, notes?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  placeOrder: (tableId: string, specialInstructions?: string) => Promise<any>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  /** Initialises (or refreshes) the guest session cookie on the API */
  ensureGuestSession: (tableId: string) => Promise<void>;
}

/** Calls guestSession mutation to set the dineflow_guest HTTP-only cookie */
async function initGuestSession(tableId: string) {
  await apolloClient.mutate({
    mutation: GUEST_SESSION,
    variables: { input: { tableId } },
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      isLoading: false,
      error: null,
      guestSessionReady: false,

      setTableId: (tableId) => set({ tableId }),

      ensureGuestSession: async (tableId: string) => {
        if (get().guestSessionReady) return;
        try {
          await initGuestSession(tableId);
          set({ guestSessionReady: true });
        } catch (err) {
          console.warn('[CartStore] Guest session init failed:', err);
        }
      },

      /** Optimistic local-first add — ensures guest session, then syncs to server */
      addItem: (item, notes) => {
        // Optimistic local update immediately
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1, notes: notes ?? i.notes } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1, notes }] };
        });

        // Ensure guest session exists then sync to server
        const tableId = get().tableId || DEFAULT_DEMO_TABLE_ID;
        (async () => {
          try {
            await get().ensureGuestSession(tableId);
            await apolloClient.mutate({
              mutation: ADD_TO_CART,
              variables: { input: { menuItemId: item.id, quantity: 1, notes: notes ?? '' } },
            });
          } catch (err) {
            console.warn('[CartStore] addToCart server sync failed:', err);
          }
        })();
      },

      /** Optimistic local-first remove */
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        apolloClient
          .mutate({ mutation: REMOVE_FROM_CART, variables: { menuItemId: id } })
          .catch((err) => console.warn('[CartStore] removeFromCart server sync failed:', err));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: async () => {
        set({ items: [], isLoading: true, guestSessionReady: false });
        try {
          await apolloClient.mutate({ mutation: CLEAR_CART });
        } catch (err) {
          console.warn('[CartStore] clearCart server sync failed:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      placeOrder: async (tableId, specialInstructions) => {
        set({ isLoading: true, error: null });
        try {
          // Try to init guest session so Redis cart works (best effort)
          await get().ensureGuestSession(tableId);

          // Always pass local items directly — the service uses Redis cart first,
          // then falls back to these items if the session/cart was lost
          const localItems = get().items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            notes: item.notes ?? '',
          }));

          const { data } = await apolloClient.mutate({
            mutation: PLACE_ORDER,
            variables: {
              input: {
                tableId,
                specialInstructions: specialInstructions ?? '',
                items: localItems,
              },
            },
          });
          set({ items: [], isLoading: false, guestSessionReady: false });
          return data.placeOrder;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to place order';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      getTotalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    {
      name: 'dineflow-cart',
      partialize: (state) => ({ items: state.items, tableId: state.tableId }),
    },
  ),
);
