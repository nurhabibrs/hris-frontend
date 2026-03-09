import { create} from 'zustand'
import api from '../api/axios'

interface User {
  userId: string
  email: string
  name?: string
}

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),

  login: async (email, password) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    })

    localStorage.setItem("access_token", res.data.access_token)

    set({
      token: res.data.access_token,
    })
  },

  logout: async () => {
    await api.post("/auth/logout")

    localStorage.removeItem("access_token")

    set({
      user: null,
      token: null,
    })
  },
}))