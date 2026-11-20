import { RouterProvider } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/stores/auth"
import routes from "@/routes"
import "@/globals.css"
import "@/i18n/config"
import { useEffect } from "react"
import { getWindowMode, setLocalStorageWindowMode } from "@/lib/utils";

export default function App() {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const handleLogout = () => {
      window.location.reload();
    };

    const ipc = window.electron?.ipcRenderer;
    if (!ipc) {
      return undefined;
    }

    const unsubscribe = ipc.on('logout-event', handleLogout);

    return () => {
      unsubscribe();
    };
  }, []);


  useEffect(() => {
    async function fetchAndStoreWindowMode() {
      const mode = await getWindowMode();
      if (mode) {
        setLocalStorageWindowMode(mode);
      }
    }

    fetchAndStoreWindowMode();
  }, []);

  return (
    <AnimatePresence>
      <RouterProvider router={routes(!!token)} />
    </AnimatePresence>
  )
}
