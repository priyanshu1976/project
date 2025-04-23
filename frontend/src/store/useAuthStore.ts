import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
// import type { AxiosError } from 'axios'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export const useAuthStore = create((set) => ({
  User: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLogingIn: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check')
      set({ User: res.data })
    } catch (error) {
      set({ User: null })
      console.log('error in check auth')
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (data: any) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post('/auth/signup', data)
      set({ User: res.data })
    } catch (error) {
      console.log('error in signup')
    } finally {
      set({ isSigningUp: false })
    }
  },

  login: async (data: any) => {
    set({ isLogingIn: true })
    try {
      console.log('Attempting login with:', data)
      const res = await axios.post('http://localhost:5000/api/auth/login', data)
      set({ User: res.data })
      console.log('Login successful:', res.data)
    } catch (error: any) {
      console.error(
        'Login error:',
        error?.response?.data?.message || 'An error occurred during login'
      )
      toast.error(error?.response?.data?.message)
      set({ User: null })
    } finally {
      set({ isLogingIn: false })
    }
  },
}))
