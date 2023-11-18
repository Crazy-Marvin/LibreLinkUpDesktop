import { ReactNode } from "react"

type Props = {
  icon: ReactNode
  label: string
  onClick: () => void
}

export function NavButton({ icon, label, onClick }: Props) {
  return (
    <button
      className=""
      onClick={onClick}
    >
      {icon}
      <p className="ml-3">{label}</p>
    </button>
  )
}
