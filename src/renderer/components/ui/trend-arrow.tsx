import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "@radix-ui/react-icons"

type Props = {
  className: string
  trend: number
}

export function TrendArrow({ className, trend }: Props) {
  // High
  if (trend === 1) {
    return (<ArrowUpIcon className={className} />)
  }
  // Same Level
  if (trend === 3) {
    return (<ArrowRightIcon className={className} />)
  }

  // Low
  return (<ArrowDownIcon className={className} />)
}
