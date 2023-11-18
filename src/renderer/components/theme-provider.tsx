import { ReactNode, createContext, useContext, useEffect, useState } from "react"

export type ThemeType = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: ThemeType
  storageKey?: string
}

type ThemeProviderState = {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: (t: ThemeType) => {
    localStorage.setItem('vite-ui-theme', t)
  },
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeType>(
    () => (localStorage.getItem(storageKey) as ThemeType) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (t: ThemeType) => {
      localStorage.setItem(storageKey, t)
      setTheme(t)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
