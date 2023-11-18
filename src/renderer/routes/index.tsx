import { createMemoryRouter } from "react-router-dom"
import LandingPage from "@/pages/landing"
import LoginPage from "@/pages/login"
import DashboardPage from "@/pages/dashboard"
import SettingsGeneralPage from "@/pages/settings/general"
import SettingsAccountPage from "@/pages/settings/account"

export default function routes(isloggedIn: boolean) {
  return createMemoryRouter([
    { path: "/",  element: <LandingPage /> },
    { path: "/login",  element: isloggedIn ? <DashboardPage /> : <LoginPage /> },
    { path: "/dashboard",  element: isloggedIn ? <DashboardPage /> : <LoginPage /> },
    { path: "/settings/general",  element: isloggedIn ? <SettingsGeneralPage /> : <LoginPage /> },
    { path: "/settings/account",  element: isloggedIn ? <SettingsAccountPage /> : <LoginPage /> },
  ])
}
