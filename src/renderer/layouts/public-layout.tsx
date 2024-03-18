import { ReactNode, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { useTranslation } from "react-i18next"
import { MainTransition } from "@/components/tranisition-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import { useAuthStore } from "@/stores/auth"

type Props = {
  className?: string
  children: ReactNode
}

export function PublicLayout({ children, className }: Props) {
  const { i18n } = useTranslation()
  const language = useAuthStore((state) => state.language)

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [])

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Toaster richColors />
        <MainTransition
          className={cn("overflow-y-scroll min-h-screen", className)}
        >
          {children}
        </MainTransition>
      </div>
    </ThemeProvider>
  )
}
