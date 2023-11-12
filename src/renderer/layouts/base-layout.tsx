import { ReactNode, useEffect } from "react"
import { Toaster } from "sonner"
import { useTranslation } from "react-i18next"
import { ThemeProvider } from "@/components/theme-provider"
import { MainTransition } from "@/components/tranisition-provider"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth"

type Props = {
  className?: string
  children: ReactNode
}

export function BaseLayout({ children, className }: Props) {
  const { i18n } = useTranslation()
  const language = useAuthStore((state) => state.language)

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [])

  return (
    <ThemeProvider>
      <div className={cn("min-h-screen overflow-x-hidden", className)}>
        <Toaster richColors />
        <MainTransition>
          {children}
        </MainTransition>
      </div>
    </ThemeProvider>
  )
}
