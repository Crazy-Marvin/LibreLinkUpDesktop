import { RouterProvider } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/stores/auth"
import routes from "@/routes"
import "@/globals.css"
import "@/custom.css"
import "@/i18n/config"

export default function App() {
  const token = useAuthStore((state) => state.token)

  return (
    <AnimatePresence>
      <RouterProvider router={routes(!!token)} />
    </AnimatePresence>
  )
}
