import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      products: [],
      orders: [],
      cartItems: [],
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token, isAuthenticated: !!token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, token: null });
      },
      setProducts: (products) => set({ products }),
      setOrders: (orders) => set({ orders }),
      
      // Cart actions
      addToCart: (product) => set((state) => ({
        cartItems: [...state.cartItems, product]
      })),
      
      removeFromCart: (productId) => set((state) => ({
        cartItems: state.cartItems.filter(item => item._id !== productId)
      })),
      
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'user-storage', // unique name for localStorage
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default useStore; 