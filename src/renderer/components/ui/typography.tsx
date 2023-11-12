import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  children: ReactNode
  icon?: ReactNode
  onClick?: () => void
}

export function Heading({ children, icon, className, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn("text-md font-semibold text-red-200 uppercase tracking-widest flex items-center gap-3 mr-3 transition-all ease-in hover:text-foreground", className)}
    >
      {icon}
      {children}
    </button>
  )
}
