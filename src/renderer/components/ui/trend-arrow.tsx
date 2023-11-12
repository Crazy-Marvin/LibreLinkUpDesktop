import {
  ArrowBottomRightIcon,
  ArrowDownIcon,
  ArrowTopRightIcon,
  ArrowUpIcon,
  HeightIcon,
} from "@radix-ui/react-icons"

type Props = {
  className: string
  trend: number
}

export function TrendArrow({ className, trend }: Props) {
  if (trend === 1) {
    return (<ArrowUpIcon className={className} />)
  }
  if (trend === 2) {
    return (<ArrowTopRightIcon className={className} />)
  }
  if (trend === 3) {
    return (<ArrowBottomRightIcon className={className} />)
  }
  if (trend === 4) {
    return (<ArrowDownIcon className={className} />)
  }

  return (<HeightIcon className={className} />)
}
