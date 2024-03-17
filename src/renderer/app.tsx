import { RouterProvider } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/stores/auth"
import routes from "@/routes"
import "@/globals.css"
import "@/custom.css"
import "@/i18n/config"
import { useEffect } from "react"

export default function App() {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const handleLogout = () => {
      window.location.reload();
    };

    const unsubscribe = window.electron.ipcRenderer.on('logout-event', handleLogout);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AnimatePresence>
      <RouterProvider router={routes(!!token)} />
    </AnimatePresence>
  )
}
