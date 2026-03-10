import { create} from 'zustand'
import api from '../api/axios'

interface User {
  userId: string
  email: string
  photo_url?: string
  name?: string
  role?: string;
}

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

function decodeToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      userId: payload.sub ?? payload.userId,
      email: payload.email,
      name: payload.name,
      photo_url: payload.photo_url,
      role: payload.role,
    }
  } catch {
    return null
  }
}

const storedToken = localStorage.getItem("access_token")

export const useAuthStore = create<AuthState>((set) => ({
  user: storedToken ? decodeToken(storedToken) : null,
  token: storedToken,

  login: async (email, password) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    })

    const token = res.data.access_token
    localStorage.setItem("access_token", token)

    set({
      token,
      user: decodeToken(token),
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