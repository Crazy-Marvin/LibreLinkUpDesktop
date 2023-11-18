import { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { MainTransition } from "@/components/tranisition-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

type Props = {
  className?: string
  children: ReactNode
}

export function PublicLayout({ children, className }: Props) {

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
