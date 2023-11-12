import { createMemoryRouter } from "react-router-dom"
import LandingPage from "@/pages/landing"
import LoginPage from "@/pages/login"
import DashboardPage from "@/pages/dashboard"
import SettingsGeneralPage from "@/pages/settings/general"
import SettingsAccountPage from "@/pages/settings/account"

export default createMemoryRouter([
  // { path: "/",  element: <SettingsGeneralPage /> },
  { path: "/",  element: <LandingPage /> },
  { path: "/login",  element: <LoginPage /> },
  { path: "/dashboard",  element: <DashboardPage /> },
  { path: "/settings/general",  element: <SettingsGeneralPage /> },
  { path: "/settings/account",  element: <SettingsAccountPage /> },
])
