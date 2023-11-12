import { RouterProvider } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import routes from "@/routes"
import "@/globals.css"
import "@/custom.css"
import "@/i18n/config"

export default function App() {
  return (
    <AnimatePresence>
      <RouterProvider router={routes} />
    </AnimatePresence>
  )
}
