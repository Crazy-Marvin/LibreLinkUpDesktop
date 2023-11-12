import { create } from 'zustand'

type AuthStore = {
  token: string|null
  country: string|null
  language: string|null
  setCountry: (value: string) => void
  setLanguage: (value: string) => void
  login: (token: string, country: string, language: string) => void
  logout: () => void
}

const useAuthStore = create<AuthStore>()((set) => ({
  token: null,
  country: null,
  language: null,
  login: (token: string, country: string, language: string) => set(() => ({ token, country, language })),
  logout: () => set(() => ({ token: null })),
  setCountry: (value) => set(() => ({ country: value })),
  setLanguage: (value) => set(() => ({ language: value })),
}))

export {
  useAuthStore
}
