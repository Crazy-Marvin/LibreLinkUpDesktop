import { useAuthStore } from "@/stores/auth"
import { useNavigate } from "react-router-dom"

export function useClearSession() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const clearSession = () => {
    logout()
    navigate('/')
  }

  return {
    clearSession
  }
}
