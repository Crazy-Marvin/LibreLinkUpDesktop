import { CSSProperties, ReactNode } from "react"
import { motion } from "framer-motion"

type MainTransitionProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties | undefined
}

export function MainTransition({ children, className, style }: MainTransitionProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{duration: 0.45,ease: [0.6, -0.05, 0.01, 0.99]}}
    >
      {children}
    </motion.div>
  )
}

type HeaderTransitionProps = {
  children: ReactNode
}

export function HeaderTransition({ children }: HeaderTransitionProps) {
  return (
    <motion.main
      className="motion__container"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{duration: 0.45,ease: [0.6, -0.05, 0.01, 0.99]}}
    >
      {children}
    </motion.main>
  )
}
