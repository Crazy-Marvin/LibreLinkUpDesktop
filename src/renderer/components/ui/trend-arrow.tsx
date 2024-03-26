import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowTopRightIcon,
  ArrowBottomRightIcon
} from "@radix-ui/react-icons"

type Props = {
  className: string
  trend: number
}

export function TrendArrow({ className, trend }: Props) {
  switch(trend)
  {
    case 1:
      return (<ArrowDownIcon className={className} />)
    case 2:
      return (<ArrowBottomRightIcon className={className} />)

    case 4:
      return (<ArrowTopRightIcon className={className} />)
    case 5:
      return (<ArrowUpIcon className={className} />)
      
    default:
      return (<ArrowRightIcon className={className} />)
  }
}
