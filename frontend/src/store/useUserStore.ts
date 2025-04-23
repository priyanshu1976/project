import { create } from 'zustand'

export const useUserStore = create((set) => ({
  balance: 0,
  transactions: [],
}))
