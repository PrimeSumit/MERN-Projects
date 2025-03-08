// src/store.js
import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  products: [],
  orders: [],
  setUser: (user) => set({ user }),
  setProducts: (products) => set({ products }),
  setOrders: (orders) => set({ orders }),
}));

export default useStore;